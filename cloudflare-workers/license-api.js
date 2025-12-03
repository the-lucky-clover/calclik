// Cloudflare Workers License Validation API
// Deploy to: workers.cloudflare.com

export default {
  async fetch(request, env) {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Validate license key
      if (path === '/api/validate' && request.method === 'POST') {
        const { licenseKey } = await request.json();
        
        if (!licenseKey) {
          return jsonResponse({ error: 'License key required' }, 400, corsHeaders);
        }

        // Check license in KV store
        const licenseData = await env.LICENSES.get(licenseKey, 'json');
        
        if (!licenseData) {
          return jsonResponse({ 
            valid: false, 
            error: 'Invalid license key' 
          }, 200, corsHeaders);
        }

        // Check expiration
        const now = Date.now();
        const expiresAt = new Date(licenseData.expiresAt).getTime();
        
        if (now > expiresAt) {
          return jsonResponse({ 
            valid: false, 
            error: 'License expired',
            expiresAt: licenseData.expiresAt 
          }, 200, corsHeaders);
        }

        // Check with Stripe for subscription status
        const stripeStatus = await checkStripeSubscription(
          licenseData.stripeCustomerId,
          env.STRIPE_SECRET_KEY
        );

        if (!stripeStatus.active) {
          return jsonResponse({ 
            valid: false, 
            error: 'Subscription inactive',
            stripeStatus: stripeStatus.status 
          }, 200, corsHeaders);
        }

        // Valid license
        return jsonResponse({
          valid: true,
          email: licenseData.email,
          plan: licenseData.plan,
          expiresAt: licenseData.expiresAt,
          customerId: licenseData.stripeCustomerId
        }, 200, corsHeaders);
      }

      // Stripe webhook handler
      if (path === '/api/stripe-webhook' && request.method === 'POST') {
        const signature = request.headers.get('stripe-signature');
        const body = await request.text();

        // Verify webhook signature
        const event = await verifyStripeWebhook(
          body,
          signature,
          env.STRIPE_WEBHOOK_SECRET
        );

        if (!event) {
          return jsonResponse({ error: 'Invalid signature' }, 400, corsHeaders);
        }

        // Handle different event types
        switch (event.type) {
          case 'checkout.session.completed':
            await handleCheckoutCompleted(event.data.object, env);
            break;
          
          case 'customer.subscription.updated':
            await handleSubscriptionUpdated(event.data.object, env);
            break;
          
          case 'customer.subscription.deleted':
            await handleSubscriptionDeleted(event.data.object, env);
            break;
          
          case 'invoice.payment_failed':
            await handlePaymentFailed(event.data.object, env);
            break;
        }

        return jsonResponse({ received: true }, 200, corsHeaders);
      }

      // Generate trial license (no payment required)
      if (path === '/api/trial' && request.method === 'POST') {
        const { email } = await request.json();
        
        if (!email || !isValidEmail(email)) {
          return jsonResponse({ error: 'Valid email required' }, 400, corsHeaders);
        }

        // Check if email already used trial
        const existingTrial = await env.TRIALS.get(email);
        if (existingTrial) {
          return jsonResponse({ 
            error: 'Email already used for trial' 
          }, 400, corsHeaders);
        }

        // Generate trial license
        const licenseKey = generateLicenseKey();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        const licenseData = {
          email,
          licenseKey,
          plan: 'trial',
          createdAt: new Date().toISOString(),
          expiresAt: expiresAt.toISOString(),
          stripeCustomerId: null,
          trial: true
        };

        // Store license
        await env.LICENSES.put(licenseKey, JSON.stringify(licenseData));
        await env.TRIALS.put(email, licenseKey);

        // Send email with license key
        await sendTrialEmail(email, licenseKey, env);

        return jsonResponse({
          success: true,
          licenseKey,
          expiresAt: expiresAt.toISOString()
        }, 200, corsHeaders);
      }

      return jsonResponse({ error: 'Not found' }, 404, corsHeaders);

    } catch (error) {
      console.error('Error:', error);
      return jsonResponse({ 
        error: 'Internal server error',
        message: error.message 
      }, 500, corsHeaders);
    }
  }
};

// Helper functions
function jsonResponse(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  });
}

