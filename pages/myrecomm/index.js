// pages/myrecomm/index.js
var handlogin = require('../../utils/handlelogin.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    followers: [],
    followers_num:0,
    user:[],
    pic:''

  },

  gotoHome: function () {

    wx.redirectTo({
      url: '../index/index'
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {

  },

  onShow: function () {
    this.getdata()
  },


getdata:function()
{
  var _this = this;
  handlogin.isLogin(() => {
        wx.request({
          url: 'https://'+app.globalData.host+'/api/user/userfollowers',
          data: {
            'user_id': wx.getStorageSync('user_id'),
            's_id': wx.getStorageSync('s_id'),
          },
          method: 'POST',
          header: {
            'content-type': 'application/json'
          }, // 设置请求的 header
          success: function (res) {

            if (!res.data.err) {
              console.log(res);
              _this.setData({ followers_num:res.data.followers.length})
              _this.setData({ followers: res.data.followers, user: res.data.user })
            }
            else {
              handlogin.handError(res,_this.getdata)
            }

          },
          complete: function (res) {
            wx.hideNavigationBarLoading()
            wx.hideLoading()
          }

        })
  })
},


  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
    this.getdata()
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

})