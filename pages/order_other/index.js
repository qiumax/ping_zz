const app = getApp()
var util = require('../../utils/util.js');
var handlogin = require('../../utils/handlelogin.js');
Page({
  data: {
      avatars:[],
      ping:[],
      name: '',
      phone: '',
      code:'',
      formid: '',
      pingid:'',
      sendtime:0,
      shigongIndex: 0 ,
      locationIndex: 0 ,
      provinces: [
      '请选择',
      '河南省',
      '安徽省',
      '北京市',
      '天津市',
      '河北省',
      '山西省',
      '内蒙古自治区',
      '辽宁省',
      '吉林省',
      '黑龙江省',
      '上海市',
      '江苏省',
      '浙江省',
      '福建省',
      '江西省',
      '山东省',
      '湖北省',
      '湖南省',
      '广东省',
      '广西壮族自治区',
      '海南省',
      '重庆市',
      '四川省',
      '贵州省',
      '云南省',
      '西藏自治区',
      '陕西省',
      '甘肃省',
      '青海省',
      '宁夏回族自治区',
      '新疆维吾尔自治区',
      '台湾省',
      '香港特别行政区',
      '澳门特别行政区'],
        
  },

  submit: function (e) {
    var _this = this
    console.log(e)
    var name = this.data.name
    var locationIndex = this.data.locationIndex
    var shigongIndex = this.data.shigongIndex
    var remark = this.data.remark
    var phone = this.data.phone
    var code = this.data.code
    var formid = e.detail.formId
    var pingid = this.data.pingid

    var product_id = _this.data.product_id
    //name phone 不能为空
    if (!name || name == '') {
      wx.showToast({
        title: '姓名不能为空！',
        icon: 'none',
        duration: 1000
      })
      return false;
    }

    //location不能为空
    if (locationIndex == 0) {
      wx.showToast({
        title: '户籍地不能为空！',
        icon: 'none',
        duration: 1000
      })
      return false;
    }
    var location = _this.data.provinces[locationIndex]
    var shigong = _this.data.provinces[shigongIndex]
    //location不能为空
    if (locationIndex != 1 || shigongIndex != 1) {

      //把记录存下来
      wx.request({

        url: 'https://' + app.globalData.host + '/api/ping/joinPingOther',
        data: {
          'user_id': wx.getStorageSync('user_id'),
          's_id': wx.getStorageSync('s_id'),
          'product_id': product_id,
          'name': name,
          'phone': phone,
          'location': location,
          'shigong': shigong,
          'price': _this.data.price,
          'setup': _this.data.setupdetails,
          'remark': remark,
        },
        method: 'POST',
        header: {
          'content-type': 'application/json'
        }, // 设置请求的 header
        success: function (res) {

          if (res.data.err) {
            wx.showToast({
              icon: 'none',
              title: res.data.err,
              duration: 5000
            })
            return false
          }

          console.log(res);
         
        }

    })
    wx.showToast({
      title: '施工地,户籍地必须为河南！',
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

    if (code !== '') {
      var storecode = wx.getStorageSync('code')
      if (code != storecode) {
        wx.showToast({
          title: '验证码错误！',
          icon: 'none',
          duration: 1000
        })
        return false;
      }
    }

    var nonce_str = util.randomString()
    var timestamp = Date.parse(new Date()) / 1000
    var reg = /^\d{11}$/;
    if (!reg.test(phone)) {
      wx.showToast({
        icon: 'none',
        title: '手机号码格式不正确',
      })
      return false;
    }
    wx.request({

      url: 'https://'+app.globalData.host+'/api/ping/joinPing',
      data: {
        'user_id': wx.getStorageSync('user_id'),
        's_id': wx.getStorageSync('s_id'),
        'product_id': product_id,
        'name': name,
        'phone': phone,
        'location': location,
        'shigong': shigong,
        'price':_this.data.price,
        'setup': _this.data.setupdetails,
        'remark': remark,
        'form_id': formid,
        'attach': 'attach',
        'nonce_str': nonce_str,
        'ping_id': pingid,
        'timestamp': timestamp
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      }, // 设置请求的 header
      success: function (res) {

        if(res.data.err){
          wx.showToast({
            icon:'none',
            title: res.data.err,
            duration:5000
          })
          return false
        }
        
        console.log(res);
        var packagestr = "prepay_id=" + res.data.prepay_id
        //返回成功，调用支付
        wx.requestPayment({
          timeStamp: timestamp.toString(),
          nonceStr: nonce_str,
          package: packagestr,
          signType: 'MD5',
          paySign: res.data._paySignjs,
          //支付成功->
          success(res) {
            wx.showToast({
              title: '支付成功',
            })

            setTimeout(function () {
              wx.hideToast();
            })
            
            wx.switchTab({
              url: '/pages/mypings/index',
            })

          },
          //支付失败
          fail(res) {
            wx.showToast({
              title: '支付失败',
            })
            setTimeout(function () {
              wx.hideToast();
            })
          }
        })

      }


    })
  },

  onPullDownRefresh: function () {
    wx.stopPullDownRefresh();
    var _this = this;
    _this.getpintuan() 
    _this.getavatars() 
    _this.getinfo()    
  },


  onLoad: function (option) {
    var _this = this
    var s
    console.log(option)
    _this.setData({pingid:option.id})
    _this.setData({ price: option.price })
    _this.setData({ product_id: option.product })


    if (!option.product || !option.price || option.price == 0 || !option.setupdetails || option.setupdetails=='')
    {
     wx.showToast({
       title: '订单错误，请重试',
       icon:'none',
       duration:2000
     })
     wx.reLaunch({
       url: '/pages/index/index',
     })
    }

    _this.setData({ setupdetails: option.setupdetails})
    var selectedinfo = JSON.parse(option.setupdetails)
    console.log(selectedinfo)
    
    _this.setData({ setups: selectedinfo})
    
  },

onShow:function(){
  var _this = this;
  _this.getpintuan()
  _this.getproduct()
 
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

  location_input: function (e) {
    this.setData({
      location: e.detail.value
    })
  },

  remark_input: function (e) {
    console.log(e)
    this.setData({
      remark: e.detail.value
    })
  },

  sendsms: function (e) {
    var nowtime = Date.parse(new Date())
    console.log(nowtime)
    if (nowtime - this.data.sendtime < 60000) {
      wx.showToast({
        title: '请一分钟后再试',
        icon: 'none',
        duration: 1000
      })
      return false;
    }
    var _this=this
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
        icon: 'success',
        title: '正在发送',
        duration: 1000
      })
      
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
          if (res.data.result == 0) {
            _this.setData({ sendtime: Date.parse(new Date()) })
            wx.showToast({
              icon: 'success',
              title: '发送成功',
              duration: 1000
            })
          }
          else {
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

getpintuan(){
  var _this =this
  handlogin.isLogin(() => {
    //拼团
    app.getpingInfo(_this.data.pingid).then(function (res) {

      if (!res.data.err) {
        _this.setData({ ping: res.data[0] })
        _this.getavatars()
        _this.getinfo() 
      }
      else {
        handlogin.handError(res,_this.getpintuan)
      }
     
    })
  })
},

getavatars(){
  var _this = this
  handlogin.isLogin(() => {
    //头像
    app.getavatarsfrompingid(_this.data.pingid).then(function (res) {

      if (!res.data.err) {
        _this.setData({ avatars: res.data })
      }


    })
  })
},

//施工地
  bindshigongChange(e){
  console.log(e)
  var _this = this
  _this.setData({shigongIndex:e.detail.value})
},

//户籍地
bindlocationChange(e) {
  console.log(e)
  var _this = this
  _this.setData({ locationIndex: e.detail.value })
},

  //产品
  getproduct() {
    console.log('getproduct')
    var _this = this

    handlogin.isLogin(() => {
      wx.request({
        url: 'https://' + app.globalData.host + '/api/product',
        data: {
          'id': wx.getStorageSync('product_id'),
          'user_id': wx.getStorageSync('user_id'),
          's_id': wx.getStorageSync('s_id'),
        },
        method: 'POST',
        header: {
          'content-type': 'application/json'
        }, // 
        success: function (res) {

          if (!res.data.err) {
            console.log(res)

            _this.setData({ product: res.data.product })

            _this.setData({ creditdesc: '以' + res.data.product.price_origin / 10000 + '万元为基数' })

          }
          else {
            console.log(res)
            handlogin.handError(res, _this.getproduct)
          }
        },
        complete: function (res) {
          wx.hideLoading()
        }
      })
    })
  },



getinfo(){
  var _this = this
  handlogin.isLogin(() => {
    //用户信息

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

          _this.setData({ user: res.data })
          _this.setData({
            name: res.data.name,
            phone: res.data.phone,
          })
        }
       

      },
      complete: function (res) {
        wx.hideNavigationBarLoading()
        wx.hideLoading()
      }

    })

  })
}


})