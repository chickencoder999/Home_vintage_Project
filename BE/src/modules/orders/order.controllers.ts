import { getInteriorById } from './../interiors/interior.controllers'
import { ParamsDictionary } from 'express-serve-static-core'
import { Request, Response } from 'express'
import { CreateOrderRequest } from './order.request'
import { orderService, updateInteriorQuantity } from './order.services'
import { ORDER_MESSAGES } from './order.messages'
import interiorService from '../interiors/interior.services'
import { INTERIOR_MESSAGES } from '../interiors/interior.messages'
import { quantityValidator } from './order.middlewares'
import Order, { OrderDetail } from './order.schema'
import { OrderStatus, PaymentMethod, PaymentStatus } from './order.enum'
import { TokenPayload } from '../users/User.request'
import { callOrderController, convertQueryStringToStatusOrder } from './order.helper'
import userServices from '../users/user.services'
import { OrderDetailResponse, OrderResponse } from './order.response'
import Interior from '../interiors/interior.schema'
import { InteriorResponse } from '../interiors/interior.response'
import { ValueNeedToConfirmOfOrder } from '~/constants/constrants.public'

export const createOrderController = async (req: Request<ParamsDictionary, any, CreateOrderRequest>, res: Response) => {
  const { detail } = req.body as { detail: OrderDetail[] }

  //check quantity
  //cho chạy for rồi lưu các lỗi vào error message
  //check error message array\
  const errorMessages = await quantityValidator(detail)
  if (errorMessages.length > 0) {
    //check lỗi rồi lưu lại có thì chửi
    return res.status(422).json({
      message: errorMessages
    })
  }

  const user_id = (req.decoded_authorization as TokenPayload).user_id
  //get user để lấy sdt
  const user = await userServices.getMe(user_id)
  const phone_number = user?.phone_number

  //check xem user này đã từng mua hàng chưa
  const isBuyFirstTime = await orderService.checkBuyFirstTime(user_id)
  let order_status: OrderStatus = OrderStatus.Pack_products
  let payment_method_real: PaymentMethod = PaymentMethod.COD
  let payment_status: PaymentStatus = PaymentStatus.do_not_pay
  const { total_payment, payment_method } = req.body
  if (!isBuyFirstTime || parseInt(total_payment) > ValueNeedToConfirmOfOrder) {
    //check xem mua lần nào chưa và giá trị đơn hàng có lớn hơn giá trị quy định của doanh nghiệp không
    order_status = OrderStatus.Wait_for_confirm
  }

  if (payment_method.toString() === PaymentMethod.Paypal.toString()) {
    payment_method_real = PaymentMethod.Paypal
    payment_status = PaymentStatus.did_pay
  }

  const result = await orderService.createOrder(
    req,
    order_status,
    payment_method_real,
    payment_status,
    phone_number as string
  )
  res.json({
    message: ORDER_MESSAGES.ORDER_SUCCESSFULL,
    orderInfor: result
  })
}

export const acceptOrderController = async (req: Request, res: Response) => {
  const { id } = req.params
  //lấy order ra này
  const order = await orderService.getOrderById(id)
  if (order) {
    //lấy xong check quantity
    const errorMessages = await quantityValidator(order.detail)
    if (errorMessages.length > 0) {
      //có lỗi thì nổ bug ra
      return res.status(422).json({
        message: errorMessages
      })
    }
    updateInteriorQuantity(order.detail, OrderStatus.Pack_products)
  }

  //ko nổ bug thì thay đổi trạng thái đơn hàng
  const result = await orderService.changeStatusOrder(id, OrderStatus.Pack_products)
  res.json({
    message: ORDER_MESSAGES.ACCEPT_ORDER_SUCCESSFULL,
    orderInfor: result
  })
}

export const shippingOrderController = async (req: Request, res: Response) => {
  const { id } = req.params
  const { order } = req as { order: Order }
  for (let i = 0; i < order.detail.length; i++) {
    const { interior_id, quantity } = order.detail[i]
    const result = await interiorService.updateNumberOfSale(quantity, interior_id.toString())
  }
  //chỉ cần thay đổi trạng thái và update number of sale của interiors
  const result = await orderService.changeStatusOrder(id, OrderStatus.Delivery)
  res.json({
    message: ORDER_MESSAGES.ORDER_IS_DELIVERIED,
    orderInfor: result
  })
}

