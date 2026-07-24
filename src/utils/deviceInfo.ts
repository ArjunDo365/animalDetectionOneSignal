// src/utils/deviceInfo.ts
//
// Best-effort device metadata for a web PWA. Browsers don't expose a real
// device ID or hardware model, so we generate/persist a stable pseudo-ID
// and parse what we can from the user agent.

const DEVICE_ID_KEY = 'pwa_device_id';
const APP_VERSION = '1.0.0'; // bump this manually per release

function getOrCreateDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

function getSystemInfo(): { systemName: string; systemVersion: string; modelNumber: string } {
  const ua = navigator.userAgent;

  let systemName = 'web';
  let systemVersion = 'unknown';

  const androidMatch = ua.match(/Android\s([\d.]+)/);
  const iosMatch = ua.match(/OS\s([\d_]+)\slike Mac OS X/);

  if (androidMatch) {
    systemName = 'android';
    systemVersion = `Android ${androidMatch[1]}`;
  } else if (iosMatch) {
    systemName = 'ios';
    systemVersion = `iOS ${iosMatch[1].replace(/_/g, '.')}`;
  } else {
    systemName = 'web';
    systemVersion = ua;
  }

  // Real hardware model isn't available to browsers — using UA string as a fallback.
  const modelNumber = ua;

  return { systemName, systemVersion, modelNumber };
}

export function getDeviceInfo() {
  const { systemName, systemVersion, modelNumber } = getSystemInfo();
  return {
    device_id: getOrCreateDeviceId(),
    system_name: systemName,
    system_version: systemVersion,
    model_number: modelNumber,
    app_version: APP_VERSION,
  };
}