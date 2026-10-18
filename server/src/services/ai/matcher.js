import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

/**
 * Scores a recipient against a listing and returns a match score + reasoning.
 *
 * @param {object} listing  - Listing document (populated)
 * @param {object} recipient - User document
 * @returns {{ score: number, reason: string }}
 */
export const scoreMatch = async (listing, recipient) => {
  if (!process.env.OPENAI_API_KEY) {
    return { score: 50, reason: 'AI matching unavailable — default score applied.' }
  }

  const prompt = `You are a food donation matching assistant.
Score how well this recipient matches this food listing (0–100).

Listing:
- Title: ${listing.title}
- Categories: ${(listing.categories || []).join(', ') || 'unknown'}
- Allergens: ${(listing.allergens || []).join(', ') || 'none'}
- Quantity: ${listing.quantity} ${listing.unit}

Recipient:
- Organization: ${recipient.organization || 'individual'}

Return a JSON object: { "score": number, "reason": string }
Respond with valid JSON only. No markdown.`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  })

  return JSON.parse(response.choices[0].message.content)
}
