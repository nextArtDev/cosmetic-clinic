import pg from 'pg'
import 'dotenv/config'

const full = process.env.DATABASE_URL
const db = decodeURIComponent(full.split('/').pop() || 'cosmetic')
const admin = full.slice(0, full.lastIndexOf('/')) + '/'

const client = new pg.Client({ connectionString: admin })
await client.connect()
const res = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [db])
if (res.rowCount === 0) {
  await client.query(`CREATE DATABASE ${db}`)
  console.log(`✅ created database: ${db}`)
} else {
  console.log(`ℹ️ database already exists: ${db}`)
}
await client.end()
