import { wrapAsync } from './../../utils/handlers'
import { Router } from 'express'
import { accessTokenAdminValidator } from '../users/user.middlewares'
import {
  deleteImageInteriorController,
  deleteThumbnailInteriorController,
  uploadImageController,
  uploadImageThumbnailController
} from './interior_image.controllers'
import {
  deleteImageInteriorValidator,
  deleteThumbnailInteriorValidator,
  uploadImageThumbnailValidator,
  uploadImageValidator
} from './interior_image.middlewares'

const interiorImageRouter = Router()
/**
 * body : images
 * url : /upload-thumbnail
 * headers : accessToken
 * query : id
 * description : upload thumbnail image
 */
interiorImageRouter.post(
  '/upload-thumbnail',
  // accessTokenAdminValidator,
  uploadImageThumbnailValidator,
  wrapAsync(uploadImageThumbnailController)
)

interiorImageRouter.post(
  '/upload-image',
  // accessTokenAdminValidator,
  uploadImageValidator,
  wrapAsync(uploadImageController)
)

/**
 * url : /:id sản phẩm
 * description : delete thumnail
 */

interiorImageRouter.delete(
  'thumbnail/:id',
  // accessTokenAdminValidator,
  deleteThumbnailInteriorValidator,
  wrapAsync(deleteThumbnailInteriorController)
)
/**
 * url : /:id
 * description : delete image
 * query : index
 */

interiorImageRouter.delete(
  '/:id',
  // accessTokenAdminValidator,
  deleteImageInteriorValidator,
  wrapAsync(deleteImageInteriorController)
)

export default interiorImageRouter
