/**
 * Auth DTOs Barrel Export
 *
 * Re-exports all authentication-related DTOs for convenient importing.
 *
 * @module AuthDtos
 *
 * @example
 * ```typescript
 * import { SignupDto, SigninDto, AuthResponseDto } from './dto';
 * ```
 */

export { SignupDto } from './signup.dto';
export { SigninDto } from './signin.dto';
export { OAuthCallbackDto } from './oauth-callback.dto';
export { RefreshTokenDto } from './refresh-token.dto';
export {
  PasswordResetRequestDto,
  PasswordResetConfirmDto,
} from './password-reset.dto';
export type {
  AuthResponseDto,
  AuthResponseUser,
  AuthMessageDto,
} from './auth-response.dto';
