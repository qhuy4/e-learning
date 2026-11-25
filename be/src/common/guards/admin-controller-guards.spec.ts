import { GUARDS_METADATA } from '@nestjs/common/constants';
import { ROLES_KEY } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enum/role.enum';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { AdminAchievementsController } from '@/modules/achievements/presentation/admin-achievements.controller';
import { AdminDashboardController } from '@/modules/analytics/presentation/admin-dashboard.controller';
import { AdminBookingsController } from '@/modules/bookings/presentation/admin-bookings.controller';
import { AdminCategoriesController } from '@/modules/categories/presentation/admin-categories.controller';
import { AdminCouponsController } from '@/modules/coupons/presentation/admin-coupons.controller';
import { AdminCourseQuestionsController } from '@/modules/course-questions/presentation/admin-course-questions.controller';
import { AdminEnrollmentsController } from '@/modules/enrollments/presentation/admin-enrollments.controller';
import { AdminPayoutAccountsController } from '@/modules/instructor-payouts/presentation/admin-payout-accounts.controller';
import { AdminPayoutsController } from '@/modules/instructor-payouts/presentation/admin-payouts.controller';
import { AdminRevenueController } from '@/modules/instructor-payouts/presentation/admin-revenue.controller';
import { AdminNotificationsController } from '@/modules/notifications/presentation/admin-notifications.controller';
import { AdminOrdersController } from '@/modules/orders/presentation/admin-orders.controller';
import { AdminPaymentsController } from '@/modules/payments/presentation/admin-payments.controller';
import { AdminReviewReportsController } from '@/modules/review-reports/presentation/admin-review-reports.controller';
import { ReviewsController } from '@/modules/reviews/presentation/reviews.controller';
import { UsersController } from '@/modules/users/presentation/user.controller';

const adminControllers = [
  AdminAchievementsController,
  AdminDashboardController,
  AdminBookingsController,
  AdminCategoriesController,
  AdminCouponsController,
  AdminCourseQuestionsController,
  AdminEnrollmentsController,
  AdminPayoutAccountsController,
  AdminPayoutsController,
  AdminRevenueController,
  AdminNotificationsController,
  AdminOrdersController,
  AdminPaymentsController,
  AdminReviewReportsController,
  ReviewsController,
  UsersController,
];

describe.each(adminControllers)('%s admin access', (controller) => {
  it('requires authentication and the admin role', () => {
    expect(Reflect.getMetadata(GUARDS_METADATA, controller)).toEqual(
      expect.arrayContaining([JwtAuthGuard, RolesGuard]),
    );
    expect(Reflect.getMetadata(ROLES_KEY, controller)).toContain(Role.ADMIN);
  });
});
