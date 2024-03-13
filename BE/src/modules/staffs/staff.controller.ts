import { TokenPayload } from '~/modules/users/User.request'
import { ParamsDictionary } from 'express-serve-static-core'
import userServices from '../users/user.services'
import { Request, Response, NextFunction } from 'express'
import { STAFFS_MESSAGES } from './staff.mesage'
import { CreateStaffReqBody } from './staff.request'
import exp from 'constants'
import staffService from './staff.services'

export const createStaffController = async (req: Request<ParamsDictionary, any, CreateStaffReqBody>, res: Response) => {
  const result = await userServices.createStaff(req.body)
  res.json({
    message: STAFFS_MESSAGES.CREATE_STAFF_SUCCESS,
    result
  })
}

export const getListStaffController = async (req: Request, res: Response) => {
  const result = await userServices.getListStaff()
  res.json({
    result
  })
}

export const updateActivityStaffController = async (req: Request, res: Response) => {
  const result = await staffService.updateActivityStaff(req.body)
  res.json({
    result
  })
}

export const updateSalaryStaffController = async (req: Request, res: Response) => {
  const result = await staffService.updateSalaryStaff(req.body)
  res.json({
    result
  })
}
