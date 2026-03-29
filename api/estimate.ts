import type { VercelRequest, VercelResponse } from '@vercel/node';

// Stub mode: returns plausible fake nutrient data based on keyword matching
// Set STUB_MODE=true in environment to use this instead of real API

const NUTRIENT_PROFILES: Record<string, any> = {
  // Proteins
  chicken: { calories: 165, protein_g: 31, fat_g: 3.6, fiber_g: 0, calcium_mg: 11, phosphorus_mg: 200, omega3_mg: 50 },
  beef: { calories: 250, protein_g: 26, fat_g: 15, fiber_g: 0, calcium_mg: 18, phosphorus_mg: 175, omega3_mg: 30 },
  turkey: { calories: 170, protein_g: 29, fat_g: 5, fiber_g: 0, calcium_mg: 12, phosphorus_mg: 190, omega3_mg: 40 },
  salmon: { calories: 180, protein_g: 25, fat_g: 8, fiber_g: 0, calcium_mg: 15, phosphorus_mg: 250, omega3_mg: 1500 },
  fish: { calories: 150, protein_g: 22, fat_g: 5, fiber_g: 0, calcium_mg: 20, phosphorus_mg: 200, omega3_mg: 800 },
  egg: { calories: 78, protein_g: 6, fat_g: 5, fiber_g: 0, calcium_mg: 28, phosphorus_mg: 99, omega3_mg: 40 },
  liver: { calories: 135, protein_g: 21, fat_g: 4, fiber_g: 0, calcium_mg: 6, phosphorus_mg: 350, omega3_mg: 20 },
  lamb: { calories: 240, protein_g: 25, fat_g: 14, fiber_g: 0, calcium_mg: 15, phosphorus_mg: 180, omega3_mg: 25 },
  
  // Carbs/grains
  rice: { calories: 130, protein_g: 2.7, fat_g: 0.3, fiber_g: 0.4, calcium_mg: 10, phosphorus_mg: 43, omega3_mg: 0 },
  oatmeal: { calories: 150, protein_g: 5, fat_g: 2.5, fiber_g: 4, calcium_mg: 20, phosphorus_mg: 150, omega3_mg: 0 },
  potato: { calories: 90, protein_g: 2, fat_g: 0, fiber_g: 2, calcium_mg: 12, phosphorus_mg: 57, omega3_mg: 0 },
  sweet_potato: { calories: 90, protein_g: 2, fat_g: 0, fiber_g: 3, calcium_mg: 38, phosphorus_mg: 54, omega3_mg: 0 },
  
  // Vegetables
  carrot: { calories: 25, protein_g: 0.6, fat_g: 0.1, fiber_g: 2, calcium_mg: 20, phosphorus_mg: 21, omega3_mg: 0 },
  broccoli: { calories: 30, protein_g: 2.5, fat_g: 0.4, fiber_g: 2.5, calcium_mg: 40, phosphorus_mg: 60, omega3_mg: 0 },
  spinach: { calories: 20, protein_g: 2, fat_g: 0.3, fiber_g: 2, calcium_mg: 100, phosphorus_mg: 50, omega3_mg: 0 },
  pumpkin: { calories: 40, protein_g: 1, fat_g: 0.1, fiber_g: 3, calcium_mg: 20, phosphorus_mg: 44, omega3_mg: 0 },
  green_beans: { calories: 30, protein_g: 2, fat_g: 0.1, fiber_g: 3, calcium_mg: 40, phosphorus_mg: 38, omega3_mg: 0 },
  peas: { calories: 80, protein_g: 5, fat_g: 0.4, fiber_g: 5, calcium_mg: 25, phosphorus_mg: 100, omega3_mg: 0 },
  
  // Fruits
  apple: { calories: 50, protein_g: 0.3, fat_g: 0.2, fiber_g: 2.4, calcium_mg: 6, phosphorus_mg: 11, omega3_mg: 0 },
  banana: { calories: 90, protein_g: 1.1, fat_g: 0.3, fiber_g: 2.6, calcium_mg: 5, phosphorus_mg: 22, omega3_mg: 0 },
  blueberries: { calories: 40, protein_g: 0.5, fat_g: 0.2, fiber_g: 1.8, calcium_mg: 6, phosphorus_mg: 12, omega3_mg: 0 },
  
  // Supplements/additions
  fish_oil: { calories: 40, protein_g: 0, fat_g: 4.5, fiber_g: 0, calcium_mg: 0, phosphorus_mg: 0, omega3_mg: 1000 },
  salmon_oil: { calories: 40, protein_g: 0, fat_g: 4.5, fiber_g: 0, calcium_mg: 0, phosphorus_mg: 0, omega3_mg: 1200 },
  yogurt: { calories: 60, protein_g: 3.5, fat_g: 3, fiber_g: 0, calcium_mg: 120, phosphorus_mg: 95, omega3_mg: 0 },
  cottage_cheese: { calories: 100, protein_g: 11, fat_g: 4.5, fiber_g: 0, calcium_mg: 80, phosphorus_mg: 160, omega3_mg: 0 },
  peanut_butter: { calories: 95, protein_g: 4, fat_g: 8, fiber_g: 1, calcium_mg: 7, phosphorus_mg: 50, omega3_mg: 0 },
  
  // Commercial food types (per cup approximate)
  kibble: { calories: 350, protein_g: 25, fat_g: 14, fiber_g: 4, calcium_mg: 1200, phosphorus_mg: 1000, omega3_mg: 100 },
  dry_food: { calories: 350, protein_g: 25, fat_g: 14, fiber_g: 4, calcium_mg: 1200, phosphorus_mg: 1000, omega3_mg: 100 },
  wet_food: { calories: 100, protein_g: 8, fat_g: 5, fiber_g: 1, calcium_mg: 200, phosphorus_mg: 150, omega3_mg: 50 },
  canned: { calories: 100, protein_g: 8, fat_g: 5, fiber_g: 1, calcium_mg: 200, phosphorus_mg: 150, omega3_mg: 50 },
  treat: { calories: 30, protein_g: 2, fat_g: 1.5, fiber_g: 0.5, calcium_mg: 20, phosphorus_mg: 15, omega3_mg: 0 },
};

