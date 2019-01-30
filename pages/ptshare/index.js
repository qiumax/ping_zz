// pages/ptshare/index.js
const app = getApp()
var handlogin = require('../../utils/handlelogin.js');
var util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pingid:'',
    ping:[],
    avatars:[]

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var pingid = options.pingid
    console.log(pingid)
    this.setData({pingid,pingid})
   

  },

onShow:function(){
  this.getdata()
},
  getdata:function(){
    var _this=this
    handlogin.isLogin(() => {
      app.getUserping(this.data.pingid).then(function (res) {
        if (!res.data.err) {
          app.getavatarsfrompingid(res.data.ping_id._id).then(function (resavatar) {
            if (!resavatar.data.err) {
              console.log(resavatar.data)
              console.log(res)
              _this.setData({ ping: res.data })
              _this.setData({ avatars: resavatar.data })
            }
          })
        }
        else {
          handlogin.handError(res,_this.getdata)
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    //带用户ID 带拼团ID
    var user_id = wx.getStorageSync('user_id');
    var product_id = wx.getStorageSync('product_id');
    var name = wx.getStorageSync('name')
    var path = 'pages/index/index?userid=' + user_id + '&product_id=' + product_id;
    var imgurl = ''
    var sy70c = '5bda65617c65fac03d619994'
    var sy55u = '5bda65617c65fac03d619993'
    if (wx.getStorageSync('product_id') == sy70c) {
      imgurl = '/images/share_70c.jpg'
    }
    else {
      imgurl = '/images/share_55u.jpg'
    }

    name = name.substring(0, 4)
    return {
      title: '【' + name + '】喊你来拼团，' + '拼得越多，优惠越多',
      imageUrl: imgurl,
      path: path
    }
  }
})