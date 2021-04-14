<template>
  <div class="container">
    <!-- 顶部 -->
    <div class="top">
    </div>
    <!-- 左侧按钮头像 -->
    <div class="left">
      <!-- 头像 -->
      <div class="avatar">
        此处显示头像
      </div>
      <!-- 其他按钮 -->
      <div class="leftButton">
        这里是多功能的按钮
      </div>
      <div class="leftBottomButton">
        这里是底部多功能按钮
      </div>
    </div>
    <!-- 好友列表 -->
    <div class="friendsList">
      <!-- 搜索框 -->
      <div class="searchDiv">
        <input type="text" class="searchInput" placeholder="请输入要搜索的内容">
      </div>
      <hr class="friendsHr">
      <!-- 好友列表的标识 -->
      <div class="friendIcon">
        <p class="friendIconP">好友</p>
      </div>
      <!-- 好友列表 -->
      <div class="friendTab" v-for="item in recentContactList" @click="createConn(item)">
        <div class="friendAvatar">
          {{item.acount.avatar}}
        </div>
        <div class="friendName">
          {{item.username}}
        </div>
        <div class="friendIntorduction">
          {{item.acount.introduction}}
        </div>
      </div>
    </div>
    <!-- 主体，搜索好友或者和好友的消息 -->
    <div class="main">
      <div class="messageListTop">
        <!-- 消息列表上方导航右侧按钮 -->
        <div class="messageListTopRight">
          <i class="el-icon-phone" @click="callPhone()"></i>
        </div>
        <!-- 语音通话弹窗 -->
        <div v-show="callPhonePopShow" class="callPhonePop" @click="closecallPhonePop()">
          <audio id="audio" autoplay></audio>
          <button @click="closeCallPhone()">挂断</button>
        </div>
      </div>
      <hr class="friendsHr">
      <div class="messageMainList" id="messageDiv">
      <!-- 是否接收通话弹窗 -->
        <div v-show="acceptCallPhoneShow" class="acceptCallPhone">
          <button @click="acceptCallPhoneBtn('accept')">接受</button>
          <button @click="acceptCallPhoneBtn('refuse')">拒绝</button>
        </div>
        <div class="friendInfo"></div>
        <!-- 消息显示div -->
        <div class="messages" v-for="item in msgRecord">
          <div class="messageAvatar"></div>
          <div class="messageInfo">
            <div class="messageFrom">{{item.sender.username ? item.sender.username : item.sender}}</div>
            <div class="messageTime">{{formatTime(item.createdAt)}}</div>
          </div>
          <div class="messageBody">{{item.content}}</div>
        </div>
        <div class="messageInfoDiv">
        <el-input
          class="messageInput"
          placeholder="请输入内容"
          v-model="messageInput"
          clearable>
        </el-input>
        <el-button type="info" icon="el-icon-message" circle @click="send"></el-button>
      </div>
      </div>
    </div>
  </div>
</template>
<script>
import Peer from 'peerjs'
import { mapGetters } from "vuex"
import { recentContact,addRecord,searchRecord } from "@/api/api"
import dayjs from 'dayjs'
dayjs().format() 

