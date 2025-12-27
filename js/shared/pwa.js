(() => {
  'use strict';

  const LOGO_KEY = 'jm_logo_url_v1';
  const IOS_HINT_KEY = 'jm_pwa_ios_hint_dismissed';
  const INSTALL_HINT_KEY = 'jm_pwa_install_dismissed';

  let deferredPrompt = null;

  const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = () =>
    window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

  const injectStyles = () => {
    if (document.getElementById('pwaStyles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'pwaStyles';
    style.textContent = `
      #pwa-splash {
        position: fixed;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #2d1b69 0%, #5b21b6 100%);
        z-index: 9999;
        opacity: 1;
        transition: opacity 0.35s ease;
      }
      #pwa-splash.hidden { opacity: 0; pointer-events: none; }
      #pwa-splash .pwa-splash-card {
        text-align: center;
        color: #ffffff;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      }
      #pwa-splash .pwa-splash-logo {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        height: 96px;
        width: 96px;
        border-radius: 24px;
        background: rgba(255, 255, 255, 0.12);
        margin-bottom: 12px;
        overflow: hidden;
      }
      #pwa-splash .pwa-splash-logo img { height: 80%; width: 80%; object-fit: contain; }
      #pwa-splash .pwa-splash-text { font-size: 20px; font-weight: 600; letter-spacing: 0.3px; }

      #pwa-install-banner,
      #pwa-ios-banner {
        position: fixed;
        left: 16px;
        right: 16px;
        bottom: 16px;
        background: #ffffff;
        color: #1f2937;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
        padding: 12px 14px;
        display: none;
        align-items: center;
        gap: 12px;
        z-index: 9998;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      }
      #pwa-install-banner.show,
      #pwa-ios-banner.show { display: flex; }
      .pwa-banner-text { flex: 1; font-size: 13px; line-height: 1.35; }
      .pwa-banner-title { font-weight: 600; margin-bottom: 2px; }
      .pwa-banner-actions { display: flex; gap: 8px; }
      .pwa-btn {
        border: none;
        background: #5b21b6;
        color: #ffffff;
        padding: 8px 12px;
        border-radius: 8px;
        font-size: 13px;
        cursor: pointer;
      }
      .pwa-btn.secondary {
        background: #f3f4f6;
        color: #1f2937;
      }
    `;

    document.head.appendChild(style);
  };

  const updateIcons = () => {
    const logoUrl = localStorage.getItem(LOGO_KEY);
    if (!logoUrl || !/^https?:\/\//i.test(logoUrl)) {
      return;
    }

    const icon = document.getElementById('pwaIcon');
    const appleIcon = document.getElementById('appleTouchIcon');
    if (icon) {
      icon.href = logoUrl;
    }
    if (appleIcon) {
      appleIcon.href = logoUrl;
    }
  };

  const createSplash = () => {
    const splash = document.createElement('div');
    splash.id = 'pwa-splash';

    const card = document.createElement('div');
    card.className = 'pwa-splash-card';

    const logoHolder = document.createElement('div');
    logoHolder.className = 'pwa-splash-logo';

    const logoUrl = localStorage.getItem(LOGO_KEY);
    if (logoUrl && /^https?:\/\//i.test(logoUrl)) {
      const img = document.createElement('img');
      img.src = logoUrl;
      img.alt = 'JulineMart logo';
      logoHolder.appendChild(img);
    } else {
      logoHolder.textContent = 'JM';
    }

    const text = document.createElement('div');
    text.className = 'pwa-splash-text';
    text.textContent = 'JulineMart';

    card.appendChild(logoHolder);
    card.appendChild(text);
    splash.appendChild(card);
    document.body.appendChild(splash);

    window.addEventListener('load', () => {
      setTimeout(() => {
        splash.classList.add('hidden');
        setTimeout(() => splash.remove(), 400);
      }, 400);
    });
  };

  const showInstallBanner = () => {
    if (localStorage.getItem(INSTALL_HINT_KEY) === '1') {
      return;
    }
    if (isStandalone()) {
      return;
    }

    const banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.className = 'show';
    banner.innerHTML = `
      <div class="pwa-banner-text">
        <div class="pwa-banner-title">Install JulineMart</div>
        <div>Install the app for a full-screen experience with no URL bar.</div>
      </div>
      <div class="pwa-banner-actions">
        <button class="pwa-btn" id="pwaInstallBtn" type="button">Install</button>
        <button class="pwa-btn secondary" id="pwaInstallDismiss" type="button">Not now</button>
      </div>
    `;

    document.body.appendChild(banner);

    const dismiss = () => {
      localStorage.setItem(INSTALL_HINT_KEY, '1');
      banner.remove();
    };

    banner.querySelector('#pwaInstallBtn').addEventListener('click', async () => {
      if (!deferredPrompt) {
        dismiss();
        return;
      }
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      dismiss();
    });
    banner.querySelector('#pwaInstallDismiss').addEventListener('click', dismiss);
  };

  const showIOSBanner = () => {
    if (!isIOS() || isStandalone()) {
      return;
    }
    if (localStorage.getItem(IOS_HINT_KEY) === '1') {
      return;
    }

    const banner = document.createElement('div');
    banner.id = 'pwa-ios-banner';
    banner.className = 'show';
    banner.innerHTML = `
      <div class="pwa-banner-text">
        <div class="pwa-banner-title">Install on iPhone or iPad</div>
        <div>Tap Share, then choose "Add to Home Screen".</div>
      </div>
      <div class="pwa-banner-actions">
        <button class="pwa-btn secondary" id="pwaIosDismiss" type="button">Got it</button>
      </div>
    `;

    document.body.appendChild(banner);
    banner.querySelector('#pwaIosDismiss').addEventListener('click', () => {
      localStorage.setItem(IOS_HINT_KEY, '1');
      banner.remove();
    });
  };

  const registerServiceWorker = () => {
    if (!('serviceWorker' in navigator)) {
      return;
    }
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  };

  document.addEventListener('DOMContentLoaded', () => {
    injectStyles();
    updateIcons();
    createSplash();
    showIOSBanner();
    registerServiceWorker();
  });

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    showInstallBanner();
  });
})();
