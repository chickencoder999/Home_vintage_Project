export interface CustomerReportResponse {
  _id: string
  customer_id: string
  interior_id: string
  reason: string
  status: string
  reason_not_valid: string
  report_date: string
  customer: {
    _id: string
    full_name: string
  }
}
