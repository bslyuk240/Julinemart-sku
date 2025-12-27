// ============================================
// JulineMart Payment Email Notifications
// Location: /netlify/functions/send-payment-email.js
// ============================================

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Email configuration (configure in Netlify environment variables)
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.ionos.co.uk';
const SMTP_PORT = process.env.SMTP_PORT || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@julinemart.com';
const FROM_NAME = process.env.FROM_NAME || 'JulineMart';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Email templates
const EMAIL_TEMPLATES = {
  advance_paid: {
    subject: '✅ Advance Payment Received - Order #{orderId}',
    getBody: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #77088a; color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0;">💰 Payment Received!</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <p style="font-size: 16px; color: #1f2937;">Hi ${data.vendorName},</p>
          
          <p style="font-size: 16px; color: #1f2937;">
            Great news! We've processed your advance payment for Order #${data.orderId}.
          </p>
          
          <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #10b981; margin-top: 0;">Payment Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Order ID:</td>
                <td style="padding: 8px 0; font-weight: bold; text-align: right;">#${data.orderId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Payment Type:</td>
                <td style="padding: 8px 0; font-weight: bold; text-align: right;">Advance (40%)</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Amount Paid:</td>
                <td style="padding: 8px 0; font-weight: bold; text-align: right; color: #10b981; font-size: 18px;">₦${data.amount.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Payment Date:</td>
                <td style="padding: 8px 0; font-weight: bold; text-align: right;">${data.paymentDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Payment Method:</td>
                <td style="padding: 8px 0; font-weight: bold; text-align: right;">${data.paymentMethod}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Reference:</td>
                <td style="padding: 8px 0; font-weight: bold; text-align: right;">${data.paymentReference}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <h4 style="color: #1e40af; margin-top: 0;">Next Steps:</h4>
            <ol style="color: #1e3a8a; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Deliver the item to <strong>${data.hubName}</strong></li>
              <li style="margin-bottom: 8px;">Our team will verify the item quality</li>
              <li style="margin-bottom: 8px;">Once verified, you'll receive the balance payment (60%): <strong>₦${data.balanceAmount.toLocaleString()}</strong></li>
            </ol>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
            Track your payment status anytime at 
            <a href="https://sku.julinemart.com/vendor/payments.html" style="color: #77088a; text-decoration: none; font-weight: bold;">Vendor Portal</a>
          </p>
        </div>
        
        <div style="background: #1f2937; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">© ${new Date().getFullYear()} JulineMart. All rights reserved.</p>
          <p style="margin: 8px 0 0 0; color: #9ca3af;">This is an automated notification. Please do not reply to this email.</p>
        </div>
      </div>
    `
  },

  balance_paid: {
    subject: '🎉 Full Payment Completed - Order #{orderId}',
    getBody: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #10b981; color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0;">🎉 Payment Complete!</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <p style="font-size: 16px; color: #1f2937;">Hi ${data.vendorName},</p>
          
          <p style="font-size: 16px; color: #1f2937;">
            Excellent news! We've completed the final payment for Order #${data.orderId}. You've now received 100% of your earnings for this order.
          </p>
          
          <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #10b981; margin-top: 0;">Final Payment Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Order ID:</td>
                <td style="padding: 8px 0; font-weight: bold; text-align: right;">#${data.orderId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Payment Type:</td>
                <td style="padding: 8px 0; font-weight: bold; text-align: right;">Balance (60%)</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Amount Paid:</td>
                <td style="padding: 8px 0; font-weight: bold; text-align: right; color: #10b981; font-size: 18px;">₦${data.amount.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Payment Date:</td>
                <td style="padding: 8px 0; font-weight: bold; text-align: right;">${data.paymentDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Payment Method:</td>
                <td style="padding: 8px 0; font-weight: bold; text-align: right;">${data.paymentMethod}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Reference:</td>
                <td style="padding: 8px 0; font-weight: bold; text-align: right;">${data.paymentReference}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: #d1fae5; border: 2px solid #10b981; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #065f46; margin-top: 0;">📊 Complete Payment Summary</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #059669;">Advance Payment (40%):</td>
                <td style="padding: 8px 0; font-weight: bold; text-align: right;">₦${data.advanceAmount.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #059669;">Balance Payment (60%):</td>
                <td style="padding: 8px 0; font-weight: bold; text-align: right;">₦${data.amount.toLocaleString()}</td>
              </tr>
              <tr style="border-top: 2px solid #10b981;">
                <td style="padding: 12px 0; color: #065f46; font-size: 16px; font-weight: bold;">Total Received:</td>
                <td style="padding: 12px 0; font-weight: bold; text-align: right; color: #10b981; font-size: 20px;">₦${data.totalEarnings.toLocaleString()}</td>
              </tr>
            </table>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
            View your complete payment history at 
            <a href="https://sku.julinemart.com/vendor/payments.html" style="color: #77088a; text-decoration: none; font-weight: bold;">Vendor Portal</a>
          </p>
        </div>
        
        <div style="background: #1f2937; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">© ${new Date().getFullYear()} JulineMart. All rights reserved.</p>
          <p style="margin: 8px 0 0 0; color: #9ca3af;">This is an automated notification. Please do not reply to this email.</p>
        </div>
      </div>
    `
  },

  hub_verified: {
    subject: '✅ Item Verified - Balance Payment Incoming | Order #{orderId}',
    getBody: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #3b82f6; color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0;">✅ Item Verified!</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <p style="font-size: 16px; color: #1f2937;">Hi ${data.vendorName},</p>
          
          <p style="font-size: 16px; color: #1f2937;">
            Good news! Your item for Order #${data.orderId} has been verified at ${data.hubName}. Your balance payment is being processed.
          </p>
          
          <div style="background: white; border: 2px solid #3b82f6; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">Verification Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Order ID:</td>
                <td style="padding: 8px 0; font-weight: bold; text-align: right;">#${data.orderId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Hub:</td>
                <td style="padding: 8px 0; font-weight: bold; text-align: right;">${data.hubName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Verified Date:</td>
                <td style="padding: 8px 0; font-weight: bold; text-align: right;">${data.verifiedDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Status:</td>
                <td style="padding: 8px 0; font-weight: bold; text-align: right; color: #10b981;">✅ Approved</td>
              </tr>
            </table>
          </div>
          
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <h4 style="color: #92400e; margin-top: 0;">Balance Payment Coming Soon</h4>
            <p style="color: #78350f; margin: 0;">
              Your balance payment of <strong style="font-size: 18px;">₦${data.balanceAmount.toLocaleString()}</strong> is now ready for processing. 
              You'll receive it shortly along with a payment confirmation email.
            </p>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
            Track your payment at 
            <a href="https://sku.julinemart.com/vendor/payments.html" style="color: #77088a; text-decoration: none; font-weight: bold;">Vendor Portal</a>
          </p>
        </div>
        
        <div style="background: #1f2937; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">© ${new Date().getFullYear()} JulineMart. All rights reserved.</p>
        </div>
      </div>
    `
  },

  item_rejected: {
    subject: '⚠️ Item Issue - Order #{orderId}',
    getBody: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #ef4444; color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0;">⚠️ Item Issue</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <p style="font-size: 16px; color: #1f2937;">Hi ${data.vendorName},</p>
          
          <p style="font-size: 16px; color: #1f2937;">
            We need to inform you about an issue with your item for Order #${data.orderId}.
          </p>
          
          <div style="background: #fee2e2; border: 2px solid #ef4444; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #991b1b; margin-top: 0;">Issue Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Order ID:</td>
                <td style="padding: 8px 0; font-weight: bold; text-align: right;">#${data.orderId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Hub:</td>
                <td style="padding: 8px 0; font-weight: bold; text-align: right;">${data.hubName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Status:</td>
                <td style="padding: 8px 0; font-weight: bold; text-align: right; color: #ef4444;">❌ Issue Found</td>
              </tr>
            </table>
            
            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #fecaca;">
              <p style="margin: 0; color: #7f1d1d; font-weight: bold;">Reason:</p>
              <p style="margin: 8px 0 0 0; color: #991b1b;">${data.rejectionReason}</p>
            </div>
          </div>
          
          <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <h4 style="color: #1e40af; margin-top: 0;">What Happens Next?</h4>
            <p style="color: #1e3a8a; margin: 0;">
              Our team will contact you directly to resolve this issue. Please check your phone or email for further instructions.
            </p>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
            If you have questions, please contact us immediately.
          </p>
        </div>
        
        <div style="background: #1f2937; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">© ${new Date().getFullYear()} JulineMart. All rights reserved.</p>
        </div>
      </div>
    `
  }
};

// Send email function (simplified - you'll need to implement actual SMTP sending)
async function sendEmail(to, subject, htmlBody) {
  // For now, just log the email (implement actual SMTP sending using nodemailer)
  console.log('📧 EMAIL TO SEND:');
  console.log('To:', to);
  console.log('Subject:', subject);
  console.log('Body length:', htmlBody.length);
  
  // TODO: Implement actual SMTP sending using nodemailer
  // const nodemailer = require('nodemailer');
  // const transporter = nodemailer.createTransporter({ ... });
  // await transporter.sendMail({ from, to, subject, html: htmlBody });
  
  return true;
}

// Main handler
export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  console.log('send-payment-email invoked', {
    method: event.httpMethod,
    path: event.path,
    hasBody: Boolean(event.body)
  });

  try {
    const { paymentId, emailType } = JSON.parse(event.body);
    console.log('send-payment-email payload', { paymentId, emailType });

    if (!paymentId || !emailType) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'paymentId and emailType are required' })
      };
    }

    // Get payment details
    const { data: payment, error: paymentError } = await supabase
      .from('vendor_payments')
      .select(`
        *,
        vendors!vendor_payments_vendor_code_fkey (vendor_name, email)
      `)
      .eq('id', paymentId)
      .single();

    if (paymentError || !payment) {
      console.error('Payment lookup failed', {
        paymentId,
        paymentError: paymentError?.message || paymentError,
        code: paymentError?.code,
        details: paymentError?.details
      });
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: 'Payment not found',
          paymentId,
          supabaseError: paymentError?.message || null
        })
      };
    }

    const vendorEmail = payment.vendors?.email;
    if (!vendorEmail) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Vendor email not found' })
      };
    }

    // Get email template
    const template = EMAIL_TEMPLATES[emailType];
    if (!template) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid email type' })
      };
    }

    // Prepare email data
    const emailData = {
      vendorName: payment.vendors?.vendor_name || payment.vendor_code,
      orderId: payment.order_id,
      amount: emailType === 'advance_paid' ? payment.advance_amount : payment.balance_amount,
      paymentDate: emailType === 'advance_paid' ? payment.advance_paid_date : payment.balance_paid_date,
      paymentMethod: emailType === 'advance_paid' ? payment.advance_payment_method : payment.balance_payment_method,
      paymentReference: emailType === 'advance_paid' ? payment.advance_payment_reference : payment.balance_payment_reference,
      balanceAmount: payment.balance_amount,
      advanceAmount: payment.advance_amount,
      totalEarnings: payment.vendor_earnings,
      hubName: payment.hub_name,
      verifiedDate: payment.hub_verified_date,
      rejectionReason: payment.hub_verification_notes
    };

    // Generate email
    const subject = template.subject.replace('{orderId}', payment.order_id);
    const htmlBody = template.getBody(emailData);

    // Send email
    await sendEmail(vendorEmail, subject, htmlBody);

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        sentTo: vendorEmail 
      })
    };

  } catch (error) {
    console.error('Error sending email:', {
      message: error?.message,
      stack: error?.stack
    });
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to send email',
        details: error?.message || 'Unknown error'
      })
    };
  }
}
