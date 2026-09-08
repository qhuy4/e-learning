export const EnrollmentStatus = {
  INACTIVE: 0,
  ACTIVE: 1,
  COMPLETED: 2,
} as const;

export type EnrollmentStatus = (typeof EnrollmentStatus)[keyof typeof EnrollmentStatus];
