import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';
import { createApp } from './app.js';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is required');

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });
const app = createApp(prisma);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
