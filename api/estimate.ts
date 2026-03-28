import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are a pet nutrition estimation assistant. Given a description of dog food, parse it into components and estimate nutritional content.

Respond ONLY with valid JSON in this exact format:
{
  "parsed_components": [
    {"food": "food name", "amount": 0.5, "unit": "cup", "grams_estimated": 70}
  ],
  "nutrients": {
    "calories": 145,
    "protein_g": 18,
    "fat_g": 3,
    "fiber_g": 0.5,
    "calcium_mg": 8,
    "phosphorus_mg": 140,
    "omega3_mg": 20
  },
  "confidence": {
    "score": 72,
    "band": "medium",
    "rationale": "Brief explanation"
  }
}

Confidence bands: high (80-100), medium (50-79), low (0-49).
Use USDA data for human foods. Use typical commercial values for dog foods.`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed', message: 'Only POST allowed' });
  }
  
  try {
    const { text, item_type, dog_weight_kg, portion_hint } = req.body;
    
    if (!text || typeof text !== 'string' || text.trim().length < 3) {
      return res.status(400).json({ error: 'invalid_input', message: 'Text description required' });
    }
    
    let userMessage = `Estimate the nutritional content of this dog food:\n\n"${text.trim()}"`;
    if (item_type) userMessage += `\n\nItem type: ${item_type}`;
    if (dog_weight_kg) userMessage += `\nDog weight: ${dog_weight_kg} kg`;
    if (portion_hint) userMessage += `\nPortion hint: ${portion_hint}`;
    
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });
    
    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }
    
    const cleanText = content.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleanText);
    
    return res.status(200).json({
      estimate_id: `est_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...parsed,
      model_version: 'claude-sonnet-4-20250514'
    });
    
  } catch (err) {
    console.error('Error:', err);
    return res.status(503).json({ error: 'ai_unavailable', message: 'AI estimation service error' });
  }
}
