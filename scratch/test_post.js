async function run() {
  try {
    const res = await fetch('https://shieldai-eight.vercel.app/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@gmail.com', name: 'Test User' })
    });
    console.log('Status:', res.status);
    const json = await res.json();
    console.log('Response:', json);
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}
run();
