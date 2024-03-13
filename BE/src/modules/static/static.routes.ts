import { wrapAsync } from './../../utils/handlers'
import { Router } from 'express'
import { serveImageInteriorController, serveImageReportController } from './static.controllers'

const staticRouter = Router()
staticRouter.get('/images-interiors/:fileName', wrapAsync(serveImageInteriorController))

staticRouter.get('/images-report/:fileName', wrapAsync(serveImageReportController))

export default staticRouter
