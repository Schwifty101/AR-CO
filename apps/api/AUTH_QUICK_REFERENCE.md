# Authentication & Authorization Quick Reference

## 🚀 Quick Start

### Making a Route Public (No Auth Required)

```typescript
import { Public } from './common/decorators/public.decorator';

@Get('health')
@Public()
healthCheck() {
  return { status: 'ok' };
}
```

### Protected Route (JWT Required)

```typescript
import { CurrentUser } from './common/decorators/current-user.decorator';
import type { AuthUser } from './common/interfaces/auth-user.interface';

@Get('profile')
getProfile(@CurrentUser() user: AuthUser) {
  return {
    id: user.id,
    email: user.email,
    userType: user.userType,
    fullName: user.fullName
  };
}
```

### Role-Based Access Control

```typescript
import { Roles } from './common/decorators/roles.decorator';
import { UserType } from './common/enums/user-type.enum';

@Delete(':id')
@Roles(UserType.ADMIN)
deleteUser(@Param('id') id: string) {
  // Only admins can access
}

@Get('attorney-dashboard')
@Roles(UserType.ATTORNEY, UserType.STAFF)
getAttorneyDashboard() {
  // Attorneys and staff can access
}
```

## 🔑 User Types

```typescript
enum UserType {
  CLIENT = 'client',      // Client users
  ATTORNEY = 'attorney',  // Attorney users
  STAFF = 'staff',        // Staff users
  ADMIN = 'admin'         // Administrator users
}
```

## 📋 AuthUser Interface

```typescript
interface AuthUser {
  id: string;                    // Supabase auth UUID
  email: string;                 // User email
  userType: UserType;            // User role
  fullName: string;              // Display name
  phoneNumber: string | null;    // Optional phone
  clientProfileId?: string;      // If userType is CLIENT
  attorneyProfileId?: string;    // If userType is ATTORNEY
}
```

## 🗄️ Database Access

### User Operations (RLS Enforced)

```typescript
import { SupabaseService } from './database/supabase.service';

@Injectable()
export class CasesService {
  constructor(private readonly supabase: SupabaseService) {}

  async getUserCases(accessToken: string) {
    const client = this.supabase.getClient(accessToken);
    const { data, error } = await client
      .from('cases')
      .select('*');
    return data; // RLS policies apply
  }
}
```

### Admin Operations (RLS Bypassed)

```typescript
async generateReport() {
  // JUSTIFICATION: Cross-user analytics requires bypassing RLS
  const client = this.supabase.getAdminClient();
  const { data, error } = await client
    .from('cases')
    .select('*');
  return data; // All rows returned
}
```

### Validate JWT

```typescript
async validateToken(token: string) {
  try {
    const user = await this.supabase.getUserFromToken(token);
    console.log(user.email, user.userType);
  } catch (error) {
    // Token invalid or expired
  }
}
```

## 🎯 Common Patterns

### Extract Specific User Fields

```typescript
@Post('appointments')
createAppointment(
  @CurrentUser('id') userId: string,
  @Body() dto: CreateAppointmentDto
) {
  return this.service.create(userId, dto);
}
```

### Conditional Logic by User Type

```typescript
@Get('my-data')
getMyData(@CurrentUser() user: AuthUser) {
  if (user.userType === UserType.CLIENT) {
    return this.service.getClientData(user.clientProfileId);
  }

  if (user.userType === UserType.ATTORNEY) {
    return this.service.getAttorneyData(user.attorneyProfileId);
  }

  // Admin/Staff see everything
  return this.service.getAllData();
}
```

### Pagination

```typescript
import { PaginationDto } from './common/dto/pagination.dto';
import { Query } from '@nestjs/common';

@Get()
async findAll(@Query() pagination: PaginationDto) {
  const offset = (pagination.page - 1) * pagination.limit;

  const { data } = await client
    .from('cases')
    .select('*')
    .order(pagination.sort, { ascending: pagination.order === 'asc' })
    .range(offset, offset + pagination.limit - 1);

  return data;
}
```

## 🔐 Admin Whitelist

Configure in `.env`:
```bash
ADMIN_EMAILS=john@gmail.com,admin@arco.com
```

