import express from 'express'
import type { JobHandler } from 'xxl-job'
import { createXxlJobExecutor } from 'xxl-job'

const jobHandlers = new Map<string, JobHandler>()
jobHandlers.set('nodejs_test', async (jobLogger, jobRequest, jobParams) => {
  jobLogger.warn(`request: ${JSON.stringify(jobRequest)}, params: ${jobParams}`)
})

const timer = function () {
  return new Promise(resolve => setTimeout(resolve, 500))
}

jobHandlers.set('nodejs_test_with_Kill', async (jobLogger, jobRequest, jobParams) => {
  jobLogger.warn(`request: ${JSON.stringify(jobRequest)}, params: ${jobParams}`)
  const { isKill } = jobRequest
  for (let count = 1; count < 2000; count++) {
    await timer() // do something
    if (isKill())
      throw new Error('Job has been killed')
  }
})

const app = express()
app.use(express.json())

app.listen(9999, () => {
  // eslint-disable-next-line no-console
  console.log('Server started on port 9999')

  const xxlJobExecutor = createXxlJobExecutor({
    app,
    jobHandlers,
    appType: 'express',
    baseUrl: 'http://192.168.3.38:9999',
    // 若IP不固定可以使用<dynamicIP>占位符,程序会自动替换为当前IP
    // baseUrl: 'http://<dynamicIP>:8081',
    accessToken: 'default_token',
    executorKey: 'executor-nodejs-express',
    scheduleCenterUrl: 'http://127.0.0.1:8080/xxl-job-admin',
    logStorage: 'local',
  })
  xxlJobExecutor.initialization()
})
