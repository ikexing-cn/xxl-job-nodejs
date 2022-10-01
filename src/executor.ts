import type { Request, Response } from 'express'
import { Router } from 'express'
import { logger } from './logger'
import { createTaskManager, request } from './'
import type { ICallBackOptions, IExecutorOptions, IObject, IRunRequest } from './'

export function createXxlJobExecutor<T extends IObject>(options: IExecutorOptions<T>) {
  const router: Router = Router()

  const {
    route = '/job',
    appType = 'express',
    app,
    context,
    baseUrl,
    accessToken,
    executorKey,
    jobHandlers,
    scheduleCenterUrl,
  } = options

  const { runTask, hasJob } = createTaskManager(context)
  const data = { registryGroup: 'EXECUTOR', registryKey: executorKey, registryValue: baseUrl + route }
  const headers = { 'xxl-job-access-token': accessToken }

  async function initialization() {
    applyMiddleware()
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
        return
      }
      if (!req?.body) {
        res.send({ code: 500, msg: 'Is app.use(express.json()) missing?' })
        return
      }
      await next()
    }
  }

  function addRoutes() {
    router.post(`${route}/beat`, async (_, res) => {
      res.status(200).send({ code: 200, msg: 'success' })
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
      // todo
      res.send({
        code: 200,
        msg: null,
        content: {
          fromLineNum: 1, // 本次请求，日志开始行数
          toLineNum: 100, // 本次请求，日志结束行号
          logContent: 'xxx', // 本次请求日志内容
          isEnd: true // 日志是否全部加载完
        }
      })
    })
    // router.post(`${baseUrl}/log`, async (...contexts) => {
    //   const { req, res } = wrappedHandler(contexts)
    //   const { logDateTim: logDateTime, logId, fromLineNum } = propOr({}, 'body', req)
    //   const data = awaitreadLog(logDateTime, logId, fromLineNum)
    //   res.send(data)
    // })
  }

  async function run(runRequest: IRunRequest) {
    const { executorHandler } = runRequest
    const jobHandler = jobHandlers.get(executorHandler)
    if (!jobHandler)
      return { code: 500, msg: `No matched jobHandler: ${executorHandler}` }

    return await runTask(jobHandler, runRequest, callBack)
  }

  function idleBeat(jobId: number) {
    return hasJob(jobId) ? { code: 500, msg: 'busy' } : { code: 200, msg: 'idle' }
  }

  function killJob(jobId: any): any {
    return { code: 500, msg: `Not yet support, jobId: ${jobId}` }
  }

  // TODO: Event Control
  async function callBack<U = any>(options: ICallBackOptions<U>) {
    const { error, result, logId } = options
    const url = `${scheduleCenterUrl}/api/callback`
    const headers = { 'xxl-job-access-token': accessToken }

    const handleCode = error ? 500 : 200
    const handleMsg = error ? error.message || error.toString() : (result ? JSON.stringify(result) : 'success')
    const data = [{ logId, logDateTim: Date.now(), handleCode, handleMsg }]
    await request.post(url, { headers, data })
  }

  return {
    cancel,
    initialization,
    applyMiddleware
  }
}
