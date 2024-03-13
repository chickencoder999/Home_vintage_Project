import { ObjectId } from 'mongodb'
import { CustomerReportStatus } from './customer-report.enum'

interface CustomerReportType {
  _id: ObjectId
  interior_id: ObjectId
  customer_id: ObjectId
  order_id: ObjectId
  rate_interior: string
  description: string
  report_date?: Date
  images?: string[]
  status?: CustomerReportStatus
  reason_not_valid?: string
}

export class CustomerReport {
  _id: ObjectId
  interior_id: ObjectId
  customer_id: ObjectId
  order_id: ObjectId
  rate_interior: string
  description: string
  report_date?: Date
  images?: string[]
  status?: CustomerReportStatus
  reason_not_valid?: string

  constructor(customerReport: CustomerReportType) {
    this._id = customerReport._id
    this.interior_id = customerReport.interior_id
    this.order_id = customerReport.order_id
    this.customer_id = customerReport.customer_id
    this.rate_interior = customerReport.rate_interior
    this.description = customerReport.description
    this.report_date = customerReport.report_date || new Date()
    this.images = customerReport.images
    this.status = customerReport.status
    this.reason_not_valid = customerReport.reason_not_valid || ''
  }
}
