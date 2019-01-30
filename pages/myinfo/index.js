// pages/myincome/index.js
var handlogin = require('../../utils/handlelogin.js');
var util = require('../../utils/util.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userpacks: [],
    user:[],
    userinfo:[],
    hasphone:false,
    name:'',
    phone:'',
    code:'',
    sendtime:0
   
  },

  phone_input: function (e) {

      this.setData({
        phone: e.detail.value
      })
   
  },

  code_input: function (e) {

    this.setData({
      code: e.detail.value
    })

  },

  name_input: function (e) {

      this.setData({
        name: e.detail.value
      })
  },


  submit: function (e) {
    console.log(e)
    var name = this.data.name
    var phone = this.data.phone
    var code = this.data.code
    //name phone 不能为空
    if (!name || name == '') {
      wx.showToast({
        title: '姓名不能为空！',
        icon: 'none',
        duration: 1000
      })
      return false;
    }

    if (!phone || phone == '') {
      wx.showToast({
        title: '手机号码不能为空！',
        icon: 'none',
        duration: 1000
      })
      return false;
    }

    if(code !=='')
    {
        var storecode = wx.getStorageSync('code')
        if(code != storecode)
        {
          wx.showToast({
            title: '验证码错误！',
            icon: 'none',
            duration: 1000
          })
          return false;
        }
    }

    var reg = /^\d{11}$/;
    console.log(phone)
    if (!reg.test(phone)) {
      wx.showToast({
        icon: 'none',
        title: '手机号码格式不正确',
      })
      return false;
    }
    wx.request({

      url: 'https://'+app.globalData.host+'/api/user/updateInfo',
      data: {
        'user_id': wx.getStorageSync('user_id'),
        's_id': wx.getStorageSync('s_id'),
        'name': name,
        'phone': phone, 
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      }, // 设置请求的 header
      success: function (res) {
        console.log(res)
        if(res.data.ok == 1 )
        {

          if(name){
            wx.setStorageSync('name', name);
          }
          wx.showToast({
            title: '更新成功',
            duration:2000,
            success(res){
              setTimeout(function () {
                wx.navigateBack({})
              }, 2000);         
             
            }
          })

         
        }

      },
      complete: function (res) {
        wx.hideNavigationBarLoading()
        wx.hideLoading()
      }


    })
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


  onShow: function (options) {
    this.getdata()
  },


  sendsms: function (e) {
    
    var nowtime = Date.parse(new Date())
    console.log(nowtime)
    if(nowtime - this.data.sendtime < 60000)
    {
      wx.showToast({
        title: '请一分钟后再试',
        icon: 'none',
        duration: 1000
      })
      return false;
    }
    var _this =this
    var phone = this.data.phone
    if (!phone || phone == '') {
      wx.showToast({
        title: '手机号码不能为空！',
        icon: 'none',
        duration: 1000
      })
      return false;
    }
    var reg = /^\d{11}$/;
    if (!reg.test(phone)) {
      wx.showToast({
        icon: 'none',
        title: '手机号码格式不正确',
        duration: 1000
      })
      return false;
    }
    var code = util.randomStringnum()
    wx.setStorageSync('code', code)
    handlogin.isLogin(() => {
      wx.showToast({
        icon:'success',
        title: '正在发送',
        duration:1000
      })
     
      console.log(this.data.sendtime)
      wx.request({
        url: 'https://'+app.globalData.host+'/api/sms/sendsms',
        data: {
          'user_id': wx.getStorageSync('user_id'),
          's_id': wx.getStorageSync('s_id'),
          'phonenum': phone,
          'code': code
        },
        method: 'POST',
        header: {
          'content-type': 'application/json'
        }, // 设置请求的 header
        success: function (res) {
          wx.hideToast()
          if (res.data.result == 0)
          {
            _this.setData({ sendtime: Date.parse(new Date()) })
            wx.showToast({
              icon: 'success',
              title: '发送成功',
              duration: 1000
            })
          }
          else
          {
            wx.showToast({
              icon: 'none',
              title: res.data.errmsg,
              duration: 1000
            })

          }

        }

      })
    })

  },

getdata:function()
{

  var _this =this;
  handlogin.isLogin(() => {
        wx.request({
          url: 'https://'+app.globalData.host+'/api/user/getInfo',
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
  
              console.log(res.data);
              _this.setData({ userinfo: res.data })

              _this.setData({
                name: res.data.name,
                phone: res.data.phone,
              })
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