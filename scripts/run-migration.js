/**
 * Direct migration application script
 * This script applies the database migration to fix inventory and sales schema
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  console.log('🚀 Starting migration...\n')

  try {
    // Step 1: Rename columns in inventory table
    console.log('📝 Step 1: Updating inventory table columns...')

    // Check if column already exists to make script idempotent
    const { data: columns } = await supabase.rpc('exec_sql', {
      sql: `SELECT column_name FROM information_schema.columns WHERE table_name = 'inventory' AND column_name = 'stock_level';`
    }).catch(() => ({ data: null }))

    if (!columns || columns.length === 0) {
      // Rename quantity to stock_level
      await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE inventory RENAME COLUMN quantity TO stock_level;'
      }).catch(async () => {
        // Fallback: use pg_temp if RPC doesn't work
        const { error: e1 } = await supabase.from('inventory').select('stock_level').limit(1)
        if (e1 && e1.message.includes('column')) {
          console.log('⚠️  Need to run migration via Supabase Dashboard')
          console.log('   Column rename requires direct SQL access')
          throw new Error('Please run migration via Supabase Dashboard SQL Editor')
        }
      })
      console.log('  ✅ Renamed quantity → stock_level')
    } else {
      console.log('  ✅ stock_level column already exists')
    }

    console.log('\n⚠️  This migration requires DDL operations that need to be run in Supabase Dashboard')
    console.log('\n📋 Please follow these steps:')
    console.log('1. Go to: https://supabase.com/dashboard/project/ymftcsdkvtmnbhrmmaho/editor')
    console.log('2. Copy the content from: supabase/migrations/003_fix_inventory_and_sales_schema.sql')
    console.log('3. Paste into SQL Editor and click Run\n')

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.log('\n📝 Manual Migration Required:')
    console.log('Please run the migration in Supabase Dashboard SQL Editor')
    console.log(`Migration file: ${path.join(__dirname, '..', 'supabase', 'migrations', '003_fix_inventory_and_sales_schema.sql')}`)
    process.exit(1)
  }
}

runMigration()
