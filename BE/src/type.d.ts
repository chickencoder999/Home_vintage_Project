import { Request } from 'express'
import User from './modules/users/user.schema'
import { TokenPayload } from './modules/users/User.request'
import Order, { OrderDetail } from './modules/orders/order.schema'
import { CustomerReportImage } from './customer-report/customer-report-image/customer-report-image.schema'
import { CustomerReport } from './modules/customer-report/customer-report/customer-report.schema'
import Interior from './modules/interiors/interior.schema'
import { InteriorImage } from './modules/interior_images/interior_image.schema'

//file này dùng để định nghĩa lại những cái có sẵn
//trong 1 request nó có thể có users
declare module 'express' {
  interface Request extends express.Request {
    user?: User
    decoded_authorization?: TokenPayload
    decoded_refresh_token?: TokenPayload
    decoded_email_verify_token?: TokenPayload
    decoded_forgot_password_token?: TokenPayload
    order?: Order
    reportImage?: CustomerReportImage
    report?: CustomerReport
    detail?: OrderDetail[]
    images?: string[]
    interior?: Interior
    interiorImage?: InteriorImage
    imageInterior?: string[]
    thumbnailInterior?: string
  }
}
