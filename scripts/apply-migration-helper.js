#!/usr/bin/env node
/**
 * Migration Helper Script
 * Helps you apply the database migration
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '003_fix_inventory_and_sales_schema.sql')
const sqlEditorUrl = 'https://supabase.com/dashboard/project/ymftcsdkvtmnbhrmmaho/editor'

console.log('\n🔧 Database Migration Helper\n')
console.log('=' .repeat(60))

// Read migration file
const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')

console.log('\n📄 Migration file loaded successfully')
console.log(`   Location: ${migrationPath}`)
console.log(`   Size: ${migrationSQL.length} characters\n`)

// Try to copy to clipboard
try {
  if (process.platform === 'darwin') {
    // macOS
    execSync('pbcopy', { input: migrationSQL })
    console.log('✅ Migration SQL copied to clipboard!\n')
  } else if (process.platform === 'linux') {
    // Linux
    execSync('xclip -selection clipboard', { input: migrationSQL })
    console.log('✅ Migration SQL copied to clipboard!\n')
  } else {
    console.log('ℹ️  Automatic clipboard copy not available on this platform\n')
  }
} catch (error) {
  console.log('ℹ️  Could not copy to clipboard automatically\n')
}

console.log('📋 Next Steps:\n')
console.log('1. Open Supabase SQL Editor in your browser:')
console.log(`   ${sqlEditorUrl}\n`)
console.log('2. Paste the migration SQL (already in clipboard if on macOS)')
console.log('   Or manually copy from: ' + migrationPath + '\n')
console.log('3. Click "Run" or press Ctrl/Cmd + Enter\n')
console.log('4. Wait for success message\n')
console.log('5. Restart your dev server: npm run dev\n')

console.log('=' .repeat(60))

// Try to open browser
console.log('\n🌐 Opening Supabase SQL Editor in browser...\n')
try {
  if (process.platform === 'darwin') {
    execSync(`open "${sqlEditorUrl}"`)
  } else if (process.platform === 'linux') {
    execSync(`xdg-open "${sqlEditorUrl}"`)
  } else if (process.platform === 'win32') {
    execSync(`start "${sqlEditorUrl}"`)
  }
  console.log('✅ Browser opened!\n')
} catch (error) {
  console.log(`⚠️  Could not open browser automatically`)
  console.log(`   Please manually open: ${sqlEditorUrl}\n`)
}

console.log('💡 The migration SQL is ready to paste!\n')

// Show first few lines of migration
console.log('Preview of migration (first 5 lines):')
console.log('-'.repeat(60))
console.log(migrationSQL.split('\n').slice(0, 5).join('\n'))
console.log('...')
console.log('-'.repeat(60))
