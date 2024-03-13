import { initFolder } from './utils/file'
import express from 'express'
import databaseService from './modules/database/database.services'
import { defaultErrorHandler } from './modules/errors/error.middlewares'
import usersRouter from './modules/users/user.routes'
import categoryRouter from './modules/categorys/category.routes'
import interiorRouter from './modules/interiors/interior.routes'
import interiorImageRouter from './modules/interior_images/interior_image.routes'
import argv from 'minimist'
import staticRouter from './modules/static/static.routes'
import orderRouter from './modules/orders/order.routes'
import customerReportRouter from './modules/customer-report/customer-report/customer-report.routes'
import customerReportImageRouter from './modules/customer-report/customer-report-image/customer-report-image.routes'
import staffRouter from './modules/staffs/staff.routes'
import { config } from 'dotenv'
import cors from 'cors'

const options = argv(process.argv.slice(2))
console.log(options.production)

config()

initFolder()
const PORT = process.env.PORT || 4000
const app = express()

//app handler
app.use(express.json())
//cors
const corsOptions = {
  origin: 'http://localhost:3000' || 'http://localhost:5173',
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200
}
app.use(cors(corsOptions))

databaseService.connect()

//API Router
app.use('/users', usersRouter)
app.use('/interiors', interiorRouter)
app.use('/categories', categoryRouter)
app.use('/interior-images', interiorImageRouter)
app.use('/static', staticRouter)
app.use('/orders', orderRouter)
app.use('/customer-report', customerReportRouter)
app.use('/customer-report-image', customerReportImageRouter)
app.use('/staffs', staffRouter)
app.use(defaultErrorHandler)

app.listen(PORT, () => {
  console.log(`server này đang chạy trên port:${PORT}`)
})
