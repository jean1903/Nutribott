export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metodo nao permitido' });

  try {
    const { imageBase64, mimeType, apiKey } = req.body;

    if (!imageBase64 || !apiKey) {
      return res.status(400).json({ error: 'imageBase64 e apiKey sao obrigatorios' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mimeType || 'image/jpeg', data: imageBase64 }
            },
            {
              type: 'text',
              text: 'Voce e nutricionista. Analise esta foto de prato. Responda SOMENTE JSON sem texto fora, sem markdown: {"prato":"nome","calorias":000,"proteinas":00,"carboidratos":00,"gorduras":00,"fibras":0,"ingredientes":[{"nome":"item","porcao":"100g","kcal":000}],"avaliacao":"otimo","dica":"dica motivadora curta em portugues"}'
            }
          ]
        }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Erro na API Anthropic' });
    }

    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
