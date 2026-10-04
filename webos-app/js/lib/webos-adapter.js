/**
 * webos-adapter.js - webOS Platform integration helper
 */

(function () {
  // Detect if running inside webOS TV environment
  const isWebOS = /Web0S|webOS|SmartTV/i.test(navigator.userAgent);
  window.isWebOS = isWebOS;

  if (isWebOS) {
    console.log("LG webOS TV environment detected.");
    document.documentElement.classList.add('webos-tv');

    // Register webOS life-cycle listeners
    document.addEventListener('webOSLaunch', function (e) {
      console.log('webOS app launched', e.detail);
    });

    document.addEventListener('webOSRelaunch', function (e) {
      console.log('webOS app relaunched', e.detail);
    });

    // Make sure pointer cursor is visible when Magic Remote moves
    document.addEventListener('cursorStateChange', function (e) {
      console.log('Cursor state:', e.detail ? e.detail.visibility : 'unknown');
    });
  } else {
    console.log("Running in standard browser / development environment.");
    document.documentElement.classList.add('browser-env');
  }
})();
