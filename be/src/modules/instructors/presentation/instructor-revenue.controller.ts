import { BadRequestException, Controller, Get, Query, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { GetInstructorRevenueSummaryQuery } from '@/modules/instructors/application/query/get-instructor-revenue-summary.query';
import { GetInstructorRevenueByCourseQuery } from '@/modules/instructors/application/query/get-instructor-revenue-by-course.query';

@Controller('instructor/revenue')
@UseGuards(JwtAuthGuard)
export class InstructorRevenueController {
  constructor(private readonly queryBus: QueryBus, private readonly dataSource: DataSource) {}

  @Get('dashboard')
  async getDashboard(@CurrentUser('id') userId: number, @Query('period') period = '30d', @Query('from') from?: string, @Query('to') to?: string) {
    const days: Record<string, number | null> = { '7d': 7, '30d': 30, '90d': 90, '365d': 365, all: null };
    if (period !== 'custom' && !Object.prototype.hasOwnProperty.call(days, period)) throw new BadRequestException('Invalid period');
    const validDate = (value?: string) => {
      if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
      const date = new Date(`${value}T00:00:00Z`);
      return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
    };
    if (period === 'custom' && (!validDate(from) || !validDate(to) || from! > to!)) {
      throw new BadRequestException('Khoảng ngày không hợp lệ');
    }
    const span = period === 'custom' ? (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000 : 0;
    const group = period === 'all' || period === '365d' || span > 90 ? 'month' : 'day';
    const profiles = await this.dataSource.query('SELECT revenue_share_pct FROM instructor_profiles WHERE user_id = $1 LIMIT 1', [userId]);
    const sharePct = Number(profiles[0]?.revenue_share_pct ?? 70);
    const base = `WITH sales AS (
      SELECT oi.id, oi.course_id, c.title, oi.final_price::numeric AS gross,
        COALESCE(split.instructor_amount, ROUND(oi.final_price::numeric * $3::numeric / 100, 2)) AS income,
        (split.id IS NULL) AS estimated, COALESCE(o.paid_at, o.created_at) AS sold_at
      FROM order_items oi JOIN orders o ON o.id = oi.order_id
      JOIN courses c ON c.id = oi.course_id
      LEFT JOIN LATERAL (SELECT rs.id, rs.instructor_amount FROM revenue_splits rs
        WHERE rs.order_item_id = oi.id ORDER BY rs.id DESC LIMIT 1) split ON true
      WHERE oi.instructor_id = $1 AND o.status::text = '3'
        AND ($2::int IS NULL OR COALESCE(o.paid_at, o.created_at) >= CURRENT_DATE - ($2::int - 1))
        AND ($4::date IS NULL OR COALESCE(o.paid_at, o.created_at) >= $4::date)
        AND ($5::date IS NULL OR COALESCE(o.paid_at, o.created_at) < $5::date + INTERVAL '1 day')
    ) `;
    const args = [userId, days[period] ?? null, sharePct, period === 'custom' ? from : null, period === 'custom' ? to : null];
    const [summary, courses, trend] = await Promise.all([
      this.dataSource.query(base + `SELECT COALESCE(SUM(gross), 0) AS gross, COALESCE(SUM(income), 0) AS income,
        COUNT(*)::int AS sales, COUNT(*) FILTER (WHERE estimated)::int AS estimated FROM sales`, args),
      this.dataSource.query(base + `SELECT course_id AS "courseId", title AS "courseTitle", COUNT(*)::int AS sales,
        COALESCE(SUM(gross), 0) AS gross, COALESCE(SUM(income), 0) AS income
        FROM sales GROUP BY course_id, title ORDER BY SUM(gross) DESC, title LIMIT 10`, args),
      this.dataSource.query(base + `SELECT TO_CHAR(date_trunc('${group}', sold_at), 'YYYY-MM-DD') AS date,
        COALESCE(SUM(gross), 0) AS gross, COALESCE(SUM(income), 0) AS income
        FROM sales GROUP BY 1 ORDER BY 1`, args),
    ]);
    const numeric = (row: Record<string, unknown>) => ({ ...row, gross: Number(row.gross), income: Number(row.income) });
    return { period, sharePct, summary: numeric(summary[0]), courses: courses.map(numeric), trend: trend.map(numeric) };
  }

  @Get('summary')
  getSummary(@CurrentUser('id') userId: number) {
    return this.queryBus.execute(new GetInstructorRevenueSummaryQuery(userId));
  }

  @Get('by-course')
  getByCourse(
    @CurrentUser('id') userId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.queryBus.execute(
      new GetInstructorRevenueByCourseQuery(
        userId,
        page ? parseInt(page, 10) : 1,
        limit ? parseInt(limit, 10) : 10,
      ),
    );
  }
}
