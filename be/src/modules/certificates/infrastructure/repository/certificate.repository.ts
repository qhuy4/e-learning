import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { CertificateOrmEntity } from '@/modules/certificates/infrastructure/entity/certificate.orm-entity';

@Injectable()
export class CertificateRepository {
  constructor(
    @InjectRepository(CertificateOrmEntity)
    private readonly repository: Repository<CertificateOrmEntity>,
  ) {}

  async findAll(options: {
    page: number;
    limit: number;
    keyword?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const { page, limit, keyword, sortBy, sortOrder } = options;

    const query = this.repository
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.user', 'user')
      .leftJoinAndSelect('c.course', 'course');

    if (keyword) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('user.name ILIKE :keyword', { keyword: `%${keyword}%` })
            .orWhere('course.title ILIKE :keyword', { keyword: `%${keyword}%` })
            .orWhere('c.cert_code::text ILIKE :keyword', { keyword: `%${keyword}%` });
        }),
      );
    }

    const sortableColumns: Record<string, string> = {
      createdAt: 'c.created_at',
      issuedAt: 'c.issued_at',
    };

    const sortKey = sortBy && sortableColumns[sortBy] ? sortableColumns[sortBy] : 'c.created_at';
    const sortDirection: 'ASC' | 'DESC' = sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query
      .orderBy(sortKey, sortDirection)
      .skip((page - 1) * limit)
      .take(limit);

    const [entities, total] = await query.getManyAndCount();

    const data = entities.map((e) => ({
      id: Number(e.id),
      userId: Number(e.userId),
      courseId: Number(e.courseId),
      enrollmentId: Number(e.enrollmentId),
      certCode: e.certCode,
      issuedAt: e.issuedAt,
      pdfUrl: e.pdfUrl,
      createdAt: e.createdAt,
      user: e.user ? { id: Number(e.user.id), name: e.user.name } : undefined,
      course: e.course ? { id: Number(e.course.id), title: e.course.title } : undefined,
    }));

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: number) {
    const entity = await this.repository.findOne({
      where: { id: id.toString() },
      relations: { user: true, course: true },
    });
    if (!entity) return null;
    return {
      id: Number(entity.id),
      userId: Number(entity.userId),
      courseId: Number(entity.courseId),
      enrollmentId: Number(entity.enrollmentId),
      certCode: entity.certCode,
      issuedAt: entity.issuedAt,
      pdfUrl: entity.pdfUrl,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      user: entity.user ? { id: Number(entity.user.id), name: entity.user.name, email: entity.user.email } : undefined,
      course: entity.course ? { id: Number(entity.course.id), title: entity.course.title } : undefined,
    };
  }
}
