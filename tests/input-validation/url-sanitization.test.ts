import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { isSafeUrl, sanitizeUrl } from '@/lib/security/urlSanitizer';

describe('Input Validation & XSS: URL Sanitization & Protocol Validation', () => {
  test('strictly rejects dangerous XSS URI schemes', () => {
    const maliciousUrls = [
      'javascript:alert(document.cookie)',
      'JAVASCRIPT:alert(1)',
      'javascript :alert(1)',
      'jav&#x09;ascript:alert(1)',
      'javascript\x00:alert(1)',
      'vbscript:msgbox("XSS")',
      'data:text/html,<script>alert(1)</script>',
      'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
    ];

    for (const url of maliciousUrls) {
      assert.strictEqual(isSafeUrl(url), false, `Must reject dangerous URL: ${url}`);
      assert.strictEqual(sanitizeUrl(url), '#', `Sanitized dangerous URL must fallback to safe anchor: ${url}`);
    }
  });

  test('allows verified safe URLs and legitimate media resources', () => {
    const safeUrls = [
      'https://example.com/document.pdf',
      'http://localhost:3000/api/files/1',
      'blob:http://localhost:3000/1234-5678',
      'data:application/pdf;base64,JVBERi0xLjQK...',
      'data:image/png;base64,iVBORw0KGgo...',
      'data:text/markdown;charset=utf-8,#%20Notes',
    ];

    for (const url of safeUrls) {
      assert.strictEqual(isSafeUrl(url), true, `Must allow legitimate resource: ${url}`);
      assert.strictEqual(sanitizeUrl(url), url, `Safe URL should remain unaltered: ${url}`);
    }
  });
});
