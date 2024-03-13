import { Request } from 'express'
import { handleUploadImage } from '~/utils/file'
import fs from 'fs'
import sharp from 'sharp'
import { getNameFormFullName } from '~/utils/file'
import { UPLOAD_IMAGE_REPORT_DIR, UPLOAD_IMAGE_REPORT_TEMP_DIR } from '~/constants/dir'
import databaseService from '~/modules/database/database.services'
import { ObjectId } from 'mongodb'
import { CustomerReportImage } from './customer-report-image.schema'
import { totalImageCustomerReport } from './customer-report-image.constants'

class CustomerReportImageService {
  async handleUploadImage(req: Request) {
    const imagesName: string[] = []
    const files = await handleUploadImage(req, totalImageCustomerReport, UPLOAD_IMAGE_REPORT_TEMP_DIR)
    const result = await Promise.all(
      files.map(async (file) => {
        const newFileName = getNameFormFullName(file.newFilename) + '.jpg'
        const newFilePath = UPLOAD_IMAGE_REPORT_DIR + '/' + newFileName
        await sharp(file.filepath).jpeg().toFile(newFilePath)
        fs.unlinkSync(file.filepath)
        imagesName.push(newFileName)
        return imagesName
      })
    )
    return result[0]
  }

  async handleDeleteFileImage(nameImage: string) {
    const filePath = UPLOAD_IMAGE_REPORT_DIR + '/' + nameImage
    fs.unlinkSync(filePath)
    return true
  }

  async createNewReportImage(imagesName: string[]) {
    const result = await databaseService.reportImage.insertOne(
      new CustomerReportImage({
        _id: new ObjectId(),
        report_id: new ObjectId(),
        images: imagesName
      })
    )
    const reportImage = await databaseService.reportImage.findOne({ _id: result.insertedId })
    return reportImage
  }

  async getReportImageById(id: string) {
    const data = await databaseService.reportImage.findOne({ _id: new ObjectId(id) })
    return data
  }

  async deleteImage(id: string, nameImage: string) {
    const result = await databaseService.reportImage.updateOne(
      { _id: new ObjectId(id) },
      {
        $pull: {
          images: { $in: [nameImage] }
        }
      }
    )
    const data = await databaseService.reportImage.findOne({ _id: new ObjectId(id) })
    if (data && data.images.length === 0) await databaseService.reportImage.deleteOne({ _id: new ObjectId(id) })
    return data
  }

  async cancelCustomerReport(id: string, images: string[]) {
    await this.handleDeleteAllImage(images)
    const result = await databaseService.reportImage.deleteOne({ report_id: new ObjectId(id) })
    return result
  }

  async getReportImageByReportId(id: string) {
    const result = await databaseService.reportImage.findOne({ report_id: new ObjectId(id) })
    return result
  }

  async handleDeleteAllImage(images: string[]) {
    images.forEach((image) => {
      const filePath = UPLOAD_IMAGE_REPORT_DIR + '/' + image
      fs.unlinkSync(filePath)
    })
  }

  async importImageReport(reportId: string, imagesName: string[]) {
    for (let index = 0; index < imagesName.length; index++) {
      const result = await databaseService.reportImage.updateOne(
        { report_id: new ObjectId(reportId) },
        { $push: { images: imagesName[index] } }
      )
    }
    const reportImage = await this.getReportImageByReportId(reportId)
    return reportImage
  }
}

const customerReportImageService = new CustomerReportImageService()
export default customerReportImageService
