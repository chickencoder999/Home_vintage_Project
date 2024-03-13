import { Request } from 'express'
import Order, { OrderDetail } from './order.schema'
import databaseService from '../database/database.services'
import { ObjectId } from 'mongodb'
import { TokenPayload } from '../users/User.request'
import { OrderStatus, PaymentMethod, PaymentStatus } from './order.enum'
import { CreateOrderRequest } from './order.request'
import interiorService from '../interiors/interior.services'
import { OrderResponse } from './order.response'

class OrderServices {
  async createOrder(
    req: Request,
    order_status: OrderStatus,
    payment_method: PaymentMethod,
    status_payment: PaymentStatus,
    phone_number: string
  ) {
    const { total_payment, detail, address }: { total_payment: string; detail: OrderDetail[]; address: string } =
      req.body
    const { user_id } = req.decoded_authorization as TokenPayload

    const order_id = new ObjectId()
    const result = await databaseService.orders.insertOne(
      new Order({
        _id: order_id,
        customer_id: new ObjectId(user_id),
        staff_id: '',
        date_order: new Date(),
        phone_number: phone_number,
        address: address,
        total_payment: total_payment,
        payment_method: payment_method,
        detail: detail,
        status_of_order: order_status,
        status_payment: status_payment
      })
    )
    //kiểm tra status mà khác wait for confirm thì sẽ thay đổi hàng tồn kho của sản phẩm
    if (order_status !== OrderStatus.Wait_for_confirm) {
      updateInteriorQuantity(detail, order_status)
    }

    const orderInfor = await this.getOrderById(result.insertedId.toString())
    return orderInfor
  }

  async getOrderById(id: string) {
    const result = await databaseService.orders.findOne({ _id: new ObjectId(id) })
    return result
  }

  async changeStatusOrder(id: string, status: OrderStatus) {
    const result = await databaseService.orders.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          status_of_order: status
        }
      }
    )
    const order = this.getOrderById(id)
    return order
  }

  async getListOrderHistory(user_id: string) {
    //vì user_id là string nên phải chuyển về ObjectId
    //lookup với interior để lấy thông tin chi tiết của sản phẩm
    const result = await databaseService.orders.find({ customer_id: new ObjectId(user_id) }).toArray()
    return result
  }

  async checkBuyFirstTime(user_id: string) {
    const result = await databaseService.orders.findOne({ customer_id: new ObjectId(user_id) })
    return Boolean(result)
  }

  async changeStatusPayment(id: string, payment_status: PaymentStatus) {
    const result = await databaseService.orders.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          payment_status: payment_status
        }
      }
    )
    const order = this.getOrderById(id)
    return order
  }

  async getListOrderWaitConfirm() {
    const result = await databaseService.orders.find({ status_of_order: OrderStatus.Wait_for_confirm }).toArray()
    return result
  }

  async getListOrderParkProduct() {
    const result = await databaseService.orders.find({ status_of_order: OrderStatus.Pack_products }).toArray()
    return result
  }
}

//tách hàm này ra để còn sử dụng lại
export const updateInteriorQuantity = (detail: OrderDetail[], order_status: OrderStatus) => {
  detail.forEach(async (orderDetail: OrderDetail) => {
    const { interior_id, quantity } = orderDetail
    const interior = await interiorService.getInteriorById(interior_id.toString())
    if (interior && order_status === OrderStatus.Pack_products) {
      const newQuantity = parseInt(interior.quantity) - parseInt(quantity)
      const result = await interiorService.updateInteriorQuantity(newQuantity, interior_id.toString())
    } else if (interior && order_status === OrderStatus.Cancel) {
      const newQuantity = parseInt(interior.quantity) + parseInt(quantity)
      const result = await interiorService.updateInteriorQuantity(newQuantity, interior_id.toString())
    }
  })
}

export const orderService = new OrderServices()
