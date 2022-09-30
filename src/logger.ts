import Log4js from 'log4js'

Log4js.configure({
  appenders: {
    console: { type: 'console' },
    file: { type: 'file', filename: 'xxl-job.log' }
  },
  categories: {
    'default': {
      appenders: ['console'],
      level: 'debug'
    },
    'XXL-JOB': {
      appenders: ['console', 'file'],
      level: 'trace'
    }
  }
})

const logger = Log4js.getLogger('XXL-JOB')

const readLogFromJobId = function () {

}

export {
  logger,
  readLogFromJobId
}
