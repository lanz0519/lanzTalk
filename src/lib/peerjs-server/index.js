import Peer from '../peer.min'

export default class {
  createrPeer () {
    var peer = new Peer()
    var conn = peer.connect('1')

    conn.on('open', () => {
      conn.send('hi!')
    })

    peer.on('connection', (conn) => {
      conn.on('data', (data) => {
        console.log(data)
      })
    })
  }
}

