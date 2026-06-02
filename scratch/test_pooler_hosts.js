const { PrismaClient } = require('@prisma/client');
const dns = require('dns');

const hosts = [
  'aws-0-eu-central-1.pooler.supabase.com',
  'aws-1-eu-central-1.pooler.supabase.com',
  'aws-2-eu-central-1.pooler.supabase.com',
  'aws-3-eu-central-1.pooler.supabase.com',
  'eu-central-1.pooler.supabase.com',
  'db.yoiikgvdrnxrcmddmvbt.supabase.co'
];

async function checkHost(host) {
  const ref = 'yoiikgvdrnxrcmddmvbt';
  const password = 'Parthadutta8724';
  
  // Format user correctly based on host
  const user = host === 'db.yoiikgvdrnxrcmddmvbt.supabase.co' ? 'postgres' : `postgres.${ref}`;
  const url = `postgresql://${user}:${password}@${host}:6543/postgres?pgbouncer=true`;

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url
      }
    }
  });

  try {
    await prisma.$connect();
    console.log(`Host SUCCESS: ${host}`);
    return true;
  } catch (err) {
    console.log(`Host ${host} failed: ${err.message.split('\n')[0]}`);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

async function run() {
  for (const host of hosts) {
    console.log(`\nProbing host ${host}...`);
    // Resolve DNS lookup first to see if it has IPv4
    await new Promise((resolve) => {
      dns.lookup(host, { all: true }, (err, addresses) => {
        if (err) {
          console.log(`  DNS lookup failed: ${err.message}`);
          resolve();
        } else {
          console.log('  DNS addresses:', addresses);
          resolve();
        }
      });
    });
    
    await checkHost(host);
  }
}

run();
