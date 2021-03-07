import errorMessage from './errorMessage'

export function errorInfo (errorCode) {
  return {
    getErrorMessage: () => {
      return `[错误码：${errorCode}] ${errorMessage[errorCode] || '当前错误码无效'}`
    }
  }
}
