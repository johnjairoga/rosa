export default async function handler(req, res) {
  // Solo aceptar POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { number } = req.body;

  // Validar que el número esté presente
  if (!number) {
    return res.status(400).json({ error: 'number is required' });
  }

  // Validar que RAPIDAPI_KEY esté configurado
  if (!process.env.RAPIDAPI_KEY) {
    console.error('RAPIDAPI_KEY environment variable is not set');
    return res.status(500).json({ error: 'API configuration error' });
  }

  try {
    // Llamar a la API de RapidAPI
    const response = await fetch('https://whatsapp-data1.p.rapidapi.com/bulk_check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'whatsapp-data1.p.rapidapi.com',
        'x-rapidapi-key': process.env.RAPIDAPI_KEY
      },
      body: JSON.stringify({ numbers: [number] })
    });

    if (!response.ok) {
      console.error('RapidAPI response error:', response.status);
      return res.status(response.status).json({ error: 'Failed to fetch WhatsApp data' });
    }

    const data = await response.json();

    // Extraer foto del perfil de la respuesta
    // La API devuelve un array; tomamos el primer elemento
    const profile = data?.[0] || {};
    const photoUrl = profile.photo || profile.profile_photo || null;

    // Retornar la foto o null si no existe
    res.status(200).json({ photoUrl });
  } catch (error) {
    console.error('Error fetching WhatsApp photo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
