import { Router } from 'express'
import { accessTokenAdminValidator } from '../users/user.middlewares'
import {
  createStaffController,
  getListStaffController,
  updateActivityStaffController,
  updateSalaryStaffController
} from './staff.controller'
import { wrapAsync } from '~/utils/handlers'
import { createStaffValidator, updateActivityStaffValidator, updateSalaryStaffValidator } from './staff.middlewares'
import { filterMiddleware } from '~/utils/common'
import { UpdateActivityStaff } from './staff.request'

const staffRouter = Router()
/*
  Description: Create new staff
  Path: /create-staff
  Method: POST
  Body: { ... }
*/
staffRouter.post('/create-staff', accessTokenAdminValidator, createStaffValidator, wrapAsync(createStaffController))
/*
  Description: get list new staff
  Path: /get-list-staff
  Method: POST
  Body: { ... }
*/
staffRouter.get('/', accessTokenAdminValidator, wrapAsync(getListStaffController))
/*
  Description: update activity staff
  Path: /update-activity-staff
  Method: patch
  Body: { ... }
*/
staffRouter.patch(
  '/update-activity-staff',
  accessTokenAdminValidator,
  updateActivityStaffValidator,
  wrapAsync(updateActivityStaffController)
)

/*
  Description: update salary staff
  Path: /update-salary-staff
  Method: patch
  Body: { ... }
*/
staffRouter.patch(
  '/update-salary-staff',
  accessTokenAdminValidator,
  updateSalaryStaffValidator,
  wrapAsync(updateSalaryStaffController)
)

export default staffRouter
