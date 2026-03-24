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
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mimeType || 'image/jpeg', data: imageBase64 }
            },
            {
              type: 'text',
              text: `Voce e um nutricionista especialista com visao aguçada. Analise ABSOLUTAMENTE TODOS os alimentos visiveis nesta foto com maximo de detalhes.

REGRAS IMPORTANTES:
- Identifique CADA ingrediente separadamente: carnes, graos, verduras, legumes, molhos, temperos, acompanhamentos, bebidas, tudo
- Estime as porcoes em gramas baseado no tamanho visual do prato
- Calcule as calorias de CADA ingrediente separadamente
- A soma das calorias dos ingredientes deve ser igual ao total de calorias do prato
- Seja preciso e detalhado como um nutricionista real faria

Responda SOMENTE JSON sem texto fora, sem markdown, sem explicacoes extras:
{
  "prato": "nome completo detalhado do prato",
  "calorias": 000,
  "proteinas": 00,
  "carboidratos": 00,
  "gorduras": 00,
  "fibras": 0,
  "sodio": 000,
  "ingredientes": [
    {
      "nome": "nome do ingrediente",
      "porcao": "000g",
      "kcal": 000,
      "proteinas": 0,
      "carboidratos": 0,
      "gorduras": 0
    }
  ],
  "avaliacao": "otimo ou bom ou moderado ou evitar",
  "indice_saciedade": "alto ou medio ou baixo",
  "dica": "dica nutricional detalhada e motivadora em portugues brasileiro"
}`
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
