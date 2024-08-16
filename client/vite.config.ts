import { sentryVitePlugin } from '@sentry/vite-plugin';
import type { PluginOption } from 'vite';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      react() as PluginOption[],
      sentryVitePlugin({
        org: 'codenickycode',
        project: 'simon-client',
        authToken: env.SENTRY_AUTH_TOKEN,
      }),
    ],
    build: {
      sourcemap: true,
    },
  };
});
