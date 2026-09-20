import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizePostgrestFilter,
  sanitizeRollNumber,
  sanitizeEmail,
} from '../../src/lib/security/querySanitizer';

describe('Input Validation: PostgREST Filter Injection Prevention', () => {
  it('neutralizes comma-based PostgREST operator injection', () => {
    // Attack payload attempting to inject an OR clause: ",role.eq.admin"
    const attackPayload = 'student123,role.eq.admin';
    const sanitized = sanitizePostgrestFilter(attackPayload);

    assert.ok(!sanitized.includes(','), 'Commas must be stripped to prevent clause injection');
    assert.ok(!sanitized.includes(':'), 'Colons must be stripped');
    assert.equal(sanitized, 'student123role.eq.admin');
  });

  it('neutralizes parenthesis and grouping injection', () => {
    // Attack payload attempting to close PostgREST filter expression: "),id.neq.0"
    const attackPayload = 'val),id.neq.0';
    const sanitized = sanitizePostgrestFilter(attackPayload);

    assert.ok(!sanitized.includes(')'), 'Parentheses must be stripped');
    assert.ok(!sanitized.includes('('), 'Parentheses must be stripped');
    assert.ok(!sanitized.includes(','), 'Commas must be stripped');
    assert.equal(sanitized, 'valid.neq.0');
  });

  it('strips PostgREST wildcards and quotes', () => {
    const malicious = 'admin*%"\'or 1=1';
    const sanitized = sanitizePostgrestFilter(malicious);

    assert.ok(!sanitized.includes('*'), 'Asterisks must be stripped');
    assert.ok(!sanitized.includes('%'), 'Percent wildcards must be stripped');
    assert.ok(!sanitized.includes('"'), 'Double quotes must be stripped');
    assert.ok(!sanitized.includes("'"), 'Single quotes must be stripped');
  });

  it('validates and sanitizes roll numbers strictly to alphanumeric and safe hyphens', () => {
    assert.equal(sanitizeRollNumber('cs-2024-001'), 'CS-2024-001');
    assert.equal(sanitizeRollNumber('  1ms21cs001  '), '1MS21CS001');

    // Injection attempt inside roll number
    const attackRoll = 'CS-001,role.eq.admin<script>';
    const sanitized = sanitizeRollNumber(attackRoll);
    assert.equal(sanitized, 'CS-001ROLEEQADMINSCRIPT');
    assert.ok(!sanitized.includes(','), 'No commas allowed');
    assert.ok(!sanitized.includes('<'), 'No angle brackets allowed');
  });

  it('normalizes and sanitizes email strings safely', () => {
    assert.equal(sanitizeEmail('Student@Classmate.Edu'), 'student@classmate.edu');
    assert.equal(
      sanitizeEmail('student+lab@college.edu'),
      'student+lab@college.edu'
    );

    // Injection attempt in email
    const maliciousEmail = 'student@college.edu,admin@college.edu<script>';
    const sanitized = sanitizeEmail(maliciousEmail);
    assert.ok(!sanitized.includes(','), 'Commas must be stripped from email');
    assert.ok(!sanitized.includes('<'), 'Tags must be stripped from email');
  });

  it('handles empty, null, or undefined inputs gracefully without throwing', () => {
    assert.equal(sanitizePostgrestFilter(''), '');
    assert.equal(sanitizePostgrestFilter(null as any), '');
    assert.equal(sanitizePostgrestFilter(undefined as any), '');
    assert.equal(sanitizeRollNumber(''), '');
    assert.equal(sanitizeEmail(''), '');
  });
});
