import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';
import { Roles } from './common/decorators/roles.decorator';
import { CurrentUser } from './common/decorators/current-user.decorator';
import { UserType } from './common/enums/user-type.enum';
import type { AuthUser } from './common/interfaces/auth-user.interface';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Public endpoint - no authentication required
   * Test with: GET /api/hello
   */
  @Get('hello')
  @Public()
  getHello(): { message: string } {
    return this.appService.getHello();
  }

  /**
   * Protected endpoint - requires valid JWT
   * Test with: GET /api/profile
   * Header: Authorization: Bearer <your-jwt-token>
   */
  @Get('profile')
  getProfile(@CurrentUser() user: AuthUser) {
    return {
      message: `Hello, ${user.fullName}!`,
      user: {
        id: user.id,
        email: user.email,
        userType: user.userType,
        fullName: user.fullName,
      },
    };
  }

  /**
   * Admin-only endpoint - requires ADMIN or STAFF role
   * Test with: GET /api/admin-dashboard
   * Header: Authorization: Bearer <admin-jwt-token>
   */
  @Get('admin-dashboard')
  @Roles(UserType.ADMIN, UserType.STAFF)
  getAdminDashboard(@CurrentUser() user: AuthUser) {
    return {
      message: 'Welcome to admin dashboard',
      user: {
        email: user.email,
        userType: user.userType,
      },
    };
  }
}
