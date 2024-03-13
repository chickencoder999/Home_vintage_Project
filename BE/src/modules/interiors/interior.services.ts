import { OrderStatus } from './../orders/order.enum'
import { getListInterior } from './interior.controllers'
import { ObjectId } from 'mongodb'
import databaseService from '../database/database.services'
import { CreateInteriorReqBody, UpdateInteriorReqBody } from './interior.request'
import Interior from './interior.schema'
import { InteriorResponse } from './interior.response'
import { InteriorStatus } from './interior.enums'
import { OrderDetail } from '../orders/order.schema'
import customerReportService from '../customer-report/customer-report/customer-report.services'
class InteriorService {
  async createInterior(payload: CreateInteriorReqBody) {
    const {
      interior_id,
      interior_name,
      description,
      quantity,
      price,
      material,
      category_id,
      color,
      size,
      images,
      thumbnail
    } = payload
    const id = new ObjectId(interior_id)
    const result = await databaseService.interiors.insertOne(
      new Interior({
        _id: id,
        interior_name: interior_name as string,
        category_id: new ObjectId(category_id),
        description: description as string,
        quantity: quantity,
        price: price,
        thumbnail: thumbnail as string,
        material: material as string,
        color: color as string,
        size: size as string,
        image: images
      })
    )

    const interior = await this.getInteriorById(interior_id.toString())
    return interior
  }

  async checkInteriorExist(id: string) {
    let interior = null
    if (id.length !== 24) {
      interior = null
      return interior
    }
    interior = await databaseService.interiors.findOne({ _id: new ObjectId(id) })
    return Boolean(interior)
  }

  async getInteriorById(id: string): Promise<InteriorResponse | null> {
    //định nghĩa lại kiểu trả về cho aggregation bằng generic và lookup với category
    const interiorCursor = databaseService.interiors.aggregate<InteriorResponse>([
      {
        $match: {
          _id: new ObjectId(id)
        }
      },
      {
        $lookup: {
          from: process.env.DB_CATEGORYS_COLLECTION as string,
          localField: 'category_id',
          foreignField: '_id',
          as: 'category_detail'
        }
      },
      {
        $addFields: {
          category_detail: {
            $arrayElemAt: ['$category_detail', 0]
          }
        }
      },
      {
        //bỏ đi trường category_id và parent_id, status của category
        $project: {
          category_id: 0,
          'category_detail.category_parent_id': 0,
          'category_detail.category_status': 0
        }
      }
    ])
    const interior = await interiorCursor.toArray()

    // Kiểm tra nếu không có interior, trả về null
    if (interior.length === 0) {
      return null
    }

    // Trả về interior đầu tiên từ kết quả aggregation
    return interior[0]
  }

  async updateInteriorQuantity(quantity: number, id: string) {
    if (quantity === 0) {
      const result = await databaseService.interiors.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            status: InteriorStatus.Sold_out,
            quantity: quantity.toString()
          }
        }
      )
    } else {
      const result = await databaseService.interiors.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            quantity: quantity.toString()
          }
        }
      )
    }
  }

  async getListInterior() {
    const listInteriorCursor = await databaseService.interiors.aggregate<InteriorResponse>([
      {
        $lookup: {
          from: process.env.DB_CATEGORYS_COLLECTION as string,
          localField: 'category_id',
          foreignField: '_id',
          as: 'category_detail'
        }
      },
      {
        $addFields: {
          category_detail: {
            $arrayElemAt: ['$category_detail', 0]
          }
        }
      },
      {
        //bỏ đi trường category_id
        $project: {
          category_id: 0,
          'category_detail.category_parent_id': 0,
          'category_detail.category_status': 0
        }
      }
    ])
    return listInteriorCursor.toArray()
  }

  async updateNumberOfSale(number_of_sale: string, id: string) {
    const result = await databaseService.interiors.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          number_of_sale: number_of_sale
        }
      }
    )
  }

  async disableInterior(id: string) {
    const result = await databaseService.interiors.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: InteriorStatus.Stop_bussiness
        }
      }
    )
    return result
  }

  async updateInterior(body: UpdateInteriorReqBody) {
    const { interior_id, category_id, ...rest } = body
    if (!category_id) {
      const result = await databaseService.interiors.findOneAndUpdate(
        { _id: new ObjectId(interior_id) },
        {
          $set: {
            ...rest
          }
        }
      )
      const interior = await this.getInteriorById(interior_id)
      return interior
    }
    const result = await databaseService.interiors.findOneAndUpdate(
      { _id: new ObjectId(interior_id) },
      {
        $set: {
          category_id: new ObjectId(category_id),
          ...rest
        }
      }
    )
    const interior = await this.getInteriorById(interior_id)
    return interior
  }
}

const interiorService = new InteriorService()
export default interiorService
