import { ParamSchema, checkSchema } from 'express-validator'
import { USERS_MESSAGES } from './user.message'
import { validate } from '~/utils/validation'
import userServices from './user.services'
import { REGEX_PHONE_NUMBER_VIETNAM } from './user.regexs'
import databaseService from '../database/database.services'
import { hashPassword } from '~/utils/crypto'
import { ErrorWithStatus } from '../errors/error.model'
import HTTP_STATUS from '~/constants/httpStatus'
import { verifyToken } from '~/utils/jwt'
import { Request, Response, NextFunction } from 'express'
import { capitalize } from 'lodash'
import { JsonWebTokenError } from 'jsonwebtoken'
import { config } from 'dotenv'
import { UserRole, UserVerifyStatus } from './user.enum'
import { ObjectId } from 'mongodb'
import { TokenPayload } from './User.request'
import { log } from 'console'

config()

const passwordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
  },
  isString: {
    errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING
  },
  isLength: {
    options: {
      min: 8,
      max: 50
    },
    errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_8_TO_50
  },
  isStrongPassword: {
    options: {
      minLength: 8,
      minUppercase: 1,
      minLowercase: 1,
      minSymbols: 1,
      minNumbers: 1
    },
    errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG
  }
}

const confirmPasswordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED
  },
  isString: {
    errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_A_STRING
  },
  isLength: {
    options: {
      min: 8,
      max: 50
    },
    errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_8_TO_50
  },
  isStrongPassword: {
    options: {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minSymbols: 1,
      minNumbers: 1
    },
    errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRONG
  },
  custom: {
    options: (value, { req }) => {
      if (value !== req.body.password) {
        throw new Error(USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD)
      }
      return true
    }
  }
}

const nameSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.NAME_IS_REQUIRED
  },
  isString: {
    errorMessage: USERS_MESSAGES.NAME_MUST_BE_A_STRING
  },
  trim: true,
  isLength: {
    options: {
      min: 1,
      max: 100
    },
    errorMessage: USERS_MESSAGES.NAME_LENGTH_MUST_BE_FROM_1_TO_100
  }
}

const dateOfBirthSchema: ParamSchema = {
  isISO8601: {
    options: {
      strict: true,
      strictSeparator: true
    },
    errorMessage: USERS_MESSAGES.DATE_OF_BIRTH_BE_ISO8601
  }
}

const phoneNumberSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.PHONE_NUMBER_IS_REQUIRED
  },
  trim: true,
  custom: {
    options: async (value, { req }) => {
      if (!REGEX_PHONE_NUMBER_VIETNAM.test(value)) {
        throw new Error(USERS_MESSAGES.PHONE_NUMBER_IS_INVALID)
      }
      const isExist = await userServices.checkPhoneNumberExist(value)
      if (isExist) {
        throw new Error(USERS_MESSAGES.PHONE_NUMBER_ALREADY_EXIST)
      }
      return true
    }
  }
}

const imageSchema: ParamSchema = {
  optional: true,
  isString: {
    errorMessage: USERS_MESSAGES.IMAGE_URL_MUST_BE_A_STRING
  },
  trim: true,
  isLength: {
    options: {
      min: 1,
      max: 400
    },
    errorMessage: USERS_MESSAGES.IMAGE_URL_LENGTH_MUST_BE_LESS_THAN_400
  }
}

//validate middlewares
export const registerValidator = validate(
  checkSchema(
    {
      full_name: nameSchema,
      email: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
        },
        isEmail: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const isExist = await userServices.checkEmailExist(value)
            if (isExist) {
              throw new Error(USERS_MESSAGES.EMAIL_ALREADY_EXISTS)
            }
            return true
          }
        }
      },
      phone_number: phoneNumberSchema,
      password: passwordSchema,
      confirm_password: confirmPasswordSchema
    },
    ['body']
  )
)

