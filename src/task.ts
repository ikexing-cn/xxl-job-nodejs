import type { Debug } from 'debug'
import type { IResponse, IRunRequest } from './typings'
import { logger } from './utils'

/* eslint-disable @typescript-eslint/no-unused-vars */
interface ObjectAny {
  [key: string]: any
}
export function createTaskManager<T extends ObjectAny>(options?: any, context?: T) {
  const runningTaskList = new Set<number>()

  function hasJob(jobId: number) {
    return runningTaskList.has(jobId)
  }

  function runTask(jobHandler: (
    logger: Debug,
    params: string,
    context: T
  ) => void,
  response: IRunRequest, callback: Function): IResponse {
    let timeout: NodeJS.Timeout
    const { executorParams, jobId, executorTimeout } = response
    const taskParams = executorParams ? JSON.parse(executorParams) : {}
    logger.log(`Job Task: ${jobId} is running`)
    if (hasJob(jobId))
      return { code: 500, msg: 'There is already have a same job is running.' }
    runningTaskList.add(jobId)

    if (executorTimeout) {
      timeout = setTimeout(() => {
        finishTask({ callback, jobId, timeout, error: new Error(`Job Task: ${jobId} state is Timeout`) })
      }, executorTimeout)
    }

    return { code: 200, msg: 'message' }
  }

  async function finishTask(options: {
    jobId: number
    callback: Function
    error?: Error
    timeout?: NodeJS.Timeout
  }) {
    const { jobId, callback, error, timeout } = options
    timeout && clearTimeout(timeout)
    error && logger.extend(':error').log(error.message || error)
    logger.log(`Job Task: ${jobId} is finished`)
    await callback(error)
    runningTaskList.delete(jobId)
  }

  return {}
}
