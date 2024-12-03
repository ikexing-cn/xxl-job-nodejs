import { createReadStream, existsSync } from 'node:fs'
import { join } from 'node:path'
import { createInterface } from 'node:readline'
import { createLogger, format, transports } from 'winston'
import type { LogRead } from './'

const { combine, timestamp, printf } = format

const xxlJobFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [XXL-JOB] ${level}: ${message}`
})

export function createXxlJobLogger(logFilename?: string) {
  const logger = createLogger({
    format: combine(
      timestamp({ format: () => new Date().toLocaleString() }),
      xxlJobFormat
    ),
    transports: [
      new transports.Console(),
    ]
  })
  if (logFilename) {
    const filename = join('logs', `${logFilename}`)
    logger.add(new transports.File({ filename }))
  }
  return {
    logger
  }
}

export function generatorJobLogFileName(logId: number, logDateTim: number) {
  const logDate = new Date(logDateTim)
  return join(`${logDate.getFullYear()}`, `${logDate.getMonth() + 1}`, `${logDate.getDay() + 1}`, `jobLog_${logId}.log`)
}

export async function readFromLogId(logId: number, fromLineNum: number, logDateTim: number): LogRead {
  return new Promise((resolve) => {
    const logFile = join('logs', generatorJobLogFileName(logId, logDateTim))
    if (!existsSync(logFile)) {
      resolve({ findFlag: false, endFlag: true })
      return
    }
    const stream = createReadStream(logFile)
    const rl = createInterface({ input: stream })
    let lineNum = 0
    let content = ''
    let endFlag = false
    const end = new RegExp(`finished: ${logId}`)
    rl.on('line', (line) => {
      if (lineNum >= fromLineNum)
        content += `${line}\n`
      lineNum++
      if (end.test(line)) {
        endFlag = true
        rl.close()
      }
    })
    rl.once('close', () => {
      resolve({ content, fromLineNum, lineNum, findFlag: true, endFlag })
    })
  })
}

