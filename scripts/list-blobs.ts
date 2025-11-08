import 'dotenv/config';
import { listAllBlobs } from '../lib/blob';

async function main() {
  try {
    console.log('🔍 Fetching blob inventory...');
    const start = Date.now();
    const blobs = await listAllBlobs();
    if (!blobs || blobs.length === 0) {
      console.warn('⚠️  No blobs returned. Ensure BLOB_READ_ONLY_TOKEN is configured and assets exist.');
      return;
    }
    console.log(`   Found ${blobs.length} blob(s) in ${(Date.now() - start) / 1000}s\n`);
    for (const blob of blobs) {
      console.log(`${blob.pathname} ${blob.size}B`);
    }
  } catch (error: any) {
    const message = error?.message ?? String(error);
    if (message.includes('token not found')) {
      console.error('❌ Failed to list blobs: missing BLOB_READ_ONLY_TOKEN or BLOB_READ_WRITE_TOKEN.');
      console.error('   Set the token in your environment (e.g. export BLOB_READ_ONLY_TOKEN="...").');
    } else {
      console.error('❌ Failed to list blobs:', message);
    }
    process.exitCode = 1;
  }
}

main();

