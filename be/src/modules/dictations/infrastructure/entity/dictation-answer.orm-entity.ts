import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity({ name: 'dictation_answers', schema: 'public' })
export class DictationAnswerOrmEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'attempt_id', type: 'bigint' })
  attemptId: string;

  @Column({ name: 'sentence_id', type: 'bigint' })
  sentenceId: string;

  @Column({ name: 'answer_text', type: 'text', nullable: true })
  answerText: string | null;

  @Column({ name: 'is_correct', type: 'boolean', default: false })
  isCorrect: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  similarity: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
