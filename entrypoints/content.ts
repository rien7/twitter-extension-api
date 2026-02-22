import { defineContentScript } from 'wxt/utils/define-content-script';
import { bootstrapTwitterExtensionApiSdk } from '../src';

export default defineContentScript({
  matches: ['*://x.com/*', '*://twitter.com/*'],
  runAt: 'document_start',
  world: 'MAIN',
  main() {
    bootstrapTwitterExtensionApiSdk();
  }
});
