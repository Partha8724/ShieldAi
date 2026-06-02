const dns = require('dns');

dns.lookup('db.yoiikgvdrnxrcmddmvbt.supabase.co', { all: true }, (err, addresses) => {
  if (err) console.error(err);
  else console.log('Addresses:', addresses);
});
