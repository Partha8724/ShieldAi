const dns = require('dns');

const hosts = [
  'aws-0-us-east-1.pooler.supabase.com',
  'aws-0-us-west-1.pooler.supabase.com',
  'aws-0-us-west-2.pooler.supabase.com',
  'aws-0-eu-west-1.pooler.supabase.com',
  'aws-0-eu-west-2.pooler.supabase.com',
  'aws-0-eu-west-3.pooler.supabase.com',
  'aws-0-eu-central-1.pooler.supabase.com',
  'aws-0-ap-southeast-1.pooler.supabase.com',
  'aws-0-ap-southeast-2.pooler.supabase.com',
  'aws-0-ap-northeast-1.pooler.supabase.com',
  'aws-0-ap-northeast-2.pooler.supabase.com',
  'aws-0-ap-south-1.pooler.supabase.com',
  'aws-0-sa-east-1.pooler.supabase.com',
  'aws-0-ca-central-1.pooler.supabase.com'
];

async function checkHost(host) {
  return new Promise((resolve) => {
    dns.lookup(host, { all: true }, (err, addresses) => {
      if (err) {
        resolve(null);
      } else {
        const ipv4s = addresses.filter(a => a.family === 4).map(a => a.address);
        resolve(ipv4s.length > 0 ? ipv4s : null);
      }
    });
  });
}

async function run() {
  for (const host of hosts) {
    const ipv4s = await checkHost(host);
    if (ipv4s) {
      console.log(`Host: ${host} has IPv4:`, ipv4s);
    }
  }
}

run();
