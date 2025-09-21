import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'app.lovable.583e6be9f66647819d8bd6e4fe71dd02',
    appName: 'Script Reader Pro',
    webDir: 'dist',
    server: {
        url: "https://583e6be9-f666-4781-9d8b-d6e4fe71dd02.lovableproject.com?forceHideBadge=true",
        cleartext: true
    },
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