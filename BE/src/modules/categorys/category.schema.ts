import exp from 'constants'
import { ObjectId } from 'mongodb'

interface CategoryType {
  _id?: ObjectId
  category_name: string
  category_parent_id?: string
  category_status?: boolean
}

export default class Category {
  _id?: ObjectId
  category_name: string
  category_parent_id?: string
  category_status?: boolean

  constructor(category: CategoryType) {
    this._id = category._id || new ObjectId()
    this.category_name = category.category_name
    this.category_parent_id = category.category_parent_id || ''
    this.category_status = category.category_status || true
  }
}
