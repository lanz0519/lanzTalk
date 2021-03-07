import { getToken, setToken, removeToken } from '@/utils/auth'
import { errorInfo } from '@/errorInfo/errorInfo'
import { login } from '@/api/api'
import app from '@/js/app'
const getDefaultState = () => {
  return {
    token: getToken(),
    username: '',
    objectId: '',
    phoneNumber: '',
    acount: {},
    status: -1,
    recentContactid: ''
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_USERNAME: (state, username) => {
    state.username = username
  },
  SET_OBJECTID: (state, objectId) => {
    state.objectId = objectId
  },
  SET_PHONEnUMBER: (state, phoneNumber) => {
    state.phoneNumber = phoneNumber
  },
  SET_ACOUNT: (state, acount) => {
    state.acount = acount
  },
  SET_STATUS: (state, status) => {
    state.status = status
  },
  SET_CONTACT: (state, contact) => {
    state.recentContactid = contact
  }
}

const actions = {
  // 用户登录
  login ({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        if (response.code) {
          reject(new Error(errorInfo(10001).getErrorMessage()))
          return
        }
        // app.username = response.number
        // localStorage.setItem('lanz-talk', JSON.stringify(response))
        sessionStorage.setItem('userInfo', JSON.stringify(response));
        const { sessionToken } = response
        
        commit('SET_TOKEN', sessionToken)
        commit('SET_USERNAME', response.username)
        commit('SET_OBJECTID', response.objectId)
        commit('SET_STATUS', response.status)
        commit('SET_PHONEnUMBER', response.phoneNumber)
        commit('SET_CONTACT', response.recentContact.objectId)
        commit('SET_ACOUNT', response.acount)
        setToken(sessionToken)
        resolve()
      }).catch(error => {
        console.error(error)
        reject(error)
      })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
