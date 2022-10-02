import type { Request, Response } from 'express'
import { Router } from 'express'
import { createXxlJobLogger } from './logger'
import { createJobManager, request } from './'
import type { ICallBackOptions, IExecutorOptions, IObject, IRunRequest } from './'

export function createXxlJobExecutor<T extends IObject>(options: IExecutorOptions<T>) {
  const router: Router = Router()

  const {
    route = '/job',
    appType = 'express',
    localName = 'xxl-job',
    storage = 'memory',
    app,
    context,
    baseUrl,
    accessToken,
    executorKey,
    jobHandlers,
    scheduleCenterUrl
  } = options

  const { logger, readFromLogId } = createXxlJobLogger(storage === 'local' ? localName : undefined)
  const { runTask, hasJob } = createJobManager(context)

  const data = { registryGroup: 'EXECUTOR', registryKey: executorKey, registryValue: baseUrl + route }
  const headers = { 'xxl-job-access-token': accessToken }

  async function initialization() {
    applyMiddleware()
    registry()
    setInterval(() => registry(), 30000)
  }

  async function registry() {
    const url = `${scheduleCenterUrl}/api/registry`
    const res = await request(url, { method: 'POST', data, headers })
    if (res.data)
      logger.info(`Registry info: ${JSON.stringify(res.data)}`)
    else
      logger.error(`Registry failed: ${JSON.stringify(res)}`)
  }

  async function cancel() {
    const url = `${scheduleCenterUrl}/api/registryRemove`
    const res = await request(url, { method: 'POST', data, headers })
    if (res.data)
      logger.info(`Registry info: ${JSON.stringify(res.data)}`)
    else
      logger.error(`Registry failed: ${JSON.stringify(res)}`)
  }

  function applyMiddleware() {
    switch (appType.toLowerCase().trim()) {
      case 'express': {
        router.use(route, initMiddleware())
        addRoutes()
        app.use(router)
      }
    }
  }

  function initMiddleware() {
    return async (req: Request, res: Response, next: Function) => {
      res.status(200)
      const token = req.headers['xxl-job-access-token']
      if (!!accessToken && accessToken !== token) {
        res.send({ code: 500, msg: 'Access token incorrect.' })
        logger.error('Access token incorrect.')
        return
      }
      if (!req?.body) {
        res.send({ code: 500, msg: 'Is app.use(express.json()) missing?' })
        logger.error('Is app.use(express.json()) missing?')
        return
      }
      await next()
    }
  }

  function addRoutes() {
    router.post(`${route}/beat`, async (_, res) => {
      res.status(200).send({ code: 200, msg: 'Success' })
    })
    router.post(`${route}/idleBeat`, async (req, res) => {
      const { jobId = -1 } = req.body
      res.status(200).send(idleBeat(jobId))
    })
    router.post(`${route}/run`, async (req, res) => {
      res.status(200).send(await run(req.body))
    })
    router.post(`${route}/kill`, async (req, res) => {
      const { jobId = -1 } = req.body
      res.status(200).send(killJob(jobId))
    })
    router.post(`${route}/log`, async (req, res) => {
      const { logId, fromLineNum, logDateTim } = req.body
      res.status(200).send(await readLog(logId, fromLineNum, logDateTim))
    })
  }

  async function run(runRequest: IRunRequest) {
    const { executorHandler } = runRequest
    const jobHandler = jobHandlers.get(executorHandler)
    if (!jobHandler)
      return { code: 500, msg: `No matched jobHandler: ${executorHandler}` }

    return await runTask(logger, jobHandler, runRequest, callBack)
  }

  function idleBeat(jobId: number) {
    return hasJob(jobId) ? { code: 500, msg: 'busy' } : { code: 200, msg: 'idle' }
  }

  function killJob(jobId: any): any {
    return { code: 500, msg: `Not yet support, jobId: ${jobId}` }
  }

  async function readLog(logId: number, _fromLineNum: number, logDateTim: number) {
    if (!localName) {
      logger.error('No local logger found.')
      return {
        code: 500,
        msg: 'No local logger found.'
      }
    }
    const { content, fromLineNum, endFlag, findFlag, lineNum } = await readFromLogId(logId, _fromLineNum, logDateTim)
    if (!findFlag) {
      const _content = `Log not found, logId: ${logId}`
      logger.error(_content)
      return {
        code: 500,
        msg: _content
      }
    }
    else {
      return {
        code: 200, msg: null, content: { fromLineNum, toLineNum: lineNum, logContent: content, isEnd: endFlag }
      }
    }
  }

  async function callBack(options: ICallBackOptions) {
    const { error, result, logId } = options
    const url = `${scheduleCenterUrl}/api/callback`

    const handleCode = error ? 500 : 200
    const handleMsg = error ? error.message || error.toString() : (result ? JSON.stringify(result) : 'Success')
    const data = [{ logId, logDateTim: Date.now(), handleCode, handleMsg }]
    const res = await request(url, { method: 'POST', data, headers })
    if (res.data?.code !== 200)
      logger.error(`LogId ${logId} Callback failed: ${JSON.stringify(res)}`)
  }

  return {
    cancel,
    initialization,
    applyMiddleware
  }
}

