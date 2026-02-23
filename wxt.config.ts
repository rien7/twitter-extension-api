import { defineConfig } from 'wxt';
import { fileURLToPath } from 'node:url';

// x-client-transaction-id pulls in linkedom, which has an optional peer dependency on `canvas`.
// In the extension bundle we only need transaction-id generation, not real canvas rendering.
// Alias `canvas` to a local shim to avoid runtime crashes from unresolved optional peer deps.
const canvasShimPath = fileURLToPath(new URL('./src/sdk/canvas-shim.ts', import.meta.url));

export default defineConfig({
  vite: () => ({
    resolve: {
      alias: {
        canvas: canvasShimPath
      }
    }
  }),
  manifest: {
    name: 'Twitter Extension API SDK',
    description:
      'Reusable Twitter/X extension API SDK with request interception and GraphQL discovery.',
    permissions: ['storage'],
    host_permissions: ['*://x.com/*', '*://twitter.com/*']
  }
});
