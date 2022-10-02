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
  storage?: 'memory' | 'local'
  /**
   * @default 'xxl-job.log'
   */
  localName?: string
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

export interface ICallBackOptions {
  result: any
  error?: Error
  logId: number
}

export interface ILogRead {
  findFlag: boolean
  endFlag: boolean
  content?: string
  lineNum?: number
  fromLineNum?: number
}

export type LogRead = Promise<ILogRead>
export type IObject = Record<string, any>
export type CallBack = (options: ICallBackOptions) => Promise<void>
export type JobHandler<T extends IObject = any> = (logger: Logger, params: any, context?: T) => Promise<any>
