<template>
  <!-- 主体 -->
  <div class="login-container">
    <!-- 登录框 -->
    <div class="login-box">
      <!-- 图片 -->
      <div class="login-img"></div>
      <!-- 登录表单 -->
      <div class="login-form">
        <el-form ref="loginForm" :model="loginForm" :rules="loginRules">
          <div class="login-title">
            <h3 class="title">登录</h3>
          </div>
          <el-form-item prop="username">
            <el-input
              ref="username"
              v-model="loginForm.username"
              placeholder="请输入账号"
              name="username"
              type="text"
              tabindex="1"
              auto-complete="on"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              :key="passwordType"
              ref="password"
              v-model="loginForm.password"
              :type="passwordType"
              placeholder="请输入密码"
              name="password"
              tabindex="2"
              auto-complete="on"
            />
          </el-form-item>
          <el-checkbox
            class="auto-login"
            v-model="autoLogin"
            @keyup.enter.native="handleLogin"
            >自动登录</el-checkbox
          >
          <el-button
            :loading="loading"
            type="primary"
            class="login-bottom"
            @click.native.prevent="handleLogin"
            >登录</el-button
          >
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import { Message } from 'element-ui'

export default {
  name: 'Login',
  data () {
    const validateUsername = (rule, value, callback) => {
      callback()
    }
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error('请输入六位以上密码'))
      } else {
        callback()
      }
    }
    return {
      loginForm: {
        username: 'ssd',
        password: '123456'
      },
      loginRules: {
        username: [
          { required: true, trigger: 'blur', validator: validateUsername },
          {
            required: true,
            pattern: /^[a-zA-Z0-9]+$/u,
            message: "用户名只能包含英文和数字",
          },
        ],
        password: [
          { required: true, trigger: 'blur', validator: validatePassword },
          {
            required: true,
            pattern: /^[a-zA-Z0-9]+$/u,
            message: "密码只能包含英文和数字",
          },
        ]
      },
      loading: false,
      autoLogin: false,
      passwordType: 'password'
    }
  },
  methods: {
    // 登录按钮点击
    handleLogin () {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$store
            .dispatch('user/login', this.loginForm)
            .then(() => {
              this.loading = false
              this.$router.push({ 
                path: '/main'
              })
            })
            .catch((err) => {
              this.loading = false
              Message({
                message: err || 'Error',
                type: 'error',
                duration: 5 * 1000
              })
            })
        }
      })
    }
  }
}
</script>
<style scoped>
.login-container {
  height: 80%;
  width: 100%;
  margin: 0 auto;
  background-color: #283443;
  padding-top: 10%;
}
.login-box {
  height: 500px;
  width: 900px;
  background-color: #f1f1f1;
  margin: 0px auto;
  /* overflow: hidden; */
  border-radius: 10px;
}
.login-img {
  border-radius: 10px;
  height: 100%;
  width: 50%;
  background-color: rgb(115, 176, 247);
  float: left;
}
.login-form {
  border-radius: 10px;
  height: 80%;
  width: 40%;
  float: left;
  margin-left: 45px;
}
.login-title {
  height: 20%;
  width: 100%;
  text-align: center;
  border-radius: 10px;
  margin-top: 15%;
}
.title {
  font-size: 30px;
}
.auto-login {
  padding-bottom: 36px;
}
.login-bottom {
  width: 100%;
  padding: 15px 180px;
  border-radius: 27px;
  font-size: 16px;
}
</style>
