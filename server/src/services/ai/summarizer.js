import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

/**
 * Generates a human-readable impact summary for a user.
 *
 * @param {{ completedDonations: number, totalQuantityKg: number }} stats
 * @returns {string} narrative summary
 */
export const generateImpactSummary = async (stats) => {
  if (!process.env.OPENAI_API_KEY) {
    return `You have completed ${stats.completedDonations} donations.`
  }

  const prompt = `Generate a short, warm, encouraging impact summary (2-3 sentences) for a food donor.
Stats:
- Completed donations: ${stats.completedDonations}
- Estimated food rescued: ${stats.totalQuantityKg} kg

Include: estimated meals provided (~2 per kg), CO₂ saved (~2.5 kg CO₂ per kg food).
Keep it friendly and motivating.`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 150,
  })

  return response.choices[0].message.content.trim()
}
