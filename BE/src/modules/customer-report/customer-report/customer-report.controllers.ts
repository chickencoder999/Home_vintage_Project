import { ParamsDictionary } from 'express-serve-static-core'
import { Request, Response } from 'express'
import customerReportImageService from '../customer-report-image/customer-report-image.services'
import { CreateCustomerReportReqBody, ManageCustomerReportReqBody } from './customer-report.request'
import customerReportService from './customer-report.services'
import { JwtPayload } from 'jsonwebtoken'
import { CUSTOMER_REPORT } from './customer-report.messages'
import { CustomerReportStatus } from './customer-report.enum'

export const createCustomerReportController = async (
  req: Request<ParamsDictionary, any, CreateCustomerReportReqBody>,
  res: Response
) => {
  const { decoded_authorization } = req as JwtPayload
  const { user_id } = decoded_authorization
  const result = await customerReportService.createCustomerReport(req.body, user_id)
  res.json({
    message: CUSTOMER_REPORT.CREATE_RERPORT_SUCCESS,
    data: result
  })
}

export const deleteCustomerReportController = async (req: Request, res: Response) => {
  const { id } = req.params
  const images = req.images

  const result = await Promise.all([
    customerReportImageService.cancelCustomerReport(id, images as string[]),
    customerReportService.deleteCustomerReport(id)
  ])
  res.json({
    message: CUSTOMER_REPORT.DELETE_CUSTOMER_REPORT_SUCCESS
  })
}

export const manageCustomerReportController = async (
  req: Request<ParamsDictionary, any, ManageCustomerReportReqBody>,
  res: Response
) => {
  const { status } = req.query as { status: string }
  const { id } = req.params as { id: string }
  if (status) {
    const { reason_not_valid } = req.body
    const result = await customerReportService.changeStatus(
      id,
      CustomerReportStatus.Not_Valid,
      reason_not_valid as string
    )
    return res.json({
      message: CUSTOMER_REPORT.REJECT_REPORT_SUCCESS,
      result
    })
  }

  const result = await customerReportService.changeStatus(id, CustomerReportStatus.Valid, '')
  res.json({
    message: CUSTOMER_REPORT.REPORT_IS_VALID,
    result
  })
}

export const getListCustomerReportNotCheckController = async (req: Request, res: Response) => {
  const listCustomerReport = await customerReportService.getListCustomerReportNotCheck()
  res.json({
    message: CUSTOMER_REPORT.GET_LIST_REPORT_NOT_CHECK_SUCCESS,
    list_customer_report: listCustomerReport
  })
}
