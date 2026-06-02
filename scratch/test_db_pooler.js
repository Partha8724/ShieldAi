const { PrismaClient } = require('@prisma/client');

async function checkUrl(url) {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url
      }
    }
  });

  try {
    console.log('Testing url:', url.replace(/:[^:@/]+@/, ':***@'));
    await prisma.$connect();
    console.log('  -> SUCCESS!');
    return true;
  } catch (err) {
    console.log('  -> FAILED:', err.message);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

async function run() {
  const password = 'Parthadutta8724';
  const ref = 'yoiikgvdrnxrcmddmvbt';
  
  const urls = [
    // 1. Direct host on 6543
    `postgresql://postgres:${password}@db.${ref}.supabase.co:6543/postgres?pgbouncer=true`,
    // 2. Direct host on 6543 without pgbouncer
    `postgresql://postgres:${password}@db.${ref}.supabase.co:6543/postgres`,
    // 3. AWS pooler host
    `postgresql://postgres.${ref}:${password}@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true`,
    // 4. AWS pooler host without pgbouncer
    `postgresql://postgres.${ref}:${password}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`
  ];

  for (const url of urls) {
    await checkUrl(url);
  }
}

run();
