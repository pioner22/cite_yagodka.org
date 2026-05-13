// Minimal bootstrap to load main layout from partial.
(function () {
  function isMobile() {
    try {
      var ua = (navigator.userAgent || navigator.vendor || '').toLowerCase();
      if (/android|iphone|ipad|ipod|windows phone|mobile/.test(ua)) {
        return true;
      }
      if (window.innerWidth && window.innerWidth <= 768) {
        return true;
      }
    } catch (e) {
      // ignore
    }
    return false;
  }

  function inject(content) {
    var root = document.getElementById('app');
    if (!root) {
      return;
    }
    var parser = new DOMParser();
    var doc = parser.parseFromString(String(content || ''), 'text/html');
    var nodes = [];
    var bodyNodes = doc && doc.body ? doc.body.childNodes : [];
    for (var i = 0; i < bodyNodes.length; i += 1) {
      nodes.push(bodyNodes[i].cloneNode(true));
    }
    root.replaceChildren.apply(root, nodes);
  }

  function showError(message) {
    var root = document.getElementById('app');
    var box;
    if (!root) {
      return;
    }
    box = document.createElement('div');
    box.className = 'page-loading';
    box.textContent = message || 'Не удалось загрузить страницу. Попробуйте обновить позже.';
    root.replaceChildren(box);
  }

  function resolvePageName() {
    var hash = window.location.hash || '#home';
    var name = hash.replace(/^#/, '');
    if (name !== 'home' && name !== 'roadmap') {
      name = 'home';
    }
    return name;
  }

  function pagePath(name) {
    var mobile = isMobile();
    if (name === 'roadmap') {
      return mobile ? 'pages/roadmap.mobile.html' : 'pages/roadmap.html';
    }
    return mobile ? 'pages/home.mobile.html' : 'pages/home.html';
  }

  function attachNavHandlers() {
    var root = document.getElementById('app');
    if (!root) {
      return;
    }
    root.addEventListener('click', function (e) {
      var el = e.target;
      while (el && el !== root) {
        if (el.dataset && el.dataset.page) {
          e.preventDefault();
          var targetPage = el.dataset.page;
          if (targetPage === 'home' || targetPage === 'roadmap') {
            window.location.hash = '#' + targetPage;
          }
          break;
        }
        el = el.parentNode;
      }
    });
  }

  function loadPage() {
    if (!window.fetch) {
      showError('Ваш браузер не поддерживает современный интерфейс. Обновите страницу или попробуйте другой браузер.');
      return;
    }
    var name = resolvePageName();
    var path = pagePath(name);
    fetch(path, { cache: 'no-cache' })
      .then(function (resp) {
        if (!resp.ok) {
          throw new Error('HTTP ' + resp.status);
        }
        return resp.text();
      })
      .then(function (html) {
        inject(html);
        attachNavHandlers();
      })
      .catch(function () {
        showError();
      });
  }

  window.addEventListener('DOMContentLoaded', loadPage);
  window.addEventListener('hashchange', loadPage);
})();
