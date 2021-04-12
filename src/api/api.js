import request from '@/utils/request'

// 用户登录
export function login (data) {
  return request({
    url: 'parse/login',
    method: 'post',
    data
  })
}

// 获取近期联系人
export function recentContact (params) {
  let str = `parse/classes/Contact/${params}?include=recentContact`
  return request({
    url: str,
    method: 'get'
  })
}

// 添加聊天记录
export function addRecord (data) {
  return request({
    url: 'parse/classes/Record',
    method: 'post',
    data: data
  })
}

// 查找最近的聊天记录
export function searchRecord (objId, toObjId) {
  return request({
    url: `parse/classes/Record?include=sender,receiver&&limit=20&&order=-createdAt&&where={"$or":[{"sender":"${objId}","receiver":"${toObjId}"},{"sender":"${toObjId}","receiver":"${objId}"}]}`,
    methos: 'get'
  })
}
