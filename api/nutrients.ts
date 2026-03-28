import type { VercelRequest, VercelResponse } from '@vercel/node';

const NUTRIENT_REFERENCES = {
  basis: 'per_1000kcal',
  life_stage: 'senior',
  nutrients: [
    { id: 'protein', name: 'Protein', unit: 'g', min: 56.3, max: null, senior_note: 'Maintain for muscle mass' },
    { id: 'fat', name: 'Fat', unit: 'g', min: 13.8, max: null, senior_note: 'Moderate fat for energy' },
    { id: 'fiber', name: 'Fiber', unit: 'g', min: 1.0, max: 10.0, senior_note: 'Supports digestion' },
    { id: 'calcium', name: 'Calcium', unit: 'g', min: 1.25, max: 4.5, senior_note: 'Balance with phosphorus' },
    { id: 'phosphorus', name: 'Phosphorus', unit: 'g', min: 1.0, max: 4.0, senior_note: 'May reduce for kidney support' },
    { id: 'omega3', name: 'Omega-3', unit: 'mg', min: 110, max: null, senior_note: 'Higher for joint and cognitive health' },
    { id: 'glucosamine', name: 'Glucosamine', unit: 'mg', min: 0, max: null, senior_note: 'Supports joints when supplemented' },
  ],
  source: 'AAFCO 2024 with senior adjustments',
  updated_at: '2025-03-28T00:00:00Z'
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'method_not_allowed', message: 'Only GET allowed' });
  }
  
  return res.status(200).json(NUTRIENT_REFERENCES);
}
