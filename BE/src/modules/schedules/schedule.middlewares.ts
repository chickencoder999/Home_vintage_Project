import { check, checkSchema } from 'express-validator'
import { validate } from '~/utils/validation'

export const registerScheduleValidator = validate(
  checkSchema({
    date: {
      in: ['body'],
      isString: true,
      toDate: true,
      errorMessage: 'Date is required'
    },
    time: {
      in: ['body'],
      isString: true,
      errorMessage: 'Time is required'
    },
    doctorId: {
      in: ['body'],
      isString: true,
      errorMessage: 'Doctor ID is required'
    }
  })
)
