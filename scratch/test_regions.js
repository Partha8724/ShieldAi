const { PrismaClient } = require('@prisma/client');

const regions = [
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'eu-central-1',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-northeast-1',
  'ap-northeast-2',
  'ap-south-1',
  'sa-east-1',
  'ca-central-1'
];

async function checkRegion(region) {
  const ref = 'yoiikgvdrnxrcmddmvbt';
  const password = 'Parthadutta8724';
  const url = `postgresql://postgres.${ref}:${password}@aws-0-${region}.pooler.supabase.com:6543/postgres?pgbouncer=true`;

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url
      }
    }
  });

  try {
    await prisma.$connect();
    console.log(`Region SUCCESS: ${region}`);
    return true;
  } catch (err) {
    console.log(`Region ${region} failed: ${err.message.split('\n')[0]}`);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

async function run() {
  for (const region of regions) {
    const success = await checkRegion(region);
    if (success) {
      break;
    }
  }
}

run();
