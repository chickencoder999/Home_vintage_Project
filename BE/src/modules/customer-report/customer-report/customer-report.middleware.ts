import { check, checkSchema } from 'express-validator'
import { validate } from '~/utils/validation'
import { CUSTOMER_REPORT } from './customer-report.messages'
import customerReportService from './customer-report.services'
import { orderService } from '~/modules/orders/order.services'
import interiorService from '~/modules/interiors/interior.services'
import customerReportImageService from '../customer-report-image/customer-report-image.services'
import { CustomerReport } from './customer-report.schema'

export const createCustomerReportValidator = validate(
  checkSchema(
    {
      report_id: {
        optional: true,
        isLength: {
          options: {
            min: 24,
            max: 24
          },
          errorMessage: CUSTOMER_REPORT.REPORT_IS_NOT_VALID
        },
        custom: {
          options: async (value, { req }) => {
            const report = await customerReportImageService.getReportImageByReportId(value)
            if (!report) {
              throw new Error(CUSTOMER_REPORT.REPORT_IS_NOT_EXIST)
            }
            return true
          }
        }
      },
      order_id: {
        notEmpty: true,
        isLength: {
          options: {
            min: 24,
            max: 24
          },
          errorMessage: CUSTOMER_REPORT.ORDER_IS_NOT_VALID_TO_REPORT
        },
        custom: {
          options: async (value, { req }) => {
            const order = await orderService.getOrderById(value)
            if (!order) {
              throw new Error(CUSTOMER_REPORT.ORDER_IS_NOT_EXIST)
            }
            return true
          }
        }
      },
      interior_id: {
        notEmpty: true,
        isLength: {
          options: {
            min: 24,
            max: 24
          },
          errorMessage: CUSTOMER_REPORT.INTERIOR_IS_NOT_VALID
        },
        custom: {
          options: async (value, { req }) => {
            const isExist = await interiorService.checkInteriorExist(value)
            if (!isExist) {
              throw new Error(CUSTOMER_REPORT.INTERIOR_IS_NOT_EXIST)
            }
            return true
          }
        }
      },
      description: {
        notEmpty: true,
        isLength: {
          options: {
            min: 5,
            max: 100
          },
          errorMessage: CUSTOMER_REPORT.DESCRIPTION_MUST_BE_FORM_5_TO_100_CHARACTERS
        }
      },
      rate_interior: {
        notEmpty: true
      }
    },
    ['body']
  )
)

export const deleteCustomerReportValidator = validate(
  checkSchema(
    {
      id: {
        notEmpty: true,
        isLength: {
          options: {
            min: 24,
            max: 24
          },
          errorMessage: CUSTOMER_REPORT.REPORT_IMAGE_IS_NOT_VALID
        },
        custom: {
          options: async (value, { req }) => {
            const report = await customerReportService.getReportById(value)
            if (!report) {
              throw new Error(CUSTOMER_REPORT.REPORT_IMAGE_IS_NOT_EXIST)
            }

            if (report.images) {
              req.images = report.images
            }

            return true
          }
        }
      }
    },
    ['params']
  )
)

export const manageCustomerReportvalidator = validate(
  checkSchema(
    {
      id: {
        notEmpty: true,
        isLength: {
          options: {
            min: 24,
            max: 24
          },
          errorMessage: CUSTOMER_REPORT.REPORT_IS_NOT_VALID
        },
        custom: {
          options: async (value, { req }) => {
            const isExist = await customerReportService.getReportById(value)
            if (!isExist) {
              throw new Error(CUSTOMER_REPORT.REPORT_IS_NOT_EXIST)
            }
            req.report = isExist
            return true
          }
        }
      },
      status: {
        optional: true,
        custom: {
          options: (value) => {
            if (value !== 'notValid') {
              throw new Error(CUSTOMER_REPORT.STATUS_IS_NOT_VALID)
            }
            return true
          }
        }
      }
    },
    ['params', 'query']
  )
)
