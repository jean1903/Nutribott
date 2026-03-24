export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metodo nao permitido' });

  try {
    const { imageBase64, mimeType, apiKey } = req.body;
    if (!imageBase64 || !apiKey) return res.status(400).json({ error: 'Dados obrigatorios ausentes' });

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
              text: `Voce e o melhor nutricionista do mundo, com 60 anos de experiencia. Analise esta foto de prato com MAXIMA PRECISAO.

REGRAS DE IDENTIFICACAO (CRITICAS):
- Analise COR, TEXTURA, FORMATO e TAMANHO de cada alimento
- FRANGO: carne BRANCA/BEGE, textura fibrosa. NUNCA confunda com peixe
- SALMON/PEIXE: carne LARANJA/ROSADA ou BRANCA com escamas
- CARNE BOVINA: MARROM escura, textura densa
- ARROZ: graos BRANCOS pequenos
- FEIJAO: graos ESCUROS/PRETOS/MARRONS
- Para ESTIMAR PORCOES: considere que um prato normal tem 25-30cm de diametro. Use isso como referencia de tamanho
- Seja CONSERVADOR nas porcoes — errar pra menos e melhor que errar pra mais
- Considere preparos tipicos BRASILEIROS: marmita, quentinha, feijao tropeiro, arroz branco, frango grelhado, carne assada, salada

ANALISE PERSONALIZADA DO PRATO:
- Se calorias > 700: alerta de prato calorico, sugira reducoes especificas
- Se proteinas < 25g: sugira como aumentar proteina
- Se carboidratos > 80g: sugira reduzir porcao de arroz/massa
- Se o prato for equilibrado: elogie e reforce o comportamento
- Sempre sugira 1 substituicao pratica e 1 adicao saudavel especifica para ESTE prato

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
  "nota_prato": 0,
  "analise_detalhada": "analise completa do prato em 2-3 frases: o que esta bom, o que pode melhorar, como esse prato impacta os objetivos de saude",
  "sugestao_reducao": "o que reduzir neste prato especifico e quanto ex: reduza o arroz de 300g para 150g economizando 150 kcal",
  "sugestao_adicao": "o que adicionar para melhorar ex: adicione 1 concha de feijao para aumentar fibras e proteinas",
  "indice_saciedade": "alto ou medio ou baixo",
  "dica": "mensagem motivadora e personalizada para este prato especifico em portugues brasileiro"
}`
            }
          ]
        }]
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.error?.message || 'Erro na API' });
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
