const app = getApp()
// 开始login
function login(callback) {
 // wx.showLoading()
  wx.login({
    success(res) {
      if (res.code) {
        // 登录成功，获取用户信息
        getUserInfo(res.code, callback)
      } else {
        console.log('a')
        // 否则弹窗显示
        showToast()
      }
    },
    fail(res) {
      console.log(res)
      showToast()
      showLoginModal()
    }
  })
}

// 获取用户信息
function getUserInfo(code, callback) {
  wx.getUserInfo({
    // 获取成功，全局存储用户信息，开发者服务器登录
    success(res) {
      console.log('wxuserinfo')
      console.log(res.userInfo)

      // 全局存储用户信息
      wx.setStorageSync('UserInfo', res.userInfo)
      postLogin(code, res.userInfo, callback)
    },
    // 获取失败，弹窗提示一键登录
    fail() {
      wx.hideLoading()
      showLoginModal()
    }
  })
}

// 服务端登录
  function postLogin(code, userinfo, callback) {
    wx.request({
      url: "https://"+app.globalData.host+"/wx/getWxUserInfo",
      data: {
        code: code,
        refer_id: wx.getStorageSync('share_userid'),//分享 二维码对应的用户id
        nickname: userinfo.nickName,
        avatar: userinfo.avatarUrl,
        city: userinfo.city,
        province: userinfo.province,
        country: userinfo.country,
        gender: userinfo.gender
      },
      method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: {
        'content-type': 'application/json'
      }, // 设置请求的 header
      success: function (res) { 
        console.log(res)
        if (!res.data.err) {
          // 登录成功，
          wx.setStorageSync('user_id', res.data.user_id);
          wx.setStorageSync('session_key', res.data.session_key);
          wx.setStorageSync('s_id', res.data.s_id);
          wx.setStorageSync('name', userinfo.nickName);
          wx.setStorageSync('avatar', userinfo.avatarUrl);
          //登陆状态
          wx.setStorageSync('loginstate', 'login in')
          callback && callback()
        }
        else
        {
          showToast()
        }
      },
      fail: function (res) {
        console.log(res)
        showToast()
      },
      complete: function () {
        // complete
      }
    })
    
}

// 显示toast弹窗
function showToast(content = '登录失败，请稍后再试') {
  wx.showToast({
    title: content,
    icon: 'none'
  })
}


// 判断是否登录
function isLogin(callback) {
  //登陆状态
  let loginstate = wx.getStorageSync('loginstate')
  console.log(loginstate)
  if (loginstate) {
    // 如果有存储的登录态，暂时认为他是登录状态
    callback && callback()
  } else {
    // 如果没有登录态，弹窗提示一键登录
    console.log('gagaga')
    showLoginModal()
  }
}


// 判断是否登录
function isLogin_true() {
  console.log(wx.getStorageSync('s_id'))
  //登陆状态
  let loginstate = wx.getStorageSync('loginstate')
  console.log(loginstate)
  if (loginstate) {
    // 如果有存储的登录态，暂时认为他是登录状态
    return true;
  } else {
    // 如果没有登录态，弹窗提示一键登录
    return false;
  }
}

// 接口调用失败处理，
function handError(res, callback) {
   // wx.setStorageSync('loginstate', '')
  // 规定err=expired代表未登录和登录态失效
  if (res.data.err == 'expired') {
    // 弹窗提示一键登录
    console.log('expired')
    //showLoginModal()
   this.login(callback)
   wx.hideLoading()
  } else if (res.data.err) {
    // 弹窗显示错误信息
    showToast(res.data.err)
  }
}


// 显示一键登录的弹窗
function showLoginModal() {
  wx.navigateTo({
      url: '/pages/login/index',
  })
     
}


module.exports = {
  login: login,
  getUserInfo: getUserInfo,
  showToast: showToast,
  isLogin: isLogin,
  handError: handError,
  showLoginModal: showLoginModal,
  isLogin_true: isLogin_true

}
