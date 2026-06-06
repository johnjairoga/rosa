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

    // Validar formato
    const cleaned = number.replace(/[\s\-()]/g, '');
    if (!cleaned.match(/^(\+)?[\d]{7,}$/)) {
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
    // RapidAPI espera el número SIN el + inicial
    const phoneForApi = cleaned.replace(/^\+/, '');

    console.log('Sending to RapidAPI:', {
      phone_number: phoneForApi,
      cleaned: cleaned,
      original: number,
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
        body: JSON.stringify({ phone_number: phoneForApi })
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

    // Solo aceptar POST
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
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

      const apiKey = env.RAPIDAPI_KEY;

      if (!apiKey) {
        return new Response(JSON.stringify({ error: 'API configuration error' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Limpiar número
      const cleanNumber = number.replace(/\D/g, '');

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

      // Si 404 = sin foto
      if (response.status === 404) {
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
        return new Response(JSON.stringify({ photoUrl: null }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // Obtener URL de foto
      const photoUrl = await response.text();

      return new Response(JSON.stringify({ photoUrl: photoUrl || null }), {
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
