import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enum/role.enum';

@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminDashboardController {
  constructor(private readonly ds: DataSource) {}

  @Get('stats')
  async getStats(@Query('from') from?: string, @Query('to') to?: string) {
    let revenueWhere = `WHERE created_at >= NOW() - INTERVAL '6 months'`;
    const params: any[] = [];

    if (from && to) {
      revenueWhere = 'WHERE created_at >= $1 AND created_at <= $2';
      params.push(from, to);
    }

    const [
      users,
      courses,
      enrollments,
      orders,
      revenue,
      pendingCerts,
      revenueByMonth,
      recentOrders,
      recentEnrollments,
    ] = await Promise.all([
      this.ds.query<Array<{ count: number }>>(
        'SELECT COUNT(*)::int AS count FROM users',
      ),
      this.ds.query<Array<{ count: number }>>(
        'SELECT COUNT(*)::int AS count FROM courses',
      ),
      this.ds.query<Array<{ count: number }>>(
        'SELECT COUNT(*)::int AS count FROM enrollments',
      ),
      this.ds.query<Array<{ count: number }>>(
        'SELECT COUNT(*)::int AS count FROM orders',
      ),
      this.ds.query<Array<{ sum: string }>>(
        'SELECT COALESCE(SUM(total), 0)::numeric AS sum FROM orders',
      ),
      this.ds.query<Array<{ count: number }>>(
        'SELECT COUNT(*)::int AS count FROM instructor_certificates WHERE certificate_status = 1',
      ),
      this.ds.query<Array<{ month: string; revenue: string }>>(`
        SELECT TO_CHAR(created_at, 'YYYY-MM') AS month, COALESCE(SUM(total), 0)::numeric AS revenue
        FROM orders
        ${revenueWhere}
        GROUP BY TO_CHAR(created_at, 'YYYY-MM')
        ORDER BY month ASC
      `, params),
      this.ds.query<
        Array<{
          id: string;
          orderCode: string;
          total: string;
          status: number;
          createdAt: Date;
          userName: string | null;
        }>
      >(`
        SELECT o.id, o.order_code AS "orderCode", o.total, o.status, o.created_at AS "createdAt",
               u.name AS "userName"
        FROM orders o
        LEFT JOIN users u ON u.id = o.user_id
        ORDER BY o.created_at DESC
        LIMIT 5
      `),
      this.ds.query<
        Array<{
          id: string;
          createdAt: Date;
          userName: string | null;
          courseTitle: string | null;
        }>
      >(`
        SELECT e.id, e.created_at AS "createdAt",
               u.name AS "userName", c.title AS "courseTitle"
        FROM enrollments e
        LEFT JOIN users u ON u.id = e.user_id
        LEFT JOIN courses c ON c.id = e.course_id
        ORDER BY e.created_at DESC
        LIMIT 5
      `),
    ]);

    return {
      totalUsers: users[0].count,
      totalCourses: courses[0].count,
      totalEnrollments: enrollments[0].count,
      totalOrders: orders[0].count,
      totalRevenue: Number(revenue[0].sum),
      pendingCertificates: pendingCerts[0].count,
      revenueByMonth,
      recentOrders,
      recentEnrollments,
    };
  }
}
