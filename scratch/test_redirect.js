async function run() {
  try {
    const res = await fetch('https://shieldai-eight.vercel.app/api/auth/oauth/redirect?provider=google', {
      redirect: 'manual'
    });
    console.log('Status:', res.status);
    console.log('Location:', res.headers.get('location'));
  } catch (err) {
    console.error('Error:', err.message);
  }
}
run();
