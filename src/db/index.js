import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// Coloque sua URL do Neon no arquivo .env na raiz do projeto:
// DATABASE_URL="postgresql://usuario:senha@ep-nome-banco.us-east-2.aws.neon.tech/neondb?sslmode=require"
const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });