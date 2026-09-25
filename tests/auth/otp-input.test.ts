import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { OtpVerificationCard } from '../../src/components/modals/joinGate/OtpVerificationCard';

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
