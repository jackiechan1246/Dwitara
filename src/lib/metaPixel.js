/**
 * Meta Pixel helper — vanilla implementation.
 * Avoids the broken CJS/ESM interop of react-facebook-pixel with Vite.
 */

const PIXEL_ID = "1557564425879005";
let initialized = false;

export const initMetaPixel = () => {
  if (initialized) return;

  // Inject the Facebook Pixel base code
  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

  window.fbq("init", PIXEL_ID);
  window.fbq("track", "PageView");
  initialized = true;
};

const ReactPixel = {
  init: initMetaPixel,
  pageView: () => {
    if (window.fbq) window.fbq("track", "PageView");
  },
  track: (event, data) => {
    if (window.fbq) window.fbq("track", event, data);
  },
  trackCustom: (event, data) => {
    if (window.fbq) window.fbq("trackCustom", event, data);
  },
};

export default ReactPixel;
