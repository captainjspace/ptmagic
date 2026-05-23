/**
 * CalcTokenErrorCodes.ts
 */

export interface TokenErrorParams {
  tokenModel: any;
  keyObject?: any;
}

export const SeverityKeys = {
  exits: 1,
  warnings: 2,
  info: 3,
} as const;

export type SeverityKey = (typeof SeverityKeys)[keyof typeof SeverityKeys];

export const SubjectKeys = {
  BAD_MODEL: 1000,
  SITE_MODEL: 2000,
  SITE_VALUE: 3000,
} as const;

export type SubjectKey = (typeof SubjectKeys)[keyof typeof SubjectKeys];

// 1. Wrapped in Partial because warnings and info are not yet defined
export const CalcTokenErrorCode: Partial<
  Record<SeverityKey, Record<SubjectKey, string>>
> = {
  [SeverityKeys.exits]: {
    [SubjectKeys.BAD_MODEL]: "%s must be defined ",
    [SubjectKeys.SITE_MODEL]: " %s  must be have %s ",
    [SubjectKeys.SITE_VALUE]: " %s value of %s must be %s - %s",
  },
};

// 2. Added 'const' and corrected the '=>' arrow function syntax
export const getErrorCode = (
  severity: SeverityKey,
  subject: SubjectKey,
): string | undefined => {
  const severityErrors = CalcTokenErrorCode[severity];

  // 3. Added optional chaining (?.) to prevent runtime crashes if a severity block is missing
  return severityErrors?.[subject];
};
