import { acceptOrderController, deleteOrderController, shippingOrderController } from './order.controllers'
import { OrderStatus } from './order.enum'
import { acceptOrderValidator, deleteOrderValidator, shippingOrderValidator } from './order.middlewares'

export const convertQueryStringToStatusOrder = (status: string) => {
  switch (status) {
    case 'wait-for-confirm':
      return OrderStatus.Wait_for_confirm
    case 'pack-products':
      return OrderStatus.Pack_products
    case 'delivery':
      return OrderStatus.Delivery
    case 'success':
      return OrderStatus.Success
    case 'cancel':
      return OrderStatus.Cancel
    default:
      return null
  }
}

export const callOrderValidator = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.Pack_products:
      return acceptOrderValidator
    case OrderStatus.Delivery:
      return shippingOrderValidator
    case OrderStatus.Cancel:
      return deleteOrderValidator
  }
}

export const callOrderController = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.Pack_products:
      return acceptOrderController
    case OrderStatus.Delivery:
      return shippingOrderController
    case OrderStatus.Cancel:
      return deleteOrderController
  }
}
