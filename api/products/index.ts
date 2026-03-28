import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    
    let query = supabase
      .from('products')
      .select('id, brand, name, category, life_stage, serving_size, kcal_per_serving')
      .eq('is_active', true)
      .or(`brand.ilike.%${q}%,name.ilike.%${q}%`)
      .limit(limit);
    
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'internal_error', message: 'Database query failed' });
    }
    
    return res.status(200).json({
      results: data || [],
      total: data?.length || 0,
      query: q
    });
    
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ error: 'internal_error', message: 'An error occurred' });
  }
}
