async function run() {
  const ipStr = '2a05:d014:128e:9500:1464:8783:90d4:5b37';
  
  try {
    const res = await fetch('https://ip-ranges.amazonaws.com/ip-ranges.json');
    const data = await res.json();
    
    const targetBinary = ipToBinary(ipStr);
    
    let matchedRegion = null;
    let matchedPrefix = null;
    
    for (const range of data.ipv6_prefixes) {
      const [prefixIp, prefixLenStr] = range.ipv6_prefix.split('/');
      const prefixLen = parseInt(prefixLenStr, 10);
      const prefixBinary = ipToBinary(prefixIp);
      
      if (targetBinary.substring(0, prefixLen) === prefixBinary.substring(0, prefixLen)) {
        console.log(`Matched prefix: ${range.ipv6_prefix} -> Region: ${range.region}`);
        matchedRegion = range.region;
        matchedPrefix = range.ipv6_prefix;
      }
    }
    
    if (matchedRegion) {
      console.log(`FINAL MATCHED REGION: ${matchedRegion}`);
    } else {
      console.log('No region matched in AWS IP ranges.');
    }
  } catch (err) {
    console.error('Error finding region:', err.message);
  }
}

// Convert IPv6 to 128-bit binary string
function ipToBinary(ip) {
  let expanded = ip;
  if (ip.includes('::')) {
    const [left, right] = ip.split('::');
    const leftParts = left ? left.split(':') : [];
    const rightParts = right ? right.split(':') : [];
    const missingCount = 8 - (leftParts.length + rightParts.length);
    const middle = Array(missingCount).fill('0000').join(':');
    expanded = [...leftParts, ...middle.split(':'), ...rightParts].join(':');
  }
  
  return expanded.split(':').map(part => {
    const hex = part.padStart(4, '0');
    return parseInt(hex, 16).toString(2).padStart(16, '0');
  }).join('');
}

run();
