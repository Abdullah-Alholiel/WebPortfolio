// Force fix for admin page issues - runs on every admin page load
if (typeof window !== 'undefined') {
  // Immediately add admin-page class
  document.body.classList.add('admin-page');
  document.documentElement.classList.add('admin-page');
  
  // Force hide portfolio header
  const hideHeader = () => {
    const headers = document.querySelectorAll('header');
    headers.forEach(header => {
      // Check if it's the portfolio header (has z-[999] or fixed positioning)
      const headerClass = header.className || '';
      const headerStyle = window.getComputedStyle(header);
      
      if (headerClass.includes('z-') && headerStyle.position === 'fixed') {
        header.style.display = 'none';
        header.style.visibility = 'hidden';
        header.style.opacity = '0';
        header.style.height = '0';
        header.style.overflow = 'hidden';
        header.style.position = 'absolute';
        header.style.left = '-9999px';
      }
    });
  };
  
  // Force white backgrounds on all inputs
  const fixInputs = () => {
    const inputs = document.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"])');
    const textareas = document.querySelectorAll('textarea');
    const selects = document.querySelectorAll('select');
    
    [...inputs, ...textareas, ...selects].forEach(el => {
      const isDark = document.documentElement.classList.contains('dark');
      if (isDark) {
        el.style.backgroundColor = '#374151';
        el.style.color = '#ffffff';
      } else {
        el.style.backgroundColor = '#ffffff';
        el.style.color = '#111827';
      }
    });
  };
  
  // Run immediately
  hideHeader();
  fixInputs();
  
  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      hideHeader();
      fixInputs();
    });
  }
  
  // Run after a short delay to catch dynamically rendered content
  setTimeout(() => {
    hideHeader();
    fixInputs();
  }, 100);
  
  // Observe for changes
  const observer = new MutationObserver(() => {
    hideHeader();
    fixInputs();
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'style']
  });
}


