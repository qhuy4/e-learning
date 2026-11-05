export enum InstructorCertificateTag {
  IELTS = 'IELTS',
  TOEIC = 'TOEIC',
  TOEFL = 'TOEFL',
  TESOL = 'TESOL',
  CELTA = 'CELTA',
  DELTA = 'DELTA',
  BUSINESS_ENGLISH = 'BUSINESS_ENGLISH',
  GENERAL_ENGLISH = 'GENERAL_ENGLISH',
  KIDS = 'KIDS',
  PRONUNCIATION = 'PRONUNCIATION',
  WRITING = 'WRITING',
  SPEAKING = 'SPEAKING',
}

export const INSTRUCTOR_CERTIFICATE_TAGS: InstructorCertificateTag[] =
  Object.values(InstructorCertificateTag);
