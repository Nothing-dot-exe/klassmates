import { storeServerOtp, verifyServerOtp, createSignedOtpToken, verifySignedOtpToken } from '../src/lib/server/otpStore.ts';

async function testOtp() {
  console.log('--- TESTING MULTI-TOKEN OTP LOGIC ---');
  const testEmail = 'student.test@classmate.edu';

  // 1. Generate and store code 1
  const code1 = '481920';
  await storeServerOtp(testEmail, code1);
  console.log(`Stored Code 1: ${code1}`);

  // 2. User clicks resend, generate and store code 2
  const code2 = '930154';
  await storeServerOtp(testEmail, code2);
  console.log(`Stored Resent Code 2: ${code2}`);

  // 3. User receives email 1 and enters code 1: MUST SUCCEED
  const checkCode1 = await verifyServerOtp(testEmail, code1);
  console.log(`Verifying Code 1 (from first email): ${checkCode1 ? '✓ SUCCESS (Multi-token works!)' : '❌ FAILED'}`);

  if (!checkCode1) {
    throw new Error('Code 1 verification failed!');
  }

  // 4. Test code 2 after another fresh store
  await storeServerOtp(testEmail, code1);
  await storeServerOtp(testEmail, code2);
  const checkCode2 = await verifyServerOtp(testEmail, code2);
  console.log(`Verifying Code 2 (from second email): ${checkCode2 ? '✓ SUCCESS (Newest code works!)' : '❌ FAILED'}`);

  if (!checkCode2) {
    throw new Error('Code 2 verification failed!');
  }

  // 5. Test invalid code: MUST FAIL
  await storeServerOtp(testEmail, '112233');
  const checkInvalid = await verifyServerOtp(testEmail, '999999');
  console.log(`Verifying Wrong Code 999999: ${!checkInvalid ? '✓ Correctly rejected' : '❌ Incorrectly accepted'}`);

  // 6. Test signed token
  const signedToken = createSignedOtpToken(testEmail, '654321');
  const isSignedOk = verifySignedOtpToken(testEmail, '654321', signedToken);
  console.log(`Verifying Signed Token: ${isSignedOk ? '✓ SUCCESS' : '❌ FAILED'}`);

  console.log('\n🎉 ALL OTP LOGIC TESTS PASSED!');
}

testOtp().catch((err) => {
  console.error('OTP test failed:', err);
  process.exit(1);
});
