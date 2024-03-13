import { ParamsDictionary } from 'express-serve-static-core'
import { checkSchema } from 'express-validator'
import { CUSTOMER_REPORT } from '../customer-report/customer-report.messages'
import { validate } from '~/utils/validation'
import { orderService } from '~/modules/orders/order.services'
import { OrderStatus } from '~/modules/orders/order.enum'
import interiorService from '~/modules/interiors/interior.services'
import customerReportImageService from './customer-report-image.services'
import { forEach } from 'lodash'
import { Request } from 'express'
import { OrderDetail } from '~/modules/orders/order.schema'

export const createCustomerReportImageValidator = validate(
  checkSchema(
    {
      orderId: {
        notEmpty: true,
        isLength: {
          options: {
            min: 24,
            max: 24
          },
          errorMessage: CUSTOMER_REPORT.ORDER_IS_NOT_EXIST
        },
        custom: {
          options: async (value, { req }) => {
            const order = await orderService.getOrderById(value)
            if (!order) {
              throw new Error(CUSTOMER_REPORT.ORDER_IS_NOT_EXIST)
            }

            const decoded_authorization = req.decoded_authorization
            const { user_id } = decoded_authorization

            if (user_id !== order.customer_id.toString()) {
              throw new Error(CUSTOMER_REPORT.THIS_IS_NOT_YOUR_ORDER)
            }

            if (order.status_of_order !== OrderStatus.Delivery) {
              throw new Error(CUSTOMER_REPORT.ORDER_IS_NOT_VALID_TO_REPORT)
            }
            req.order = order
            return true
          }
        }
      },
      interiorId: {
        notEmpty: true,
        isLength: {
          options: {
            min: 24,
            max: 24
          },
          errorMessage: CUSTOMER_REPORT.INTERIOR_IS_NOT_EXIST
        },
        custom: {
          options: async (value, { req }) => {
            const interior = await interiorService.getInteriorById(value)
            if (!interior) {
              throw new Error(CUSTOMER_REPORT.INTERIOR_IS_NOT_EXIST)
            }

            const orderId = req.order._id
            const order = await orderService.getOrderById(orderId)
            if (order) {
              const detail = order.detail as OrderDetail[]
              let isExistInteriorInOrder = false
              for (let index = 0; index < detail.length; index++) {
                if (value === detail[index].interior_id.toString()) {
                  isExistInteriorInOrder = true
                  break
                }
              }

              if (!isExistInteriorInOrder) {
                throw new Error(CUSTOMER_REPORT.INTERIOR_IS_NOT_EXIST_IN_ORDER)
              }
            }

            return true
          }
        }
      }
    },
    ['params', 'query']
  )
)

export const deleteCustomerReportImageValidator = validate(
  checkSchema(
    {
      reportId: {
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
            const customerReportImage = await customerReportImageService.getReportImageByReportId(value)
            if (!customerReportImage) {
              throw new Error(CUSTOMER_REPORT.REPORT_IMAGE_IS_NOT_EXIST)
            }
            req.reportImage = customerReportImage
            return true
          }
        }
      },
      nameImage: {
        notEmpty: true,
        custom: {
          options: (value, { req }) => {
            const reportImage = req.reportImage
            let isExistImage = false
            for (let index = 0; index < reportImage.images.length; index++) {
              if (value === reportImage.image[index]) {
                isExistImage = false
                break
              }
            }
            if (!isExistImage) {
              throw new Error(CUSTOMER_REPORT.NAME_IMAGE_IS_NOT_EXIST)
            }
            return true
          }
        }
      }
    },
    ['params', 'query']
  )
)

export const deleteAllImageAndInforValidator = validate(
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
            const customerReportImage = await customerReportImageService.getReportImageByReportId(value)
            if (!customerReportImage) {
              throw new Error(CUSTOMER_REPORT.REPORT_IMAGE_IS_NOT_EXIST)
            }
            req.reportImage = customerReportImage
            return true
          }
        }
      }
    },
    ['params']
  )
)

export const importReportImageValidator = validate(
  checkSchema(
    {
      reportId: {
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
            const customerReportImage = await customerReportImageService.getReportImageByReportId(value)
            if (!customerReportImage) {
              throw new Error(CUSTOMER_REPORT.REPORT_IMAGE_IS_NOT_EXIST)
            }
            req.reportImage = customerReportImage
            return true
          }
        }
      }
    },
    ['params']
  )
)
