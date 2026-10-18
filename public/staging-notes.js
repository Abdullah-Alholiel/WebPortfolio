/**
 * Staging Notes — lightweight annotation layer for portfolio review.
 *
 * Features:
 *  - Floating toggle (bottom-right) opens the notes panel.
 *  - Capture a note by selecting text, or Alt+Click any element.
 *  - Every note is stamped with the section id + component name so Hermes
 *    can map feedback to source files.
 *  - Notes always land in localStorage first (never lost), then sync to
 *    /api/staging-notes when an access key is present (?k= / #k= in URL,
 *    or typed into the panel).
 */
(function () {
  'use strict';

  var LS_NOTES = 'staging_notes_local';
  var LS_KEY = 'staging_notes_key';
  var SYNC_BASE = '/api/staging-notes';

  // ---- state ---------------------------------------------------------
  var notes = [];
  var accessKey = null;
  var panelOpen = false;
  var pending = null; // captured anchor awaiting note text
  var serverAvailable = true;
  var resolved = {}; // id → { message, at } — "✓ Addressed" messages from Hermes
  var resolvedSig = '';

  // ---- helpers -------------------------------------------------------
  function lsGet(k, fallback) {
    try {
      var v = window.localStorage.getItem(k);
      return v === null ? fallback : v;
    } catch (e) {
      return fallback;
    }
  }
  function lsSet(k, v) {
    try {
      window.localStorage.setItem(k, v);
    } catch (e) {
      /* private mode — keep memory-only */
    }
  }

  function loadLocal() {
    try {
      notes = JSON.parse(lsGet(LS_NOTES, '[]')) || [];
      if (!Array.isArray(notes)) notes = [];
    } catch (e) {
      notes = [];
    }
  }
  function saveLocal() {
    lsSet(LS_NOTES, JSON.stringify(notes));
  }

  function uid() {
    return 'n_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Map a DOM node to { section, component } using section ids.
  // Sections in this app map 1:1 to components (id="about" -> About.tsx).
  var SECTION_COMPONENT = {
    home: 'Intro', about: 'About', projects: 'Projects', skills: 'Skills',
    achievements: 'Achievements', mentorship: 'Mentorship',
    experience: 'Experience', contact: 'Contact',
  };

  function locate(node) {
    var el = node && node.nodeType === 3 ? node.parentElement : node;
    if (!el || !el.closest) return { section: 'page', component: 'page' };
    var section = el.closest('section[id]');
    var sectionId = section ? section.getAttribute('id') : 'page';
    var component = SECTION_COMPONENT[sectionId] || sectionId;
    return { section: sectionId, component: component };
  }

  function snippet(text, max) {
    var t = String(text || '').replace(/\s+/g, ' ').trim();
    if (t.length > max) return t.slice(0, max - 1) + '…';
    return t;
  }

  function describeElement(el) {
    if (!el || !el.tagName) return 'element';
    var d = el.tagName.toLowerCase();
    if (el.id) d += '#' + el.id;
    else if (el.className && typeof el.className === 'string') {
      var c = el.className.trim().split(/\s+/).slice(0, 3).join('.');
      if (c) d += '.' + c;
    }
    return d;
  }

  // ---- key handling --------------------------------------------------
  function readKeyFromUrl() {
    try {
      var u = new URL(window.location.href);
      var k = u.searchParams.get('k');
      if (k) return k;
      var m = (u.hash || '').match(/k=([A-Za-z0-9_-]+)/);
      return m ? m[1] : null;
    } catch (e) {
      return null;
    }
  }

  function setAccessKey(k, remember) {
    accessKey = k || null;
    if (k && remember) lsSet(LS_KEY, k);
    syncFromServer();
    renderPanel();
    renderToggle();
  }

  // ---- server sync ----------------------------------------------------
  function fetchResolved() {
    if (!accessKey || !serverAvailable) return;
    fetch(SYNC_BASE + '/resolved?key=' + encodeURIComponent(accessKey), {
      cache: 'no-store',
    })
      .then(function (r) {
        if (!r.ok) throw new Error('http ' + r.status);
        return r.json();
      })
      .then(function (data) {
        var list = (data && data.resolved) || [];
        var next = {};
        var sig = '';
        list.forEach(function (r) {
          next[r.id] = r;
          sig += r.id + ':' + r.message + '|';
        });
        var changed = sig !== resolvedSig;
        resolved = next;
        resolvedSig = sig;
        if (changed && panelOpen) renderPanel();
      })
      .catch(function () {});
  }

  function syncFromServer() {
    if (!accessKey || !serverAvailable) return;
    fetch(SYNC_BASE + '?key=' + encodeURIComponent(accessKey), { cache: 'no-store' })
      .then(function (r) {
        if (!r.ok) throw new Error('http ' + r.status);
        return r.json();
      })
      .then(function (data) {
        var remote = (data && data.notes) || [];
        if (!Array.isArray(remote)) remote = [];
        serverAvailable = true;
        // Merge: local notes win (they may be newer / unsynced).
        var byId = {};
        remote.forEach(function (n) { byId[n.id] = n; });
        notes.forEach(function (n) { byId[n.id] = n; });
        var merged = Object.keys(byId).map(function (k) { return byId[k]; });
        merged.sort(function (a, b) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        if (merged.length !== notes.length) {
          notes = merged;
          saveLocal();
          renderPanel();
          renderToggle();
        } else {
          notes = merged;
        }
      })
      .catch(function () {
        serverAvailable = false;
        renderPanel();
      });
  }

  function pushNote(note) {
    if (!accessKey || !serverAvailable) return;
    fetch(SYNC_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: accessKey, note: note }),
    })
      .then(function (r) {
        if (!r.ok) throw new Error('http ' + r.status);
        serverAvailable = true;
        renderPanel();
      })
      .catch(function () {
        serverAvailable = false;
        renderPanel();
      });
  }

  function deleteNote(id) {
    notes = notes.filter(function (n) { return n.id !== id; });
    saveLocal();
    renderPanel();
    renderToggle();
    if (!accessKey || !serverAvailable) return;
    fetch(
      SYNC_BASE +
        '?key=' + encodeURIComponent(accessKey) +
        '&id=' + encodeURIComponent(id),
      { method: 'DELETE' }
    ).catch(function () {});
  }

  // ---- capture: text selection ---------------------------------------
  var selBtn = null;
  document.addEventListener('selectionchange', function () {
    var sel = window.getSelection();
    var text = sel ? String(sel.toString()).trim() : '';
    if (selBtn) {
      selBtn.remove();
      selBtn = null;
    }
    if (!text || text.length < 2 || !panelOpen) return;
    var range = sel.getRangeAt(0);
    var rect = range.getBoundingClientRect();
    if (!rect || (!rect.width && !rect.height)) return;
    var loc = locate(range.startContainer);
    var btn = document.createElement('button');
    btn.className = 'stg-sel-btn';
    btn.textContent = '💬 Note this';
    btn.style.top = Math.max(8, rect.top + window.scrollY - 42) + 'px';
    btn.style.left = Math.max(8, rect.left + window.scrollX) + 'px';
    btn.addEventListener('mousedown', function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
    });
    btn.addEventListener('click', function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      var chosen = loc;
      var anchorNode = range.startContainer.parentElement;
      openModal({
        kind: 'text',
        section: chosen.section,
        component: chosen.component,
        quote: snippet(text, 300),
        element: describeElement(anchorNode),
      });
      if (sel) sel.removeAllRanges();
      if (selBtn) {
        selBtn.remove();
        selBtn = null;
      }
    });
    document.body.appendChild(btn);
    selBtn = btn;
  });

  // ---- capture: Alt+Click element -------------------------------------
  document.addEventListener(
    'click',
    function (ev) {
      if (!ev.altKey || !panelOpen) return;
      ev.preventDefault();
      ev.stopPropagation();
      var el = ev.target;
      if (el.closest('.stg-notes-root')) return;
      var loc = locate(el);
      openModal({
        kind: 'element',
        section: loc.section,
        component: loc.component,
        quote: snippet(el.innerText || el.textContent || '', 160),
        element: describeElement(el),
      });
    },
    true
  );

  // ---- modal -----------------------------------------------------------
  function openModal(anchor) {
    closeModal();
    var wrap = document.createElement('div');
    wrap.className = 'stg-notes-root stg-modal-wrap';
    wrap.innerHTML =
      '<div class="stg-modal">' +
      '  <div class="stg-modal-head">' +
      '    <span class="stg-badge">' + esc(anchor.section) + '</span>' +
      '    <span class="stg-comp">' + esc(anchor.component) + '</span>' +
      '    <button class="stg-x" title="Cancel">✕</button>' +
      '  </div>' +
      (anchor.quote
        ? '<div class="stg-quote">“' + esc(anchor.quote) + '”</div>'
        : '') +
      '  <div class="stg-target">' + esc(anchor.element) + '</div>' +
      '  <textarea class="stg-input" rows="3" placeholder="What should change? Be as specific as you like…"></textarea>' +
      '  <div class="stg-modal-foot">' +
      '    <span class="stg-hint">Alt+Click or select text anytime to capture</span>' +
      '    <button class="stg-save">Save note</button>' +
      '  </div>' +
      '</div>';
    document.body.appendChild(wrap);
    var ta = wrap.querySelector('.stg-input');
    setTimeout(function () {
      ta.focus();
    }, 30);
    wrap.querySelector('.stg-x').addEventListener('click', closeModal);
    wrap.addEventListener('mousedown', function (ev) {
      if (ev.target === wrap) closeModal();
    });
    wrap.querySelector('.stg-save').addEventListener('click', function () {
      var text = ta.value.trim();
      if (!text) {
        ta.focus();
        return;
      }
      addNote(anchor, text);
      closeModal();
    });
    ta.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') closeModal();
      if (ev.key === 'Enter' && (ev.metaKey || ev.ctrlKey)) {
        wrap.querySelector('.stg-save').click();
      }
    });
  }

  function closeModal() {
    var m = document.querySelector('.stg-modal-wrap');
    if (m) m.remove();
  }

  function addNote(anchor, text) {
    var note = {
      id: uid(),
      kind: anchor.kind,
      section: anchor.section,
      component: anchor.component,
      quote: anchor.quote || '',
      element: anchor.element || '',
      note: text,
      path: window.location.pathname,
      createdAt: new Date().toISOString(),
    };
    notes.unshift(note);
    saveLocal();
    renderPanel();
    renderToggle();
    pushNote(note);
  }

  // ---- panel ----------------------------------------------------------
  var root = null;

  function renderToggle() {
    var t = document.getElementById('stg-toggle');
    var count = notes.length;
    if (t) {
      var badge = t.querySelector('.stg-count');
      if (badge) badge.textContent = count > 0 ? String(count) : '';
      t.classList.toggle('stg-active', panelOpen);
      return;
    }
    t = document.createElement('button');
    t.id = 'stg-toggle';
    t.className = 'stg-notes-root stg-toggle';
    t.innerHTML =
      '<span class="stg-toggle-ico">💬</span>' +
      '<span class="stg-toggle-txt">Notes</span>' +
      '<span class="stg-count"></span>';
    t.addEventListener('click', function () {
      panelOpen = !panelOpen;
      renderToggle();
      renderPanel();
      if (panelOpen) {
        syncFromServer();
        fetchResolved();
      }
    });
    document.body.appendChild(t);
    renderToggle();
  }

  function fmtTime(iso) {
    try {
      var d = new Date(iso);
      var h = d.getHours();
      var ampm = h >= 12 ? 'pm' : 'am';
      h = h % 12 || 12;
      return d.getDate() + '/' + (d.getMonth() + 1) + ' ' + h + ':' +
        String(d.getMinutes()).padStart(2, '0') + ampm;
    } catch (e) {
      return '';
    }
  }

  function renderPanel() {
    if (!panelOpen) {
      if (root) {
        root.remove();
        root = null;
      }
      return;
    }
    if (root) root.remove();
    root = document.createElement('div');
    root.className = 'stg-notes-root stg-panel';

    var keyUi;
    if (accessKey) {
      keyUi =
        '<span class="stg-key-ok" title="Notes sync to the staging server">● synced' +
        (serverAvailable ? '' : ' (offline — saved locally)') + '</span>';
    } else {
      keyUi =
        '<input class="stg-key-in" placeholder="Paste access key…" />' +
        '<button class="stg-key-go">Link</button>';
    }

    var items = notes
      .map(function (n) {
        var res = resolved[n.id];
        var resHtml = res
          ? '<div class="stg-res">✓ ' +
            esc(res.message) +
            '</div>'
          : '';
        return (
          '<div class="stg-item' + (res ? ' stg-item-res' : '') + '" data-id="' + esc(n.id) + '">' +
          '  <div class="stg-item-head">' +
          '    <span class="stg-badge">' + esc(n.section) + '</span>' +
          '    <span class="stg-comp">' + esc(n.component) + '</span>' +
          '    <span class="stg-time">' + esc(fmtTime(n.createdAt)) + '</span>' +
          '    <button class="stg-del" title="Delete note">🗑</button>' +
          '  </div>' +
          (n.quote
            ? '<div class="stg-quote">“' + esc(n.quote) + '”</div>'
            : '') +
          (n.kind === 'element'
            ? '<div class="stg-target">' + esc(n.element) + '</div>'
            : '') +
          '  <div class="stg-note">' + esc(n.note) + '</div>' +
          resHtml +
          '</div>'
        );
      })
      .join('');

    root.innerHTML =
      '<div class="stg-panel-head">' +
      '  <strong>Staging notes</strong>' + keyUi +
      '  <button class="stg-x stg-panel-close" title="Close">✕</button>' +
      '</div>' +
      '<div class="stg-panel-body">' +
      (items ||
        '<div class="stg-empty">No notes yet.<br /><br />' +
        'Select any text → <em>“Note this”</em>,<br />or <b>Alt+Click</b> any element.</div>') +
      '</div>' +
      '<div class="stg-panel-foot">' +
      '  <button class="stg-copy">Copy all (JSON)</button>' +
      '  <span class="stg-hint">Hermes reads /api/staging-notes</span>' +
      '</div>';

    document.body.appendChild(root);

    var closeBtn = root.querySelector('.stg-panel-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        panelOpen = false;
        renderToggle();
        renderPanel();
      });
    }
    var keyIn = root.querySelector('.stg-key-in');
    var keyGo = root.querySelector('.stg-key-go');
    if (keyGo) {
      keyGo.addEventListener('click', function () {
        var v = (keyIn.value || '').trim();
        if (v) setAccessKey(v, true);
      });
      keyIn.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter') keyGo.click();
      });
    }
    var copyBtn = root.querySelector('.stg-copy');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var payload = JSON.stringify(
          { key: accessKey, notes: notes },
          null,
          2
        );
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(payload);
        } else {
          var ta = document.createElement('textarea');
          ta.value = payload;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          ta.remove();
        }
        copyBtn.textContent = 'Copied ✓';
        setTimeout(function () {
          copyBtn.textContent = 'Copy all (JSON)';
        }, 1500);
      });
    }
    Array.prototype.forEach.call(
      root.querySelectorAll('.stg-del'),
      function (btn) {
        btn.addEventListener('click', function () {
          var item = btn.closest('.stg-item');
          if (item) deleteNote(item.getAttribute('data-id'));
        });
      }
    );
  }

  // ---- styles ----------------------------------------------------------
  function injectStyles() {
    var css =
      '.stg-notes-root{font-family:Inter,system-ui,sans-serif;font-size:14px;' +
      'color:#1f2937;--stg-accent:#e11d48;}' +
      '.dark .stg-notes-root{color:#f3f4f6;}' +
      '.stg-toggle{position:fixed;bottom:20px;right:20px;z-index:99998;' +
      'display:flex;align-items:center;gap:8px;padding:10px 16px;border:none;' +
      'border-radius:9999px;background:#111827;color:#fff;cursor:pointer;' +
      'box-shadow:0 10px 25px -5px rgba(0,0,0,.35);font-weight:600;font-size:14px;}' +
      '.stg-toggle.stg-active{background:var(--stg-accent);}' +
      '.stg-count{min-width:20px;height:20px;border-radius:9999px;' +
      'background:var(--stg-accent);color:#fff;font-size:11px;font-weight:700;' +
      'display:none;align-items:center;justify-content:center;padding:0 6px;}' +
      '.stg-count:not(:empty){display:inline-flex;}' +
      '.stg-toggle.stg-active .stg-count{background:rgba(255,255,255,.25);}' +
      '.stg-panel{position:fixed;bottom:76px;right:20px;z-index:99999;' +
      'width:380px;max-width:calc(100vw - 32px);max-height:min(70vh,560px);' +
      'display:flex;flex-direction:column;border-radius:16px;overflow:hidden;' +
      'background:#fff;border:1px solid #e5e7eb;' +
      'box-shadow:0 25px 60px -12px rgba(0,0,0,.35);}' +
      '.dark .stg-panel{background:#1f2937;border-color:#374151;}' +
      '.stg-panel-head{display:flex;align-items:center;gap:8px;padding:12px 14px;' +
      'border-bottom:1px solid #e5e7eb;font-size:14px;}' +
      '.dark .stg-panel-head{border-color:#374151;}' +
      '.stg-key-ok{font-size:11px;color:#059669;font-weight:600;}' +
      '.stg-key-in{flex:1;min-width:0;font-size:12px;padding:4px 8px;' +
      'border:1px solid #d1d5db;border-radius:6px;background:transparent;' +
      'color:inherit;}' +
      '.stg-key-go{font-size:12px;padding:4px 10px;border:none;' +
      'border-radius:6px;background:var(--stg-accent);color:#fff;cursor:pointer;' +
      'font-weight:600;}' +
      '.stg-x{background:none;border:none;cursor:pointer;font-size:14px;' +
      'color:inherit;opacity:.6;padding:2px 4px;}' +
      '.stg-x:hover{opacity:1;}' +
      '.stg-panel-close{margin-left:auto;}' +
      '.stg-panel-body{flex:1;overflow-y:auto;padding:10px;}' +
      '.stg-item{border:1px solid #e5e7eb;border-radius:10px;padding:10px 12px;' +
      'margin-bottom:8px;background:#fafafa;}' +
      '.dark .stg-item{border-color:#374151;background:#111827;}' +
      '.stg-item-head{display:flex;align-items:center;gap:6px;margin-bottom:6px;}' +
      '.stg-badge{font-size:10px;font-weight:700;text-transform:uppercase;' +
      'letter-spacing:.05em;color:var(--stg-accent);background:rgba(225,29,72,.08);' +
      'padding:2px 7px;border-radius:5px;}' +
      '.stg-comp{font-size:11px;font-weight:600;opacity:.75;}' +
      '.stg-time{margin-left:auto;font-size:10px;opacity:.5;}' +
      '.stg-del{background:none;border:none;cursor:pointer;font-size:12px;' +
      'opacity:.4;padding:0 2px;}' +
      '.stg-del:hover{opacity:1;}' +
      '.stg-quote{font-size:12px;opacity:.65;font-style:italic;' +
      'border-left:2px solid var(--stg-accent);padding-left:8px;margin:6px 0;' +
      'word-break:break-word;}' +
      '.stg-target{font-size:10px;font-family:ui-monospace,monospace;opacity:.45;' +
      'margin:2px 0;word-break:break-all;}' +
      '.stg-note{font-size:13px;line-height:1.5;margin-top:4px;' +
      'word-break:break-word;white-space:pre-wrap;}' +
      '.stg-res{margin-top:8px;padding:7px 10px;border-radius:8px;font-size:12px;' +
      'line-height:1.45;font-weight:600;background:rgba(5,150,105,.1);color:#047857;' +
      'border:1px solid rgba(5,150,105,.25);word-break:break-word;}' +
      '.dark .stg-res{background:rgba(16,185,129,.12);color:#34d399;' +
      'border-color:rgba(16,185,129,.3);}' +
      '.stg-item-res{opacity:.75;}' +
      '.stg-empty{text-align:center;opacity:.55;padding:36px 12px;font-size:13px;' +
      'line-height:1.6;}' +
      '.stg-panel-foot{display:flex;align-items:center;gap:8px;padding:10px 14px;' +
      'border-top:1px solid #e5e7eb;}' +
      '.dark .stg-panel-foot{border-color:#374151;}' +
      '.stg-copy{font-size:12px;padding:5px 12px;border-radius:7px;' +
      'border:1px solid #d1d5db;background:transparent;color:inherit;' +
      'cursor:pointer;font-weight:600;}' +
      '.dark .stg-copy{border-color:#4b5563;}' +
      '.stg-copy:hover{border-color:var(--stg-accent);color:var(--stg-accent);}' +
      '.stg-hint{margin-left:auto;font-size:10px;opacity:.45;}' +
      '.stg-sel-btn{position:absolute;z-index:99997;padding:7px 14px;border:none;' +
      'border-radius:9999px;background:var(--stg-accent);color:#fff;font-size:12px;' +
      'font-weight:600;cursor:pointer;' +
      'box-shadow:0 8px 20px -4px rgba(225,29,72,.5);}' +
      '.stg-modal-wrap{position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.35);' +
      'display:flex;align-items:center;justify-content:center;padding:16px;}' +
      '.stg-modal{width:440px;max-width:100%;background:#fff;border-radius:14px;' +
      'padding:16px;box-shadow:0 25px 60px -12px rgba(0,0,0,.5);color:#1f2937;}' +
      '.dark .stg-modal{background:#1f2937;color:#f3f4f6;}' +
      '.stg-modal-head{display:flex;align-items:center;gap:8px;margin-bottom:8px;}' +
      '.stg-modal-head .stg-x{margin-left:auto;}' +
      '.stg-input{width:100%;box-sizing:border-box;margin-top:6px;padding:10px;' +
      'border:1px solid #d1d5db;border-radius:8px;font-size:13px;resize:vertical;' +
      'background:transparent;color:inherit;font-family:inherit;}' +
      '.dark .stg-input{border-color:#4b5563;}' +
      '.stg-input:focus{outline:2px solid var(--stg-accent);outline-offset:1px;}' +
      '.stg-modal-foot{display:flex;align-items:center;margin-top:10px;gap:8px;}' +
      '.stg-save{margin-left:auto;padding:8px 16px;border:none;border-radius:8px;' +
      'background:var(--stg-accent);color:#fff;font-size:13px;font-weight:600;' +
      'cursor:pointer;}' +
      '.stg-save:hover{filter:brightness(1.08);}' +
      'html.stg-notes-on{-webkit-user-select:text!important;user-select:text!important;}';
    var style = document.createElement('style');
    style.id = 'stg-notes-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ---- boot ------------------------------------------------------------
  function boot() {
    injectStyles();
    loadLocal();
    var urlKey = readKeyFromUrl();
    var storedKey = lsGet(LS_KEY, null);
    if (urlKey) {
      accessKey = urlKey;
      lsSet(LS_KEY, urlKey);
    } else if (storedKey) {
      accessKey = storedKey;
    }
    renderToggle();
    if (accessKey) {
      syncFromServer();
      fetchResolved();
      // Keep "✓ Addressed" messages fresh while the page stays open
      setInterval(fetchResolved, 30000);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
