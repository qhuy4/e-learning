import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, EntityManager } from 'typeorm';
import { BookingOrmEntity } from '@/modules/bookings/infrastructure/entity/booking.orm-entity';
import { BookingStatusEnum } from '@/modules/bookings/domain/enum/booking-status.enum';

@Injectable()
export class BookingRepository {
  constructor(
    @InjectRepository(BookingOrmEntity)
    private readonly repo: Repository<BookingOrmEntity>,
  ) {}

  async findOverlap(
    instructorId: number,
    bookingDate: string,
    startTime: string,
    endTime: string,
    excludeId?: number,
  ): Promise<BookingOrmEntity | null> {
    const qb = this.repo
      .createQueryBuilder('b')
      .where('b.instructor_id = :instructorId', { instructorId })
      .andWhere('b.booking_date = :bookingDate', { bookingDate })
      .andWhere(
        '(b.status = :confirmed OR (b.status = :pending AND b.created_at > NOW() - INTERVAL \'15 minutes\'))',
        {
          confirmed: BookingStatusEnum.CONFIRMED,
          pending: BookingStatusEnum.PENDING,
        },
      )
      .andWhere('b.start_time < :endTime', { endTime })
      .andWhere('b.end_time > :startTime', { startTime });

    if (excludeId) {
      qb.andWhere('b.id != :excludeId', { excludeId });
    }

    return qb.getOne();
  }

  async findAll(options: {
    page: number;
    limit: number;
    keyword?: string;
    instructorId?: number;
    studentId?: number;
    status?: number;
    bookingDate?: string;
  }) {
    const {
      page,
      limit,
      keyword,
      instructorId,
      studentId,
      status,
      bookingDate,
    } = options;

    const query = this.repo
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.student', 'student')
      .leftJoinAndSelect('b.instructor', 'instructor')
      .leftJoinAndSelect('b.meetingRoom', 'meetingRoom');

    if (keyword) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('student.name ILIKE :keyword', {
            keyword: `%${keyword}%`,
          }).orWhere('instructor.name ILIKE :keyword', {
            keyword: `%${keyword}%`,
          });
        }),
      );
    }

    if (instructorId) {
      query.andWhere('b.instructor_id = :instructorId', { instructorId });
    }

    if (studentId) {
      query.andWhere('b.student_id = :studentId', { studentId });
    }

    if (status !== undefined) {
      query.andWhere('b.status = :status', { status });
    }

    if (bookingDate) {
      query.andWhere('b.booking_date = :bookingDate', { bookingDate });
    }

    query
      .orderBy('b.booking_date', 'DESC')
      .addOrderBy('b.start_time', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [entities, total] = await query.getManyAndCount();

    const data = entities.map((e) => ({
      id: Number(e.id),
      studentId: Number(e.student_id),
      studentName: e.student?.name ?? '',
      studentEmail: e.student?.email ?? '',
      instructorId: Number(e.instructor_id),
      instructorName: e.instructor?.name ?? '',
      bookingDate: e.booking_date,
      startTime: e.start_time,
      endTime: e.end_time,
      status: e.status,
      hourlyRate: Number(e.hourly_rate),
      totalAmount: Number(e.total_amount),
      paymentStatus: e.payment_status,
      notes: e.notes,
      meetingRoomId: e.meetingRoom ? Number(e.meetingRoom.id) : null,
      meetingRoom: e.meetingRoom
        ? {
            id: Number(e.meetingRoom.id),
            roomId: e.meetingRoom.roomId,
            status: e.meetingRoom.status,
            startedAt: e.meetingRoom.startedAt,
            endedAt: e.meetingRoom.endedAt,
          }
        : null,
      createdAt: e.created_at,
      updatedAt: e.updated_at,
    }));

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: number) {
    const entity = await this.repo.findOne({
      where: { id },
      relations: { student: true, instructor: true, meetingRoom: true },
    });
    if (!entity) return null;

    return {
      id: Number(entity.id),
      studentId: Number(entity.student_id),
      studentName: entity.student?.name ?? '',
      studentEmail: entity.student?.email ?? '',
      instructorId: Number(entity.instructor_id),
      instructorName: entity.instructor?.name ?? '',
      bookingDate: entity.booking_date,
      startTime: entity.start_time,
      endTime: entity.end_time,
      status: entity.status,
      hourlyRate: Number(entity.hourly_rate),
      totalAmount: Number(entity.total_amount),
      paymentStatus: entity.payment_status,
      notes: entity.notes,
      meetingRoomId: entity.meetingRoom ? Number(entity.meetingRoom.id) : null,
      meetingRoom: entity.meetingRoom
        ? {
            id: Number(entity.meetingRoom.id),
            roomId: entity.meetingRoom.roomId,
            status: entity.meetingRoom.status,
            startedAt: entity.meetingRoom.startedAt,
            endedAt: entity.meetingRoom.endedAt,
          }
        : null,
      createdAt: entity.created_at,
      updatedAt: entity.updated_at,
    };
  }

  async create(data: Partial<BookingOrmEntity>) {
    const entity = this.repo.create(data);
    const saved = await this.repo.save(entity);
    return this.findById(Number(saved.id));
  }

  async updateStatus(id: number, status: number, manager: EntityManager) {
    const repository = manager.getRepository(BookingOrmEntity);

    await repository.update({ id }, { status });

    return repository.findOne({
      where: { id },
    });
  }

  async delete(id: number) {
    await this.repo.delete(id);
  }

  async updateStatusWithMeetingRoom() {}
}
