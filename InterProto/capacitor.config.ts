import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.InterProto.ar',
  appName: 'InterProto',
  webDir: 'dist/InterProto/browser',
  plugins: {
    StatusBar: {
      overlaysWebView: true,          // ← muy importante
      style: 'DARK',                  // o 'LIGHT' según tu caso
      // backgroundColor: '#78000000', // semi-transparente (opcional)
    },
    // Si usas Android 15+ a veces ayuda forzar:
    Android: {
      adjustMarginsForEdgeToEdge: 'force',  // o 'auto'
    }
  }
};

export default config;
