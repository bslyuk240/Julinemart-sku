(() => {
  'use strict';

  const LOGO_KEY = 'jm_logo_url_v1';
  const DEFAULT_LOGO_URL = 'https://res.cloudinary.com/dupgdbwrt/image/upload/v1759971092/icon-512x512.png_ygtda9.png';
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
        top: calc(env(safe-area-inset-top) + 12px);
        background: linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%);
        color: #ffffff;
        border: none;
        border-radius: 16px;
        box-shadow: 0 18px 40px rgba(45, 27, 105, 0.35);
        padding: 16px 18px;
        display: none;
        align-items: center;
        gap: 14px;
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      }
      #pwa-install-banner.show,
      #pwa-ios-banner.show { display: flex; }
      .pwa-banner-text { flex: 1; font-size: 14px; line-height: 1.4; }
      .pwa-banner-title { font-weight: 700; font-size: 15px; margin-bottom: 4px; }
      .pwa-banner-actions { display: flex; gap: 10px; }
      .pwa-btn {
        border: none;
        background: #ffffff;
        color: #4c1d95;
        padding: 10px 14px;
        border-radius: 10px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 6px 16px rgba(17, 24, 39, 0.18);
      }
      .pwa-btn.secondary {
        background: rgba(255, 255, 255, 0.2);
        color: #ffffff;
        box-shadow: none;
      }
      html.pwa-standalone.pwa-ios body {
        padding-top: env(safe-area-inset-top);
      }
    `;

    document.head.appendChild(style);
  };

  const getLogoUrl = () => {
    const stored = localStorage.getItem(LOGO_KEY);
    return stored && /^https?:\/\//i.test(stored) ? stored : DEFAULT_LOGO_URL;
  };

  const updateIcons = () => {
    const logoUrl = getLogoUrl();

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

    const logoUrl = getLogoUrl();
    if (logoUrl) {
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

  const applySafeAreaToHeaders = () => {
    if (!isIOS()) {
      return;
    }
    const headers = document.querySelectorAll('header');
    headers.forEach((header) => {
      const styles = window.getComputedStyle(header);
      const paddingTop = parseFloat(styles.paddingTop) || 0;
      header.style.paddingTop = `calc(env(safe-area-inset-top) + ${paddingTop}px)`;
      header.style.top = '0px';
      header.style.zIndex = styles.zIndex === 'auto' ? '200' : styles.zIndex;
    });
  };

  const initPullToRefresh = () => {
    if (!isStandalone()) {
      return;
    }

    const indicator = document.createElement('div');
    indicator.id = 'pwa-pull-refresh';
    indicator.style.cssText = [
      'position:fixed',
      'left:16px',
      'right:16px',
      'top:calc(env(safe-area-inset-top) + 12px)',
      'height:36px',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'background:rgba(45,27,105,0.9)',
      'color:#fff',
      'border-radius:18px',
      'font-size:13px',
      'font-weight:600',
      'opacity:0',
      'transform:translateY(-10px)',
      'transition:opacity 0.2s ease, transform 0.2s ease',
      'z-index:10001'
    ].join(';');
    indicator.textContent = 'Pull to refresh';
    document.body.appendChild(indicator);

    let startY = 0;
    let pulling = false;
    let triggered = false;

    const onStart = (event) => {
      if (document.scrollingElement && document.scrollingElement.scrollTop > 0) {
        return;
      }
      startY = event.touches[0].clientY;
      pulling = true;
      triggered = false;
    };

    const onMove = (event) => {
      if (!pulling) {
        return;
      }
      const currentY = event.touches[0].clientY;
      const delta = currentY - startY;
      if (delta <= 0) {
        return;
      }
      event.preventDefault();

      const clamped = Math.min(delta, 90);
      indicator.style.opacity = '1';
      indicator.style.transform = `translateY(${Math.min(clamped / 3, 20)}px)`;
      indicator.textContent = clamped > 70 ? 'Release to refresh' : 'Pull to refresh';
      triggered = clamped > 70;
    };

    const onEnd = () => {
      if (!pulling) {
        return;
      }
      pulling = false;
      if (triggered) {
        indicator.textContent = 'Refreshing...';
        indicator.style.transform = 'translateY(0)';
        setTimeout(() => window.location.reload(), 200);
        return;
      }
      indicator.style.opacity = '0';
      indicator.style.transform = 'translateY(-10px)';
    };

    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd, { passive: true });
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
    if (isIOS()) {
      document.documentElement.classList.add('pwa-ios');
    }
    if (isStandalone()) {
      document.documentElement.classList.add('pwa-standalone');
    }
    injectStyles();
    updateIcons();
    createSplash();
    applySafeAreaToHeaders();
    initPullToRefresh();
    showIOSBanner();
    registerServiceWorker();
  });

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    showInstallBanner();
  });
})();
