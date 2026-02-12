import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PaymentsModule } from './payments/payments.module';
import { ClientsModule } from './clients/clients.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { ComplaintsModule } from './complaints/complaints.module';
import { ServiceRegistrationsModule } from './service-registrations/service-registrations.module';
import { ServicesModule } from './services/services.module';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    AuthModule,
    UsersModule,
    DashboardModule,
    PaymentsModule,
    ClientsModule,
    SubscriptionsModule,
    ComplaintsModule,
    ServiceRegistrationsModule,
    ServicesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
