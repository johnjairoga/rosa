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
    // Limpiar número (remover caracteres especiales si es necesario)
    const cleanNumber = number.replace(/\D/g, '');

    // Llamar a RapidAPI — endpoint GET /picture/{number}
    const response = await fetch(
      `https://whatsapp-data1.p.rapidapi.com/picture/${cleanNumber}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-rapidapi-host': 'whatsapp-data1.p.rapidapi.com',
          'x-rapidapi-key': process.env.RAPIDAPI_KEY
        }
      }
    );

    if (!response.ok) {
      console.error(`RapidAPI error: ${response.status}`);
      // Si el número no existe o no tiene foto, retornar null sin error
      if (response.status === 404) {
        return res.status(200).json({ photoUrl: null });
      }
      return res.status(response.status).json({ error: 'Failed to fetch WhatsApp photo' });
    }

    // La respuesta directa es la URL de la foto
    const photoUrl = await response.text();

    // Retornar la URL o null si está vacía
    res.status(200).json({ photoUrl: photoUrl || null });
  } catch (error) {
    console.error('Error fetching WhatsApp photo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