export const deleteOrderController = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string }
  const order = req.order as Order
  updateInteriorQuantity(order.detail, OrderStatus.Cancel)
  if (order.status_of_order === OrderStatus.Pack_products && order.payment_method === PaymentMethod.Paypal) {
    //nếu status là pack product thì sẽ update lại quantity của interior

    const result = await Promise.all([
      orderService.changeStatusOrder(id, OrderStatus.Cancel),
      orderService.changeStatusPayment(id, PaymentStatus.refunds)
    ])

    return res.json({
      message: ORDER_MESSAGES.ORDER_IS_CANCEL,
      orderInfor: result
    })
  }

  const result = await orderService.changeStatusOrder(id, OrderStatus.Cancel)

  res.json({
    message: ORDER_MESSAGES.ORDER_IS_CANCEL,
    orderInfor: result
  })
}

export const getListOrderHistoryController = async (req: Request, res: Response) => {
  const { decoded_authorization } = req as { decoded_authorization: TokenPayload }
  const { user_id } = decoded_authorization
  const result = await orderService.getListOrderHistory(user_id)
  const list_order_history: OrderResponse[] = []

  //xử lý lấy ra interior từ order detail
  for (let index = 0; index < result.length; index++) {
    const { detail, ...restOrder } = result[index]
    const newDetail: OrderDetailResponse[] = [] //khỏi tạo này
    for (let index = 0; index < detail.length; index++) {
      const { interior_id, ...rest } = detail[index]
      const interior: any = await interiorService.getInteriorById(detail[index].interior_id.toString())
      newDetail.push({ interior: interior as Interior, ...rest }) //tạo ra 1 order detail response
    }

    const { date_order, ...restOrderWithoutDate } = restOrder // chỗ này bị 1 bug là nó ko thể xác định date_order do lúc đầu ta để nó là optional
    const validDateOrder = date_order || new Date()
    list_order_history.push({ detail: newDetail, ...restOrderWithoutDate, date_order: validDateOrder }) // Fix for problem 1
  }

  res.json({
    message: ORDER_MESSAGES.GET_LIST_ORDER_HISTORY_SUCCESS,
    list_order_history: list_order_history
  })
}

export const rejectOrderController = async (req: Request, res: Response) => {
  const { id } = req.params
  const { order } = req as { order: Order }
  if (order.payment_method === PaymentMethod.Paypal) {
    const result = await Promise.all([
      orderService.changeStatusOrder(id, OrderStatus.Cancel),
      orderService.changeStatusPayment(id, PaymentStatus.refunds)
    ])

    return res.json({
      message: ORDER_MESSAGES.ORDER_IS_CANCEL,
      orderInfor: result
    })
  }

  const result = await orderService.changeStatusOrder(id, OrderStatus.Cancel)

  res.json({
    message: ORDER_MESSAGES.ORDER_IS_CANCEL,
    orderInfor: result
  })
}

export const orderControllerTotal = async (req: Request, res: Response) => {
  console.log(1)
  const { status } = req.query
  const status_string = status as string
  const status_order = convertQueryStringToStatusOrder(status_string)
  if (status_order === null) {
    return res.status(422).json({
      message: ORDER_MESSAGES.STATUS_IS_NOT_VALID
    })
  }
  const controller = callOrderController(status_order)
  console.log(controller)
  return controller
}

export const getListOrder = async (req: Request, res: Response) => {
  const status = req.query.status as string
  if (status === 'waitConfirm') {
    const result = await orderService.getListOrderWaitConfirm()
    return res.json({
      message: ORDER_MESSAGES.GET_LIST_ORDER_WAIT_CONFIRM_SUCCESS,
      list_order_wait_confirm: result
    })
  }

  const result = await orderService.getListOrderParkProduct()
  return res.json({
    message: ORDER_MESSAGES.GET_LIST_ORDER_PARK_PRODUCT_SUCCESS,
    list_order_wait_confirm: result
  })
}
