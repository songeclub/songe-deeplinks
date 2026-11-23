// Ouvre l'app sur la bonne page, sinon envoie vers le store du téléphone.
//
// Avec l'app installée, les Universal Links (iOS) et App Links (Android)
// ouvrent l'app avant même cette page. On n'arrive donc ici que sans l'app,
// ou depuis un navigateur intégré qui ignore ces liens (Instagram, Facebook,
// adresse tapée dans Safari…). D'où :
// - Android : un lien intent://, qui ouvre l'app si elle est là, sinon le
//   Play Store (S.browser_fallback_url) ;
// - iOS : le schéma songe://, puis le store si la page est toujours visible
//   au bout de 1,5 s (l'app ouverte fait passer l'onglet en arrière-plan) ;
// - ordinateur : rien, la page reste lisible avec ses boutons des stores.
//
// `path` est le chemin dans l'app, sans « / » au début : « pack/<id> »,
// « a-lire/<id> ». Le routeur de l'app lit `songe://songe.com/<path>`.
(function () {
  var IOS_STORE = 'https://apps.apple.com/app/id6741076205';
  var ANDROID_STORE = 'https://play.google.com/store/apps/details?id=studio.techno.songe';
  var ANDROID_PACKAGE = 'studio.techno.songe';

  function platform() {
    var ua = navigator.userAgent || navigator.vendor || '';
    // iPadOS 13+ se présente comme un Mac tactile
    if (/iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && 'ontouchend' in document)) return 'ios';
    if (/android/i.test(ua)) return 'android';
    return 'desktop';
  }

  function schemeUrl(path) {
    return 'songe://songe.com/' + path;
  }

  function intentUrl(path) {
    return 'intent://songe.com/' + path +
      '#Intent;scheme=songe;package=' + ANDROID_PACKAGE +
      ';S.browser_fallback_url=' + encodeURIComponent(ANDROID_STORE) + ';end';
  }

  // Un seul essai par page : revenir du store ne relance pas la redirection.
  var tried = false;

  function openAppOrStore(path) {
    var os = platform();
    if (os === 'desktop' || tried) return;
    tried = true;

    if (os === 'android') {
      window.location.href = intentUrl(path);
      return;
    }

    var left = false;
    function markLeft() { left = true; }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) markLeft();
    });
    window.addEventListener('pagehide', markLeft);
    window.addEventListener('blur', markLeft);

    window.location.href = schemeUrl(path);
    setTimeout(function () {
      if (left || document.hidden) return;
      window.location.replace(IOS_STORE);
    }, 1500);
  }

  // Le bouton « Ouvrir dans Songe » : l'app si elle est là, sans détour.
  function openApp(path) {
    window.location.href = platform() === 'android' ? intentUrl(path) : schemeUrl(path);
  }

  window.SongeOpenApp = { openAppOrStore: openAppOrStore, openApp: openApp, platform: platform };
})();
