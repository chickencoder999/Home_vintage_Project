import { ObjectId } from 'mongodb'
import { CustomerReportStatus } from './customer-report.enum'

export interface CreateCustomerReportReqBody {
  report_id: string
  interior_id: string
  customer_id: string
  order_id: string
  rate_interior: string
  description: string
  images?: string[]
  status: CustomerReportStatus
}

export interface ManageCustomerReportReqBody {
  reason_not_valid?: string
}
