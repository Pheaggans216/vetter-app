import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const { jobId, amount, tierLabel, buyerEmail, buyerName } = await req.json();

    if (!jobId || !amount || !tierLabel) {
      return Response.json({ error: 'Missing required fields: jobId, amount, tierLabel' }, { status: 400 });
    }

    const WIX_API_KEY = Deno.env.get('WIX_PAYMENTS_API_KEY');
    const WIX_SITE_ID = Deno.env.get('WIX_PAYMENTS_SITE_ID');

    if (!WIX_API_KEY || !WIX_SITE_ID) {
      console.error('Missing WIX_PAYMENTS_API_KEY or WIX_PAYMENTS_SITE_ID');
      return Response.json({ error: 'Payment configuration missing' }, { status: 500 });
    }

    const origin = req.headers.get('Origin') || 'https://app.base44.com';
    const thankYouUrl = `${origin}/listings?payment=success&jobId=${jobId}`;
    const cancelUrl = `${origin}/listings`;

    const body = {
      cart: {
        items: [
          {
            name: `Vetter Verification — ${tierLabel}`,
            quantity: 1,
            price: amount.toFixed(2),
          },
        ],
        ...(buyerEmail || buyerName ? {
          customerInfo: {
            ...(buyerEmail ? { email: buyerEmail } : {}),
            ...(buyerName ? {
              firstName: buyerName.split(' ')[0] || buyerName,
              lastName: buyerName.split(' ').slice(1).join(' ') || undefined,
            } : {}),
          }
        } : {}),
      },
      callbackUrls: {
        postFlowUrl: cancelUrl,
        thankYouPageUrl: thankYouUrl,
      },
    };

    const response = await fetch(
      'https://www.wixapis.com/payments/platform/v1/checkout-sessions/construct',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': WIX_API_KEY,
          'wix-site-id': WIX_SITE_ID,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Wix Payments API error:', JSON.stringify(data));
      return Response.json({ error: data.message || 'Failed to create checkout session' }, { status: response.status });
    }

    const redirectUrl = data.checkoutSession?.redirectUrl;
    if (!redirectUrl) {
      console.error('No redirectUrl in response:', JSON.stringify(data));
      return Response.json({ error: 'No checkout URL returned' }, { status: 500 });
    }

    // Store the checkout session ID on the job for reconciliation
    const base44 = createClientFromRequest(req);
    try {
      await base44.asServiceRole.entities.VetterJob.update(jobId, {
        status: 'pending_payment',
        payment_status: 'unpaid',
      });
    } catch (e) {
      console.error('Failed to update VetterJob (non-fatal):', e.message);
    }

    return Response.json({ redirectUrl });
  } catch (error) {
    console.error('create-checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});