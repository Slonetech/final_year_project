/**
 * Script to apply database migration
 * Run with: npx tsx scripts/apply-migration.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyMigration() {
  try {
    console.log('📦 Reading migration file...')
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '003_fix_inventory_and_sales_schema.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')

    console.log('🚀 Applying migration to database...')
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL })

    if (error) {
      // If RPC doesn't exist, try direct execution (this might not work with complex migrations)
      console.log('⚠️  RPC method not available, trying alternative approach...')

      // Split migration into individual statements
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'))

      for (const statement of statements) {
        if (statement.toUpperCase().startsWith('DO $$') ||
            statement.toUpperCase().startsWith('CREATE OR REPLACE FUNCTION')) {
          console.log('⚠️  Skipping complex statement (requires Supabase Dashboard):')
          console.log(statement.substring(0, 100) + '...')
          continue
        }

        const { error: stmtError } = await (supabase as any).rpc('query', { query_text: statement })
        if (stmtError) {
          console.error(`❌ Error executing statement: ${stmtError.message}`)
        } else {
          console.log(`✅ Executed statement successfully`)
        }
      }

      console.log('\n⚠️  IMPORTANT: Complex migrations need to be run in Supabase Dashboard SQL Editor')
      console.log('📝 Copy the migration file content from:')
      console.log(migrationPath)
      console.log('\n🌐 And run it in your Supabase Dashboard:')
      console.log(`   ${supabaseUrl.replace('https://', 'https://supabase.com/dashboard/project/')}/editor`)

      return
    }

    console.log('✅ Migration applied successfully!')
  } catch (error: any) {
    console.error('❌ Error applying migration:', error.message)
    console.log('\n📝 Manual Migration Required:')
    console.log('Please run the migration manually in Supabase Dashboard SQL Editor')
    console.log(`Migration file: ${path.join(__dirname, '..', 'supabase', 'migrations', '003_fix_inventory_and_sales_schema.sql')}`)
    process.exit(1)
  }
}

applyMigration()
