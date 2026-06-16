const SDK_POLL_MS = 200;
const SDK_MAX_RETRIES = 3;

let state: "idle" | "loaded" | "activated" | "error" = "idle";
let activationCount = 0;
let readyPromise: Promise<boolean> | null = null;

function checkGlobals(): boolean {
  return typeof (window as any).evina_notify !== "undefined";
}

function injectScript(code: string): void {
  const existing = document.getElementById("evina-injected-script");
  if (existing) existing.remove();
  const s = document.createElement("script");
  s.id = "evina-injected-script";
  s.type = "text/javascript";
  s.textContent = code;
  document.head.appendChild(s);
}

function pollSDK(remaining: number): Promise<boolean> {
  return new Promise((resolve) => {
    function tick() {
      if (checkGlobals()) {
        resolve(true);
        return;
      }
      if (remaining <= 0) {
        resolve(false);
        return;
      }
      remaining--;
      setTimeout(tick, SDK_POLL_MS);
    }
    tick();
  });
}

export const Evina = {
  load(code: string): Promise<boolean> {
    if (state !== "idle" && state !== "error") {
      return readyPromise || Promise.resolve(false);
    }
    if (!code?.trim()) return Promise.resolve(false);

    state = "loaded";
    injectScript(code);

    const ev = new Event("DCBProtectRun");
    document.dispatchEvent(ev);
    activationCount++;
    state = "activated";

    readyPromise = pollSDK(SDK_MAX_RETRIES);
    return readyPromise;
  },

  activate(): Promise<boolean> {
    return Promise.resolve(true);
  },

  reset(): void {
    const existing = document.getElementById("evina-injected-script");
    if (existing) existing.remove();
    state = "idle";
    activationCount = 0;
    readyPromise = null;
  },

  getState() {
    return state;
  },
};