export const loginValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
        },
        isEmail: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const user = await databaseService.users.findOne({
              email: value,
              password: hashPassword(req.body.password)
            })
            if (!user) {
              throw new Error(USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT)
            }

            if (user.verify_status === UserVerifyStatus.Banned) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.ACCOUNT_IS_BANNED,
                status: HTTP_STATUS.FORBIDDEN
              })
            }

            if (user.verify_status === UserVerifyStatus.Unverified) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.EMAIL_OF_ACCOUNT_IS_NOT_VERIFY,
                status: HTTP_STATUS.FORBIDDEN
              })
            }

            req.user = user
            return true
          }
        }
      },
      password: passwordSchema
    },
    ['body']
  )
)

export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        trim: true, //nó truyền khoảng trắng bụp liền
        custom: {
          options: async (value, { req }) => {
            const access_token = value.split(' ')[1]
            if (!access_token) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }

            try {
              // nếu có accessToken thì kiểm tra xem accessToken có hợp lệ không, tức là verify accessToken
              const decoded_authorization = await verifyToken({
                token: access_token,
                secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
              })

              const { role } = decoded_authorization
              if (role !== UserRole.User) {
                throw new ErrorWithStatus({
                  message: USERS_MESSAGES.ACCESS_TOKEN_IS_INVALID,
                  status: HTTP_STATUS.FORBIDDEN
                })
              }

              // lấy ra decoded_authorization để đưa vào req
              ;(req as Request).decoded_authorization = decoded_authorization
            } catch (error) {
              throw new ErrorWithStatus({
                message: capitalize((error as JsonWebTokenError).message),
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            return true
          }
        }
      }
    },
    ['headers']
  )
)

