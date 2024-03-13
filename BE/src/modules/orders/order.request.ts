import { OrderStatus, PaymentMethod, PaymentStatus } from './order.enum'
import { OrderDetail } from './order.schema'

export interface CreateOrderRequest {
  payment_method: PaymentMethod
  total_payment: string
  detail: OrderDetail[]
}
