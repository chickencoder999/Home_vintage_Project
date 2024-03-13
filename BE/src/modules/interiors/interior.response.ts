import { ObjectId } from 'mongodb'
import { InteriorStatus, InteriorWarranty } from './interior.enums'
import Category from '../categorys/category.schema'
import { CustomerReportResponse } from '../customer-report/customer-report/customer-report.response'

export interface InteriorResponse {
  _id?: ObjectId
  interior_name: string
  description: string
  quantity: string
  price: string
  material: string
  size: string
  color: string
  warranty: InteriorWarranty
  thumbnail: string
  sale: boolean
  number_of_sale: string
  created_at?: Date
  status?: InteriorStatus
  image: string[]
  catetogy_detail: Category
  list_report?: CustomerReportResponse[]
}
