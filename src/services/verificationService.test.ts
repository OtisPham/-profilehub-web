import { generateVerificationCode, generateVerificationHash } from './verificationService';

export function runVerificationServiceTests(): boolean {
  console.log('[TDD TEST] Running verificationService Seam tests...');

  // Test 1: Code generation format (PH-VER-XXXXXX)
  const code = generateVerificationCode();
  if (!code.startsWith('PH-VER-') || code.length !== 15) {
    throw new Error(`TDD Assertion Failed: Verification Code ${code} format invalid`);
  }

  // Test 2: Hash determinism for identical payload inputs
  const timestamp = '2026-09-23T14:00:00.000Z';
  const hash1 = generateVerificationHash('proj-123', 'student-456', 'teacher-789', timestamp);
  const hash2 = generateVerificationHash('proj-123', 'student-456', 'teacher-789', timestamp);

  if (hash1 !== hash2) {
    throw new Error('TDD Assertion Failed: Hash is not deterministic for identical inputs');
  }

  if (!hash1.startsWith('0x')) {
    throw new Error(`TDD Assertion Failed: Hash ${hash1} missing 0x prefix`);
  }

  console.log('[TDD TEST] All verificationService tests PASSED cleanly! 🟢');
  return true;
}

// Self-run when invoked
runVerificationServiceTests();
