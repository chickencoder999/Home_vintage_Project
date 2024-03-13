import { Router } from 'express'
import { accessTokenValidator } from '~/modules/users/user.middlewares'
import { wrapAsync } from '~/utils/handlers'
import {
  createCustomerReportImageController,
  deleteAllImageAndInforController,
  deleteCustomerReportImageController,
  importReportImageController
} from './customer-report-image.controller'
import {
  createCustomerReportImageValidator,
  deleteAllImageAndInforValidator,
  deleteCustomerReportImageValidator,
  importReportImageValidator
} from './customer-report-image.middlewares'

const customerReportImageRouter = Router()

/**
 * params : order_id
 * query : interior_id , report_id
 * body : image[]
 * response : customerReportImage
 */
customerReportImageRouter.post(
  '/new-report-image/:orderId',
  accessTokenValidator,
  createCustomerReportImageValidator,
  wrapAsync(createCustomerReportImageController)
)

customerReportImageRouter.post(
  '/:reportId',
  accessTokenValidator,
  importReportImageValidator,
  wrapAsync(importReportImageController)
)

/**
 * params : _id
 * query : nameImage
 * response : customerReportImage
 */
customerReportImageRouter.delete(
  '/:reportId',
  accessTokenValidator,
  deleteCustomerReportImageValidator,
  wrapAsync(deleteCustomerReportImageController)
)

/**
 * param : id là report id nhá
 */
customerReportImageRouter.delete(
  '/cancel/:id',
  accessTokenValidator,
  deleteAllImageAndInforValidator,
  wrapAsync(deleteAllImageAndInforController)
)

export default customerReportImageRouter
