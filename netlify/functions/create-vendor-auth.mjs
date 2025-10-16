// netlify/functions/create-vendor-auth.js
// Using CommonJS syntax for Netlify compatibility

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
// Detect the site URL dynamically from the request
const SITE_URL = process.env.SITE_URL || 
                 process.env.URL || 
                 process.env.DEPLOY_PRIME_URL || 
                 'https://sku.julinemart.com';

console.log('🌐 Using SITE_URL:', SITE_URL);

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables!');
  console.error('SUPABASE_URL:', SUPABASE_URL ? 'Set' : 'Missing');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing');
}

// Create Supabase admin client with service role key
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

exports.handler = async function(event) {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { vendor_code, vendor_name, email } = JSON.parse(event.body);

    console.log('📨 Received request:', { vendor_code, vendor_name, email });
    console.log('🌐 Redirect URL will be:', `${SITE_URL}/vendor/reset-password.html`);

    // Validate input
    if (!vendor_code || !vendor_name || !email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing required fields: vendor_code, vendor_name, email' 
        })
      };
    }

    // Validate environment
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ Missing Supabase credentials in environment');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Server configuration error - missing Supabase credentials'
        })
      };
    }

    console.log('🔍 Checking if user exists:', email);

    let authCreated = false;
    let emailSent = false;
    let userId = null;
    let userExists = false;

    // Step 1: Try to create user
    console.log('➕ Attempting to create user:', email);
    
    try {
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email.toLowerCase(),
        email_confirm: true, // Skip email confirmation
        user_metadata: {
          role: 'vendor',
          vendor_code: vendor_code.toUpperCase(),
          vendor_name: vendor_name
        }
      });

      if (createError) {
        // Check if user already exists
        if (createError.message.includes('already registered') || 
            createError.message.includes('already been registered') ||
            createError.message.includes('already exists') ||
            createError.code === 'user_already_exists') {
          console.log('ℹ️ User already exists, will send password reset');
          userExists = true;
          // Don't throw error, continue to password reset
        } else {
          throw new Error(`Failed to create auth user: ${createError.message}`);
        }
      } else {
        console.log('✅ Auth user created:', newUser.user.id);
        authCreated = true;
        userId = newUser.user.id;
      }
    } catch (createError) {
      console.error('❌ Exception in user creation:', createError.message);
      
      // Check if it's a duplicate user error
      if (createError.message.includes('already registered') || 
          createError.message.includes('already been registered') ||
          createError.message.includes('already exists')) {
        console.log('ℹ️ User already exists (caught in exception), will send password reset');
        userExists = true;
        // Don't throw error, continue to password reset
      } else {
        throw createError;
      }
    }

    // Step 2: Send password reset email (for both new and existing users)
    console.log('📧 Sending password reset email...');
    
    try {
      const { data: resetData, error: resetError } = await supabaseAdmin.auth.resetPasswordForEmail(
        email.toLowerCase(),
        {
          redirectTo: `${SITE_URL}/vendor/reset-password.html`
        }
      );

      if (resetError) {
        console.error('❌ Password reset email error:', resetError.message);
        console.error('Error details:', resetError);
        emailSent = false;
      } else {
        console.log('✅ Password reset email sent');
        emailSent = true;
      }
    } catch (resetError) {
      console.error('❌ Exception in password reset:', resetError.message);
      emailSent = false;
    }

    // Success response
    const response = {
      success: true,
      vendor_code: vendor_code.toUpperCase(),
      vendor_name: vendor_name,
      email: email.toLowerCase(),
      authCreated: authCreated,
      userExists: userExists,
      emailSent: emailSent,
      userId: userId,
      redirectUrl: `${SITE_URL}/vendor/reset-password.html`,
      message: authCreated
        ? (emailSent 
            ? `✅ New vendor created and invitation email sent to ${email}` 
            : `⚠️ Vendor created but email failed - check Supabase email settings`)
        : (userExists && emailSent
            ? `✅ Vendor already exists, password reset email sent to ${email}`
            : `⚠️ Vendor exists but email failed - check Supabase email settings`)
    };

    console.log('✅ Success response:', response);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error('💥 Function error:', error);
    console.error('Error stack:', error.stack);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error.message || 'Failed to create vendor authentication',
        details: error.toString()
      })
    };
  }
};
