(function () {
  var WEB_CLIENT_PATH = "/web/";
  var ROOT_PATHS = { "/": true, "/index.html": true };

  function isRootPath() {
    try {
      return ROOT_PATHS[window.location.pathname || "/"] === true;
    } catch (e) {
      return false;
    }
  }

  function isStandaloneLaunch() {
    try {
      if (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) {
        return true;
      }
    } catch (e) {
      // ignore
    }
    try {
      if (window.navigator && window.navigator.standalone === true) {
        return true;
      }
    } catch (e) {
      // ignore
    }
    try {
      return String(document.referrer || "").indexOf("android-app://") === 0;
    } catch (e) {
      return false;
    }
  }

  function shouldBypassMigration() {
    try {
      return new URLSearchParams(window.location.search || "").get("site") === "1";
    } catch (e) {
      return false;
    }
  }

  if (isRootPath() && isStandaloneLaunch() && !shouldBypassMigration()) {
    window.location.replace(WEB_CLIENT_PATH);
  }
})();
