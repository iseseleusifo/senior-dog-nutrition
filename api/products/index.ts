import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'method_not_allowed', message: 'Only GET allowed' });
  }
  
  try {
    const q = req.query.q as string;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const category = req.query.category as string;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'invalid_input', message: 'Search query required (min 2 chars)' });
    }
    
    const searchTerm = q.trim().toLowerCase();
    
    // Search products table
    let productsQuery = supabase
      .from('products')
      .select('id, brand, name, category, life_stage, serving_size, serving_unit, kcal_per_serving, guaranteed_analysis')
      .eq('is_active', true)
      .or(`brand.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%`)
      .limit(Math.ceil(limit / 2));
    
    if (category) {
      productsQuery = productsQuery.eq('category', category);
    }
    
    // Search ingredients table
    const ingredientsQuery = supabase
      .from('ingredients')
      .select('id, name, category, subcategory, serving_size, serving_unit, kcal_per_serving, protein_g, fat_g, fiber_g, calcium_mg, omega3_mg, notes')
      .eq('is_active', true)
      .ilike('name', `%${searchTerm}%`)
      .limit(Math.ceil(limit / 2));
    
    // Run both queries in parallel
    const [productsResult, ingredientsResult] = await Promise.all([
      productsQuery,
      ingredientsQuery
    ]);
    
    if (productsResult.error) {
      console.error('Products query error:', productsResult.error);
    }
    
    if (ingredientsResult.error) {
      console.error('Ingredients query error:', ingredientsResult.error);
    }
    
    // Transform products to unified format
    const products = (productsResult.data || []).map(p => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      type: 'product',
      category: p.category,
      life_stage: p.life_stage,
      serving_size: p.serving_size,
      serving_unit: p.serving_unit || 'cup',
      kcal_per_serving: p.kcal_per_serving,
      nutrients: p.guaranteed_analysis || {},
      display: `${p.brand} ${p.name}`,
      subtitle: p.kcal_per_serving ? `${Math.round(p.kcal_per_serving)} kcal/${p.serving_unit || 'cup'}` : ''
    }));
    
    // Transform ingredients to unified format
    const ingredients = (ingredientsResult.data || []).map(i => ({
      id: i.id,
      name: i.name,
      brand: null,
      type: 'ingredient',
      category: i.category,
      subcategory: i.subcategory,
      serving_size: i.serving_size,
      serving_unit: i.serving_unit,
      kcal_per_serving: i.kcal_per_serving,
      nutrients: {
        protein: i.protein_g,
        fat: i.fat_g,
        fiber: i.fiber_g,
        calcium: i.calcium_mg ? i.calcium_mg / 1000 : 0, // Convert mg to g
        omega3: i.omega3_mg ? i.omega3_mg / 1000 : 0 // Convert mg to g
      },
      notes: i.notes,
      display: i.name,
      subtitle: i.kcal_per_serving ? `${Math.round(i.kcal_per_serving)} kcal/${i.serving_size}${i.serving_unit}` : ''
    }));
    
    // Merge and sort by relevance (exact matches first)
    const allResults = [...ingredients, ...products].sort((a, b) => {
      const aExact = a.name.toLowerCase().startsWith(searchTerm) ? 0 : 1;
      const bExact = b.name.toLowerCase().startsWith(searchTerm) ? 0 : 1;
      if (aExact !== bExact) return aExact - bExact;
      
      // Then by type (ingredients first for common terms)
      if (a.type !== b.type) return a.type === 'ingredient' ? -1 : 1;
      
      return a.name.localeCompare(b.name);
    });
    
    return res.status(200).json({
      results: allResults.slice(0, limit),
      total: allResults.length,
      query: q
    });
    
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ error: 'internal_error', message: 'An error occurred' });
  }
}
