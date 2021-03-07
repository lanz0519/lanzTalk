const getters = {
  username: state => state.user.username,
  objectId: state => state.user.objectId,
  phoneNumber: state => state.user.phoneNumber,
  acount: state => state.user.acount,
  status: state => state.user.status,
  token: state => state.user.token,
  recentContactid: state => state.user.recentContactid,
}
export default getters
