import dotenv from 'dotenv'
import { MongoClient, Db, Collection } from 'mongodb'
import User from '../users/user.schema'
import RefreshToken from '../refresh_tokens/RefreshToken.schema'
import Category from '../categorys/category.schema'
import Interior from '../interiors/interior.schema'
import Order from '../orders/order.schema'
import { CustomerReport } from '../customer-report/customer-report/customer-report.schema'
import { CustomerReportImage } from '../customer-report/customer-report-image/customer-report-image.schema'
import { InteriorImage } from '../interior_images/interior_image.schema'

dotenv.config() // là để đọc file .env
//chúng ta cần mã hóa password với username của database

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@homevintageproject.swqyylc.mongodb.net/?retryWrites=true&w=majority`
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri)
class DatabaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(process.env.DB_NAME)
  }
  async connect() {
    try {
      await this.db.command({ ping: 1 }) //nếu thành công thì sẽ trả về 1
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.log(error) //thông báo lỗi
      // throw error //throw error để quăng lỗi vê 1 chỗ xử lý lỗi cuối cùng
    }
  }

  get users(): Collection<User> {
    //định dạng object lấy từ db ra là user ha
    return this.db.collection(process.env.DB_USERS_COLLECTION as string)
  }

  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(process.env.DB_REFRESH_TOKENS_COLLECTION as string)
  }

  get categorys(): Collection<Category> {
    return this.db.collection(process.env.DB_CATEGORYS_COLLECTION as string)
  }

  get interiors(): Collection<Interior> {
    return this.db.collection(process.env.DB_INTERIORS_COLLECTION as string)
  }

  get orders(): Collection<Order> {
    return this.db.collection(process.env.DB_ORDERS_COLLECTION as string)
  }

  get reportImage(): Collection<CustomerReportImage> {
    return this.db.collection(process.env.DB_REPORT_IMAGE_COLLECTION as string)
  }

  get customerReport(): Collection<CustomerReport> {
    return this.db.collection(process.env.DB_CUSTOMER_REPORT_COLLECTION as string)
  }

  get interiorImage(): Collection<InteriorImage> {
    return this.db.collection(process.env.DB_INTERIOR_IMAGES_COLLECTION as string)
  }
}

const databaseService = new DatabaseService()
export default databaseService
