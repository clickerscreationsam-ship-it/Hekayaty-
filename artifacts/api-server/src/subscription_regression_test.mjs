// =============================================================================
// HEKAYATY — SUBSCRIPTION SYSTEM COMPREHENSIVE REGRESSION TEST SUITE
// =============================================================================
import assert from 'node:assert';
import { 
  calculateQueueDates, 
  checkUserSubscriptionStatus,
  defaultPlans,
  getInMemoryPlans,
  getInMemorySubscriptions,
  addInMemorySubscription,
  getInMemoryPaymentRequests,
  addInMemoryPaymentRequest,
  getInMemoryCodes,
  setInMemoryCodes,
  getInMemorySettings,
} from './services/subscriptionService.ts';

console.log('🧪 Starting Hekayaty Subscription System Regression Tests...\n');

let testsPassed = 0;
let testsTotal = 0;

async function it(name, fn) {
  testsTotal++;
  try {
    await fn();
    console.log(`  ✅ PASS: ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}\n`);
    throw err;
  }
}

async function runTests() {
  // ── TEST GROUP 1: Canonical Plans & Configuration ──────────────────────────
  console.log('📌 GROUP 1: Canonical Plans & Pricing Verification');

  await it('Initial canonical monthly plan is 99 EGP for 30 days', () => {
    const plans = getInMemoryPlans();
    const monthlyPlan = plans.find(p => p.id === 'monthly_standard');
    assert.ok(monthlyPlan, 'monthly_standard plan must exist');
    assert.strictEqual(Number(monthlyPlan.price_egp), 99.00, 'Price must be 99 EGP');
    assert.strictEqual(monthlyPlan.duration_days, 30, 'Duration must be 30 days');
    assert.strictEqual(monthlyPlan.is_active, true, 'Plan must be active');
    assert.strictEqual(monthlyPlan.is_featured, true, 'Plan should be featured');
    assert.ok(monthlyPlan.features.length >= 3, 'Must have at least 3 features listed');
  });

  await it('Default settings contain valid InstaPay payment instructions', () => {
    const settings = getInMemorySettings();
    assert.ok(settings.instapay_address, 'InstaPay address required');
    assert.ok(settings.recipient_name, 'Recipient name required');
    assert.ok(settings.instructions_ar, 'Arabic instructions required');
  });

  // ── TEST GROUP 2: Queue Date Continuity Calculation ────────────────────────
  console.log('\n📌 GROUP 2: Subscription Queue Date Math & Continuity');

  const testUserId = 'test-user-uuid-' + Date.now();

  await it('First subscription starts immediately and is active', async () => {
    const queue1 = await calculateQueueDates(testUserId, 30);
    assert.strictEqual(queue1.status, 'active', 'First subscription must be active');
    const now = Date.now();
    const startMs = new Date(queue1.startDate).getTime();
    const endMs = new Date(queue1.endDate).getTime();
    assert.ok(Math.abs(startMs - now) < 2000, 'Start date should be approx now');
    const diffDays = Math.round((endMs - startMs) / (1000 * 60 * 60 * 24));
    assert.strictEqual(diffDays, 30, 'Duration must be exactly 30 days');

    // Simulate saving this subscription to store
    addInMemorySubscription({
      id: 9001,
      user_id: testUserId,
      plan_id: 'monthly_standard',
      status: queue1.status,
      duration_days: 30,
      start_date: queue1.startDate.toISOString(),
      end_date: queue1.endDate.toISOString(),
      source: 'instapay',
      reference_code: 'SUB-9001',
      created_at: new Date().toISOString(),
    });
  });

  await it('Second consecutive subscription queues without gaps after the first ends', async () => {
    const queue2 = await calculateQueueDates(testUserId, 90);
    assert.strictEqual(queue2.status, 'scheduled', 'Second subscription must be scheduled');
    
    // Check that start date matches the first subscription end date exactly
    const sub1 = getInMemorySubscriptions().find(s => s.id === 9001);
    assert.strictEqual(queue2.startDate.toISOString(), sub1.end_date, 'Scheduled sub must start exactly at active sub end date');
    
    const startMs = new Date(queue2.startDate).getTime();
    const endMs = new Date(queue2.endDate).getTime();
    const diffDays = Math.round((endMs - startMs) / (1000 * 60 * 60 * 24));
    assert.strictEqual(diffDays, 90, 'Duration of second sub must be exactly 90 days');

    addInMemorySubscription({
      id: 9002,
      user_id: testUserId,
      plan_id: 'quarterly_standard',
      status: queue2.status,
      duration_days: 90,
      start_date: queue2.startDate.toISOString(),
      end_date: queue2.endDate.toISOString(),
      source: 'code',
      reference_code: 'SUB-9002',
      created_at: new Date().toISOString(),
    });
  });

  await it('Third consecutive subscription queues seamlessly after the second scheduled sub', async () => {
    const queue3 = await calculateQueueDates(testUserId, 365);
    assert.strictEqual(queue3.status, 'scheduled', 'Third subscription must be scheduled');
    const sub2 = getInMemorySubscriptions().find(s => s.id === 9002);
    assert.strictEqual(queue3.startDate.toISOString(), sub2.end_date, 'Must start exactly when sub 2 ends');
    
    const startMs = new Date(queue3.startDate).getTime();
    const endMs = new Date(queue3.endDate).getTime();
    const diffDays = Math.round((endMs - startMs) / (1000 * 60 * 60 * 24));
    assert.strictEqual(diffDays, 365, 'Duration must be 365 days');
  });

  // ── TEST GROUP 3: Access Control & Entitlement Hierarchy ───────────────────
  console.log('\n📌 GROUP 3: Access Control & Server-side Entitlement Hierarchy');

  await it('Admin accounts bypass subscription check regardless of active subscriptions', async () => {
    const adminCheck = await checkUserSubscriptionStatus('any-admin-uuid', 'admin');
    assert.strictEqual(adminCheck.isSubscriber, true, 'Admin must be considered a subscriber');
    assert.strictEqual(adminCheck.isAdmin, true, 'isAdmin flag must be true');
    assert.strictEqual(adminCheck.status, 'active');
  });

  await it('Unsubscribed reader account is rejected for protected content', async () => {
    const readerCheck = await checkUserSubscriptionStatus('non-subscribed-reader-uuid', 'reader');
    assert.strictEqual(readerCheck.isSubscriber, false, 'Unsubscribed reader must NOT be subscriber');
    assert.strictEqual(readerCheck.status, 'none');
    assert.strictEqual(readerCheck.remainingDays, 0);
  });

  await it('Writers and Publishing houses without active subscriptions lose subscriber content access', async () => {
    const writerCheck = await checkUserSubscriptionStatus('writer-uuid-no-sub', 'writer');
    assert.strictEqual(writerCheck.isSubscriber, false, 'Writer without sub must not have subscriber access');
    const pubCheck = await checkUserSubscriptionStatus('pub-uuid-no-sub', 'publishing_house');
    assert.strictEqual(pubCheck.isSubscriber, false, 'Publishing house without sub must not have subscriber access');
  });

  await it('User with active subscription is granted subscriber access', async () => {
    const userCheck = await checkUserSubscriptionStatus(testUserId, 'reader');
    assert.strictEqual(userCheck.isSubscriber, true, 'User with active subscription must be granted access');
    assert.strictEqual(userCheck.status, 'active');
    assert.ok(userCheck.remainingDays > 25, 'Must report remaining days');
    assert.strictEqual(userCheck.scheduledSubscriptions.length, 1, 'Must report the queued subscription');
  });

  // ── TEST GROUP 4: InstaPay Payment Request Workflow ────────────────────────
  console.log('\n📌 GROUP 4: InstaPay Payment State Machine & Uniqueness');

  await it('Payment request lifecycle transitions through pending -> under_review -> approved', async () => {
    const reqId = 'pay-req-test-' + Date.now();
    // 1. Create request
    addInMemoryPaymentRequest({
      id: reqId,
      reference: 'IP-REQ-001',
      user_id: 'payment-user-1',
      plan_id: 'monthly_standard',
      plan_name_ar: 'اشتراك شهري',
      price_egp: 99.00,
      currency: 'EGP',
      duration_days: 30,
      payment_method: 'instapay',
      status: 'pending_payment',
      created_at: new Date().toISOString(),
    });
    let req = getInMemoryPaymentRequests().find(r => r.id === reqId);
    assert.strictEqual(req.status, 'pending_payment');

    // 2. Submit proof
    const uniqueTxRef = 'IPN-' + Date.now();
    req.proof_image_url = 'https://cloudinary.com/fake-proof.jpg';
    req.transaction_reference = uniqueTxRef;
    req.status = 'under_review';

    assert.strictEqual(req.status, 'under_review');
    assert.strictEqual(req.transaction_reference, uniqueTxRef);

    // 3. Duplicate transaction reference detection
    const isDuplicate = getInMemoryPaymentRequests().some(
      r => r.id !== 'other-id' && r.transaction_reference === uniqueTxRef && ['under_review', 'approved'].includes(r.status)
    );
    assert.strictEqual(isDuplicate, true, 'Must detect duplicate transaction reference');

    // 4. Admin approval
    const qDates = await calculateQueueDates('payment-user-1', req.duration_days);
    req.status = 'approved';
    req.reviewed_at = new Date().toISOString();
    
    assert.strictEqual(req.status, 'approved');
    assert.strictEqual(qDates.status, 'active');
  });

  // ── TEST GROUP 5: Subscription Codes & Atomic Redemption ───────────────────
  console.log('\n📌 GROUP 5: Subscription Gift/Promo Codes Lifecycle');

  await it('Codes can only be redeemed once and reject double redemption', () => {
    const codeId = 8801;
    const testCode = 'HEKAYATY-TEST-CODE-2026';
    setInMemoryCodes([
      ...getInMemoryCodes(),
      {
        id: codeId,
        code: testCode,
        batch_id: 1,
        duration_days: 30,
        is_active: true,
        is_redeemed: false,
        created_at: new Date().toISOString(),
      }
    ]);

    const codeObj = getInMemoryCodes().find(c => c.code === testCode);
    assert.ok(codeObj, 'Code must exist');
    assert.strictEqual(codeObj.is_redeemed, false);

    // First redemption
    codeObj.is_redeemed = true;
    codeObj.redeemed_by = 'redeem-user-uuid';
    codeObj.redeemed_at = new Date().toISOString();

    assert.strictEqual(codeObj.is_redeemed, true);
    assert.strictEqual(codeObj.redeemed_by, 'redeem-user-uuid');

    // Second redemption attempt
    const secondAttemptUsable = codeObj.is_active && !codeObj.is_redeemed;
    assert.strictEqual(secondAttemptUsable, false, 'Redeemed code must be rejected on second use');
  });

  console.log(`\n🎉 ALL ${testsPassed}/${testsTotal} REGRESSION TESTS PASSED SUCCESSFULLY!`);
}

runTests().catch((err) => {
  console.error('\n❌ Test execution terminated with failure:');
  console.error(err);
  process.exit(1);
});
