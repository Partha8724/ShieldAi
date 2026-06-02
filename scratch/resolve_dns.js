const dns = require('dns');

dns.resolve('db.yoiikgvdrnxrcmddmvbt.supabase.co', (err, addresses) => {
  if (err) {
    console.error(err);
    // Resolve CNAME
    dns.resolveCname('db.yoiikgvdrnxrcmddmvbt.supabase.co', (err2, cnames) => {
      console.log('CNAMEs:', cnames);
    });
  } else {
    console.log('IPs:', addresses);
  }
});
