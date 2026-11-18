import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizOrmEntity } from '../entity/quiz.orm-entity';
import { Quiz } from '../../domain/entity/quiz.entity';
import { IQuizRepository } from '../../domain/repository/quiz.repository';
import { QuizMapper } from '../mapper/quiz.mapper';

@Injectable()
export class QuizRepository implements IQuizRepository {
  constructor(
    @InjectRepository(QuizOrmEntity)
    private readonly repository: Repository<QuizOrmEntity>,
  ) {}

  async findById(id: number): Promise<Quiz | null> {
    const entity = await this.repository.findOne({ where: { id: id.toString() } });
    if (!entity) return null;
    return QuizMapper.toDomain(entity);
  }
  
  async findAll(): Promise<Quiz[]> {
    const entities = await this.repository.find();
    return entities.map((entity) => QuizMapper.toDomain(entity));
  }

  async findByCreator(userId: number): Promise<Quiz[]> {
    const entities = await this.repository.find({ where: { createdBy: userId.toString() } });
    return entities.map((entity) => QuizMapper.toDomain(entity));
  }

  async create(quiz: Quiz): Promise<Quiz> {
    const entity = this.repository.create({
      title: quiz.title,
      description: quiz.description,
      isPremium: quiz.isPremium,
      timeLimit: quiz.timeLimit,
      passingScore: quiz.passingScore,
      maxAttempts: quiz.maxAttempts,
      shuffleQuestions: quiz.shuffleQuestions,
      shuffleOptions: quiz.shuffleOptions,
      showAnswerAfterSubmit: quiz.showAnswerAfterSubmit,
      createdBy: quiz.createdBy ? quiz.createdBy.toString() : null,
    });
    const saved = await this.repository.save(entity);
    return QuizMapper.toDomain(saved);
  }

  async update(quiz: Quiz): Promise<Quiz> {
    const entity = await this.repository.preload({
      id: quiz.id!.toString(),
      title: quiz.title,
      description: quiz.description,
      isPremium: quiz.isPremium,
      timeLimit: quiz.timeLimit,
      passingScore: quiz.passingScore,
      maxAttempts: quiz.maxAttempts,
      shuffleQuestions: quiz.shuffleQuestions,
      shuffleOptions: quiz.shuffleOptions,
      showAnswerAfterSubmit: quiz.showAnswerAfterSubmit,
    });
    if (!entity) throw new Error('Quiz not found');
    const saved = await this.repository.save(entity);
    return QuizMapper.toDomain(saved);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
