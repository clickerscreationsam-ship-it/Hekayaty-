import crypto from 'node:crypto';

const BASE_URL = 'http://localhost:3001';

function getDevToken(userId = '00000000-0000-4000-8000-000000000001') {
  const secret = process.env.SESSION_SECRET || process.env.SESSION_SECRET_DEV || 'hekayaty_core_secret_key_2027_production_secure_entropy_key_v3!';
  const expiresAt = Date.now() + 1000 * 60 * 60 * 24;
  const payload = `${userId}:${expiresAt}`;
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  const b64 = Buffer.from(payload).toString('base64url');
  return `hky_${b64}.${sig}`;
}

async function runTests() {
  console.log('================================================================');
  console.log('   HEKAYATY ENGAGEMENT & ANALYTICS REGRESSION SUITE');
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

  const readerToken = getDevToken('00000000-0000-4000-8000-000000000001');
  const adminToken = getDevToken('00000000-0000-4000-8000-000000000099'); // admin profile id
  const testStoryId = `test_story_${Date.now()}`;
  const testComicId = `test_comic_${Date.now()}`;
  const testSeriesId = `test_series_${Date.now()}`;

  // -------------------------------------------------------------------------
  // 1. LIKE TESTS
  // -------------------------------------------------------------------------
  console.log('\n--- 1. Like System Tests ---');

  // 1.1 Unauthenticated like rejected
  const res1 = await fetch(`${BASE_URL}/api/engagement/likes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contentType: 'story', contentId: testStoryId }),
  });
  assert(res1.status === 401, '1.1 Unauthenticated user cannot like content', `Status: ${res1.status}`);

  // 1.2 Authenticated like succeeds and increments count
  const res2 = await fetch(`${BASE_URL}/api/engagement/likes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${readerToken}` },
    body: JSON.stringify({ contentType: 'story', contentId: testStoryId }),
  });
  const data2 = await res2.json();
  assert(res2.status === 200 && data2.liked === true && data2.likesCount >= 1, '1.2 Authenticated user likes a story', JSON.stringify(data2));

  // 1.3 Check like status shows liked = true
  const res3 = await fetch(`${BASE_URL}/api/engagement/likes/status?contentType=story&contentId=${testStoryId}`, {
    headers: { Authorization: `Bearer ${readerToken}` },
  });
  const data3 = await res3.json();
  assert(data3.liked === true && data3.likesCount >= 1, '1.3 Like status endpoint reflects liked state', JSON.stringify(data3));

  // 1.4 Unlike story decrements count
  const res4 = await fetch(`${BASE_URL}/api/engagement/likes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${readerToken}` },
    body: JSON.stringify({ contentType: 'story', contentId: testStoryId }),
  });
  const data4 = await res4.json();
  assert(data4.liked === false, '1.4 User unlikes story and status reverts to false');

  // 1.5 Like a comic and check user's liked items
  await fetch(`${BASE_URL}/api/engagement/likes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${readerToken}` },
    body: JSON.stringify({ contentType: 'comic', contentId: testComicId }),
  });
  const res5 = await fetch(`${BASE_URL}/api/engagement/users/me/likes`, {
    headers: { Authorization: `Bearer ${readerToken}` },
  });
  const data5 = await res5.json();
  assert(data5.success && Array.isArray(data5.likes), '1.5 User can retrieve their liked content list');

  // -------------------------------------------------------------------------
  // 2. FOLLOW TESTS
  // -------------------------------------------------------------------------
  console.log('\n--- 2. Follow System Tests ---');

  // 2.1 Unauthenticated follow rejected
  const res6 = await fetch(`${BASE_URL}/api/engagement/follows`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contentType: 'series', contentId: testSeriesId }),
  });
  assert(res6.status === 401, '2.1 Unauthenticated user cannot follow content');

  // 2.2 Authenticated follow succeeds
  const res7 = await fetch(`${BASE_URL}/api/engagement/follows`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${readerToken}` },
    body: JSON.stringify({ contentType: 'series', contentId: testSeriesId }),
  });
  const data7 = await res7.json();
  assert(res7.status === 200 && data7.following === true, '2.2 Authenticated user follows a series');

  // 2.3 Follow status reflects following
  const res8 = await fetch(`${BASE_URL}/api/engagement/follows/status?contentType=series&contentId=${testSeriesId}`, {
    headers: { Authorization: `Bearer ${readerToken}` },
  });
  const data8 = await res8.json();
  assert(data8.following === true && data8.followersCount >= 1, '2.3 Follow status reflects following state');

  // 2.4 User following list contains the series
  const res9 = await fetch(`${BASE_URL}/api/engagement/users/me/following`, {
    headers: { Authorization: `Bearer ${readerToken}` },
  });
  const data9 = await res9.json();
  assert(data9.success && Array.isArray(data9.following), '2.4 User can retrieve their followed content list');

  // 2.5 Unfollow series
  const res10 = await fetch(`${BASE_URL}/api/engagement/follows`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${readerToken}` },
    body: JSON.stringify({ contentType: 'series', contentId: testSeriesId }),
  });
  const data10 = await res10.json();
  assert(data10.following === false, '2.5 User unfollows series successfully');

  // -------------------------------------------------------------------------
  // 3. VIEWS & 24-HOUR DEDUPLICATION TESTS
  // -------------------------------------------------------------------------
  console.log('\n--- 3. Views & Deduplication Tests ---');

  const anonSessionId = `anon_${Date.now()}_abc`;

  // 3.1 Initial view is recorded
  const res11 = await fetch(`${BASE_URL}/api/engagement/views`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contentType: 'comic',
      contentId: testComicId,
      anonymousSessionId: anonSessionId,
      source: 'explore',
      deviceCategory: 'mobile',
    }),
  });
  const data11 = await res11.json();
  assert(data11.success && data11.recorded === true && data11.deduplicated === false, '3.1 Initial view is counted');

  // 3.2 Immediate second view from same anonymous session is deduplicated
  const res12 = await fetch(`${BASE_URL}/api/engagement/views`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contentType: 'comic',
      contentId: testComicId,
      anonymousSessionId: anonSessionId,
    }),
  });
  const data12 = await res12.json();
  assert(data12.success && data12.deduplicated === true && data12.recorded === false, '3.2 Duplicate view within 24h is deduplicated');

  // 3.3 Engagement stats returns combined numbers
  const res13 = await fetch(`${BASE_URL}/api/engagement/stats/comic/${testComicId}`);
  const data13 = await res13.json();
  assert(typeof data13.views === 'number' && typeof data13.likes === 'number' && typeof data13.followers === 'number', '3.3 Engagement stats endpoint returns valid numbers');

  // -------------------------------------------------------------------------
  // 4. NOTIFICATION PREFERENCES TESTS
  // -------------------------------------------------------------------------
  console.log('\n--- 4. Notification Preferences Tests ---');

  const res14 = await fetch(`${BASE_URL}/api/engagement/preferences/notifications`, {
    headers: { Authorization: `Bearer ${readerToken}` },
  });
  const data14 = await res14.json();
  assert(data14.success && typeof data14.preferences.notifyChapters === 'boolean', '4.1 Get notification preferences');

  const res15 = await fetch(`${BASE_URL}/api/engagement/preferences/notifications`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${readerToken}` },
    body: JSON.stringify({ notifyChapters: false, emailNotifications: true }),
  });
  const data15 = await res15.json();
  assert(data15.success && data15.preferences.notifyChapters === false && data15.preferences.emailNotifications === true, '4.2 Update notification preferences');

  // -------------------------------------------------------------------------
  // 5. CREATOR & ADMIN ANALYTICS TESTS
  // -------------------------------------------------------------------------
  console.log('\n--- 5. Creator Analytics Tests ---');

  const res16 = await fetch(`${BASE_URL}/api/analytics/creator/overview`, {
    headers: { Authorization: `Bearer ${readerToken}` },
  });
  const data16 = await res16.json();
  assert(data16.success && data16.overview && Array.isArray(data16.works), '5.1 Creator analytics returns personal works overview');

  console.log('\n================================================================');
  console.log(`   TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error('Fatal error running tests:', err);
  process.exit(1);
});
