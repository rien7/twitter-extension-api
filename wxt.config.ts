import { defineConfig } from 'wxt';

export default defineConfig({
  manifest: {
    name: 'Twitter Extension API SDK',
    description:
      'Reusable Twitter/X extension API SDK with request interception and GraphQL discovery.',
    permissions: ['storage'],
    host_permissions: ['*://x.com/*', '*://twitter.com/*']
  }
});