// Default fallback
const DEFAULT_PROFILE = { calories: 150, protein_g: 10, fat_g: 5, fiber_g: 1, calcium_mg: 50, phosphorus_mg: 40, omega3_mg: 10 };

function findMatchingProfiles(text: string): { keyword: string; profile: any }[] {
  const lower = text.toLowerCase();
  const matches: { keyword: string; profile: any }[] = [];
  
  for (const [keyword, profile] of Object.entries(NUTRIENT_PROFILES)) {
    // Handle underscores in keywords
    const searchTerms = [keyword, keyword.replace('_', ' ')];
    if (searchTerms.some(term => lower.includes(term))) {
      matches.push({ keyword, profile });
    }
  }
  
  return matches;
}

function estimatePortionMultiplier(text: string): number {
  const lower = text.toLowerCase();
  
  // Check for explicit amounts
  if (lower.includes('half') || lower.includes('1/2')) return 0.5;
  if (lower.includes('quarter') || lower.includes('1/4')) return 0.25;
  if (lower.includes('two') || lower.includes('2 cup')) return 2;
  if (lower.includes('small') || lower.includes('little') || lower.includes('bit')) return 0.5;
  if (lower.includes('large') || lower.includes('big')) return 1.5;
  if (lower.includes('spoon') || lower.includes('tbsp')) return 0.25;
  
  return 1; // Default to 1 serving
}

function generateStubEstimate(text: string) {
  const matches = findMatchingProfiles(text);
  const portionMultiplier = estimatePortionMultiplier(text);
  
  if (matches.length === 0) {
    // No keywords found, return low confidence default
    return {
      parsed_components: [
        { food: 'Unknown food item', amount: 1, unit: 'serving', grams_estimated: 100 }
      ],
      nutrients: {
        calories: Math.round(DEFAULT_PROFILE.calories * portionMultiplier),
        protein_g: Math.round(DEFAULT_PROFILE.protein_g * portionMultiplier),
        fat_g: Math.round(DEFAULT_PROFILE.fat_g * portionMultiplier),
        fiber_g: Math.round(DEFAULT_PROFILE.fiber_g * portionMultiplier * 10) / 10,
        calcium_mg: Math.round(DEFAULT_PROFILE.calcium_mg * portionMultiplier),
        phosphorus_mg: Math.round(DEFAULT_PROFILE.phosphorus_mg * portionMultiplier),
        omega3_mg: Math.round(DEFAULT_PROFILE.omega3_mg * portionMultiplier)
      },
      confidence: {
        score: 25,
        band: 'Low',
        rationale: 'Could not identify specific foods in description'
      }
    };
  }
  
  // Aggregate nutrients from all matched components
  const aggregated = {
    calories: 0,
    protein_g: 0,
    fat_g: 0,
    fiber_g: 0,
    calcium_mg: 0,
    phosphorus_mg: 0,
    omega3_mg: 0
  };
  
  const components = matches.map(({ keyword, profile }) => {
    const componentMultiplier = portionMultiplier / Math.max(matches.length * 0.7, 1); // Reduce per-component if multiple
    
    aggregated.calories += profile.calories * componentMultiplier;
    aggregated.protein_g += profile.protein_g * componentMultiplier;
    aggregated.fat_g += profile.fat_g * componentMultiplier;
    aggregated.fiber_g += profile.fiber_g * componentMultiplier;
    aggregated.calcium_mg += profile.calcium_mg * componentMultiplier;
    aggregated.phosphorus_mg += profile.phosphorus_mg * componentMultiplier;
    aggregated.omega3_mg += profile.omega3_mg * componentMultiplier;
    
    return {
      food: keyword.replace('_', ' '),
      amount: Math.round(componentMultiplier * 10) / 10,
      unit: 'serving',
      grams_estimated: Math.round(100 * componentMultiplier)
    };
  });
  
  // Round all values
  Object.keys(aggregated).forEach(key => {
    aggregated[key as keyof typeof aggregated] = Math.round(aggregated[key as keyof typeof aggregated] * 10) / 10;
  });
  
  // Confidence based on match count and specificity
  const confidenceScore = Math.min(85, 50 + matches.length * 15);
  const confidenceBand = confidenceScore >= 70 ? 'High' : confidenceScore >= 45 ? 'Medium' : 'Low';
  
  return {
    parsed_components: components,
    nutrients: aggregated,
    confidence: {
      score: confidenceScore,
      band: confidenceBand,
      rationale: `Identified ${matches.length} food component(s): ${matches.map(m => m.keyword.replace('_', ' ')).join(', ')}`
    }
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed', message: 'Only POST allowed' });
  }
  
  try {
    const { text, item_type } = req.body;
    
    if (!text || typeof text !== 'string' || text.trim().length < 3) {
      return res.status(400).json({ error: 'invalid_input', message: 'Text description required (min 3 chars)' });
    }
    
    const estimate = generateStubEstimate(text.trim());
    
    return res.status(200).json({
      estimate_id: `stub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...estimate,
      model_version: 'stub-v1',
      stub_mode: true
    });
    
  } catch (err) {
    console.error('Stub estimate error:', err);
    return res.status(500).json({ error: 'internal_error', message: 'Estimation failed' });
  }
}
