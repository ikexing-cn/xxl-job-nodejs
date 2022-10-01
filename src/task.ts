import type { Logger } from 'winston'
import type {
  CallBack,
  IObject,
  IRunRequest,
  JobHandler
} from './typings'

export function createTaskManager<T extends IObject>(context?: T) {
  const runningTaskList = new Set<number>()

  function hasJob(jobId: number) {
    return runningTaskList.has(jobId)
  }

  async function runTask(logger: Logger, jobHandler: JobHandler<T>, response: IRunRequest, callback: CallBack) {
    let timeout: NodeJS.Timeout
    const { executorParams, jobId, executorTimeout, logId } = response
    logger.info(`Job Task: ${jobId} is running: ${logId}`)
    if (hasJob(jobId))
      return { code: 500, msg: 'There is already have a same job is running.' }
    runningTaskList.add(jobId)

    if (executorTimeout) {
      timeout = setTimeout(() => {
        finishTask({ logger, callback, jobId, timeout, logId, error: new Error(`Job Task: ${jobId} is Timeout.`) })
      }, executorTimeout * 1000)
    }

    await jobHandler(logger, executorParams, context)
      .then(result => finishTask({ logger, result, callback, jobId, logId }))
      .catch(error => finishTask({ logger, callback, jobId, logId, error }))

    return { code: 200, msg: 'Success' }
  }

  async function finishTask<R = any>(options: {
    logger: Logger
    jobId: number
    logId: number
    callback: CallBack
    result?: R
    error?: Error
    timeout?: NodeJS.Timeout
  }) {
    const { logger, jobId, logId, callback, error, timeout, result } = options
    timeout && clearTimeout(timeout)
    error && logger.error(error.message || error)
    logger.info(`Job Task: ${jobId} is finished: ${logId}`)
    await callback({ error, result, logId })
    runningTaskList.delete(jobId)
  }

  return {
    hasJob,
    runTask
  }
}
