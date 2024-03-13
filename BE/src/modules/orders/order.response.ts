import { ObjectId } from 'mongodb'
import { OrderStatus, PaymentMethod, PaymentStatus } from './order.enum'
import Interior from '../interiors/interior.schema'

export interface OrderResponse {
  _id?: ObjectId
  customer_id: ObjectId
  date_order: Date
  staff_id?: string
  address?: string
  phone_number?: string
  payment_method: PaymentMethod
  total_payment: string
  status_payment: PaymentStatus
  status_of_order: OrderStatus
  detail: OrderDetailResponse[]
}

export interface OrderDetailResponse {
  interior: Interior
  price: string
  quantity: string
}
