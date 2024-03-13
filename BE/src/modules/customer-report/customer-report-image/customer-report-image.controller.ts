import { Request, Response } from 'express'
import customerReportImageService from './customer-report-image.services'
import { CUSTOMER_REPORT } from '../customer-report/customer-report.messages'
import { CustomerReport } from '../customer-report/customer-report.schema'
import { getTotalImage, handleUploadImage } from '~/utils/file'

export const createCustomerReportImageController = async (req: Request, res: Response) => {
  const imagesName = await customerReportImageService.handleUploadImage(req)
  const result = await customerReportImageService.createNewReportImage(imagesName)
  return res.json({
    message: CUSTOMER_REPORT.CREATE_REPORT_IMAGE_SUCCESS,
    image_report: result
  })
}

export const importReportImageController = async (req: Request, res: Response) => {
  const { reportImage } = req
  const imagesName = await customerReportImageService.handleUploadImage(req)
  if (imagesName.length + reportImage.images.length > 3) {
    for (let index = 0; index < imagesName.length; index++) {
      customerReportImageService.handleDeleteFileImage(imagesName[index])
    }
    return res.status(422).json({
      message: CUSTOMER_REPORT.TOTAL_IMAGE_LIMIT_IS_3
    })
  }

  const result = await customerReportImageService.importImageReport(reportImage.report_id, imagesName)
  res.json({
    message: CUSTOMER_REPORT.IMPORT_REPORT_IMAGE_SUCCESS,
    image_report: result
  })
}

export const deleteCustomerReportImageController = async (req: Request, res: Response) => {
  const { nameImage } = req.query
  const { reportId } = req.params
  await customerReportImageService.handleDeleteFileImage(nameImage as string)
  const result = await customerReportImageService.deleteImage(reportId as string, nameImage as string)
  res.json({
    message: CUSTOMER_REPORT.DELETE_REPORT_IMAGE_SUCCESS,
    result
  })
}

export const deleteAllImageAndInforController = async (req: Request, res: Response) => {
  const { reportImage } = req
  const { images } = reportImage
  const { id } = req.params
  const result = await customerReportImageService.cancelCustomerReport(id.toString(), images)
  res.json({
    message: CUSTOMER_REPORT.CANCEL_SUCCESS
  })
}
