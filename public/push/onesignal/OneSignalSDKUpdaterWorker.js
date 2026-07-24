// OneSignal SDK Service Worker Updater (scoped to /push/onesignal/)
//
// Browsers check this file for byte-differences to decide whether the main
// OneSignal worker needs to be re-fetched/updated. It imports the same SDK
// entry point as the main worker.
importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");
