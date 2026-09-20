import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  checkVerifyRateLimit,
  resetVerifyRateLimits,
} from '../../src/app/api/verify-otp/route';

describe('Authentication: OTP Verification IP Rate Limiting', () => {
  beforeEach(() => {
    resetVerifyRateLimits();
  });

  it('permits requests within the defined threshold', () => {
    const testIp = '192.168.1.50';
    for (let i = 0; i < 15; i++) {
      const allowed = checkVerifyRateLimit(testIp, 15, 60000);
      assert.equal(allowed, true, `Attempt ${i + 1} should be permitted`);
    }
  });

  it('strictly blocks requests exceeding maximum allowed verification attempts (HTTP 429 prevention)', () => {
    const testIp = '10.0.0.99';
    // Exhaust threshold
    for (let i = 0; i < 15; i++) {
      checkVerifyRateLimit(testIp, 15, 60000);
    }

    // 16th and subsequent attempts must be rejected
    const blockedAttempt = checkVerifyRateLimit(testIp, 15, 60000);
    assert.equal(blockedAttempt, false, '16th attempt must be rejected by rate limiter');

    const blockedAttempt2 = checkVerifyRateLimit(testIp, 15, 60000);
    assert.equal(blockedAttempt2, false, '17th attempt must remain blocked');
  });

  it('isolates rate-limiting counters between different IP addresses', () => {
    const ipAttacker = '203.0.113.1';
    const ipLegitimate = '203.0.113.2';

    // Exhaust attacker IP
    for (let i = 0; i < 15; i++) {
      checkVerifyRateLimit(ipAttacker, 15, 60000);
    }
    assert.equal(checkVerifyRateLimit(ipAttacker, 15, 60000), false);

    // Legitimate user from different IP must still be permitted
    assert.equal(
      checkVerifyRateLimit(ipLegitimate, 15, 60000),
      true,
      'Legitimate user from separate IP must not be penalized'
    );
  });
});