export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        trim: true,
        custom: {
          options: async (value, { req }) => {
            try {
              const decoded_refresh_token = await verifyToken({
                token: value,
                secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
              })
              const refresh_token = await databaseService.refreshTokens.findOne({
                token: value
              })

              //check xem token này có tồn tại trong db ko ha
              if (refresh_token === null) {
                throw new ErrorWithStatus({
                  message: USERS_MESSAGES.USED_REFRESH_TOKEN_OR_NOT_EXIST,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              ;(req as Request).decoded_refresh_token = decoded_refresh_token
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: capitalize((error as JsonWebTokenError).message),
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              throw error
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const accessTokenAdminValidator = validate(
  checkSchema(
    {
      Authorization: {
        trim: true, //nó truyền khoảng trắng bụp liền
        custom: {
          options: async (value, { req }) => {
            // console.log('bug1')
            //định dạng token Bearer <token> => split để lấy access ra
            const access_token = value.split(' ')[1]
            if (!access_token) {
              //ko có thì ăn chửi
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            // có rồi thì decode
            // const sercet_access_token = process.env.JWT_SECRET_ACCESS_TOKEN

            try {
              const decoded_authorization = await verifyToken({
                token: access_token,
                secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
              })

              const { role } = decoded_authorization
              if (role !== UserRole.Admin) {
                throw new ErrorWithStatus({
                  message: USERS_MESSAGES.ACCESS_TOKEN_IS_INVALID,
                  status: HTTP_STATUS.FORBIDDEN
                })
              }

              ;(req as Request).decoded_authorization = decoded_authorization
            } catch (error) {
              throw new ErrorWithStatus({
                message: capitalize((error as JsonWebTokenError).message),
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            return true
          }
        }
      }
    },
    ['headers']
  )
)

export const accessTokenStaffValidator = validate(
  checkSchema(
    {
      Authorization: {
        trim: true, //nó truyền khoảng trắng bụp liền
        custom: {
          options: async (value, { req }) => {
            // console.log('bug1')
            //định dạng token Bearer <token> => split để lấy access ra
            const access_token = value.split(' ')[1]
            if (!access_token) {
              //ko có thì ăn chửi
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            // có rồi thì decode
            // const sercet_access_token = process.env.JWT_SECRET_ACCESS_TOKEN

            try {
              const decoded_authorization = await verifyToken({
                token: access_token,
                secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
              })

              const { role } = decoded_authorization
              if (role !== UserRole.Staff) {
                throw new ErrorWithStatus({
                  message: USERS_MESSAGES.ACCESS_TOKEN_IS_INVALID,
                  status: HTTP_STATUS.FORBIDDEN
                })
              }

              ;(req as Request).decoded_authorization = decoded_authorization
            } catch (error) {
              throw new ErrorWithStatus({
                message: capitalize((error as JsonWebTokenError).message),
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            return true
          }
        }
      }
    },
    ['headers']
  )
)

export const accessTokenStaffOrAdminValidator = validate(
  checkSchema(
    {
      Authorization: {
        trim: true, //nó truyền khoảng trắng bụp liền
        custom: {
          options: async (value, { req }) => {
            // console.log('bug1')
            //định dạng token Bearer <token> => split để lấy access ra
            const access_token = value.split(' ')[1]
            if (!access_token) {
              //ko có thì ăn chửi
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            // có rồi thì decode
            // const sercet_access_token = process.env.JWT_SECRET_ACCESS_TOKEN

            try {
              const decoded_authorization = await verifyToken({
                token: access_token,
                secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
              })

              const { role } = decoded_authorization
              if (role === UserRole.User) {
                throw new ErrorWithStatus({
                  message: USERS_MESSAGES.ACCESS_TOKEN_IS_INVALID,
                  status: HTTP_STATUS.FORBIDDEN
                })
              }

              ;(req as Request).decoded_authorization = decoded_authorization
            } catch (error) {
              throw new ErrorWithStatus({
                message: capitalize((error as JsonWebTokenError).message),
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            return true
          }
        }
      }
    },
    ['headers']
  )
)

export const emailVerifyTokenValidator = validate(
  checkSchema(
    {
      email_verify_token: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            const token = req.query?.token
            // kiểm tra user có truyền lên email_verify_token không ?
            if (!token) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.EMAIL_VERIFY_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED // 401
              })
            }

            try {
              const decoded_email_verify_token = await verifyToken({
                token,
                secretOrPublicKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string
              })

              // sau khi verify mình đc payload
              ;(req as Request).decoded_email_verify_token = decoded_email_verify_token
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: capitalize((error as JsonWebTokenError).message),
                  status: HTTP_STATUS.UNAUTHORIZED // 401
                })
              }
              throw error
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const forgotPasswordValidator = validate(
  checkSchema({
    email: {
      notEmpty: {
        errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
      },
      isEmail: {
        errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
      },
      trim: true,
      custom: {
        options: async (value, { req }) => {
          // dựa vào email tìm đối tượng user tương ứng
          const user = await databaseService.users.findOne({ email: value })

          if (user === null) {
            throw new ErrorWithStatus({
              message: USERS_MESSAGES.USER_NOT_FOUND,
              status: HTTP_STATUS.NOT_FOUND // 404
            })
          }

          if (user.role !== UserRole.User) {
            throw new ErrorWithStatus({
              message: USERS_MESSAGES.USER_NOT_VALIDED,
              status: HTTP_STATUS.FORBIDDEN
            })
          }

          if (user.verify_status === UserVerifyStatus.Banned) {
            throw new ErrorWithStatus({
              message: USERS_MESSAGES.USER_BANNED,
              status: HTTP_STATUS.FORBIDDEN
            })
          }
          req.user = user // gán user vào req.user để sử dụng ở middleware tiếp theo
          return true
        }
      }
    }
  })
)

export const verifyForgotPasswordTokenValidator = validate(
  checkSchema(
    {
      forgot_password_token: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            // kiểm trả user có truyền lên email_verify_token không ?
            if (!value) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED // 401
              })
            }

            // verify forgot_password_token để lấy decoded_forgot_password_token
            try {
              const decoded_forgot_password_token = await verifyToken({
                token: value,
                secretOrPublicKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
              })

              // sau khi verify mình đc payload
              ;(req as Request).decoded_forgot_password_token = decoded_forgot_password_token

              const { user_id } = decoded_forgot_password_token
              // dựa vào user_id để tìm user
              const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })

              if (user === null) {
                throw new ErrorWithStatus({
                  message: USERS_MESSAGES.USER_NOT_FOUND,
                  status: HTTP_STATUS.NOT_FOUND // 404
                })
              }

              if (user.forgot_password_token !== value) {
                throw new ErrorWithStatus({
                  message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_INCORRECT,
                  status: HTTP_STATUS.UNAUTHORIZED // 401
                })
              }
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: capitalize((error as JsonWebTokenError).message),
                  status: HTTP_STATUS.UNAUTHORIZED // 401
                })
              }
              throw error
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const resetPasswordValidator = validate(
  checkSchema(
    {
      password: passwordSchema,
      confirm_password: confirmPasswordSchema
    },
    ['body']
  )
)

export const verifiedUserValidator = (req: Request, res: Response, next: NextFunction) => {
  const { verify_status } = req.decoded_authorization as TokenPayload
  if (verify_status !== UserVerifyStatus.Verified) {
    //muốn update thì user phải verify trước đó mới được update nhá
    return next(
      new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_VERIFIED,
        status: HTTP_STATUS.FORBIDDEN // 403
      })
    )
  }
  next()
}

export const updateMeValidator = validate(
  checkSchema(
    {
      full_name: {
        optional: true, //đc phép có hoặc k
        ...nameSchema, //phân rã nameSchema ra
        notEmpty: undefined //ghi đè lên notEmpty của nameSchema
      },
      date_of_birth: {
        optional: true, //đc phép có hoặc k
        ...dateOfBirthSchema, //phân rã nameSchema ra
        notEmpty: undefined //ghi đè lên notEmpty của nameSchema
      },
      phone_number: {
        optional: true, //đc phép có hoặc k
        ...phoneNumberSchema, //phân rã nameSchema ra
        notEmpty: undefined //ghi đè lên notEmpty của nameSchema
      },
      cccd: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGES.CCCD_MUST_BE_A_STRING
        },
        trim: true,
        isLength: {
          options: {
            min: 1,
            max: 12
          },
          errorMessage: USERS_MESSAGES.CCCD_LENGTH_MUST_BE_12
        }
      },
      user_avatar: imageSchema
    },
    ['body']
  )
)

export const changePasswordValidator = validate(
  checkSchema(
    {
      old_password: {
        ...passwordSchema,
        custom: {
          options: async (value, { req }) => {
            //sau khi qua accestokenValidator thì ta đã có req.decoded_authorization chứa user_id
            //lấy user_id đó để tìm user trong db
            const { user_id } = req.decoded_authorization as TokenPayload
            const user = await databaseService.users.findOne({
              _id: new ObjectId(user_id)
            })

            // nếu user k tồn tai thì throw error
            if (user === null) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.USER_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND // 404
              })
            }

            // nếu user tồn tại thì check xem old_password có đúng với password trong db hay k
            const { password } = user
            if (password !== hashPassword(value)) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.OLD_PASSWORD_NOT_MATCH,
                status: HTTP_STATUS.UNAUTHORIZED // 401
              })
            }
            return true
          }
        }
      },
      password: passwordSchema,
      confirm_password: confirmPasswordSchema
    },
    ['body']
  )
)

export const accessTokenLogoutValidator = validate(
  checkSchema(
    {
      Authorization: {
        trim: true, //nó truyền khoảng trắng bụp liền
        custom: {
          options: async (value, { req }) => {
            const access_token = value.split(' ')[1]
            if (!access_token) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }

            try {
              // nếu có accessToken thì kiểm tra xem accessToken có hợp lệ không, tức là verify accessToken
              const decoded_authorization = await verifyToken({
                token: access_token,
                secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
              })

              // lấy ra decoded_authorization để đưa vào req
              ;(req as Request).decoded_authorization = decoded_authorization
            } catch (error) {
              throw new ErrorWithStatus({
                message: capitalize((error as JsonWebTokenError).message),
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            return true
          }
        }
      }
    },
    ['headers']
  )
)

export const deleteAccountValidator = validate(
  checkSchema(
    {
      user_id: {
        custom: {
          options: async (value, { req }) => {
            const user = await userServices.getUserById(value)
            if (user === null) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.USER_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND // 404
              })
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)
