import axios from 'axios'

export const request = axios.create()

export const initJobIsKill = () => {
  let isKill = false
  return {
    isKill: () => isKill,
    setJobKill: () => isKill = true,
  }
}
