import { Router } from 'express'
import { wrap } from 'module'
import { accessTokenValidator } from '../users/user.middlewares'
import { wrapAsync } from '~/utils/handlers'
import { registerScheduleValidator } from './schedule.middlewares'

const scheduleRoutes = Router()

// scheduleRoutes.post(
//   '/register-schedule',
//   accessTokenValidator,
//   registerScheduleValidator,
//   wrapAsync(registerScheduleController)
// )

export default scheduleRoutes
