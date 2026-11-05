import {
  INSTRUCTOR_CERTIFICATE_TAGS,
  InstructorCertificateTag,
} from '@/modules/instructor-applications/domain/enums/instructor-certificate-tag.enum';

const TAG_KEYWORDS: Record<InstructorCertificateTag, string[]> = {
  [InstructorCertificateTag.IELTS]: ['ielts'],
  [InstructorCertificateTag.TOEIC]: ['toeic'],
  [InstructorCertificateTag.TOEFL]: ['toefl'],
  [InstructorCertificateTag.TESOL]: ['tesol'],
  [InstructorCertificateTag.CELTA]: ['celta'],
  [InstructorCertificateTag.DELTA]: ['delta'],
  [InstructorCertificateTag.BUSINESS_ENGLISH]: [
    'business english',
    'business',
    'thương mại',
  ],
  [InstructorCertificateTag.GENERAL_ENGLISH]: ['general english', 'tefl', 'esl'],
  [InstructorCertificateTag.KIDS]: ['kids', 'young learner', 'children', 'thiếu nhi'],
  [InstructorCertificateTag.PRONUNCIATION]: ['pronunciation', 'phonetics', 'phát âm'],
  [InstructorCertificateTag.WRITING]: ['writing', 'viết'],
  [InstructorCertificateTag.SPEAKING]: ['speaking', 'nói'],
};

export function deriveCertificateTags(
  certificateName: string,
  issuer?: string | null,
  ocrRawText?: string | null,
): InstructorCertificateTag[] {
  const haystack =
    `${certificateName} ${issuer ?? ''} ${ocrRawText ?? ''}`.toLowerCase();
  const matched = INSTRUCTOR_CERTIFICATE_TAGS.filter((tag) =>
    TAG_KEYWORDS[tag].some((keyword) => haystack.includes(keyword)),
  );

  return matched.length > 0 ? matched : [InstructorCertificateTag.GENERAL_ENGLISH];
}

export function sanitizeCertificateTags(tags: unknown): InstructorCertificateTag[] {
  if (!Array.isArray(tags)) {
    return [];
  }

  const allowed = new Set<string>(INSTRUCTOR_CERTIFICATE_TAGS);
  return Array.from(
    new Set(tags.filter((tag): tag is InstructorCertificateTag =>
      typeof tag === 'string' && allowed.has(tag),
    )),
  );
}
