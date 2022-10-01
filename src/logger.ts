import { createReadStream } from 'node:fs'
import { createInterface } from 'node:readline'
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

  async function readFromLogId(logId: number, fromLineNum: number): Promise<{
    content: string
    fromLineNum: number
  }> {
    return new Promise((resolve) => {
      const stream = createReadStream(filename)
      const rl = createInterface({ input: stream })
      let lineNum = 0
      let content = ''
      let findFlag = false
      rl.on('line', (line) => {
        const start = new RegExp(`running:\s${logId}`)
        const end = new RegExp(`finished:\s${logId}`)
        if (lineNum > fromLineNum)
          lineNum = fromLineNum
        if (start.test(line))
          findFlag = true
        if (findFlag) {
          content += `\n${line}`
          lineNum++
        }
        if (lineNum > fromLineNum + 20 || end.test(line))
          rl.close()
      })

      rl.once('close', () => resolve({ content, fromLineNum: lineNum }))
    })
  }

  return {
    logger,
    readFromLogId
  }
}

