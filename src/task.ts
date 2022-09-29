import { logger } from './utils'
import type {
  IObject,
  IRunRequest,
  JobHandler
} from './typings'

export function createTaskManager<T extends IObject>(context: T) {
  const runningTaskList = new Set<number>()

  function hasJob(jobId: number) {
    return runningTaskList.has(jobId)
  }

  async function runTask(jobHandler: JobHandler<T>, response: IRunRequest, callback: Function) {
    let timeout: NodeJS.Timeout
    const { executorParams, jobId, executorTimeout, logId } = response
    const taskParams = JSON.parse(executorParams) || {}
    logger.log(`Job Task: ${jobId} is running`)
    if (hasJob(jobId))
      return { code: 500, msg: 'There is already have a same job is running.' }
    runningTaskList.add(jobId)

    if (executorTimeout) {
      timeout = setTimeout(() => {
        finishTask({ callback, jobId, timeout, logId, error: new Error(`Job Task: ${jobId} is Timeout.`) })
      }, executorTimeout * 1000)
    }

    await jobHandler(taskParams, context)
      .then(() => finishTask({ callback, jobId, logId }))
      .catch(error => finishTask({ callback, jobId, logId, error }))

    return { code: 200, msg: 'Success' }
  }

  async function finishTask<R = any>(options: {
    jobId: number
    logId: number
    callback: Function
    result?: R
    error?: Error
    timeout?: NodeJS.Timeout
  }) {
    const { jobId, logId, callback, error, timeout, result } = options
    timeout && clearTimeout(timeout)
    error && logger.extend(':error').log(error.message || error)
    logger.log(`Job Task: ${jobId} is finished`)
    await callback({ error, result, logId })
    runningTaskList.delete(jobId)
  }

  return {
    runTask,
    hasJob
  }
}
