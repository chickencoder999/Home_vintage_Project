import { ValidationChain, check, checkSchema } from 'express-validator'
import { validate } from '~/utils/validation'
import { INTERIOR_MESSAGES } from '../interiors/interior.messages'

import Order, { OrderDetail } from './order.schema'
import { ObjectId } from 'mongodb'
import { ORDER_MESSAGES } from './order.messages'
import { orderService, updateInteriorQuantity } from './order.services'
import { OrderStatus } from './order.enum'
import { TokenPayload } from '../users/User.request'
import { decode } from 'punycode'
import { ErrorWithStatus } from '../errors/error.model'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/message'
import { NextFunction, Request, Response } from 'express'
import { callOrderValidator, convertQueryStringToStatusOrder } from './order.helper'
import { RunnableValidationChains } from 'express-validator/src/middlewares/schema'
import interiorService from '../interiors/interior.services'

export const createOrderValidator = validate(
  checkSchema(
    {
      address: {
        notEmpty: true
      },
      'detail.*.interior_id': {
        //check id sản phẩm nha
        notEmpty: true,
        isLength: {
          options: {
            min: 24,
            max: 24
          },
          errorMessage: 'Id is not valid'
        },
        custom: {
          options: async (value, { req }) => {
            const isExist = await interiorService.checkInteriorExist(value)
            if (!isExist) {
              //check xem tồn tại ko
              throw new Error(INTERIOR_MESSAGES.INTERIOR_NOT_FOUND)
            }
            return true
          }
        }
      },
      'detail.*.quantity': {
        //check quantity có không
        notEmpty: true
      }
    },
    ['body']
  )
)

export const quantityValidator = async (detail: OrderDetail[]) => {
  const errorMessages: string[] = []
  for (let index = 0; index < detail.length; index++) {
    const item = detail[index]
    const errorMessagesLocal: string[] = []
    const { interior_id, quantity } = item
    const idString = new ObjectId(interior_id).toString()
    const interior = await interiorService.getInteriorById(idString)
    if ((interior && parseInt(interior.quantity) < parseInt(quantity)) || parseInt(quantity) === 0) {
      errorMessagesLocal.push(`Detail[${index}].quantity : ${ORDER_MESSAGES.QUANTITY_IS_NOT_VALID}`)
      errorMessages.push(errorMessagesLocal.join(', '))
    }
  }
  return errorMessages
}

export const acceptOrderValidator = validate(
  checkSchema(
    {
      id: {
        notEmpty: true,
        isLength: {
          options: {
            max: 24,
            min: 24
          },
          errorMessage: ORDER_MESSAGES.ORDER_IS_NOT_EXIST
        },
        custom: {
          options: async (value, { req }) => {
            //check order tồn tại trước khi accept
            const order = await orderService.getOrderById(value)
            if (!order) {
              throw new Error(ORDER_MESSAGES.ORDER_IS_NOT_EXIST)
            }

            if (
              //check status of order có đúng không
              order.status_of_order !== OrderStatus.Wait_for_confirm
            ) {
              throw new Error(ORDER_MESSAGES.ORDER_IS_NOT_VALID_TO_ACCEPT)
            }

            return true
          }
        }
      }
    },
    ['params']
  )
)

export const shippingOrderValidator = validate(
  checkSchema(
    {
      id: {
        notEmpty: true,
        isLength: {
          options: {
            min: 24,
            max: 24
          },
          errorMessage: ORDER_MESSAGES.ORDER_IS_NOT_EXIST
        },
        custom: {
          options: async (value, { req }) => {
            const order = await orderService.getOrderById(value)
            if (!order) {
              //check order tồn tại không này
              throw new Error(ORDER_MESSAGES.ORDER_IS_NOT_EXIST)
            }
            //check xem đúng status là shipping không
            if (order.status_of_order !== OrderStatus.Pack_products) {
              throw new Error(ORDER_MESSAGES.ORDER_IS_NOT_VALID_TO_DELIVERY)
            }
            req.order = order
            return true
          }
        }
      }
    },
    ['params']
  )
)

export const deleteOrderValidator = validate(
  checkSchema(
    {
      id: {
        notEmpty: true,
        isLength: {
          options: {
            min: 24,
            max: 24
          },
          errorMessage: ORDER_MESSAGES.ORDER_IS_NOT_EXIST
        },
        custom: {
          options: async (value, { req }) => {
            const order = await orderService.getOrderById(value)
            if (!order) {
              //kiểm tra order tồn tại hay không
              throw new Error(ORDER_MESSAGES.ORDER_IS_NOT_EXIST)
            }

            //nếu là status là 1 trong 2 dạng dưới thì chửi
            if ([OrderStatus.Delivery, OrderStatus.Cancel].includes(order.status_of_order)) {
              throw new Error(ORDER_MESSAGES.ORDER_IS_NOT_VALID_TO_DELETE)
            }

            const { decoded_authorization } = req as { decoded_authorization: TokenPayload }
            const { user_id } = decoded_authorization
            if (user_id !== order.customer_id.toString()) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.THIS_IS_NOT_YOUR_ORDER,
                status: HTTP_STATUS.FORBIDDEN
              })
            }

            req.order = order
            return true
          }
        }
      }
    },
    ['params']
  )
)

export const rejectOrderValidator = validate(
  checkSchema(
    {
      id: {
        notEmpty: true,
        isLength: {
          options: {
            min: 24,
            max: 24
          },
          errorMessage: ORDER_MESSAGES.ORDER_IS_NOT_EXIST
        },
        custom: {
          options: async (value, { req }) => {
            const order = await orderService.getOrderById(value)
            if (!order) {
              throw new Error(ORDER_MESSAGES.ORDER_IS_NOT_EXIST)
            }

            if (order.status_of_order !== OrderStatus.Wait_for_confirm) {
              throw new Error(ORDER_MESSAGES.ORDER_IS_NOT_VALID_TO_REJECT)
            }
            req.order = order
            return true
          }
        }
      }
    },
    ['params']
  )
)

//đoạn này để tối ưu mà khó quá :<
// export const orderValidatorTotal = async (req: Request, res: Response, next: NextFunction) => {
//   console.log(1)
//   const { status } = req.query
//   const status_string = status as string
//   const status_order = convertQueryStringToStatusOrder(status_string)
//   if (status_order === null) {
//     return res.status(422).json({
//       message: ORDER_MESSAGES.STATUS_IS_NOT_VALID
//     })
//   }
//   const validator = callOrderValidator(status_order)
// }
