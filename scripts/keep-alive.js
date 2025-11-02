/**
 * Standalone Keep-Alive Script
 * Run this script periodically to prevent Supabase from pausing
 * 
 * Usage:
 * 1. Install dependencies: npm install node-fetch (or use built-in fetch in Node 18+)
 * 2. Run manually: node scripts/keep-alive.js
 * 3. Schedule with cron:
 *    - Linux/Mac: Add to crontab (crontab -e): 0 0 */6 * * /usr/bin/node /path/to/project/scripts/keep-alive.js
 *    - Windows: Use Task Scheduler
 * 
 * Or use an online cron service like:
 * - https://cron-job.org/
 * - https://www.easycron.com/
 * - https://www.setcronjob.com/
 */

// For Node.js < 18, uncomment and install: npm install node-fetch
// const fetch = require('node-fetch');

// Get these from your .env file or Supabase dashboard
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://eslqbocmhaaxzeptezwq.supabase.co'
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzbHFib2NtaGFheHplcHRlendxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNjY4NDAsImV4cCI6MjA3NzY0Mjg0MH0.A5wLOxtFUKy3VGPLiZG8IDmGTvSjBlF-SFj1OnLKgVc'

async function keepAlive() {
  try {
    console.log(`[${new Date().toISOString()}] Sending keep-alive heartbeat...`)

    // Try to insert a heartbeat record
    const insertUrl = `${SUPABASE_URL}/rest/v1/keep_alive`
    const insertResponse = await fetch(insertUrl, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        activity_type: 'external_heartbeat',
        timestamp: new Date().toISOString()
      })
    })

    if (insertResponse.ok) {
      console.log('✅ Keep-alive successful (insert)')
      return { success: true, method: 'insert' }
    }

    // If insert fails, try a simple read query
    console.log('⚠️  Insert failed, trying read query...')
    const readUrl = `${SUPABASE_URL}/rest/v1/gallery_items?select=id&limit=1`
    const readResponse = await fetch(readUrl, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    })

    if (readResponse.ok) {
      console.log('✅ Keep-alive successful (read)')
      return { success: true, method: 'read' }
    }

    throw new Error(`HTTP ${readResponse.status}: ${readResponse.statusText}`)
  } catch (error) {
    console.error('❌ Keep-alive failed:', error.message)
    process.exit(1)
  }
}

// Run the keep-alive function
keepAlive()
  .then((result) => {
    console.log(`Keep-alive completed: ${JSON.stringify(result)}`)
    process.exit(0)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })

