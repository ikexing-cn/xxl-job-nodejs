import type { Application } from 'express'

export interface IResponse {
  msg: string
  code: 500 | 200
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

export interface IExecutorOptions<T extends IObject> {
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
  /**
   * @default 'memory'
   */
  storageLog?: 'memory' | 'local'
  /**
   * @default ''
   */
  storageLocalUri?: string

  context: T
  baseUrl: string
  app: Application
  exectorKey: string
  accessToken: string
  scheduleCenterUrl: string
  jobHandlers: Map<string, JobHandler<T>>
}

export interface ICallBackOptions<U = any> {
  result?: U
  error?: Error
  logId: number
}

export type IObject = Record<string, any>
export type JobHandler<T extends IObject, R = any> = (params: string, context?: T) => Promise<R>
