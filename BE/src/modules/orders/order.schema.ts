import { ObjectId } from 'mongodb'
import { OrderStatus, PaymentMethod, PaymentStatus } from './order.enum'

interface OrderType {
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
  detail: OrderDetailType[]
}

interface OrderDetailType {
  interior_id: ObjectId
  price: string
  quantity: string
}

export class OrderDetail {
  interior_id: ObjectId
  price: string
  quantity: string

  constructor(orderDetail: OrderDetailType) {
    this.interior_id = orderDetail.interior_id
    this.price = orderDetail.price
    this.quantity = orderDetail.quantity
  }
}

export default class Order {
  _id?: ObjectId
  customer_id: ObjectId
  staff_id?: string
  date_order?: Date
  payment_method: PaymentMethod
  address?: string
  phone_number?: string
  total_payment: string
  status_payment: PaymentStatus
  status_of_order: OrderStatus
  detail: OrderDetail[]

  constructor(order: OrderType) {
    const date = new Date()
    this._id = order._id || new ObjectId()
    this.customer_id = order.customer_id
    this.staff_id = order.staff_id || ''
    this.address = order.address || ''
    this.phone_number = order.phone_number || ''
    this.date_order = order.date_order || date
    this.payment_method = order.payment_method
    this.total_payment = order.total_payment
    this.status_payment = order.status_payment
    this.status_of_order = order.status_of_order
    this.detail = order.detail
  }
}
