// pages/myincome/index.js
var handlogin = require('../../utils/handlelogin.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userpacks: [],
    sumpack:0,
    user:[]
   
  },



  gotoHome: function () {

    wx.redirectTo({
      url: '../index/index'
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

onShow:function(){
  this.getdata()
},



getdata:function()
{

  var _this =this;
  handlogin.isLogin(() => {
      wx.request({
        url: 'https://'+app.globalData.host+'/api/user/userpacks',
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
            var sum = 0
            console.log(res);
            console.log(res.data.redpacks)
            res.data.redpacks.forEach((v, i) => {
              var tm = v.created_at.substring(0, 10)
              res.data.redpacks[i].created_at = tm
              sum = sum + v.amount
            })
            _this.setData({ sumpack:sum/100})
            _this.setData({ userpacks: res.data.redpacks, user: res.data.user })
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
    this.getdata()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  }


})