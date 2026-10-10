import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ssbabysong.tietieben',
  appName: '贴贴本',
  webDir: 'dist',
  backgroundColor: '#cbbda3',
  ios: {
    contentInset: 'never',
    scrollEnabled: false,
    backgroundColor: '#cbbda3',
  },
};

export default config;
