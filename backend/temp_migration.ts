import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

async function run() {
  try {
    await pool.query('ALTER TABLE needs ADD COLUMN media_url TEXT;');
    console.log('Successfully added media_url column');
  } catch (err: any) {
    if (err.code === '42701') {
       console.log('media_url column already exists');
    } else {
       console.error('Error adding column', err);
    }
  } finally {
    process.exit(0);
  }
}

run();
