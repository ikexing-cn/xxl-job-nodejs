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
    baseUrl: 'http://localhost:8081',
    // If the IP is not fixed, you can use the <DynamicIP> placeholder, the program will automatically replace it with the current IP
    // baseUrl: 'http://<DynamicIP>:8081',
    // -----------------------------------
    // ip: 'dynamic',
    // port: 8081, // It's also support
    // -----------------------------------
    accessToken: 'default_token',
    executorKey: 'executor-nodejs-express',
    scheduleCenterUrl: 'http://127.0.0.1:8080/xxl-job-admin',
    logStorage: 'local',
  })
  xxlJobExecutor.initialization()
})
