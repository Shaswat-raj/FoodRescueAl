import OpenAI from 'openai'
import Listing from '../../models/Listing.js'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

/**
 * Classifies a food listing using GPT-4o and updates the listing
 * with AI-populated categories and allergens.
 *
 * @param {import('../../models/Listing.js').default} listing
 */
export const classifyFood = async (listing) => {
  if (!process.env.OPENAI_API_KEY) return

  const prompt = `You are a food classification assistant.
Given a food listing title and description, return a JSON object with:
- categories: string[]  (e.g. ["prepared meals", "bakery"])
- allergens: string[]   (e.g. ["gluten", "dairy", "nuts"])
- estimated_servings: number

Listing title: ${listing.title}
Description: ${listing.description || 'N/A'}
Quantity: ${listing.quantity} ${listing.unit}

Respond with valid JSON only. No markdown.`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.2,
  })

  const result = JSON.parse(response.choices[0].message.content)

  await Listing.findByIdAndUpdate(listing._id, {
    categories:   result.categories   || [],
    allergens:    result.allergens    || [],
    aiClassified: true,
  })
}
