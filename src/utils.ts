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
 * Get the IP address of the current program.
 * @returns The IP address of the current program
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
          // The IP address of the current program: ${iface.address}
          return iface.address
        }
      }
    }
  }
  catch (e) {
    // Failed to get the IP address of the local machine, possibly due to permission issues or unsupported environment
  }

  return 'localhost'
}
