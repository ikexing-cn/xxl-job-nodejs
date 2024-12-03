import type { Logger } from 'winston'
import type {
  CallBack,
  IObject,
  IRunRequest,
  JobHandler, JobKillUtil, JobObject
} from './typings'
import { initJobIsKill } from './utils'
import { createXxlJobLogger, generatorJobLogFileName } from './logger'

export function createJobManager<T extends IObject>(logStorage: string, context?: T) {
  const runningJobMap = new Map<number, JobObject>()

  function hasJob(jobId: number) {
    return runningJobMap.has(jobId)
  }
  function getJob(jobId: number) {
    return runningJobMap.get(jobId)
  }
  async function runJob(mainLogger: Logger, jobHandler: JobHandler<T>, request: IRunRequest, callback: CallBack) {
    let timeout: NodeJS.Timeout | null = null
    const { executorParams, jobId, executorTimeout, logId } = request
    const logger = logStorage === 'local' ? createXxlJobLogger(generatorJobLogFileName(request.logId, request.logDateTime)).logger : mainLogger
    logger.info(`Job Task: ${jobId} is running: ${logId}`)
    if (hasJob(jobId))
      return { code: 500, msg: 'There is already have a same job is running.' }
    if (executorTimeout) {
      timeout = setTimeout(() => {
        finishJob({ jobId, error: new Error(`Job Task: ${jobId} is Timeout.`) })
      }, executorTimeout * 1000)
    }
    const jobKill: JobKillUtil = initJobIsKill()
    runningJobMap.set(jobId, {
      id: jobId,
      callback,
      jobKill,
      logId,
      logger,
      timeout
    })
    jobHandler(logger, { ...request, isKill: jobKill.isKill }, executorParams, context).then(result => finishJob({ jobId, result })).catch(error => finishJob({ jobId, error }))
    return { code: 200, msg: 'Success' }
  }

  async function finishJob<R = any>(options: {
    jobId: number
    func?: CallBack | undefined
    result?: R | undefined
    error?: Error | undefined
  }) {
    const { error, result } = options
    const job = runningJobMap.get(options.jobId)
    if (!job)
      return
    const { id: jobId, logger, logId, callback, timeout, jobKill: { setJobKill } } = job
    setJobKill()
    timeout && clearTimeout(timeout)
    error && logger.error(error.message || error)
    logger.info(`Job Task: ${jobId} is finished: ${logId}`)
    await callback({ error, result, logId })
    runningJobMap.delete(jobId)
  }

  return {
    hasJob,
    getJob,
    runJob,
    finishJob
  }
}
