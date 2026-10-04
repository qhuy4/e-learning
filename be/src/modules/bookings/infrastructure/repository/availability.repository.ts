import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BookingOrmEntity } from '@/modules/bookings/infrastructure/entity/booking.orm-entity';
import { UserOrmEntity } from '@/modules/users/infrastructure/entity/user.orm.entity';
import { TeacherAvailabilityRecurringOrmEntity } from '@/modules/instructors/infrastructure/entity/teacher-availability-recurring.orm.entity';
import { TeacherAvailabilityExceptionOrmEntity } from '@/modules/instructors/infrastructure/entity/teacher-availability-exception.orm.entity';
import {
  formatNextAvailableDisplay,
  getVNDateTimeParts,
  parseDateOnly,
} from '@/common/utils/helper.util';
import { BookingStatusEnum } from '@/modules/bookings/domain/enum/booking-status.enum';

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function normalizeTime(time: string): string {
  return time.length === 5 ? `${time}:00` : time;
}

@Injectable()
export class AvailabilityRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,

    @InjectRepository(BookingOrmEntity)
    private readonly bookingRepository: Repository<BookingOrmEntity>,
  ) {}

  async findAvailableTeachers(params: {
    page?: number;
    limit?: number;
    bookingDate?: string;
    startTime?: string;
    endTime?: string;
  }) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.max(1, params.limit ?? 10);
    const skip = (page - 1) * limit;

    const { dateStr: todayStr, timeStr: currentTimeStr } = getVNDateTimeParts();

    const bookingDate = params.bookingDate?.trim()
      ? params.bookingDate.split('T')[0]
      : todayStr;
    const targetDate = parseDateOnly(bookingDate);

    if (isNaN(targetDate.getTime())) {
      throw new BadRequestException(
        'Invalid bookingDate format. Expected YYYY-MM-DD',
      );
    }

    const dayOfWeek = targetDate.getDay();

    const hasTimeFilter = Boolean(
      params.startTime?.trim() && params.endTime?.trim(),
    );

    const searchStartTime = hasTimeFilter
      ? params.startTime!
      : bookingDate === todayStr
        ? currentTimeStr
        : '00:00:00';
    const searchEndTime = hasTimeFilter ? params.endTime! : '23:59:59';

    const baseQuery = this.userRepository
      .createQueryBuilder('teacher')
      .innerJoin(
        TeacherAvailabilityRecurringOrmEntity,
        'availability',
        hasTimeFilter
          ? `availability.instructor_id = teacher.id AND availability.day_of_week = :dayOfWeek
           AND availability.start_time <= :searchStartTime AND availability.end_time >= :searchEndTime`
          : `availability.instructor_id = teacher.id AND availability.day_of_week = :dayOfWeek
           AND availability.end_time >= :searchStartTime`,
      )
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('1')
          .from(TeacherAvailabilityExceptionOrmEntity, 'exception')
          .where('exception.instructor_id = teacher.id')
          .andWhere('exception.specific_date = :bookingDate')
          .andWhere('exception.deleted_at IS NULL')
          .andWhere(
            `(
              exception.is_unavailable = true
              OR (
                exception.start_time IS NOT NULL
                AND exception.end_time IS NOT NULL
                AND exception.start_time < :searchEndTime
                AND exception.end_time > :searchStartTime
              )
            )`,
          )
          .getQuery();
        return `NOT EXISTS ${subQuery}`;
      })
      .andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('1')
          .from(BookingOrmEntity, 'booking')
          .where('booking.instructor_id = teacher.id')
          .andWhere('booking.booking_date = :bookingDate')
          .andWhere('booking.start_time < :searchEndTime')
          .andWhere('booking.end_time > :searchStartTime')
          .andWhere('booking.status = :confirmedStatus')
          .getQuery();
        return `NOT EXISTS ${subQuery}`;
      })
      .setParameters({
        dayOfWeek,
        bookingDate,
        searchStartTime,
        searchEndTime,
        confirmedStatus: BookingStatusEnum.CONFIRMED,
      });

    const [rawIds, totalRow] = await Promise.all([
      baseQuery
        .clone()
        .select('DISTINCT teacher.id', 'id')
        .offset(skip)
        .take(limit)
        .getRawMany(),
      baseQuery
        .clone()
        .select('COUNT(DISTINCT teacher.id)', 'count')
        .getRawOne(),
    ]);

    const teacherIds = rawIds.map((item) => item.id);
    const total = parseInt(totalRow?.count ?? '0', 10);
    if (teacherIds.length === 0) {
      return {
        data: [],
        meta: {
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
      };
    }

    const teachers = await this.userRepository
      .createQueryBuilder('teacher')
      .leftJoinAndSelect('teacher.instructorProfile', 'instructorProfile')
      .leftJoinAndSelect('teacher.profile', 'profile')
      .leftJoinAndSelect('teacher.reviews', 'review')
      .where('teacher.id IN (:...teacherIds)', { teacherIds })
      .getMany();
    console.log(teachers)
    return {
      data: teachers.map((item) => ({
        id: item.id,
        name: item.name

      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /** Batch-check many 15-min slots for one instructor in a single round-trip. */
  async findInstructorSlots(params: {
    instructorId: number;
    bookingDate: string;
    slots: string[];
    durationMinutes: number;
  }): Promise<Record<string, boolean>> {
    const { instructorId, slots, durationMinutes } = params;
    const bookingDate = params.bookingDate.trim().split('T')[0];
    const targetDate = parseDateOnly(bookingDate);

    if (isNaN(targetDate.getTime())) {
      throw new BadRequestException(
        'Invalid bookingDate format. Expected YYYY-MM-DD',
      );
    }

    if (!slots.length) return {};

    const dayOfWeek = targetDate.getDay();
    const { dateStr: todayStr, timeStr: currentTimeStr } = getVNDateTimeParts();
    const nowMinutes = toMinutes(currentTimeStr);

    const [recurring, exceptions, bookings] = await Promise.all([
      this.userRepository.manager.find(TeacherAvailabilityRecurringOrmEntity, {
        where: {
          instructor_id: instructorId,
          day_of_week: dayOfWeek,
          is_active: true,
        },
      }),
      this.userRepository.manager.find(TeacherAvailabilityExceptionOrmEntity, {
        where: { instructor_id: instructorId, specific_date: bookingDate },
      }),
      this.bookingRepository.find({
        where: {
          instructor_id: instructorId,
          booking_date: bookingDate,
          // 2 = cancelled
        },
      }),
    ]);

    const activeRecurring = recurring.filter(
      (r) => !r.deleted_at && r.is_active,
    );
    const activeExceptions = exceptions.filter((e) => !e.deleted_at);
    const activeBookings = bookings.filter((b) => Number(b.status) !== 2);

    const result: Record<string, boolean> = {};

    for (const slot of slots) {
      const startMin = toMinutes(normalizeTime(slot));
      const endMin = startMin + durationMinutes;

      if (bookingDate === todayStr && startMin <= nowMinutes) {
        result[slot] = false;
        continue;
      }

      const inRecurring = activeRecurring.some(
        (r) =>
          toMinutes(r.start_time) <= startMin &&
          toMinutes(r.end_time) >= endMin,
      );
      if (!inRecurring) {
        result[slot] = false;
        continue;
      }

      const blockedByException = activeExceptions.some((e) => {
        if (e.is_unavailable) return true;
        if (!e.start_time || !e.end_time) return false;
        return (
          toMinutes(e.start_time) < endMin && toMinutes(e.end_time) > startMin
        );
      });
      if (blockedByException) {
        result[slot] = false;
        continue;
      }

      const blockedByBooking = activeBookings.some(
        (b) =>
          toMinutes(b.start_time) < endMin &&
          toMinutes(b.end_time) > startMin,
      );
      result[slot] = !blockedByBooking;
    }

    return result;
  }

  /**
   * Day window for one instructor: outer availability + busy blocks
   * (partial exceptions + active bookings). Full-day exception → available:false.
   */
  async findInstructorWindow(
    instructorId: number,
    bookingDate: string,
  ): Promise<{
    available: boolean;
    start: string | null;
    end: string | null;
    busy: { start: string; end: string }[];
  }> {
    const date = bookingDate.trim().split('T')[0];
    const targetDate = parseDateOnly(date);
    if (isNaN(targetDate.getTime())) {
      throw new BadRequestException(
        'Invalid bookingDate format. Expected YYYY-MM-DD',
      );
    }

    const dayOfWeek = targetDate.getDay();
    const today = getVNDateTimeParts().dateStr;

    const [recurring, exceptions, bookings] = await Promise.all([
      this.userRepository.manager.find(TeacherAvailabilityRecurringOrmEntity, {
        where: {
          instructor_id: instructorId,
          day_of_week: dayOfWeek,
          is_active: true,
        },
      }),
      this.userRepository.manager.find(TeacherAvailabilityExceptionOrmEntity, {
        where: { instructor_id: instructorId, specific_date: date },
      }),
      this.bookingRepository.find({
        where: { instructor_id: instructorId, booking_date: date },
      }),
    ]);

    const activeRecurring = recurring.filter((r) => {
      if (r.deleted_at || !r.is_active) return false;
      if (r.effective_from && date < r.effective_from) return false;
      if (r.effective_until && date > r.effective_until) return false;
      return true;
    });

    const activeExceptions = exceptions.filter((e) => !e.deleted_at);
    const fullDayOff = activeExceptions.some((e) => e.is_unavailable);

    if (fullDayOff || activeRecurring.length === 0) {
      return { available: false, start: null, end: null, busy: [] };
    }

    const starts = activeRecurring.map((r) => toMinutes(r.start_time));
    const ends = activeRecurring.map((r) => toMinutes(r.end_time));
    let windowStart = Math.min(...starts);
    let windowEnd = Math.max(...ends);

    const busy: { start: string; end: string }[] = [];

    for (const e of activeExceptions) {
      if (!e.is_unavailable && e.start_time && e.end_time) {
        busy.push({ start: e.start_time, end: e.end_time });
      }
    }

    for (const b of bookings) {
      if (Number(b.status) === 2) continue;
      busy.push({ start: b.start_time, end: b.end_time });
    }

    const fmt = (m: number) =>
      `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

    if (date === today) {
      const nowMin = toMinutes(getVNDateTimeParts().timeStr);
      windowStart = Math.max(windowStart, nowMin);
    }

    if (windowStart >= windowEnd) {
      return { available: false, start: null, end: null, busy: [] };
    }

    return {
      available: true,
      start: fmt(windowStart),
      end: fmt(windowEnd),
      busy: busy
        .map((b) => ({
          start: fmt(toMinutes(b.start)),
          end: fmt(toMinutes(b.end)),
        }))
        .sort((a, b) => toMinutes(a.start) - toMinutes(b.start)),
    };
  }
}
