import type { Application } from 'express'
import type { Logger } from 'winston'

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
  executorParams: any
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
   * @default 'express'
   */
  appType?: 'express'
  /**
   * @default 'memory'
   */
  storageLog?: 'memory' | 'local'
  /**
   * @default 'xxl-job-node.log'
   */
  storageLocalUrl?: string
  /**
   * Assign a common context object to all job handlers (database, redis...)
   */
  context?: T

  baseUrl: string
  app: Application
  executorKey: string
  accessToken: string
  scheduleCenterUrl: string
  jobHandlers: Map<string, JobHandler<T>>
}

export interface ICallBackOptions<R = any> {
  result?: R
  error?: Error
  logId: number
}

export type IObject = Record<string, any>
export type JobHandler<T extends IObject = any, P = any, R = any> = (logger: Logger, params: P, context?: T) => Promise<R>
