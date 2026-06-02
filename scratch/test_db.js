const { PrismaClient } = require('@prisma/client');

async function testConn() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });

  try {
    console.log('Testing connection to:', process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/:[^:@/]+@/, ':***@') : 'undefined');
    await prisma.$connect();
    console.log('Successfully connected!');
    const count = await prisma.user.count();
    console.log('User count:', count);
  } catch (err) {
    console.error('Connection failed:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConn();
