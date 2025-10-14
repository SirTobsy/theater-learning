# theater-learning
This is a prototype for a theater script learning app based on react native


# Getting Started

## Prerequisites
- node 24.8.0
- npm 11.6.0
- [JDK 21](https://www.oracle.com/de/java/technologies/downloads/#java21)

## Android CLI Tools
Download the Android CLI tools from [here](https://developer.android.com/studio#command-line-tools-only)
To set up the CLI tools follow the [documentation](https://developer.android.com/tools/sdkmanager)

Note: You need to set the `ANDROID_SDK_ROOT` environment variable

Install the packaged 
- "system-images;android-34;google_apis;x86_64" 
- "emulator"
- "platform-tools"
- (...)

## Emulator
### Android
```bash
avdmanager create avd --name MyAwesomeAVD --package "system-images;android-34;google_apis;x86_64"
```
```bash
emulator -avd MyAwesomeAVD
```
if the screen is not responsive run it with the `-wipe-data` flag or as cold boot with the `-no-snapshot-load` flag
```bash
emulator -avd MyAwesomeAVD -wipe-data
emulator -avd MyAwesomeAVD -no-snapshot-load
```


## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS


# To deploy to mobile devices (Preview):

Export to GitHub and git pull locally
Run `npm install`
Add platforms: `npx cap add ios` and/or `npx cap add android`
Build: `npm run build`
Sync: `npx cap sync`

Tip: Run the Emulator first
Run: `npx cap run android` or `npx cap run ios`

# To show in browser (preview):
```
vite preview
```