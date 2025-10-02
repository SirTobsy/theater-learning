import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.theaterscript.app',
    appName: 'Theater Script Reader',
    webDir: 'dist',
    plugins: {
        SplashScreen: {
            launchShowDuration: 2000,
            backgroundColor: "#1a1625",
            showSpinner: true,
            spinnerColor: "#d4af37"
        }
    }
};

export default config;