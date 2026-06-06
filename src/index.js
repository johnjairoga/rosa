/**
 * Cloudflare Worker — API WhatsApp Photo
 * Obtiene foto de perfil de WhatsApp vía RapidAPI
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

    // Validar formato (debe ser solo dígitos, 10-15 caracteres)
    const cleaned = number.replace(/\D/g, '');
    if (!cleaned.match(/^\d{10,15}$/)) {
      return new Response(JSON.stringify({ valid: false, message: 'Formato inválido' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const apiKey = env.RAPIDAPI_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API configuration error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Llamar a RapidAPI WhatsappNumberHasItWithToken
    // cleaned ya contiene solo dígitos (558296771065)
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

    // Verificar si la respuesta es JSON válido
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // RapidAPI devolvió HTML o algo que no es JSON
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

    // Manejar respuesta de RapidAPI
    // El endpoint retorna { status: "valid" } o { status: "invalid" }
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

export default {
  async fetch(request, env) {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };

    // Obtener pathname
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Manejar preflight CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders
      });
    }

    // Router: decidir qué handler ejecutar
    if (pathname === '/validate') {
      return validateWhatsAppNumber(request, env, corsHeaders);
    }

    if (pathname === '/photo') {
      // Solo aceptar POST para foto
      if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
      // Continuar con lógica de foto...
    } else {
      // Rutas no reconocidas
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    try {
      // Parsear request
      let body;
      try {
        body = await request.json();
      } catch (e) {
        return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      const { number } = body;

      if (!number) {
        return new Response(JSON.stringify({ error: 'number is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Validar formato de número
      const cleaned = number.replace(/[\s\-()]/g, '');

      // Debe ser solo números y opcionalmente +
      if (!cleaned.match(/^(\+)?[\d]{7,}$/)) {
        return new Response(JSON.stringify({ error: 'invalid number format' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Si tiene +, debe tener 10-15 dígitos
      if (cleaned.startsWith('+')) {
        const digits = cleaned.slice(1);
        if (digits.length < 10 || digits.length > 15) {
          return new Response(JSON.stringify({ error: 'invalid number length' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }

      const apiKey = env.RAPIDAPI_KEY_PHOTO;

      if (!apiKey) {
        console.log('[PHOTO] ❌ API key not found: RAPIDAPI_KEY_PHOTO');
        return new Response(JSON.stringify({ photoUrl: null }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Limpiar número
      const cleanNumber = number.replace(/\D/g, '');
      console.log('[PHOTO] 📱 Phone:', cleanNumber, '| API Key exists:', !!apiKey);

      // Llamar a RapidAPI
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

      // Si 404 = sin foto
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

      // Si error
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

      // Obtener foto como ArrayBuffer y convertir a data URL
      try {
        const imageBuffer = await response.arrayBuffer();
        console.log('[PHOTO] 📦 Got arrayBuffer, size:', imageBuffer.byteLength, 'bytes');

        const uint8Array = new Uint8Array(imageBuffer);
        console.log('[PHOTO] 📦 Created uint8Array, length:', uint8Array.byteLength);

        // Convertir a base64 sin usar apply (evita límite de argumentos en imágenes grandes)
        let binary = '';
        for (let i = 0; i < uint8Array.byteLength; i++) {
          binary += String.fromCharCode(uint8Array[i]);
        }
        console.log('[PHOTO] 🔄 Converted to binary string, length:', binary.length);

        const base64String = btoa(binary);
        console.log('[PHOTO] ✅ Base64 encoded, length:', base64String.length);

        const photoUrl = `data:image/jpeg;base64,${base64String}`;
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
};
