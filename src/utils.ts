import axios from 'axios'
import debug from 'debug'

export const request = axios.create()
export const logger = debug('xxl-job-nodejs')
