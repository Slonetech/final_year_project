import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { Client } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ Missing DATABASE_URL');
  console.error('Please add DATABASE_URL to your .env.local file');
  console.error('You can find it in Supabase Dashboard > Project Settings > Database > Connection String > URI');
  process.exit(1);
}

async function runMigrations() {
  console.log('🚀 Starting migrations...\n');

  const client = new Client({
    connectionString: databaseUrl,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    const migrationsDir = join(process.cwd(), 'supabase', 'migrations');
    const files = readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Run migrations in order

    console.log(`Found ${files.length} migration files:\n`);

    for (const file of files) {
      console.log(`📝 Running migration: ${file}`);
      const filePath = join(migrationsDir, file);
      const sql = readFileSync(filePath, 'utf-8');

      try {
        await client.query(sql);
        console.log('  ✅ Success\n');
      } catch (err: any) {
        if (err.message.includes('already exists') || err.message.includes('does not exist')) {
          console.log('  ⚠️  Already applied or schema changed\n');
        } else {
          console.error(`  ❌ Error: ${err.message}\n`);
        }
      }
    }

    console.log('✨ Migration process completed!\n');

  } catch (err: any) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
