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
  isKill: Function
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
  logStorage?: 'memory' | 'local'
  /**
   * @default 'xxl-job'
   */
  logLocalName?: string
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
export type JobHandler<T extends IObject = any> = (logger: Logger, request: IRunRequest, params: any, context?: T) => Promise<any>

export interface JobKillUtil {
  isKill: Function
  setJobKill: Function
}

export interface JobObject {
  id: number
  callback: CallBack
  jobKill: JobKillUtil
  logId: number
  logger: Logger
  timeout: NodeJS.Timeout | null
}

