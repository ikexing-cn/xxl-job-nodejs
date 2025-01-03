# XXL-JOB-NODEJS

[![NPM version](https://img.shields.io/npm/v/xxl-job?color=a1b858&label=)](https://www.npmjs.com/package/xxl-job)

Provide xxl-job SDK for NodeJs.

## TODO

- [x] Example
- [x] Complete basic functions
- [ ] Koa support [low-priority]

## Features
- Job Execution
- Log Query & Saved
- Typescript Support
- Express Integration
- Run Request Params Support(broad cast…)

## Install
```
npm install xxl-job
```

## Usage
```ts
import express from 'express'
import type { JobHandler } from 'xxl-job'
import { createXxlJobExecutor } from 'xxl-job'

const jobHandlers = new Map<string, JobHandler>()

jobHandlers.set('nodejs_test', async (jobLogger, jobRequest, jobParams) => {
  jobLogger.warn(`request: ${JSON.stringify(jobRequest)}, params: ${jobParams}`)
})

jobHandlers.set('nodejs_test_with_Kill', async (jobLogger, jobRequest, jobParams) => {
    jobLogger.warn(`request: ${JSON.stringify(jobRequest)}, params: ${jobParams}`)
    const { isKill } = jobRequest
    for (let count = 1; count < 2000; count++) {
        // do something
        if (isKill())
            throw new Error('Job has been killed')
    }
})

const app = express()
app.use(express.json())

app.listen(8081, () => {
  const xxlJobExecutor = createXxlJobExecutor({
    app,
    jobHandlers,
    appType: 'express',
    accessToken: 'default_token',
    baseUrl: 'http://127.0.0.1:8081', // Server address
    executorKey: 'executor-nodejs-express',
    scheduleCenterUrl: 'http://127.0.0.1:8080/xxl-job-admin', // xxl-job address
  })
  xxlJobExecutor.initialization()
})
```

See the [example](./example) folder for details

## License
[MIT](./LICENSE) License © 2022 [ikexing-cn](https://github.com/ikexing-cn)

## Code Reference

[xxl-job-executor-nodejs](https://github.com/Aouchinx/xxl-job-executor-nodejs)
