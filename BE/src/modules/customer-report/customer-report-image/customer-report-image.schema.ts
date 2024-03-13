import { ObjectId } from 'mongodb'

interface CustomerReportImageType {
  _id?: ObjectId
  report_id?: ObjectId
  images: string[]
}

export class CustomerReportImage {
  _id?: ObjectId
  report_id?: ObjectId
  images: string[]

  constructor(data: CustomerReportImageType) {
    this._id = data._id || new ObjectId()
    this.report_id = data.report_id || new ObjectId()
    this.images = data.images
  }
}
