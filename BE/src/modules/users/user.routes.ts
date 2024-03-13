import { Router } from 'express'

import { wrapAsync } from '~/utils/handlers'
import {
  changePasswordController,
  deleteAccountController,
  emailVerifyTokenController,
  forgotPasswordController,
  getProfileController,
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  resendEmailVerifyController,
  resetPasswordController,
  updateMeController,
  verifyForgotPasswordTokenController
} from './user.controllers'
import {
  accessTokenAdminValidator,
  accessTokenLogoutValidator,
  accessTokenValidator,
  changePasswordValidator,
  deleteAccountValidator,
  emailVerifyTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  updateMeValidator,
  verifiedUserValidator,
  verifyForgotPasswordTokenValidator
} from './user.middlewares'
import { UpdateMeReqBody } from './User.request'
import { filterMiddleware } from '~/utils/common'

const usersRouter = Router()

/*
  Description: Register new user
  Path: /register
  Method: POST
  Body: { ... }
*/
usersRouter.post('/register', registerValidator, wrapAsync(registerController))

/*
  Description: Login
  Path: /login
  Method: POST
  Body: { email, password }
    - email: string
    - password: string
*/
usersRouter.post('/login', loginValidator, wrapAsync(loginController))

/*
  Description: Logout
  Path: /logout
  Method: POST
  Headers: { Authorization: 'Bearer <access_token>' }
  Body: { refresh_token: string }
*/
usersRouter.post('/logout', accessTokenLogoutValidator, refreshTokenValidator, wrapAsync(logoutController))

/*  
  Description: Verify email
  Khi user register,  they will receive an email with a format like this:
  https://localhost:3000/users/verify-email?token=<email_verify_token>
  nếu user click vào link này thì sẽ tạo ra req gửi email_verify_token lên server
  server kiểm tra email_verify_token có hợp lệ không? nếu hợp lệ thì sẽ update email_verified thành true
  và vào user_id để update email_verified thành '', verify = 1, update_at = new Date()
  Path: /verify-email
  Method: POST
  Body: { email_verify_token: string }
*/
usersRouter.get('/verify-email', emailVerifyTokenValidator, wrapAsync(emailVerifyTokenController))

/*
  Des: Resend email verify token
  Method: POST
  Path: users/resend-verify-email
  Headers: { Authorization: "Bearer <access_token>" } (đăng nhập mới được resend)
  Body: {}
*/
usersRouter.post('/resend-verify-email', accessTokenValidator, wrapAsync(resendEmailVerifyController))

/*
Des: khi user quên mật khẩu, họ gửi email lên server để xin tạo cho họ forgot_password_token
Path: /users/forgot-password
Method: POST
Body: { email: string }
*/
usersRouter.post('/forgot-password', forgotPasswordValidator, wrapAsync(forgotPasswordController))

/*
Des: khi user nhấn vào link trong email để reset password
Họ sẽ gửi 1 req kèm theo forgot_password_token lên server
server sẽ kiểm tra forgot_password_token có hợp lệ không? nếu hợp lệ thì sẽ cho phép user reset password
sau đó chuyến hướng user đến trang reset password
Path: /users/verify-forgot-password
Method: POST
Body: { forgot_password_token: string }
*/
usersRouter.post(
  '/verify-forgot-password',
  verifyForgotPasswordTokenValidator,
  wrapAsync(verifyForgotPasswordTokenController)
)

/*
  Des: reset password
  Path: '/reset-password'
  Method: POST
  Header: không cần, vì ngta quên password rồi, thì sao mà login để có authen đc
  Body: {forgot_password_token: string, password: string, confirm_password: string}
  */
usersRouter.post(
  '/reset-password',
  resetPasswordValidator,
  verifyForgotPasswordTokenValidator,
  wrapAsync(resetPasswordController)
)

/*
     Des: get profile của user
     Path: '/me'
     Method: get
     Header: {Authorization: Bearer <access_token>}
     Body: {}
   */
usersRouter.get('/me', accessTokenValidator, wrapAsync(getProfileController))

usersRouter.patch(
  '/me',
  accessTokenValidator,
  verifiedUserValidator,
  filterMiddleware<UpdateMeReqBody>(['full_name', 'date_of_birth', 'cccd', 'phone_number', 'user_avatar']),
  updateMeValidator,
  wrapAsync(updateMeController)
)

// change password
/*
  Des: change password
  Path: '/change-password'
  Method: PUT
  Headers: { Authorization: Bearer <access_token> }
  Body: { old_password: string, new_password: string, confirm_new_password: string }
*/
usersRouter.put(
  '/change-password',
  accessTokenValidator,
  verifiedUserValidator,
  changePasswordValidator,
  wrapAsync(changePasswordController)
)
//changePasswordValidator check các giá trị truyền lên body có valid k ?

/*
  Des: refresh token
  Path: '/refresh-token'
  Method: POST
  Body: { refresh_token: string }
*/
// Ques: Why dont check access-token here
// Ans: Because access-token is expired, so we need to use refresh-token to get new access-token
usersRouter.post('/refresh-token', refreshTokenValidator, wrapAsync(refreshTokenController))

/*
  Des: delete account
  Path: '/delete-account'
  Method: patch
  Body: 
*/
usersRouter.patch(
  '/delete-account',
  accessTokenAdminValidator,
  deleteAccountValidator,
  wrapAsync(deleteAccountController)
)

export default usersRouter
