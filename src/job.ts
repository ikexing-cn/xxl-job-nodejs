import type { Logger } from 'winston'
import type {
  CallBack,
  IObject,
  IRunRequest,
  JobHandler
} from './typings'

export function createJobManager<T extends IObject>(context?: T) {
  const runningJobList = new Set<number>()

  function hasJob(jobId: number) {
    return runningJobList.has(jobId)
  }

  async function runJob(logger: Logger, jobHandler: JobHandler<T>, request: IRunRequest, callback: CallBack) {
    let timeout: NodeJS.Timeout
    const { executorParams, jobId, executorTimeout, logId } = request
    logger.info(`Job Task: ${jobId} is running: ${logId}`)
    if (hasJob(jobId))
      return { code: 500, msg: 'There is already have a same job is running.' }
    runningJobList.add(jobId)

    if (executorTimeout) {
      timeout = setTimeout(() => {
        finishJob({ logger, callback, jobId, timeout, logId, error: new Error(`Job Task: ${jobId} is Timeout.`) })
      }, executorTimeout * 1000)
    }

    await jobHandler(logger, request, executorParams, context)
      .then(result => finishJob({ logger, result, callback, jobId, logId }))
      .catch(error => finishJob({ logger, callback, jobId, logId, error }))

    return { code: 200, msg: 'Success' }
  }

  async function finishJob<R = any>(options: {
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
    runningJobList.delete(jobId)
  }

  return {
    hasJob,
    runTask: runJob
  }
}