function generateLicenseKey() {
  const segments = [];
  for (let i = 0; i < 4; i++) {
    segments.push(
      Math.random().toString(36).substring(2, 6).toUpperCase()
    );
  }
  return `CLIK-${segments.join('-')}`;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function checkStripeSubscription(customerId, secretKey) {
  const response = await fetch(
    `https://api.stripe.com/v1/customers/${customerId}/subscriptions`,
    {
      headers: {
        'Authorization': `Bearer ${secretKey}`
      }
    }
  );

  const data = await response.json();
  
  if (data.data && data.data.length > 0) {
    const subscription = data.data[0];
    return {
      active: subscription.status === 'active' || subscription.status === 'trialing',
      status: subscription.status
    };
  }

  return { active: false, status: 'none' };
}

async function verifyStripeWebhook(body, signature, secret) {
  // Simplified - use Stripe SDK in production
  try {
    const event = JSON.parse(body);
    // In production, verify the signature properly
    return event;
  } catch {
    return null;
  }
}

async function handleCheckoutCompleted(session, env) {
  const customerId = session.customer;
  const customerEmail = session.customer_email;
  const subscriptionId = session.subscription;

  // Get subscription details
  const response = await fetch(
    `https://api.stripe.com/v1/subscriptions/${subscriptionId}`,
    {
      headers: {
        'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`
      }
    }
  );

  const subscription = await response.json();
  const plan = subscription.items.data[0].price.recurring.interval; // 'month' or 'year'

  // Generate license key
  const licenseKey = generateLicenseKey();
  const expiresAt = new Date(subscription.current_period_end * 1000);

  const licenseData = {
    email: customerEmail,
    licenseKey,
    plan: plan === 'year' ? 'annual' : 'monthly',
    createdAt: new Date().toISOString(),
    expiresAt: expiresAt.toISOString(),
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
    trial: false
  };

  // Store license
  await env.LICENSES.put(licenseKey, JSON.stringify(licenseData));

  // Send email with license key
  await sendLicenseEmail(customerEmail, licenseKey, plan, env);
}

async function handleSubscriptionUpdated(subscription, env) {
  const customerId = subscription.customer;
  
  // Find license by customer ID
  const { keys } = await env.LICENSES.list();
  
  for (const key of keys) {
    const licenseData = await env.LICENSES.get(key.name, 'json');
    
    if (licenseData.stripeCustomerId === customerId) {
      // Update expiration date
      licenseData.expiresAt = new Date(subscription.current_period_end * 1000).toISOString();
      await env.LICENSES.put(key.name, JSON.stringify(licenseData));
      break;
    }
  }
}

async function handleSubscriptionDeleted(subscription, env) {
  const customerId = subscription.customer;
  
  // Find and expire license
  const { keys } = await env.LICENSES.list();
  
  for (const key of keys) {
    const licenseData = await env.LICENSES.get(key.name, 'json');
    
    if (licenseData.stripeCustomerId === customerId) {
      // Set expiration to now
      licenseData.expiresAt = new Date().toISOString();
      await env.LICENSES.put(key.name, JSON.stringify(licenseData));
      
      // Send cancellation email
      await sendCancellationEmail(licenseData.email, env);
      break;
    }
  }
}

async function handlePaymentFailed(invoice, env) {
  const customerId = invoice.customer;
  
  // Find license and notify user
  const { keys } = await env.LICENSES.list();
  
  for (const key of keys) {
    const licenseData = await env.LICENSES.get(key.name, 'json');
    
    if (licenseData.stripeCustomerId === customerId) {
      await sendPaymentFailedEmail(licenseData.email, env);
      break;
    }
  }
}

async function sendTrialEmail(email, licenseKey, env) {
  // Use Cloudflare Email Workers or SendGrid
  const emailData = {
    to: email,
    from: 'no-reply@calclik.app',
    subject: 'Your CalClik 7-Day Trial',
    html: `
      <h1>Welcome to CalClik!</h1>
      <p>Your 7-day free trial has started.</p>
      <p><strong>Your License Key:</strong> ${licenseKey}</p>
      <p>To activate:</p>
      <ol>
        <li>Open the CalClik extension</li>
        <li>Click "Activate License"</li>
        <li>Enter your license key</li>
      </ol>
      <p>Your trial ends in 7 days. We'll remind you 2 days before.</p>
      <p>Questions? Reply to this email.</p>
    `
  };

  // Send via your email provider
  await sendEmail(emailData, env);
}

async function sendLicenseEmail(email, licenseKey, plan, env) {
  const emailData = {
    to: email,
    from: 'no-reply@calclik.app',
    subject: 'Welcome to CalClik - Your License Key',
    html: `
      <h1>Thank you for subscribing to CalClik!</h1>
      <p>Your ${plan === 'year' ? 'annual' : 'monthly'} subscription is now active.</p>
      <p><strong>Your License Key:</strong> ${licenseKey}</p>
      <p>To activate:</p>
      <ol>
        <li>Open the CalClik extension</li>
        <li>Click "Activate License"</li>
        <li>Enter your license key above</li>
      </ol>
      <p>Your license will automatically renew. Manage your subscription at https://calclik.app/account</p>
    `
  };

  await sendEmail(emailData, env);
}

async function sendCancellationEmail(email, env) {
  const emailData = {
    to: email,
    from: 'no-reply@calclik.app',
    subject: 'CalClik Subscription Cancelled',
    html: `
      <h1>We're sorry to see you go</h1>
      <p>Your CalClik subscription has been cancelled.</p>
      <p>You can continue using CalClik until the end of your billing period.</p>
      <p>Want to come back? Reactivate anytime at https://calclik.app/pricing</p>
      <p>We'd love to hear your feedback: support@calclik.app</p>
    `
  };

  await sendEmail(emailData, env);
}

async function sendPaymentFailedEmail(email, env) {
  const emailData = {
    to: email,
    from: 'no-reply@calclik.app',
    subject: 'CalClik Payment Failed',
    html: `
      <h1>Payment Issue</h1>
      <p>We couldn't process your payment for CalClik.</p>
      <p>Please update your payment method at https://calclik.app/account</p>
      <p>Your subscription will be cancelled if payment isn't received within 7 days.</p>
    `
  };

  await sendEmail(emailData, env);
}

async function sendEmail(data, env) {
  // Implement with your email provider (SendGrid, Mailgun, etc.)
  // For now, log to console
  console.log('Email to send:', data);
}
