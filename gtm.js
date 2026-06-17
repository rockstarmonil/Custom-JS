(function() {

    if (window.location.pathname !== '/moas/login') {
        return;
    }

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        'gtm.start': new Date().getTime(),
        event: 'gtm.js'
    });

    var gtmScript = document.createElement('script');
    gtmScript.async = true;
    gtmScript.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-PWW3CWVC';

    document.head.appendChild(gtmScript);

    console.log('GTM loaded for /moas/login');

})();