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
        model: 'claude-sonnet-4-6',
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
              text: `Voce e um nutricionista brasileiro especialista com visao extremamente precisa para identificar alimentos.

REGRAS CRITICAS DE IDENTIFICACAO:
- Analise a COR, TEXTURA e FORMATO de cada alimento com muito cuidado
- Frango tem carne BRANCA/BEGE clara. Salmao tem carne LARANJA/ROSADA. Carne bovina e MARROM escura. NUNCA confunda!
- Identifique o metodo de preparo: grelhado, cozido, frito, assado, refogado
- Identifique TODOS os ingredientes visiveis: carnes, graos, verduras, legumes, molhos, temperos, acompanhamentos
- Estime as porcoes em gramas baseado no tamanho visual
- A soma das calorias dos ingredientes deve ser EXATAMENTE igual ao total

CONTEXTO BRASILEIRO: Considere pratos tipicos brasileiros como marmita, feijao, arroz, farofa, salada, frango grelhado, carne assada, etc.

Responda SOMENTE JSON puro sem texto fora, sem markdown:
{
  "prato": "nome completo e preciso do prato",
  "calorias": 000,
  "proteinas": 00,
  "carboidratos": 00,
  "gorduras": 00,
  "fibras": 0,
  "sodio": 000,
  "ingredientes": [
    {
      "nome": "nome preciso do ingrediente",
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
