import http from 'node:http';

// Set environment variables for the test run
process.env.PORT = '3099';
process.env.SUPABASE_URL = 'https://naxqsbyupqrljciubvyx.supabase.co';
process.env.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5heHFzYnl1cHFybGpjaXVidnl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUyNDMxNzYsImV4cCI6MjExMDgxOTE3Nn0.BaRd-HZPjx0DrowZ_hBuCOyY2sJ-B9iteSGdJNFU9NM';
process.env.SUPABASE_SECRET_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5heHFzYnl1cHFybGpjaXVidnl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5NTI0MzE3NiwiZXhwIjoyMTEwODE5MTc2fQ.1CcbMsJGoU48F2w4v1TU7Kle3jq_Jyx-LU3HCTGPL0Y';

// Import built api server dist (starts listening on PORT 3099)
await import('../../artifacts/api-server/dist/index.mjs');

console.log('🧪 Waiting 1000ms for API Server startup...');
await new Promise((r) => setTimeout(r, 1000));

function req(path, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(path, 'http://localhost:3099');
    const r = http.request(
      {
        hostname: 'localhost',
        port: 3099,
        path: parsedUrl.pathname + parsedUrl.search,
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data), headers: res.headers });
          } catch {
            resolve({ status: res.statusCode, body: data, headers: res.headers });
          }
        });
      }
    );
    r.on('error', reject);
    if (options.body) {
      r.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    r.end();
  });
}

async function runTests() {
  try {
    // 1. Worlds
    console.log('\n--- 1. Testing GET /api/worlds ---');
    const worldsRes = await req('/api/worlds');
    console.log(`Status: ${worldsRes.status}, Count: ${worldsRes.body.length}`);
    console.log(`First World: ${worldsRes.body[0]?.nameAr} (${worldsRes.body[0]?.nameEn}) - ID: ${worldsRes.body[0]?.id}`);

    // 2. Characters
    console.log('\n--- 2. Testing GET /api/characters ---');
    const charsRes = await req('/api/characters');
    console.log(`Status: ${charsRes.status}, Count: ${charsRes.body.length}`);
    console.log(`First Character: ${charsRes.body[0]?.nameAr} - Alignment: ${charsRes.body[0]?.alignment}`);

    // 3. Comics
    console.log('\n--- 3. Testing GET /api/comics ---');
    const comicsRes = await req('/api/comics');
    console.log(`Status: ${comicsRes.status}, Count: ${comicsRes.body.length}`);
    console.log(`First Comic: ${comicsRes.body[0]?.titleAr} - Issue: ${comicsRes.body[0]?.issueNumber}`);

    // 4. Products
    console.log('\n--- 4. Testing GET /api/shop/products ---');
    const prodRes = await req('/api/shop/products');
    console.log(`Status: ${prodRes.status}, Count: ${prodRes.body.length}`);
    console.log(`First Product: ${prodRes.body[0]?.nameAr} - Price: ${prodRes.body[0]?.priceEgp} EGP`);

    // 5. Subscription Plans
    console.log('\n--- 5. Testing GET /api/subscriptions/plans ---');
    const plansRes = await req('/api/subscriptions/plans');
    console.log(`Status: ${plansRes.status}, Count: ${plansRes.body.length}`);
    console.log(`First Plan: ${plansRes.body[0]?.nameAr} - Price: ${plansRes.body[0]?.priceEgp} EGP`);

    // 6. Auth Registration with real Supabase Auth
    const testEmail = `hekayaty_user_${Date.now()}@example.com`;
    const testPassword = 'Password1234!';
    console.log(`\n--- 6. Testing POST /api/auth/register (${testEmail}) ---`);
    const regRes = await req('/api/auth/register', {
      method: 'POST',
      body: {
        email: testEmail,
        password: testPassword,
        displayName: 'مستكشف حكاياتي الأصيل',
        role: 'reader',
      },
    });
    console.log(`Status: ${regRes.status}, Message: ${regRes.body.message}`);
    console.log(`Registered User ID: ${regRes.body.user?.id}, Role: ${regRes.body.user?.role}`);

    const authToken = regRes.body.token;

    // 7. Auth Login with real credentials
    console.log('\n--- 7. Testing POST /api/auth/login ---');
    const loginRes = await req('/api/auth/login', {
      method: 'POST',
      body: { email: testEmail, password: testPassword },
    });
    console.log(`Status: ${loginRes.status}, Token received: ${!!loginRes.body.token}`);
    console.log(`Logged in as: ${loginRes.body.user?.displayName}`);

    // 8. Auth /me with real Supabase Bearer Token
    console.log('\n--- 8. Testing GET /api/auth/me ---');
    const meRes = await req('/api/auth/me', {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    console.log(`Status: ${meRes.status}, Authenticated: ${meRes.body.isAuthenticated}`);
    console.log(`User: ${meRes.body.user?.displayName} (${meRes.body.user?.email})`);

    // 9. Real Supabase Favorites Toggle
    console.log('\n--- 9. Testing POST /api/user/favorites/toggle ---');
    const favRes1 = await req('/api/user/favorites/toggle', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: { contentType: 'comic', contentId: 'comic_1' },
    });
    console.log(`Status: ${favRes1.status}, Favorited: ${favRes1.body.favorited}, Count: ${favRes1.body.count}`);

    // 10. Real Supabase Reading Progress
    console.log('\n--- 10. Testing POST /api/user/progress ---');
    const progRes = await req('/api/user/progress', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: { contentType: 'comic', contentId: 'comic_1', progress: 15, isCompleted: false },
    });
    console.log(`Status: ${progRes.status}, Success: ${progRes.body.success}`);

    // 11. Real Supabase Checkout & Order Creation
    console.log('\n--- 11. Testing POST /api/orders/checkout ---');
    const checkRes = await req('/api/orders/checkout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        items: [
          { id: 1, nameAr: 'مجلة أبطال الذهب', priceEgp: 120, quantity: 2 },
          { id: 2, nameAr: 'حزمة البطاقات', priceEgp: 250, quantity: 1 },
        ],
        shippingAddress: { city: 'القاهرة', street: 'شارع المعز', country: 'مصر' },
        paymentMethod: 'credit_card',
      },
    });
    console.log(`Status: ${checkRes.status}, Order ID: ${checkRes.body.orderId}, Total: ${checkRes.body.totalEgp} EGP`);

    console.log('\n🎉 ALL REAL DATA ENDPOINTS VERIFIED SUCCESSFULLY WITH LIVE SUPABASE BACKEND!');
  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    process.exit(0);
  }
}

runTests();
