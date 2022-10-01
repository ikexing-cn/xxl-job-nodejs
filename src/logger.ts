import { createLogger, format, transports } from 'winston'
const { combine, timestamp, printf } = format

const xxlJobFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [XXL-JOB] ${level}: ${message}`
})

export const logger = createLogger({
  format: combine(
    timestamp(),
    xxlJobFormat
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'xxl-job.log' })
  ]
})
