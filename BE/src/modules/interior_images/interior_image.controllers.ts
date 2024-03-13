import { InteriorImage } from './interior_image.schema'
import { Request, Response } from 'express'
import { formidable } from 'formidable'
import path from 'path'
import { INTERIOR_MESSAGES } from '../interiors/interior.messages'
import interiorImageServices from './interior_image.services'
import interiorService from '../interiors/interior.services'
import { ErrorWithStatus } from '../errors/error.model'
import HTTP_STATUS from '~/constants/httpStatus'
import { totalUploadImage, totalUploadImageThumbnail } from './interior_image.constants'
import exp from 'constants'

export const uploadImageThumbnailController = async (req: Request, res: Response) => {
  const { id } = req.query
  const isExist = await interiorImageServices.getInteriorImageByInteriorId(id as string)
  const images = await interiorImageServices.handleUploadImage(req, totalUploadImageThumbnail)
  if (!isExist) {
    const interiorImage = await interiorImageServices.createNewInteriorThumbnail(images[0])
    return res.json({
      message: INTERIOR_MESSAGES.UPLOAD_IMAGE_THUMBNAIL_SUCCESS,
      interiorImage
    })
  }

  const newInteriorImage = await interiorImageServices.updateThumbnailImageInterior(id as string, images[0])
  res.json({
    message: INTERIOR_MESSAGES.UPLOAD_IMAGE_THUMBNAIL_SUCCESS,
    newInteriorImage
  })
}

export const uploadImageController = async (req: Request, res: Response) => {
  const { id } = req.query
  const isExist = await interiorImageServices.getInteriorImageByInteriorId(id as string)
  const images = await interiorImageServices.handleUploadImage(req, totalUploadImage)
  if (!isExist) {
    const interiorImage = await interiorImageServices.createNewInteriorImage(images)
    return res.json({
      message: INTERIOR_MESSAGES.UPLOAD_IMAGE_SUCCESS,
      interiorImage
    })
  }

  if ((isExist.images as string[]).length + images.length > totalUploadImage) {
    await interiorImageServices.deleteInteriorSeverImage(images)
    return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
      message: INTERIOR_MESSAGES.TOTAL_IMAGE_PRODUCT_IS_5
    })
  }

  const newInteriorImage = await interiorImageServices.importImageInterior(id as string, images)
  res.json({
    message: INTERIOR_MESSAGES.UPLOAD_IMAGE_SUCCESS,
    newInteriorImage
  })
}

export const deleteThumbnailInteriorController = async (req: Request, res: Response) => {
  const { id } = req.params
  const thumbnail = req.thumbnailInterior
  await interiorImageServices.deleteInteriorSeverImage([thumbnail as string])
  const result = await interiorImageServices.updateThumbnailImage(id, '')
  res.json({
    message: INTERIOR_MESSAGES.DELETE_THUMBNAIL_SUCCESS,
    interiorImage: result
  })
}

export const deleteImageInteriorController = async (req: Request, res: Response) => {
  const { nameImage } = req.query as { nameImage: string }
  const id = req.params.id as string
  await interiorImageServices.deleteInteriorSeverImage([nameImage])
  const result = await interiorImageServices.deleteImageInterior(id, nameImage)

  res.json({
    message: INTERIOR_MESSAGES.DELETE_IMAGE_SUCCESS,
    interiorImage: result
  })
}
