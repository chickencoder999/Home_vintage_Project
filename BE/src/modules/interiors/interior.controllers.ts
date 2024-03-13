import { ParamsDictionary } from 'express-serve-static-core'
import { Request, Response } from 'express'
import { CreateInteriorReqBody, UpdateInteriorReqBody } from './interior.request'
import interiorService from './interior.services'
import { INTERIOR_MESSAGES } from './interior.messages'
import interiorImageServices from '../interior_images/interior_image.services'
import customerReportService from '../customer-report/customer-report/customer-report.services'

export const createInteriorController = async (
  req: Request<ParamsDictionary, any, CreateInteriorReqBody>,
  res: Response
) => {
  const result = await interiorService.createInterior(req.body)

  res.json({
    message: INTERIOR_MESSAGES.CREATE_INTERIOR_SUCCESS,
    result
  })
}

export const getInteriorById = async (req: Request, res: Response) => {
  const { id } = req.params
  const type = req.query.type as string
  const interior = await interiorService.getInteriorById(id)
  const listReport = await customerReportService.getListCustomerReportNotCheckAndValidByInteriorId(id)
  if (interior) interior.list_report = listReport
  res.json({
    message: INTERIOR_MESSAGES.GET_INTERRIOR_SUCCESS,
    interior: interior
  })
}

export const getListInterior = async (req: Request, res: Response) => {
  const type = req.query.type as string
  if (type === 'bestSeller') {
    const bestSellers = await getListInteriorBestSeller()
    return res.json({
      message: INTERIOR_MESSAGES.GET_LIST_INTERIOR_SUCCESS,
      list_best_sellers_interior: bestSellers
    })
  }

  const newInteriors = await getListNewInteriors()
  res.json({
    message: INTERIOR_MESSAGES.GET_LIST_INTERIOR_SUCCESS,
    list_new_interior: newInteriors
  })
}

const getListInteriorBestSeller = async () => {
  const listInterior = await interiorService.getListInterior()
  const bestSellers = listInterior
    .sort((interior_a, interior_b) => parseInt(interior_b.number_of_sale) - parseInt(interior_a.number_of_sale))
    .slice(0, 20)
  return bestSellers
}

export const disableInteriorController = async (req: Request, res: Response) => {
  const id = req.params.id as string
  const result = await interiorService.disableInterior(id)
  res.json({
    message: INTERIOR_MESSAGES.DISABLE_INTERIOR_SUCCESS
  })
}

export const updateInteriorController = async (
  req: Request<ParamsDictionary, any, UpdateInteriorReqBody>,
  res: Response
) => {
  const result = await interiorService.updateInterior(req.body)
  res.json({
    message: INTERIOR_MESSAGES.UPDATE_INTERIOR_SUCCESS,
    interior: result
  })
}

const getListNewInteriors = async () => {
  const listInterior = await interiorService.getListInterior()
  const newInteriors = listInterior.filter((interior) => {
    return interior.number_of_sale === '0'
  })
  return newInteriors
}
