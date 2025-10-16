/**
 * Shared Logo Management System - Supabase Version
 * Stores logo URL in Supabase settings table for cross-device sync
 */

const logoManager = {
  LOGO_KEY: 'site_logo_url',
  TITLE_KEY: 'site_title',
  supabase: null,
  
  /**
   * Initialize Supabase client
   */
  initSupabase() {
    if (!this.supabase && window.supabase && window.SUPABASE_URL && window.SUPABASE_ANON_KEY) {
      this.supabase = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
    }
    return this.supabase;
  },
  
  /**
   * Get logo URL from Supabase
   */
  async getLogoUrl() {
    const sb = this.initSupabase();
    if (!sb) return '';
    
    try {
      const { data, error } = await sb
        .from('settings')
        .select('value')
        .eq('key', this.LOGO_KEY)
        .maybeSingle();
      
      if (error) {
        console.warn('Could not fetch logo URL:', error.message);
        return '';
      }
      
      return data?.value || '';
    } catch (err) {
      console.warn('Error fetching logo:', err);
      return '';
    }
  },
  
  /**
   * Get site title from Supabase
   */
  async getSiteTitle() {
    const sb = this.initSupabase();
    if (!sb) return '';
    
    try {
      const { data, error } = await sb
        .from('settings')
        .select('value')
        .eq('key', this.TITLE_KEY)
        .maybeSingle();
      
      if (error) {
        console.warn('Could not fetch site title:', error.message);
        return '';
      }
      
      return data?.value || '';
    } catch (err) {
      console.warn('Error fetching title:', err);
      return '';
    }
  },
  
  /**
   * Save logo URL to Supabase
   */
  async setLogoUrl(url) {
    const sb = this.initSupabase();
    if (!sb) {
      console.error('Supabase not initialized');
      return false;
    }
    
    try {
      const { error } = await sb
        .from('settings')
        .upsert({
          key: this.LOGO_KEY,
          value: url,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'key'
        });
      
      if (error) throw error;
      
      console.log('✅ Logo URL saved to database');
      return true;
    } catch (err) {
      console.error('❌ Error saving logo URL:', err);
      return false;
    }
  },
  
  /**
   * Save site title to Supabase
   */
  async setSiteTitle(title) {
    const sb = this.initSupabase();
    if (!sb) {
      console.error('Supabase not initialized');
      return false;
    }
    
    try {
      const { error } = await sb
        .from('settings')
        .upsert({
          key: this.TITLE_KEY,
          value: title,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'key'
        });
      
      if (error) throw error;
      
      console.log('✅ Site title saved to database');
      return true;
    } catch (err) {
      console.error('❌ Error saving site title:', err);
      return false;
    }
  },
  
  /**
   * Initialize logo display for a page
   */
  async init(options = {}) {
    const {
      logoElementId = 'headerLogo',
      fallbackText = 'JulineMart',
      titleElementId = null,
      pageType = ''
    } = options;
    
    const logoElement = document.getElementById(logoElementId);
    const titleElement = titleElementId ? document.getElementById(titleElementId) : null;
    
    if (!logoElement) {
      console.warn('Logo element not found:', logoElementId);
      return;
    }
    
    // Get logo URL and title from Supabase
    const logoUrl = await this.getLogoUrl();
    const customTitle = await this.getSiteTitle();
    const displayTitle = customTitle || fallbackText;
    
    // Update page title
    this.updatePageTitle(pageType, customTitle || fallbackText);
    
    if (logoUrl) {
      this.updateLogoDisplay(logoElement, logoUrl, titleElement, displayTitle);
    } else {
      this.showFallback(logoElement, displayTitle, titleElement);
    }
  },
  
  /**
   * Update logo display with URL
   */
  updateLogoDisplay(logoElement, logoUrl, titleElement = null, displayTitle = 'JulineMart') {
    logoElement.src = logoUrl;
    logoElement.style.display = 'block';
    logoElement.classList.remove('broken');
    
    if (titleElement) {
      titleElement.textContent = displayTitle;
      titleElement.style.display = 'block';
    }
    
    logoElement.onerror = () => {
      console.warn('Failed to load logo:', logoUrl);
      logoElement.classList.add('broken');
      logoElement.style.display = 'none';
      if (titleElement) {
        titleElement.textContent = displayTitle;
        titleElement.style.display = 'block';
      }
    };
    
    logoElement.onload = () => {
      logoElement.classList.remove('broken');
      logoElement.style.display = 'block';
      if (titleElement) {
        titleElement.textContent = displayTitle;
        titleElement.style.display = 'block';
      }
    };
  },
  
  /**
   * Show fallback when no logo is available
   */
  showFallback(logoElement, displayTitle, titleElement = null) {
    logoElement.style.display = 'none';
    logoElement.src = '';
    logoElement.classList.remove('broken');
    
    if (titleElement) {
      titleElement.style.display = 'block';
      titleElement.textContent = displayTitle;
    }
  },
  
  /**
   * Update page title based on configured site title
   */
  updatePageTitle(pageType = '', baseName = 'JulineMart') {
    if (pageType) {
      document.title = `${pageType} - ${baseName}`;
    } else {
      document.title = baseName;
    }
  },
  
  /**
   * Get logo HTML for print/export functions
   */
  async getLogoForPrint() {
    const logoUrl = await this.getLogoUrl();
    const customTitle = await this.getSiteTitle();
    const displayTitle = customTitle || 'JulineMart';
    
    if (logoUrl) {
      return `<img src="${logoUrl}" alt="Logo" style="max-height: 50px; max-width: 150px; object-fit: contain;">`;
    }
    return `<div class="company-name">${displayTitle}</div>`;
  }
};

// Make it globally available
if (typeof window !== 'undefined') {
  window.logoManager = logoManager;
}