export default {
  name: 'Main',
  data () {
    return {
      myName: '',
      toName: '',
      messageInput: '',
      messageInfo: '',
      msgRecord: [],
      msgDivId: 1,
      userId: null,
      peer: null,
      conn: null,
      callConn: null,
      callStream: null,
      recentContactList: [],
      nowChatUserInfo: {},
      callPhonePopShow: false,
      acceptCallPhoneShow: false,
      audio: null
    }
  },
  computed: {
    ...mapGetters(["username", "objectId", "recentContactid"]),
  },
  created() {
    // 在页面加载时读取sessionStorage
    if (sessionStorage.getItem('userInfo')) {
      this.$store.replaceState(Object.assign({}, this.$store.state, JSON.parse(sessionStorage.getItem('userInfo'))))
    }
    // 在页面刷新时将store保存到sessionStorage里
    window.addEventListener('beforeunload', () => {
      sessionStorage.setItem('userInfo', JSON.stringify(this.$store.state))
    })
  },
  mounted() {
    this.myName = this.username
    // console.log(this.recentContactid)
    recentContact(this.recentContactid).then(res => {
      this.recentContactList = res.recentContact
      // console.log(this.recentContactList)
    })
    this.login()

    // 获取audio控件
    this.audio = document.getElementById("audio")

  },
  methods: {
    hashCode(str){
      let hash = 0;
      if (str.length == 0) return hash;
      for (let i = 0; i < str.length; i++) {
        let char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return hash;
    },
    login(){
      if (this.myName.length == 0) {
        alert("please input your name");
        return;
      }

      let connOption = { host: 'www.lanzyy.com', port: 9000, path: '/', debug: 3};

      //创建peer实例
      this.peer = new Peer(this.hashCode(this.myName), connOption);
      
      //register成功的回调
      this.peer.on('open', function (id) {
        this.userId = id
        // console.log('userId', this.userId)
      });

      this.peer.on('connection', (conn) => {
        console.log('有人连接了')
        //收到对方消息的回调
        conn.on('data', (data) => {
          var msg = JSON.parse(data);
          console.log('对方的消息', msg)
          if (msg.action == 'call') {
            console.log('是否接受通话')
            this.callPhonePopShow = !this.callPhonePopShow
            this.acceptCallPhoneShow = !this.acceptCallPhoneShow
            
          }

          if (msg.action == 'accept') {
            navigator.mediaDevices.getUserMedia({video: false, audio: true}).then((stream) => {
              this.callStream = stream.getTracks()[0]
              this.callConn = this.peer.call(this.hashCode(this.toName), stream);
              this.callConn.on('stream', (remoteStream) => {
                console.log('accept stream====================')
                // Show stream in some <video> element.
                this.audio.srcObject = remoteStream
              });
            }).catch((err) => {
              console.log('err ====================', err)
            })
          }
          if (msg.action == 'closeCall') {
            this.closeCallPhone(2)
          }

          // 默认接收信息不处理
          this.msgRecord.push(msg)
          if (this.toName.length == 0) {
            this.toName = msg.from
            this.connect()
          }
        });
      });

      this.peer.on('call', (call) => {
        this.callConn = call
        navigator.mediaDevices.getUserMedia({video: false, audio: true}).then((stream) => {
          this.callStream = stream.getTracks()[0]
          call.answer(stream)// Answer the call with an A/V stream.
          call.on('stream', (remoteStream) => {
            console.log('accept stream====================')
            // Show stream in some <video> element.
            this.audio.srcObject = remoteStream
          });
        }).catch((err) => {
          console.log('err ====================', err)
        })
      });
    },
    sendMessage(message) {
      this.conn.send(JSON.stringify(message));
      this.msgRecord.push(message)
    },
    // 点击好友卡片之后建立连接
    createConn(toUserInfo) {
      console.log('---------', toUserInfo.objectId)
      // 把当前聊天的好友信息获取出来
      this.nowChatUserInfo = toUserInfo
      // 获取消息记录并显示
      searchRecord(this.objectId, toUserInfo.objectId).then(res => {
        this.msgRecord = res.results.reverse();
        // console.log(this.msgRecord,this.objectId, toUserInfo.objectId)
      })

      this.toName = toUserInfo.username
      if (this.toName.length == 0) {
        return new Error("用户名为空")
      }

      //创建到对方的连接
      this.conn = this.peer.connect(this.hashCode(this.toName));

      // this.messageInfo = { "from": this.myName, "to": this.toName, "body": '首条消息' };

      this.conn.on('open', () => {
        console.log('我的消息:', this.messageInfo)
        //首次发送消息
        // this.sendMessage(this.messageInfo);
      });
    },
    send() {
      //消息体
      this.messageInfo = { "sender": this.myName, "receiver": this.toName, "content": this.messageInput };
      if (this.messageInput.length == 0) {
        alert("please input message");
        return;
      }
      // 添加信息到数据库
      addRecord({
        ifServer: false,
        content: this.messageInput,
        receiver: this.nowChatUserInfo.objectId
      }).then(res => {
        console.log(res)
        this.messageInput = ''
        //发送消息
        if (this.conn.open) {
          console.log('我的消息:', this.messageInfo)
          this.sendMessage(this.messageInfo);
        }
      })
    },
    callPhone() {
      this.callPhonePopShow = !this.callPhonePopShow

      this.conn.send(JSON.stringify({ "sender": this.myName, "receiver": this.toName, "action": "call"}));
    },
    acceptCallPhoneBtn(action) {
      switch(action) {
        case 'accept': {
           this.conn.send(JSON.stringify({ "sender": this.myName, "receiver": this.toName, "action": "accept"}));
        }break;
        case 'refuse': {
           this.conn.send(JSON.stringify({ "sender": this.myName, "receiver": this.toName, "action": "refuse"}));
        }break
      }
    },
    closeCallPhone(params) {
      if (this.callStream) {
        this.callConn.close()
        this.callStream.stop()
        this.audio.srcObject = null
        if (params != 2) {
          this.conn.send(JSON.stringify({ "sender": this.myName, "receiver": this.toName, "action": "closeCall"}));
        }
      }
    },
    closecallPhonePop() {
      this.callPhonePopShow = !this.callPhonePopShow
    },
    formatTime(time) {
      return dayjs(time).format('HH:mm')
    }
  },
  watch: {
    msgRecord: function () {
      // console.log(this.msgRecord)
      let div = document.getElementById('messageDiv');
      // console.log(div.scrollTop, div.scrollHeight)
      setTimeout(() => {
        div.scrollTop = div.scrollHeight;
      }, 20)
    }
  }
}
</script>

<style scoped>
.container {
  height: 100%;
  width: 100%;
}
.top {
  height: 7%;
  width: 100%;
}
.left {
  height: 93%;
  width: 7%;
  background-color: rgb(20, 22, 25);
  float: left;
  /* position:relative; */
}
.avatar {
  height: 85px;
  width: 85px;
  margin: 0px auto;
  margin-top: 10px;
  margin-bottom: 30px;
  background-color: #fff;
  border-radius: 10px;
}
.leftButton {
  height: 75px;
  width: 75px;
  background-color: #4b4e55;
  margin: 0px auto;
  margin-top: 5px;
  overflow: hidden;
  border-radius: 100%;
}
.leftBottomButton {
  height: 75px;
  width: 75px;
  background-color: #4b4e55;
  margin: 0px auto;
  /* margin-top: 480% */
  position: relative;
  top: 60%;
  overflow: hidden;
  border-radius: 100%;
}
.friendsList {
  height: 93%;
  width: 20%;
  background-color:  #2f3136;
  float: left;
}
/* .friendsHr {
} */
.friendIcon {
  width: 80%;
  margin: 0px auto;
  align-items: center;
  border-radius: 4px;
  height: 42px;
  padding: 0 8px;
  display: flex;
  background-color: #464950;
  margin-bottom: 30px;
}
.friendIconP {
  color: #fff;
}
.friendTab {
  width: 100%;
  height: 60px;
  margin-bottom: 10px;
  margin-left: 20px;
}
.friendAvatar {
  width: 60px;
  height: 60px;
  border-radius: 100%;
  background-color: rgb(238, 130, 130);
  float: left;
}
.friendName {
  width: 180px;
  height: 25px;
  background-color: rgb(252, 159, 159);
  float: left;
  margin: 5px 0px 0px 8px;
}
.friendIntorduction {
  width: 180px;
  height: 20px;
  background-color: rgb(252, 159, 159);
  float: left;
  margin: 5px 0px 0px 8px;
}
.searchDiv {
  margin-top: 10px;
  padding: 0 0 0 40px;
}
.searchInput {
  background-color: #202225;
  overflow: hidden;
  border-radius: 4px;
  text-align: left;
  text-overflow: ellipsis;
  font-size: 14px;
  font-weight: 500;
  line-height: 24px;
  white-space: nowrap;
}
.main {
  height: 93%;
  width: 73%;
  background-color: #36393f;
  float: left;
}
.messageListTop {
  position:relative;
  height: 40px;
  width: 100%;
  background-color: #36393f;
}
.messageMainList {
  width: 100%;
  height: 85%;
  overflow: hidden;
  /* padding-right: 20px; */
}
.messageMainList:hover {
    overflow-y: auto;
}
.messageInfoDiv {
  float: left;
  width: 100%;
  position: absolute;
  /* top: 780px; */
  bottom: 20px;
}
.messages {
  margin: 0px 0px 20px 0px;
  /* width: 100%; */
}
.messageInput {
  width: 68%;
}
.messageAvatar {
  width: 50px;
  height: 50px;
  margin-right: 10px;
  border-radius: 100%;
  background-color: rgb(238, 130, 130);
  float: left;
}
.messageFrom {
  margin: 0px 10px 0px 0px;
  color: #fff;
  float: left;
  font-weight: 550;
}
.messageTime {
  color: rgb(218, 210, 210);
}
.messageBody {
  color: #fff;
  margin: 0px 10px 0px 60px;
  word-wrap:break-word;
  font-weight: 300;
}
.messageListTopRight {
  float: right;
  margin:7px 15px;
}
.el-icon-phone {
   font-size:200%
}
.callPhonePop {
  position: absolute;
  width: 100%;
  height: 100px;
  background-color: #fff;
  float: left;
  z-index: 1000;
}
.acceptCallPhone {
  position: absolute;
  width: 250px;
  height: 150px;
  background-color: #fff;
  top: 30%;
  left: 50%;
}
</style>
