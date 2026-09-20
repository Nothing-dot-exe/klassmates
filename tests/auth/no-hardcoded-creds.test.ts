import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Authentication: No Hardcoded Backdoors & Roll-number Passwords', () => {
  test('source code must not contain hardcoded default admin or student passwords', () => {
    const srcDir = path.resolve(process.cwd(), 'src');
    const forbiddenPatterns = [
      /['"]Admin@2026['"]/,
      /['"]admin123['"]/,
      /['"]Classmate@2026['"]/,
      /inputPassword\.toUpperCase\(\)\s*===\s*student\.rollNo\.toUpperCase\(\)/,
    ];

    function scanDir(dir: string): { file: string; pattern: string }[] {
      const violations: { file: string; pattern: string }[] = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          violations.push(...scanDir(fullPath));
        } else if (/\.(ts|tsx|js|mjs)$/.test(entry.name)) {
          const content = fs.readFileSync(fullPath, 'utf8');
          for (const pattern of forbiddenPatterns) {
            if (pattern.test(content)) {
              violations.push({ file: fullPath, pattern: pattern.toString() });
            }
          }
        }
      }
      return violations;
    }

    const violations = scanDir(srcDir);
    assert.strictEqual(
      violations.length,
      0,
      `Detected hardcoded backdoor passwords or roll-number auth in codebase: ${JSON.stringify(violations, null, 2)}`
    );
  });
});
