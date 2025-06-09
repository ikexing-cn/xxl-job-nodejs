import os from 'os'
import axios from 'axios'

export const request = axios.create()

export const initJobIsKill = () => {
  let isKill = false
  return {
    isKill: () => isKill,
    setJobKill: () => isKill = true,
  }
}

/**
 * 获取当前程序的IP地址.
 * @returns 当前程序的IP地址
 */
export const getProgramIp = function () {
  try {
    const interfaces = os.networkInterfaces()
    for (const devName in interfaces) {
      const ifaceArr = interfaces[devName]
      if (!Array.isArray(ifaceArr))
        continue
      for (const iface of ifaceArr) {
        if (
          iface
          && iface.family === 'IPv4'
          && !iface.internal
          && iface.address
        ) {
          // 当前程序IP地址: ${iface.address}
          return iface.address
        }
      }
    }
  }
  catch (e) {
    // 获取本机IP地址失败，可能是权限问题或环境不支持
  }

  return ''
}