**Behavior:**
- Whitelisted emails bypass all `@Roles()` restrictions
- Still requires valid JWT authentication
- Used for Google OAuth with personal emails

**Check whitelist programmatically:**
```typescript
import { AdminWhitelistService } from './database/admin-whitelist.service';

constructor(private readonly adminWhitelist: AdminWhitelistService) {}

isUserAdmin(email: string): boolean {
  return this.adminWhitelist.isAdminEmail(email);
}
```

## 🧪 Testing Endpoints

### With cURL

**Public endpoint:**
```bash
curl http://localhost:4000/api/hello
```

**Protected endpoint:**
```bash
curl http://localhost:4000/api/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**With body:**
```bash
curl -X POST http://localhost:4000/api/cases \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"New Case","description":"Details"}'
```

### With Postman/Insomnia

1. Add header: `Authorization: Bearer <your-jwt-token>`
2. Send request
3. Expect 200 (success) or 401 (unauthorized) or 403 (forbidden)

## ❌ Error Responses

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "timestamp": "2024-01-20T10:30:00.000Z",
  "path": "/api/profile",
  "message": "Missing or invalid authorization header"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "timestamp": "2024-01-20T10:30:00.000Z",
  "path": "/api/admin-dashboard",
  "message": "Insufficient permissions"
}
```

### 404 Not Found (Supabase PGRST116)
```json
{
  "statusCode": 404,
  "timestamp": "2024-01-20T10:30:00.000Z",
  "path": "/api/cases/123",
  "message": "Resource not found"
}
```

### 409 Conflict (Supabase 23505)
```json
{
  "statusCode": 409,
  "timestamp": "2024-01-20T10:30:00.000Z",
  "path": "/api/users",
  "message": "Resource already exists"
}
```

## 🎨 Best Practices

### ✅ DO

- Use `@Public()` for authentication/health endpoints
- Use `@CurrentUser()` to access authenticated user
- Use `@Roles()` for role-based access control
- Use `getClient()` for user operations (RLS enforced)
- Document why `getAdminClient()` is necessary
- Handle errors with try/catch blocks
- Return generic error messages to clients

### ❌ DON'T

- Don't trust client-provided user IDs (use `@CurrentUser()` instead)
- Don't use `getAdminClient()` without justification
- Don't expose service role key to frontend
- Don't return detailed error messages to clients
- Don't reverse guard execution order
- Don't skip JWT validation for sensitive operations

## 📚 File Locations

```
src/
├── common/
│   ├── decorators/
│   │   ├── public.decorator.ts
│   │   ├── current-user.decorator.ts
│   │   └── roles.decorator.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── enums/
│   │   └── user-type.enum.ts
│   └── interfaces/
│       └── auth-user.interface.ts
├── database/
│   ├── supabase.service.ts
│   └── admin-whitelist.service.ts
└── config/
    └── configuration.ts
```

## 🔄 Guard Execution Flow

```
1. Request arrives with Authorization header
   ↓
2. JwtAuthGuard runs
   ├─ Check @Public() decorator → Skip auth if present
   ├─ Extract JWT from header
   ├─ Validate with Supabase
   └─ Set request.user = AuthUser
   ↓
3. RolesGuard runs
   ├─ Check @Roles() decorator → Allow all if not present
   ├─ Check admin whitelist → Allow if email whitelisted
   ├─ Check user.userType against required roles
   └─ Allow or throw ForbiddenException
   ↓
4. Route handler executes
   └─ Access user via @CurrentUser()
```

## 💡 Tips

1. **Always test with invalid tokens** to ensure guards are working
2. **Use TypeScript types** for compile-time safety (`type { AuthUser }`)
3. **Check user type** before accessing `clientProfileId` or `attorneyProfileId`
4. **Log admin operations** that bypass RLS for audit trails
5. **Keep admin whitelist small** - use database roles for most users

## 🆘 Troubleshooting

**"Missing or invalid authorization header"**
→ Add `Authorization: Bearer <token>` header

**"Insufficient permissions"**
→ Check user's `userType` matches `@Roles()` requirement

**"Authentication failed"**
→ Token expired or invalid - get new token from auth endpoint

**TypeScript error with `@CurrentUser()`**
→ Import with `import type { AuthUser }` for isolatedModules compatibility
