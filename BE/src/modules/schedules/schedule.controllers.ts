import { ParamsDictionary } from 'express-serve-static-core'
import { RegisterScheduleReqBody } from './schedule.request'
import { Request, Response, NextFunction } from 'express'
import scheduleServices from './schedule.services'
export const registerScheduleController = async (
  req: Request<ParamsDictionary, any, RegisterScheduleReqBody>,
  res: Response
) => {
  const { date, time, doctorId } = req.body
  const result = await scheduleServices.registerSchedule()
  return res.json(result)
}
