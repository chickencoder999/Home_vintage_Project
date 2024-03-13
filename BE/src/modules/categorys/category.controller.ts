import { ParamsDictionary } from 'express-serve-static-core'
import { CreateCategoryReqBody } from './category.request'
import { Request, Response } from 'express'
import { CATEGORY_MESSAGES } from './category.message'
import categoryServices from './category.services'
import exp from 'constants'

export const createCategoryController = async (
  req: Request<ParamsDictionary, any, CreateCategoryReqBody>,
  res: Response
) => {
  const result = await categoryServices.createCategory(req.body)
  res.json({
    message: CATEGORY_MESSAGES.CREATE_CATEGORY_SUCCESSFULLY,
    result
  })
}

export const getListCategoryController = async (req: Request, res: Response) => {
  const result = await categoryServices.getListCategory()
  res.json({
    message: CATEGORY_MESSAGES.GET_LIST_CATEGORY_SUCCESSFULLY,
    result
  })
}

export const updateCategoryController = async (req: Request, res: Response) => {
  const result = await categoryServices.updateCategory(req.body)
  res.json({
    message: CATEGORY_MESSAGES.UPDATE_CATEGORY_SUCCESSFULLY,
    result
  })
}

export const deleteCategoryController = async (req: Request, res: Response) => {
  const result = await categoryServices.deleteCategory(req.body)
  res.json({
    message: CATEGORY_MESSAGES.CHANGE_STATUS_CATEGORY_SUCCESSFULLY,
    result
  })
}
