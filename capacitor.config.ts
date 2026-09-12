import type { CapacitorConfig } from '@capacitor/cli'

/**
 * Native wrapper config. The web build in dist/ is the entire app, so going
 * native is `npx cap add android && npx cap sync` with no code changes — the
 * app never talks to a server, so there is no origin or CORS story to manage.
 */
const config: CapacitorConfig = {
  appId: 'com.resumeforge.app',
  appName: 'Resume Forge',
  webDir: 'dist',
  android: {
    // The resume preview is a light surface; a dark WebView background flashes on load.
    backgroundColor: '#f6f7f9',
  },
  ios: {
    contentInset: 'always',
    backgroundColor: '#f6f7f9',
  },
}

export default config
