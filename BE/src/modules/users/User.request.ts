import { JwtPayload } from 'jsonwebtoken'
import { TokenType, UserRole, UserVerifyStatus } from './user.enum'

export interface LogoutReqBody {
  refresh_token: string
}

export interface LoginReqBody {
  email: string
  password: string
}

export interface RegisterReqBody {
  full_name: string
  phone_number: string
  email: string
  password: string
  confirm_password: string
}

export interface TokenPayload extends JwtPayload {
  user_id: string
  token_type: TokenType
  verify: UserVerifyStatus
  role: UserRole
  exp: number
  iat: number
}

export interface VerifyEmailReqBody {
  email_verify_token: string
}

export interface ResetPasswordReqBody {
  forgot_password_token: string
  password: string
  confirm_password: string
}

export interface UpdateMeReqBody {
  full_name?: string
  date_of_birth?: string
  cccd?: string
  phone_number?: string
  user_avatar?: string
}

export interface deleteAccountReqBody {
  verify_status: UserVerifyStatus
}

export interface ChangePasswordReqBody {
  old_password: string
  password: string
  confirm_password: string
}

export interface RefreshTokenReqBody {
  refresh_token: string
}
