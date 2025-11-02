/**
 * Vercel Serverless Function for Keep-Alive
 * This endpoint can be called by Vercel Cron to prevent Supabase from pausing
 * 
 * Usage:
 * 1. Deploy this to Vercel
 * 2. Set up a Vercel Cron job to call this endpoint every 6 days
 * 3. The cron configuration is in vercel.json
 */

// @ts-check
// Vercel Serverless Function for Keep-Alive
// Note: Install @vercel/node for types: npm install -D @vercel/node

export default async function handler(
  request: any,
  response: any,
) {
  // Only allow GET and POST requests
  if (request.method !== 'GET' && request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return response.status(500).json({ 
        error: 'Missing Supabase environment variables' 
      })
    }

    // Make a simple query to keep the project active
    const keepAliveUrl = `${supabaseUrl}/rest/v1/keep_alive`
    
    const insertResponse = await fetch(keepAliveUrl, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        activity_type: 'vercel_cron_heartbeat',
        timestamp: new Date().toISOString()
      })
    })

    // If insert fails, try a simple read query
    if (!insertResponse.ok) {
      const readUrl = `${supabaseUrl}/rest/v1/gallery_items?select=id&limit=1`
      await fetch(readUrl, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`
        }
      })
    }

    return response.status(200).json({ 
      success: true,
      message: 'Keep-alive heartbeat sent',
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Keep-alive error:', error)
    return response.status(500).json({ 
      error: 'Failed to send keep-alive',
      message: error.message 
    })
  }
}

