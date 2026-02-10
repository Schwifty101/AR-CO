import { NestFactory, Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { SupabaseExceptionFilter } from './common/filters/supabase-exception.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { SupabaseService } from './database/supabase.service';
import { AdminWhitelistService } from './database/admin-whitelist.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set global API prefix
  app.setGlobalPrefix('api');

  // Get services from DI container
  const configService = app.get(ConfigService);
  const reflector = app.get(Reflector);
  const supabaseService = app.get(SupabaseService);
  const adminWhitelistService = app.get(AdminWhitelistService);

  // Register global exception filters
  app.useGlobalFilters(
    new HttpExceptionFilter(),
    new SupabaseExceptionFilter(),
  );

  // Register global guards (order matters!)
  app.useGlobalGuards(
    new JwtAuthGuard(reflector, supabaseService),
    new RolesGuard(reflector, adminWhitelistService),
  );

  // Enable CORS with configured origins
  const corsOrigins = configService.get<string[]>('app.corsOrigins') || [];
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 4000);
}

void bootstrap();
