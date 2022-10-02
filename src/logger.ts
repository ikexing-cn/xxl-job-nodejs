import { createReadStream, existsSync } from 'node:fs'
import { createInterface } from 'node:readline'
import { createLogger, format, transports } from 'winston'
import type { LogRead } from './'
const { combine, timestamp, printf } = format

const xxlJobFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [XXL-JOB] ${level}: ${message}`
})

export function createXxlJobLogger(localName?: string) {
  const foundMap = new Map<number, string>()

  const logger = createLogger({
    format: combine(
      timestamp(),
      xxlJobFormat
    ),
    transports: [
      new transports.Console(),
    ]
  })

  const filename = `logs/${localName}-${new Date().getMonth()}-${new Date().getDate()}.log`
  if (localName)
    logger.add(new transports.File({ filename }))

  async function readFromLogId(logId: number, fromLineNum: number, logDateTim: number): LogRead {
    return new Promise((resolve) => {
      if (foundMap.has(logId)) {
        resolve({ content: foundMap.get(logId)!, fromLineNum, lineNum: fromLineNum, findFlag: true, endFlag: true })
        return
      }

      const logFile = `logs/${localName}-${new Date(logDateTim).getMonth()}-${new Date(logDateTim).getDate()}.log`
      if (!existsSync(logFile)) {
        logger.error(`Log file does not exist or has been cleaned, logId:${logId}`)
        resolve({ findFlag: false, endFlag: true })
        return
      }

      const stream = createReadStream(filename)
      const rl = createInterface({ input: stream })
      let lineNum = 0
      let content = ''
      let findFlag = false
      let endFlag = false
      const start = new RegExp(`running: ${logId}`)
      const end = new RegExp(`finished: ${logId}`)

      rl.on('line', (line) => {
        if (lineNum > fromLineNum)
          lineNum = fromLineNum
        if (start.test(line))
          findFlag = true
        if (findFlag) {
          content += `${line}\n`
          lineNum++
        }
        if (end.test(line)) {
          endFlag = true
          rl.close()
        }
        if (lineNum > (fromLineNum + 20))
          rl.close()
      })

      rl.once('close', () => {
        if (!findFlag) { resolve({ findFlag, endFlag: true }) }
        else {
          if (endFlag)
            foundMap.set(logId, content)
          resolve({ content, fromLineNum, lineNum, findFlag, endFlag })
        }
      })
    })
  }

  return {
    logger,
    readFromLogId
  }
}

