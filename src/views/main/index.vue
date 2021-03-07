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
      <div class="messageListTop"></div>
      <hr class="friendsHr">
      <div class="messageMainList">
        <div class="friendInfo"></div>
        <!-- 消息显示div -->
        <div class="messages" v-for="item in msgRecord">
          <div class="messageAvatar"></div>
          <div class="messageInfo">
            <div class="messageFrom">{{item.sender.username}}</div>
            <div class="messageTime">2020/9/18</div>
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
      recentContactList: [],
      nowChatUserInfo: {}
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
    recentContact(this.recentContactid).then(res => {
      this.recentContactList = res.recentContact
    })
    this.login()
    // 获取消息记录
    searchRecord().then(res => {
      console.log(res)
    })
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

      let connOption = { host: 'localhost', port: 9000, path: '/', debug: 3};

      //创建peer实例
      this.peer = new Peer(this.hashCode(this.myName), connOption);
      
      //register成功的回调
      this.peer.on('open', function (id) {
        this.userId = id
        console.log('userId', this.userId)
      });

      this.peer.on('connection', (conn) => {
        console.log('有人连接了')
        //收到对方消息的回调
        conn.on('data', (data) => {
          var msg = JSON.parse(data);
          console.log('对方的消息', msg)
          this.msgRecord.push(msg)
          if (this.toName.length == 0) {
            this.toName = msg.from
            this.connect()
          }
        });
      });
    },
    sendMessage(message) {
      this.conn.send(JSON.stringify(message));
      this.msgRecord.push(message)
    },
    // 点击好友卡片之后建立连接
    createConn(toUserInfo) {
      // 把当前聊天的好友信息获取出来
      this.nowChatUserInfo = toUserInfo
      // 获取消息记录并显示
      searchRecord().then(res => {
        this.msgRecord = res.results
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
      })
      this.messageInput = ''
      //发送消息
      if (this.conn.open) {
        console.log('我的消息:', this.messageInfo)
        this.sendMessage(this.messageInfo);
      }
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
  margin-top: 400px;
  margin-bottom: 10px;
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
  height: 620px;
  overflow: auto;
}
.messageInfoDiv {
  float: left;
  width: 100%;
  position: absolute;
  top: 680px;
}
.messages {
  margin: 0px 0px 20px 0px;
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
</style>
