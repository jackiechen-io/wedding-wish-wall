import { normalizeText } from './normalizeText';
import { SENSITIVE_PATTERNS } from './sensitivePatterns';

export function moderateText(input: string): { passed: boolean; reason: string | null } {
  const normalized = normalizeText(input);
  const matched = SENSITIVE_PATTERNS.find((pattern) => pattern.test(normalized));

  if (matched) {
    return {
      passed: false,
      reason: '文字包含不適合公開顯示的內容'
    };
  }

  return { passed: true, reason: null };
}
