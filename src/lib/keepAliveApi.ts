/**
 * Keep-Alive API - Prevents Supabase project from pausing due to inactivity
 * This makes a simple database query to simulate activity
 */

import { supabase } from './supabase'

/**
 * Sends a keep-alive heartbeat to prevent project from pausing
 * This should be called periodically (every 6 days or so)
 */
export async function sendKeepAliveHeartbeat(): Promise<void> {
  try {
    // Simple query to keep the project active
    // This queries the keep_alive table we created
    const { error } = await supabase
      .from('keep_alive')
      .insert([
        {
          activity_type: 'api_heartbeat',
          timestamp: new Date().toISOString()
        }
      ])
      .select()
      .limit(1)

    if (error) {
      // If insert fails, try a simple read query instead
      await supabase
        .from('keep_alive')
        .select('id')
        .limit(1)

      console.log('Keep-alive heartbeat sent (read query)')
    } else {
      console.log('Keep-alive heartbeat sent (insert)')
    }
  } catch (error) {
    console.error('Keep-alive heartbeat failed:', error)
    // Try alternative: query any existing table
    try {
      await supabase
        .from('gallery_items')
        .select('id')
        .limit(1)
      console.log('Keep-alive heartbeat sent (fallback query)')
    } catch (fallbackError) {
      console.error('All keep-alive methods failed:', fallbackError)
    }
  }
}

/**
 * Alternative: Query any existing table
 * This is a minimal query that keeps the project active
 */
export async function sendMinimalKeepAlive(): Promise<void> {
  try {
    // Query the healthiest table (one that likely exists)
    const { error } = await supabase
      .from('gallery_items')
      .select('id')
      .limit(1)

    if (error) {
      // Try another table
      await supabase
        .from('shop_products')
        .select('id')
        .limit(1)
    }

    console.log('Minimal keep-alive sent')
  } catch (error) {
    console.error('Minimal keep-alive failed:', error)
  }
}

