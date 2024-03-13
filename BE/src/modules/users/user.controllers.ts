import { UserVerifyStatus, UserRole } from './user.enum'
import { Request, Response, NextFunction } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import userServices from './user.services'
import {
  ChangePasswordReqBody,
  LoginReqBody,
  LogoutReqBody,
  RefreshTokenReqBody,
  RegisterReqBody,
  ResetPasswordReqBody,
  TokenPayload,
  UpdateMeReqBody,
  VerifyEmailReqBody,
  deleteAccountReqBody
} from './User.request'
import { USERS_MESSAGES } from './user.message'
import User from './user.schema'
import { ObjectId } from 'mongodb'
import databaseService from '../database/database.services'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '../errors/error.model'
import exp from 'constants'
import { log } from 'console'

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  const result = await userServices.register(req.body)
  res.json({
    message: USERS_MESSAGES.REGISTER_SUCCESS,
    result
  })
}

export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  const user = req.user as User
  const user_id = user._id as ObjectId
  const { verify_status, role } = user
  const result = await userServices.login({
    user_id: user_id.toString(),
    verify_status: verify_status as UserVerifyStatus,
    role: role as UserRole
    //verify: user.verify làm như này ăn bug, do tay cho verify là optional
  })
  res.json({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    result
  })
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  const { refresh_token } = req.body
  const result = await userServices.logout(refresh_token)
  res.json({
    message: USERS_MESSAGES.LOGOUT_SUCCESS,
    result
  })
}

export const getProfileController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await userServices.getMe(user_id)
  res.json({
    message: USERS_MESSAGES.GET_ME_SUCCESS,
    result
  })
}

export const emailVerifyTokenController = async (
  req: Request<ParamsDictionary, any, VerifyEmailReqBody>,
  res: Response
) => {
  // nếu code vào đc  đây thì nghĩa là email_verify_token hợp lệ
  // và mình đã lấy đc decoded_email_verify_token
  const { user_id } = req.decoded_email_verify_token as TokenPayload
  // dựa vào user_id tìm user và xem thử nó đã verify email chưa ?
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })

  if (user === null) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.USER_NOT_FOUND,
      status: HTTP_STATUS.NOT_FOUND // 404
    })
  }

  // nếu verified rồi thì k cần verify nữa
  if (user.verify_status === UserVerifyStatus.Verified && user.email_verify_token === '') {
    return res.json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }

  // nếu mà không khớp email_verify_token thì trả về lỗi
  if (user.email_verify_token !== req.query?.token) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.EMAIL_VERIFY_TOKEN_IS_INCORRECT,
      status: HTTP_STATUS.UNAUTHORIZED // 401
    })
  }

  // nếu mà xuống đc đây thì nghĩa là user chưa verify email
  // mình sẽ update lại user đó
  const result = await userServices.verifyEmail(user_id)
  return res.json({
    message: USERS_MESSAGES.EMAIL_VERIFY_SUCCESS,
    result
  })
}

export const resendEmailVerifyController = async (req: Request, res: Response) => {
  // nếu vào dc đây thì nghĩa là access token hợp lệ
  // và mình đã lấy đc decoded_authorization
  const { user_id } = req.decoded_authorization as TokenPayload

  // dựa vào user_id để tìm user và xem thử nó đã verify email chưa ?
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  if (user === null) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.USER_NOT_FOUND,
      status: HTTP_STATUS.NOT_FOUND // 404
    })
  }

  if (user.verify_status === UserVerifyStatus.Banned) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.USER_BANNED,
      status: HTTP_STATUS.FORBIDDEN // 403
    })
  }

  // nếu mà xuống đc đây thì nghĩa là user chưa verify email
  const result = await userServices.resendEmailVerify(user_id)
  return res.json(result)
}

export const forgotPasswordController = async (req: Request, res: Response) => {
  // lấy _id từ user của req(mongodb)
  const { _id } = req.user as User
  // dùng _id tìm và update forgot_password_token
  const result = await userServices.forgotPassword((_id as ObjectId).toString())
  return res.json(result)
}

export const verifyForgotPasswordTokenController = async (req: Request, res: Response) => {
  return res.json({ message: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESS })
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordReqBody>,
  res: Response
) => {
  // muốn đổi mật khẩu thì cần user_id và pasword mới
  const { user_id } = req.decoded_forgot_password_token as TokenPayload
  const { password } = req.body
  // cập nhật
  const result = await userServices.resetPassword({ user_id, password })
  return res.json(result)
}

export const updateMeController = async (req: Request<ParamsDictionary, any, UpdateMeReqBody>, res: Response) => {
  // muốn update profile thì cần user_id và các thông tin cần update
  const { user_id } = req.decoded_authorization as TokenPayload
  const { body } = req
  // update lại user
  const result = await userServices.updateMe(user_id, body)
  return res.json({
    message: USERS_MESSAGES.UPDATE_ME_SUCCESS,
    result
  })
}

export const changePasswordController = async (
  req: Request<ParamsDictionary, any, ChangePasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  //lấy user_id từ decoded_authorization của access_token
  const { user_id } = req.decoded_authorization as TokenPayload
  //lấy old_password, new_password, confirm_new_password từ req.body
  const { password } = req.body
  //gọi hàm changePassword
  const result = await userServices.changePassword(user_id, password)
  return res.json(result)
}

export const refreshTokenController = async (
  req: Request<ParamsDictionary, any, RefreshTokenReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { refresh_token } = req.body
  const { user_id, verify } = req.decoded_refresh_token as TokenPayload
  const result = await userServices.refreshToken({ refresh_token, user_id, verify })
  return res.json({
    message: USERS_MESSAGES.REFRESH_TOKEN_SUCCESS,
    result
  })
}

export const deleteAccountController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.body
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  if (user?.verify_status === UserVerifyStatus.Banned) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.USER_BANNED,
      status: HTTP_STATUS.FORBIDDEN // 403
    })
  }

  const result = await userServices.deleteAccount(user_id)
  return res.json({
    message: USERS_MESSAGES.DELETE_ACCOUNT_SUCCESS,
    result
  })
}
