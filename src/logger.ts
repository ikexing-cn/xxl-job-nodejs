import { createLogger, format, transports } from 'winston'
const { combine, timestamp, printf } = format

const xxlJobFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [XXL-JOB] ${level}: ${message}`
})

export function createXxlJobLogger(localFilename?: string) {
  const logger = createLogger({
    format: combine(
      timestamp(),
      xxlJobFormat
    ),
    transports: [
      new transports.Console(),
    ]
  })

  const filename = `${localFilename}-${Date.now()}`

  if (localFilename)
    logger.add(new transports.File({ filename }))

  return {
    logger,
  }
}

