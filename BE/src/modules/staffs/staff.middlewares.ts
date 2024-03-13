import { ParamSchema, check, checkSchema } from 'express-validator'
import { validate } from '~/utils/validation'
import userServices from '../users/user.services'
import { REGEX_PHONE_NUMBER_VIETNAM } from '../users/user.regexs'
import { USERS_MESSAGES } from '../users/user.message'
import { STAFFS_MESSAGES } from './staff.mesage'
import { REGEX_CCCD_VIETNAM } from './staff.regex'
import databaseService from '../database/database.services'
import { ErrorWithStatus } from '../errors/error.model'
import HTTP_STATUS from '~/constants/httpStatus'
import { ObjectId } from 'mongodb'
import staffService from './staff.services'

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

const cccdSchema: ParamSchema = {
  notEmpty: {
    errorMessage: STAFFS_MESSAGES.CCCD_IS_REQUIRED
  },
  isString: {
    errorMessage: STAFFS_MESSAGES.CCCD_MUST_BE_A_STRING
  },
  trim: true,
  custom: {
    options: async (value, { req }) => {
      if (!REGEX_CCCD_VIETNAM.test(value)) {
        throw new Error(STAFFS_MESSAGES.CCCD_IS_INVALID)
      }
      const isExist = await userServices.checkCCCDExist(value)
      if (isExist) {
        throw new Error(STAFFS_MESSAGES.CCCD_ALREADY_EXISTS)
      }
      return true
    }
  }
}

export const createStaffValidator = validate(
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
      address: {
        notEmpty: {
          errorMessage: STAFFS_MESSAGES.ADDRESS_IS_REQUIRED
        },
        isString: {
          errorMessage: STAFFS_MESSAGES.ADDRESS_MUST_BE_A_STRING
        },
        trim: true
      },
      cccd: cccdSchema,
      phone_number: phoneNumberSchema,
      password: passwordSchema,
      confirm_password: confirmPasswordSchema
    },
    ['body']
  )
)

export const updateActivityStaffValidator = validate(
  checkSchema(
    {
      user_id: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.USER_ID_IS_REQUIRED
        },
        custom: {
          options: async (value, { req }) => {
            const user = await staffService.checkIDExist(value)

            if (user === null) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.USER_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND // 404
              })
            }
            return true
          }
        }
      },
      day_on: {
        isInt: {
          errorMessage: STAFFS_MESSAGES.DAY_ON_MUST_BE_AN_INTEGER
        }
      },
      day_off: {
        isInt: {
          errorMessage: STAFFS_MESSAGES.DAY_OFF_MUST_BE_AN_INTEGER
        }
      }
    },
    ['body']
  )
)

export const updateSalaryStaffValidator = validate(
  checkSchema(
    {
      user_id: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.USER_ID_IS_REQUIRED
        },
        custom: {
          options: async (value, { req }) => {
            const user = await staffService.checkIDExist(value)

            if (user === null) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.USER_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND // 404
              })
            }
            return true
          }
        }
      },
      salary: {
        isInt: {
          errorMessage: STAFFS_MESSAGES.SALARY_MUST_BE_AN_INTEGER
        },
        custom: {
          options: (value, { req }) => {
            if (value < 0) {
              throw new Error(STAFFS_MESSAGES.SALARY_MUST_BE_GREATER_THAN_OR_EQUAL_TO_0)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)
