/**
 * Cloudflare Worker — API WhatsApp + Stripe Payment
 */

// Validar número de WhatsApp
async function validateWhatsAppNumber(request, env, corsHeaders) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  try {
    const { number } = await request.json();

    if (!number) {
      return new Response(JSON.stringify({ error: 'number is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const cleaned = number.replace(/\D/g, '');
    if (!cleaned.match(/^\d{10,15}$/)) {
      return new Response(JSON.stringify({ valid: false, message: 'Formato inválido' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    let apiKey = env.RAPIDAPI_KEY;
    if (apiKey) {
      apiKey = apiKey.replace(/^﻿/, '').trim();
    }

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API configuration error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    console.log('Sending to RapidAPI:', {
      phone_number: cleaned,
      apiKeyExists: !!apiKey
    });

    const response = await fetch(
      'https://whatsapp-number-validator3.p.rapidapi.com/WhatsappNumberHasItWithToken',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-rapidapi-host': 'whatsapp-number-validator3.p.rapidapi.com',
          'x-rapidapi-key': apiKey
        },
        body: JSON.stringify({ phone_number: cleaned })
      }
    );

    console.log('RapidAPI response status:', response.status);

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('RapidAPI no JSON response:', { status: response.status, body: text.substring(0, 200) });
      return new Response(
        JSON.stringify({
          valid: false,
          message: 'No se pudo verificar el número. Intenta nuevamente.'
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    const data = await response.json();
    console.log('RapidAPI response:', data);

    const isValid = data.status === 'valid' || data.has_whatsapp === true;

    return new Response(
      JSON.stringify({
        valid: isValid,
        message: isValid
          ? '✓ Número validado correctamente'
          : '✗ Este número no tiene WhatsApp activo. Por favor, verifica el número e intenta con otro.'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// Crear PaymentIntent para Stripe
async function createPaymentIntent(request, env, corsHeaders) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  try {
    // No necesitamos datos del cliente aquí - Stripe los captura en el Payment Element
    await request.json();

    let stripeKey = env.STRIPE_SECRET_KEY;
    if (stripeKey) {
      stripeKey = stripeKey.replace(/^﻿/, '').trim();
    }

    if (!stripeKey) {
      return new Response(JSON.stringify({ error: 'Payment not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const stripeResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: '499',
        currency: 'usd',
        'automatic_payment_methods[enabled]': 'true',
      }).toString()
    });

    const paymentIntent = await stripeResponse.json();

    if (paymentIntent.error) {
      return new Response(JSON.stringify({ error: paymentIntent.error.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    return new Response(JSON.stringify({ clientSecret: paymentIntent.client_secret }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Payment error: ' + err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };

    const url = new URL(request.url);
    const pathname = url.pathname;

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders
      });
    }

    if (pathname === '/validate') {
      return validateWhatsAppNumber(request, env, corsHeaders);
    }

    if (pathname === '/create-payment-intent') {
      return createPaymentIntent(request, env, corsHeaders);
    }

    if (pathname === '/photo') {
      if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      try {
        const { number } = await request.json();

        if (!number) {
          return new Response(JSON.stringify({ error: 'number is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        const cleaned = number.replace(/[\s\-()]/g, '');

        if (!cleaned.match(/^(\+)?[\d]{7,}$/)) {
          return new Response(JSON.stringify({ error: 'invalid number format' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        if (cleaned.startsWith('+')) {
          const digits = cleaned.slice(1);
          if (digits.length < 10 || digits.length > 15) {
            return new Response(JSON.stringify({ error: 'invalid number length' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }
        }

        let apiKey = env.RAPIDAPI_KEY_PHOTO;
        if (apiKey) {
          apiKey = apiKey.replace(/^﻿/, '').trim();
        }

        if (!apiKey) {
          console.log('[PHOTO] ❌ API key not found: RAPIDAPI_KEY_PHOTO');
          return new Response(JSON.stringify({ photoUrl: null }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        const cleanNumber = number.replace(/\D/g, '');
        console.log('[PHOTO] 📱 Phone:', cleanNumber, '| API Key exists:', !!apiKey);

        const response = await fetch(
          `https://whatsapp-data1.p.rapidapi.com/picture/${cleanNumber}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'x-rapidapi-host': 'whatsapp-data1.p.rapidapi.com',
              'x-rapidapi-key': apiKey
            }
          }
        );

        console.log('[PHOTO] 🔗 RapidAPI Response Status:', response.status);

        if (response.status === 404) {
          console.log('[PHOTO] 🚫 Photo not found (404)');
          return new Response(JSON.stringify({ photoUrl: null }), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.log('[PHOTO] ❌ API Error:', response.status, '|', errorText.substring(0, 200));
          return new Response(JSON.stringify({ photoUrl: null }), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }

        let photoUrl = null;
        try {
          const imageBuffer = await response.arrayBuffer();
          console.log('[PHOTO] 📦 Got arrayBuffer, size:', imageBuffer.byteLength, 'bytes');

          const uint8Array = new Uint8Array(imageBuffer);
          console.log('[PHOTO] 📦 Created uint8Array, length:', uint8Array.byteLength);

          let binary = '';
          for (let i = 0; i < uint8Array.byteLength; i++) {
            binary += String.fromCharCode(uint8Array[i]);
          }
          console.log('[PHOTO] 🔄 Converted to binary string, length:', binary.length);

          const base64String = btoa(binary);
          console.log('[PHOTO] ✅ Base64 encoded, length:', base64String.length);

          photoUrl = `data:image/jpeg;base64,${base64String}`;
          console.log('[PHOTO] ✅ Photo URL generated, total length:', photoUrl.length);
        } catch (err) {
          console.error('[PHOTO] ❌ Error processing image:', err.message, err.stack);
          return new Response(JSON.stringify({ photoUrl: null }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        return new Response(JSON.stringify({ photoUrl }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });

      } catch (error) {
        console.error('Error:', error);
        return new Response(JSON.stringify({ error: 'Internal server error', details: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};
