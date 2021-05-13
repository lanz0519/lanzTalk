import axios from 'axios'
import { Message } from 'element-ui'
import { errorInfo } from '@/errorInfo/errorInfo'
import store from '@/store'
import { getToken } from '@/utils/auth'

const service = axios.create({
  baseURL: 'http://www.lanzyy.com:4001/', // process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 10000, // request timeout
  validateStatus: (status) => {
    return true
  }
})

service.interceptors.request.use(
  config => {
    config.headers['X-Parse-Application-Id'] = 'lanz-talk001'
    
    if (store.getters.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      config.headers['X-Parse-Session-Token'] = getToken()
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  response => {
    const res = response.data
    if (response.status === 404 && !res.code) {
      return Promise.reject(new Error(errorInfo(404).getErrorMessage() || 'Error'))
    }
    if (response.status === 403) {
      return Promise.reject(new Error(errorInfo(403).getErrorMessage() || 'Error'))
    }
    return res
  },
  error => {
    console.log('err' + error) // for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
