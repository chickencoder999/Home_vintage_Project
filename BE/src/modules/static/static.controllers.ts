import { Request, Response } from 'express'
import path from 'path'
import { UPLOAD_DIR, UPLOAD_IMAGE_DIR, UPLOAD_IMAGE_REPORT_DIR } from '~/constants/dir'

export const serveImageInteriorController = async (req: Request, res: Response) => {
  const { fileName } = req.params
  res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, fileName), (error) => {
    if (error) {
      res.status((error as any).status).send('Not found image')
    }
  })
}

export const serveImageReportController = async (req: Request, res: Response) => {
  const { fileName } = req.params
  res.sendFile(path.resolve(UPLOAD_IMAGE_REPORT_DIR, fileName), (error) => {
    if (error) {
      res.status((error as any).status).send('Not found image')
    }
  })
}
