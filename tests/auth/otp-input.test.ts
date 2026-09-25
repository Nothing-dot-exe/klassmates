import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { OtpVerificationCard } from '../../src/components/modals/joinGate/OtpVerificationCard';
import { createSignedOtpToken, verifySignedOtpToken } from '../../src/lib/server/otpStore';

describe('OtpVerificationCard Component UI & Input Rendering', () => {
  test('renders exactly 6 individual digit input boxes when otpInput is empty', () => {
    const html = renderToString(
      React.createElement(OtpVerificationCard, {
        email: 'test@example.com',
        otpInput: '',
        countdown: 60,
        isVerifying: false,
        onOtpInputChange: () => {},
        onVerify: () => {},
      })
    );

    // Count input elements rendered
    const inputMatches = html.match(/<input\b/g);
    assert.ok(inputMatches, 'Expected input elements to be rendered');
    assert.equal(inputMatches.length, 6, 'Must render exactly 6 digit input boxes');

    // Confirm disabled button text when incomplete
    assert.ok(html.includes('Enter all 6 digits'), 'Should indicate missing digits');
    assert.ok(html.includes('Check your email inbox'), 'Should display email instructions');
  });

  test('renders in-card error alert banner and loader when verifying', () => {
    const htmlWithError = renderToString(
      React.createElement(OtpVerificationCard, {
        email: 'test@example.com',
        otpInput: '123456',
        countdown: 40,
        isVerifying: false,
        error: 'Invalid or expired 6-digit verification code.',
        onOtpInputChange: () => {},
        onVerify: () => {},
      })
    );

    assert.ok(htmlWithError.includes('Invalid or expired 6-digit verification code.'), 'Must show in-card error');

    const htmlLoading = renderToString(
      React.createElement(OtpVerificationCard, {
        email: 'test@example.com',
        otpInput: '123456',
        countdown: 40,
        isVerifying: true,
        onOtpInputChange: () => {},
        onVerify: () => {},
      })
    );

    assert.ok(htmlLoading.includes('Verifying Code…'), 'Must show loading indicator');
  });

  test('renders 6 input boxes with partial values and full values correctly', () => {
    const htmlPartial = renderToString(
      React.createElement(OtpVerificationCard, {
        email: 'admin@bkit.ac.in',
        otpInput: '849',
        countdown: 45,
        isVerifying: false,
        onOtpInputChange: () => {},
        onVerify: () => {},
      })
    );

    const partialInputs = htmlPartial.match(/<input\b/g);
    assert.equal(partialInputs?.length, 6, 'Must still render 6 input boxes for partial input');
    assert.ok(htmlPartial.includes('value="8"'));
    assert.ok(htmlPartial.includes('value="4"'));
    assert.ok(htmlPartial.includes('value="9"'));

    const htmlComplete = renderToString(
      React.createElement(OtpVerificationCard, {
        email: 'admin@bkit.ac.in',
        otpInput: '849201',
        countdown: 30,
        isVerifying: false,
        onOtpInputChange: () => {},
        onVerify: () => {},
      })
    );

    assert.ok(htmlComplete.includes('Confirm Code ✓'), 'Should show Confirm Code button when complete');
  });
});

describe('Stateless Cryptographic Signed OTP Tokens', () => {
  test('generates and verifies signed token successfully', () => {
    const email = 'cr.lead@bkit.ac.in';
    const code = '592014';
    const token = createSignedOtpToken(email, code);
    assert.ok(token && typeof token === 'string', 'Expected signed token string');

    const isValid = verifySignedOtpToken(email, code, token);
    assert.equal(isValid, true, 'Token must verify with correct code and email');

    const isWrongCode = verifySignedOtpToken(email, '999999', token);
    assert.equal(isWrongCode, false, 'Token must reject wrong code');

    const isWrongEmail = verifySignedOtpToken('other@college.edu', code, token);
    assert.equal(isWrongEmail, false, 'Token must reject wrong email');
  });

  test('rejects expired signed tokens', () => {
    const email = 'cr.lead@bkit.ac.in';
    const code = '592014';
    // Expired 1 second ago (-1000ms TTL)
    const expiredToken = createSignedOtpToken(email, code, -1000);
    const isValid = verifySignedOtpToken(email, code, expiredToken);
    assert.equal(isValid, false, 'Expired token must be rejected');
  });
});
