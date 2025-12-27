// ============================================
// JulineMart Payment System - Shared Functions
// Location: /js/shared/payments.js
// ============================================

const PaymentSystem = {
  // Constants
  COMMISSION_RATE: 5.00,
  ADVANCE_PERCENTAGE: 40.00,
  BALANCE_PERCENTAGE: 60.00,
  
  // Payment status labels and colors
  STATUS_CONFIG: {
    'pending_advance': {
      label: 'Advance Pending',
      color: '#f59e0b',
      icon: 'PEND',
      description: 'Waiting for 40% advance payment'
    },
    'advance_paid': {
      label: 'Advance Paid',
      color: '#3b82f6',
      icon: 'ADV',
      description: 'Advance paid, awaiting hub delivery'
    },
    'hub_pending': {
      label: 'At Hub',
      color: '#8b5cf6',
      icon: 'HUB',
      description: 'Item at hub, awaiting verification'
    },
    'hub_verified': {
      label: 'Hub Verified',
      color: '#06b6d4',
      icon: 'VER',
      description: 'Item verified, balance payment ready'
    },
    'completed': {
      label: 'Completed',
      color: '#10b981',
      icon: 'DONE',
      description: 'Fully paid'
    },
    'rejected': {
      label: 'Rejected',
      color: '#ef4444',
      icon: 'REJ',
      description: 'Item rejected at hub'
    }
  },

  // Nigerian banks list
  NIGERIAN_BANKS: [
    { name: 'Access Bank', code: '044' },
    { name: 'Citibank Nigeria', code: '023' },
    { name: 'Ecobank Nigeria', code: '050' },
    { name: 'Fidelity Bank', code: '070' },
    { name: 'First Bank of Nigeria', code: '011' },
    { name: 'First City Monument Bank (FCMB)', code: '214' },
    { name: 'Guaranty Trust Bank (GTBank)', code: '058' },
    { name: 'Heritage Bank', code: '030' },
    { name: 'Keystone Bank', code: '082' },
    { name: 'Polaris Bank', code: '076' },
    { name: 'Providus Bank', code: '101' },
    { name: 'Stanbic IBTC Bank', code: '221' },
    { name: 'Standard Chartered Bank', code: '068' },
    { name: 'Sterling Bank', code: '232' },
    { name: 'Union Bank of Nigeria', code: '032' },
    { name: 'United Bank for Africa (UBA)', code: '033' },
    { name: 'Unity Bank', code: '215' },
    { name: 'Wema Bank', code: '035' },
    { name: 'Zenith Bank', code: '057' }
  ],

  // Calculate payment breakdown
  calculatePaymentBreakdown(productTotal) {
    const commissionAmount = productTotal * (this.COMMISSION_RATE / 100);
    const vendorEarnings = productTotal - commissionAmount;
    const advanceAmount = vendorEarnings * (this.ADVANCE_PERCENTAGE / 100);
    const balanceAmount = vendorEarnings * (this.BALANCE_PERCENTAGE / 100);

    return {
      productTotal: parseFloat(productTotal.toFixed(2)),
      commissionRate: this.COMMISSION_RATE,
      commissionAmount: parseFloat(commissionAmount.toFixed(2)),
      vendorEarnings: parseFloat(vendorEarnings.toFixed(2)),
      advancePercentage: this.ADVANCE_PERCENTAGE,
      advanceAmount: parseFloat(advanceAmount.toFixed(2)),
      balancePercentage: this.BALANCE_PERCENTAGE,
      balanceAmount: parseFloat(balanceAmount.toFixed(2))
    };
  },

  // Format currency (Nigerian Naira)
  formatCurrency(amount) {
    if (amount === null || amount === undefined) return 'NGN 0.00';
    return 'NGN ' + parseFloat(amount).toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  },

  // Format date
  formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  // Format datetime
  formatDateTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Get status badge HTML
  getStatusBadge(status) {
    const config = this.STATUS_CONFIG[status] || this.STATUS_CONFIG['pending_advance'];
    return `
      <span class="status-badge" style="background: ${config.color}20; color: ${config.color}; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
        
        <span>${config.label}</span>
      </span>
    `;
  },

  // Get payment progress percentage
  getPaymentProgress(payment) {
    if (payment.payment_status === 'completed') return 100;
    if (payment.payment_status === 'hub_verified' || payment.balance_paid) return 80;
    if (payment.payment_status === 'hub_pending') return 60;
    if (payment.payment_status === 'advance_paid') return 40;
    return 20;
  },

  // Get next action for payment
  getNextAction(payment) {
    switch (payment.payment_status) {
      case 'pending_advance':
        return { action: 'pay_advance', label: 'Pay Advance', color: '#f59e0b' };
      case 'advance_paid':
        return { action: 'mark_hub_received', label: 'Mark Hub Received', color: '#3b82f6' };
      case 'hub_pending':
        return { action: 'verify_item', label: 'Verify Item', color: '#8b5cf6' };
      case 'hub_verified':
        return { action: 'pay_balance', label: 'Pay Balance', color: '#10b981' };
      case 'completed':
        return { action: 'view_only', label: 'View Details', color: '#6b7280' };
      case 'rejected':
        return { action: 'view_only', label: 'View Details', color: '#ef4444' };
      default:
        return { action: 'view_only', label: 'View Details', color: '#6b7280' };
    }
  },

  // Validate payment data
  validatePaymentData(data) {
    const errors = [];

    if (!data.order_id || data.order_id <= 0) {
      errors.push('Valid order ID is required');
    }

    if (!data.order_date) {
      errors.push('Order date is required');
    }

    if (!data.vendor_code || data.vendor_code.trim() === '') {
      errors.push('Vendor is required');
    }

    if (!data.product_total || data.product_total <= 0) {
      errors.push('Product total must be greater than 0');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  },

  // Validate payment reference
  validatePaymentReference(reference) {
    if (!reference || reference.trim() === '') {
      return { isValid: false, error: 'Payment reference is required' };
    }
    if (reference.length < 5) {
      return { isValid: false, error: 'Payment reference must be at least 5 characters' };
    }
    return { isValid: true };
  },

  // Validate bank account
  validateBankAccount(accountData) {
    const errors = [];

    if (!accountData.bank_name || accountData.bank_name.trim() === '') {
      errors.push('Bank name is required');
    }

    if (!accountData.account_number || accountData.account_number.trim() === '') {
      errors.push('Account number is required');
    } else if (!/^\d{10}$/.test(accountData.account_number)) {
      errors.push('Account number must be exactly 10 digits');
    }

    if (!accountData.account_name || accountData.account_name.trim() === '') {
      errors.push('Account name is required');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  },

  // Generate payment receipt data
  generateReceiptData(payment, transaction) {
    return {
      receiptNumber: `PAY-${payment.order_id}-${transaction?.id?.substring(0, 8) || 'DRAFT'}`,
      date: this.formatDate(transaction?.transaction_date || new Date()),
      vendor: {
        code: payment.vendor_code,
        name: payment.vendor_name || payment.vendor_code
      },
      order: {
        id: payment.order_id,
        date: this.formatDate(payment.order_date),
        reference: payment.order_reference || `JLM-${payment.order_id}`
      },
      amounts: {
        productTotal: this.formatCurrency(payment.product_total),
        commission: this.formatCurrency(payment.commission_amount),
        vendorEarnings: this.formatCurrency(payment.vendor_earnings),
        advanceAmount: this.formatCurrency(payment.advance_amount),
        balanceAmount: this.formatCurrency(payment.balance_amount),
        paidAmount: this.formatCurrency(transaction?.amount || 0)
      },
      payment: {
        type: transaction?.transaction_type || 'N/A',
        method: transaction?.payment_method || 'N/A',
        reference: transaction?.payment_reference || 'N/A',
        status: transaction?.status || 'pending'
      }
    };
  },

  // Show toast notification
  showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `payment-toast payment-toast-${type}`;
    toast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 20px;">
          ${type === 'success' ? 'OK' : type === 'error' ? 'ERR' : type === 'warning' ? 'WARN' : 'INFO'}
        </span>
        <span>${message}</span>
      </div>
    `;

    // Add styles
    Object.assign(toast.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: type === 'success' ? '#10b981' : 
                  type === 'error' ? '#ef4444' : 
                  type === 'warning' ? '#f59e0b' : '#3b82f6',
      color: 'white',
      padding: '16px 24px',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: '10000',
      animation: 'slideInRight 0.3s ease-out',
      maxWidth: '400px'
    });

    document.body.appendChild(toast);

    // Remove after 4 seconds
    setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  },

  // Show loading indicator
  showLoading(message = 'Loading...') {
    const loader = document.createElement('div');
    loader.id = 'payment-loader';
    loader.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999;">
        <div style="background: white; padding: 32px; border-radius: 12px; text-align: center; min-width: 200px;">
          <div style="width: 40px; height: 40px; border: 4px solid #e5e7eb; border-top-color: #77088a; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px;"></div>
          <div style="color: #1f2937; font-weight: 600;">${message}</div>
        </div>
      </div>
    `;
    document.body.appendChild(loader);

    // Add spin animation
    if (!document.getElementById('payment-loader-style')) {
      const style = document.createElement('style');
      style.id = 'payment-loader-style';
      style.textContent = `
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideOutRight { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
      `;
      document.head.appendChild(style);
    }
  },

  // Hide loading indicator
  hideLoading() {
    const loader = document.getElementById('payment-loader');
    if (loader) loader.remove();
  },

  // Show confirmation dialog
  async showConfirm(title, message) {
    return new Promise((resolve) => {
      const result = confirm(`${title}\n\n${message}`);
      resolve(result);
    });
  },

  // Export to CSV
  exportToCSV(data, filename) {
    if (!data || data.length === 0) {
      this.showToast('No data to export', 'warning');
      return;
    }

    // Get headers
    const headers = Object.keys(data[0]);
    
    // Create CSV content
    let csv = headers.join(',') + '\n';
    
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma
        const stringValue = String(value || '').replace(/"/g, '""');
        return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
      });
      csv += values.join(',') + '\n';
    });

    // Create download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `payments-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    this.showToast('Export completed successfully', 'success');
  },

  // Get Supabase client (uses existing pattern from your app)
  getSupabase() {
    if (!window.supabase) {
      console.error('Supabase library not loaded');
      return null;
    }

    if (window.authManager) {
      if (!authManager.supabase) authManager.init();
      if (authManager.supabase) return authManager.supabase;
    }
    
    // Return existing client or create new one
    if (!this._supabaseClient) {
      const SUPABASE_URL = window.SUPABASE_URL || 'https://hnpwnjjjgxuelfognakp.supabase.co';
      const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY;
      this._supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    
    return this._supabaseClient;
  }
};

// Make globally available
window.PaymentSystem = PaymentSystem;









