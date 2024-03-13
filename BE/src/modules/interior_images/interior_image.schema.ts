import { ObjectId } from 'mongodb'

interface InteriorImageType {
  _id?: ObjectId
  interior_id: ObjectId
  thumbnail?: string
  images?: string[]
}

export class InteriorImage {
  _id?: ObjectId
  interior_id: ObjectId
  thumbnail?: string
  images?: string[]

  constructor(interiorImage: InteriorImageType) {
    this._id = interiorImage._id || new ObjectId()
    this.interior_id = interiorImage.interior_id
    this.thumbnail = interiorImage.thumbnail || ''
    this.images = interiorImage.images || []
  }
}
