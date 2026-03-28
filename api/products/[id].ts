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
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'invalid_input', message: 'Product ID required' });
    }
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();
    
    if (error || !data) {
      return res.status(404).json({ error: 'not_found', message: 'Product not found' });
    }
    
    return res.status(200).json(data);
    
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ error: 'internal_error', message: 'An error occurred' });
  }
}
