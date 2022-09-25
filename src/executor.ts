import type { Request, Response } from 'express'
import { Router } from 'express'
import type { IOptions } from './'

/* eslint-disable @typescript-eslint/no-unused-vars */
export function createXxlJobExecutor(options: IOptions) {
  let router: Router

  const {
    app,
    route = '/job',
    debug = false,
    appType = 'express',
    baseUrl,
    accessToken,
    exectorKey,
    taskHandlers,
    scheduleCenterUrl,
  } = options

  async function applyMiddleware() {
    switch (appType.toLowerCase().trim()) {
      case 'express': {
        router = Router()
        app.use(initMiddleware())
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

  function addRoutes(baseUrl: string) {
    router.post(`${baseUrl}/beat`, async (req, res) => {
      res.status(200).send({ code: 200, msg: 'success' })
    })
    // router.post(`${baseUrl}/idleBeat`, async (...contexts) => {
    //   const { req, res } = wrappedHandler(contexts)
    //   const jobId = pathOr(-1, ['body', 'jobId'], req)
    //   res.send(idleBeat(jobId))
    // })
    // router.post(`${baseUrl}/run`, async (...contexts) => {
    //   const { req, res } = wrappedHandler(contexts)
    //   res.send(run(propOr({}, 'body', req)))
    // })
    // router.post(`${baseUrl}/kill`, async (...contexts) => {
    //   const { req, res } = wrappedHandler(contexts)
    //   res.send(killJob(pathOr(-1, ['body', 'jobId'], req)))
    // })
    // router.post(`${baseUrl}/log`, async (...contexts) => {
    //   const { req, res } = wrappedHandler(contexts)
    //   const { logDateTim: logDateTime, logId, fromLineNum } = propOr({}, 'body', req)
    //   const data = awaitreadLog(logDateTime, logId, fromLineNum)
    //   res.send(data)
    // })
  }

  return {
    applyMiddleware
  }
}
