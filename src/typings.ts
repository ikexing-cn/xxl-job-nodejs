import type { Application } from 'express'

export interface IResponse {
  msg: string
  code: number
}

export interface IRequest {
  jobId: number
}

export interface IRunRequest extends IRequest {
  logId: number
  glueType: string
  glueSource: string
  logDateTime: number
  executorHandler: string
  executorParams: string
  executorTimeout: number
  glueUpdatetime: number
  broadcastIndex: number
  broadcastTotal: number
  executorBlockStrategy: string
}

export interface IKillResuest extends IRequest {
  logDateTim: number
  fromLineNum: number
}

export interface IOptions {
  /**
   * @default '/job'
   */
  route?: string
  /**
   * @default false
   */
  debug?: boolean
  /**
   * @default 'express'
   */
  appType?: 'express'

  app: Application
  baseUrl: string
  exectorKey: string
  accessToken: string
  scheduleCenterUrl: string
  taskHandlers: Map<string, Function>
}
