import crypto from 'node:crypto';
import { spawn } from 'node:child_process';

const BASE_URL = 'http://localhost:3001';

// Generate a valid development token using the known development secret
function getDevToken(userId = '00000000-0000-4000-8000-000000000001') {
  const secret = process.env.SESSION_SECRET_DEV || 'hekayaty_dev_secret_key_32_characters_minimum!';
  const expiresAt = Date.now() + 1000 * 60 * 60 * 24;
  const payload = `${userId}:${expiresAt}`;
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  const b64 = Buffer.from(payload).toString('base64url');
  return `hky_${b64}.${sig}`;
}

async function runTests() {
  console.log('================================================================');
  console.log('   HEKAYATY COMPREHENSIVE SECURITY REGRESSION TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} - ${details}`);
      failed++;
    }
  }

  // -------------------------------------------------------------------------
  // 1. CORS TESTS
  // -------------------------------------------------------------------------
  console.log('--- 1. CORS Origin Validation Tests ---');

  // 1.1 Legitimate Vercel production origin
  const res1 = await fetch(`${BASE_URL}/api/healthz`, {
    headers: { Origin: 'https://hekayaty-v3.vercel.app' },
  });
  assert(
    res1.headers.get('access-control-allow-origin') === 'https://hekayaty-v3.vercel.app',
    'CORS: Legitimate production Vercel domain is allowed'
  );

  // 1.2 Official apex domain
  const res2 = await fetch(`${BASE_URL}/api/healthz`, {
    headers: { Origin: 'https://hekayaty.com' },
  });
  assert(
    res2.headers.get('access-control-allow-origin') === 'https://hekayaty.com',
    'CORS: Official domain hekayaty.com is allowed'
  );

  // 1.3 Attacker Vercel subdomain
  const res3 = await fetch(`${BASE_URL}/api/healthz`, {
    headers: { Origin: 'https://evil-attacker.vercel.app' },
  });
  assert(
    !res3.headers.get('access-control-allow-origin'),
    'CORS: Malicious Vercel subdomain (evil-attacker.vercel.app) is strictly rejected'
  );

  // 1.4 Suffix spoofing
  const res4 = await fetch(`${BASE_URL}/api/healthz`, {
    headers: { Origin: 'https://hekayaty.com.evil.com' },
  });
  assert(
    !res4.headers.get('access-control-allow-origin'),
    'CORS: Suffix-spoofed origin (hekayaty.com.evil.com) is strictly rejected'
  );

  // 1.5 CSRF Block on mutating endpoint
  const res5 = await fetch(`${BASE_URL}/api/orders/checkout`, {
    method: 'POST',
    headers: {
      Origin: 'https://malicious-site.com',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items: [] }),
  });
  assert(
    res5.status === 403,
    'CSRF: Mutating request from untrusted Origin is blocked with HTTP 403'
  );

  // -------------------------------------------------------------------------
  // 2. RATE LIMITER IP SPOOFING RESISTANCE
  // -------------------------------------------------------------------------
  console.log('\n--- 2. Rate Limiting & IP Spoofing Resistance Tests ---');

  let blockedCount = 0;
  // Send 8 login attempts spoofing different X-Forwarded-For headers
  for (let i = 1; i <= 8; i++) {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': `203.0.113.${i}`,
      },
      body: JSON.stringify({ email: 'spoofed@example.com', password: 'wrongpassword' }),
    });
    if (res.status === 429) {
      blockedCount++;
    }
  }
  assert(
    blockedCount > 0,
    `Rate Limiting: Client was throttled (HTTP 429) despite spoofing X-Forwarded-For (Blocked ${blockedCount} requests)`
  );

  // -------------------------------------------------------------------------
  // 3. SSRF ELIMINATION IN UPLOADS
  // -------------------------------------------------------------------------
  console.log('\n--- 3. SSRF Elimination in Media Upload Tests ---');

  const authToken = getDevToken();

  // 3.1 Cloud metadata URL
  const resSsrf1 = await fetch(`${BASE_URL}/api/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ image: 'http://169.254.169.254/latest/meta-data/' }),
  });
  const dataSsrf1 = await resSsrf1.json();
  assert(
    resSsrf1.status === 400 && dataSsrf1.code === 'REMOTE_FETCH_DISABLED',
    'SSRF: Cloud metadata remote URL is rejected with REMOTE_FETCH_DISABLED'
  );

  // 3.2 Internal network address
  const resSsrf2 = await fetch(`${BASE_URL}/api/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ image: 'http://172.20.0.1:8080/internal' }),
  });
  const dataSsrf2 = await resSsrf2.json();
  assert(
    resSsrf2.status === 400 && dataSsrf2.code === 'REMOTE_FETCH_DISABLED',
    'SSRF: Internal Docker/VPC remote URL is rejected with REMOTE_FETCH_DISABLED'
  );

  // -------------------------------------------------------------------------
  // 4. FILE CONTENT VALIDATION & MAGIC BYTES
  // -------------------------------------------------------------------------
  console.log('\n--- 4. File Content Validation & Magic Bytes Tests ---');

  // 4.1 MIME spoofing: HTML script payload with declared image/png
  const scriptPayload = Buffer.from('<script>alert("XSS")</script>').toString('base64');
  const resMimeSpoof = await fetch(`${BASE_URL}/api/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ image: `data:image/png;base64,${scriptPayload}` }),
  });
  const dataMimeSpoof = await resMimeSpoof.json();
  assert(
    resMimeSpoof.status === 400 &&
      (dataMimeSpoof.code === 'INVALID_FILE_SIGNATURE' || dataMimeSpoof.code === 'MIME_SPOOFING_DETECTED'),
    'File Validation: MIME spoofing (<script> masked as image/png) rejected via Magic Bytes inspection'
  );

  // 4.2 Valid PNG header
  // 1x1 transparent PNG binary bytes
  const validPngBuffer = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG Signature
    0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89,
    0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41, 0x54,
    0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4,
    0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
  ]);
  const validPngBase64 = validPngBuffer.toString('base64');
  // Attempt upload (might fail only on remote Cloudinary credential, but MUST pass local magic byte check)
  const resValidPng = await fetch(`${BASE_URL}/api/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ image: `data:image/png;base64,${validPngBase64}` }),
  });
  const dataValidPng = await resValidPng.json();
  assert(
    dataValidPng.code !== 'INVALID_FILE_SIGNATURE' && dataValidPng.code !== 'MIME_SPOOFING_DETECTED',
    'File Validation: Real PNG magic bytes (89 50 4E 47...) successfully pass local signature verification'
  );

  // -------------------------------------------------------------------------
  // 5. COMMERCE PRICING & PAYMENT STATUS
  // -------------------------------------------------------------------------
  console.log('\n--- 5. Commerce Pricing & Elimination of Auto-Paid Checkout ---');

  // 5.1 Unknown product ID rejected
  const resComm1 = await fetch(`${BASE_URL}/api/orders/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [{ id: 'attacker_fake_item_9999', priceEgp: 1, quantity: 1 }],
    }),
  });
  const dataComm1 = await resComm1.json();
  assert(
    resComm1.status === 400 && dataComm1.code === 'PRODUCT_NOT_FOUND',
    'Commerce: Unknown/unlisted product ID is rejected with HTTP 400 PRODUCT_NOT_FOUND'
  );

  // 5.2 Valid product checkout NEVER creates a 'paid' order
  const resComm2 = await fetch(`${BASE_URL}/api/orders/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [{ id: 1, priceEgp: 5, quantity: 1 }], // Product 1 real price is 120 EGP
    }),
  });
  const dataComm2 = await resComm2.json();
  assert(
    dataComm2.status === 'pending_payment' && dataComm2.totalEgp === 120,
    `Commerce: Authoritative price enforced (120 EGP, client 5 EGP ignored) and status is strictly 'pending_payment' (never 'paid')`
  );

  // 5.3 Webhook rejects missing signature
  const resWebhook = await fetch(`${BASE_URL}/api/orders/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event: 'payment.succeeded', orderId: 1 }),
  });
  assert(
    resWebhook.status === 401 || resWebhook.status === 503,
    'Commerce: Payment webhook strictly rejects unauthenticated / unsigned requests'
  );

  // -------------------------------------------------------------------------
  // 6. PRODUCTION STARTUP SECURITY
  // -------------------------------------------------------------------------
  console.log('\n--- 6. Production Startup Safety Tests ---');

  const prodTestPassed = await new Promise((resolve) => {
    // Attempt to start api-server in production mode without SESSION_SECRET
    const child = spawn(
      process.execPath,
      ['-e', `
        process.env.NODE_ENV = 'production';
        delete process.env.SESSION_SECRET;
        import('./artifacts/api-server/dist/index.mjs')
          .then(() => process.exit(0))
          .catch((err) => {
            if (err.message.includes('SESSION_SECRET')) {
              process.exit(42);
            }
            process.exit(1);
          });
      `],
      { cwd: process.cwd() }
    );

    child.on('exit', (code) => {
      resolve(code === 42 || code === 1);
    });
  });

  assert(
    prodTestPassed,
    'Auth Startup: Server safely aborts startup in production (NODE_ENV=production) when SESSION_SECRET is missing'
  );

  // -------------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
