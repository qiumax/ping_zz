const app = getApp()
var util = require('../../utils/util.js');
var handlogin = require('../../utils/handlelogin.js');
Page({
  data: {
    userInfo: getApp().globalData.userInfo,
    config:'',
    toppic:'',
    detail:'',
    showdetail:1,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    host: getApp().globalData.host,
    product:[],
    hasUserInfo:true,
    hasphone:true,//是否有电话信息
    activitystatus:0, //
    interval:0,
    counttimeout:0,
    starttime:'',//开始时间
    activitystart:0,
    activitytimeout:0,
    ping:[],
    share_userid: '',//分销用户id
    hasping:true,//判断当前是否有拼团
    expire:0,//带链接拼团id的过期时间
    opacity:1,//透明度
    showwindow:false,//弹窗
    setupid:[-1,-1,-1,-1,-1,-1],
    num0:0,
    num1:0,
    setupdetails:[],
    selectedinfo:'',//已选配置
  },

  preventTouchMove() {},

  gotoHome:function(){
    console.log('clear interval')
    clearInterval(this.data.interval)
    clearTimeout(this.data.counttimeout)
    clearTimeout(this.data.activitytimeout)
    wx.switchTab({
      url: '../member/index'
    })
  },

  getPhoneNumber: function (e) {
    console.log('getphone')
    var _this =this
    //先判断用户是否已经有电话
    var btn_type = e.currentTarget.dataset.type
    var pt_id = e.currentTarget.dataset.pt_id

    console.log(e)
    console.log(e.detail.errMsg)
    console.log(e.detail.iv)
    console.log(e.detail.encryptedData)
    if (e.detail.errMsg == 'getPhoneNumber:fail user deny') {
      wx.showToast({
        title: '授权失败，请重试',
        icon:'none',
        duration:2000
      })
    } else {//授权成功

      //解密数据
      handlogin.isLogin(() => {
        wx.request({
          url: 'https://'+app.globalData.host+'/api/user/getphone',
          data: {
            'user_id': wx.getStorageSync('user_id'),
            's_id': wx.getStorageSync('s_id'),
            'encryptedData': e.detail.encryptedData,
            'iv': e.detail.iv,
            'session_key': wx.getStorageSync('session_key')
          },
          method: 'POST',
          header: {
            'content-type': 'application/json'
          }, // 设置请求的 header
          success: function (res) {
              console.log(res)
              if(res.data.phoneNumber){
                  //更新
                _this.setData({ hasphone: true })
                wx.request({
                  url: 'https://'+app.globalData.host+'/api/user/updateInfo',
                  data: {
                    'user_id': wx.getStorageSync('user_id'),
                    's_id': wx.getStorageSync('s_id'),
                    'phone': res.data.phoneNumber,
                    'name': wx.getStorageSync('name'),
                  },
                  method: 'POST',
                  header: {
                    'content-type': 'application/json'
                  }, // 设置请求的 header
                  success: function (res) {
                      console.log('update success')
                  }

                })
              }
             
          },
          complete:function(res){//进入相应页面
           
            clearInterval(_this.data.interval)
            clearTimeout(_this.data.counttimeout)
            if (btn_type == 'member')
            {
              console.log('clear interval')
              wx.switchTab({
                url: '../member/index'
              })
            }
            else
            {
              if (_this.data.activitystatus == 1) {
                if (_this.data.hasping) {
                  //背景透明度
                  _this.setData({ opacity: 0.5 })
                  //弹窗
                  _this.setData({ showwindow: true })
                  _this.setData({ showmodal: false })
                  //  wx.navigateTo({
                  //    url: '../order_other/index?id=' + pt_id
                  //  })
                }
                else {
                  console.log('aa')
                  wx.showToast({
                    icon: 'none',
                    title: '当前拼团已结束\r\n距离下次开团时间约剩余：5分钟',
                    duration: 3000
                  })
                }
              }
              else if (_this.data.activitystatus == 2) {
                wx.showToast({
                  icon: 'none',
                  title: '活动未开始',
                  duration: 3000
                })

              }
              else {
                wx.showToast({
                  icon: 'none',
                  title: '活动已结束',
                  duration: 3000
                })
              }  

            }
          }

        })

      })

     
    }
  },

  gotoOrderOther: function (e) {
    console.log('gotoOrderOther')
    var _this = this
    //activitystatus 1进行中 2未开始 3已结束
    if (this.data.activitystatus == 1)
    {

      if (this.data.hasping) {
        //背景透明度
        _this.setData({opacity:0.5})
        //弹窗
        _this.setData({ showmodal: false })
        _this.setData({showwindow:true})
         var pt_id = e.currentTarget.dataset.pt_id
        //  wx.navigateTo({
        //    url: '../order_other/index?id=' + pt_id
        //  })
      }
      else {
        console.log('aa')
        wx.showToast({
          icon: 'none',
          title: '当前拼团已结束\r\n距离下次开团时间约剩余：5分钟',
          duration: 3000
        })
      }
    }
    else if (this.data.activitystatus == 2)
    {
      wx.showToast({
        icon: 'none',
        title: '活动未开始',
        duration: 3000
      })

    }
    else
    {
      wx.showToast({
        icon: 'none',
        title: '活动已结束',
        duration: 3000
      })
    }

  },


  onLoad: function (option) {
    console.log(app.globalData.host)
    console.log('onload')
    console.log(option)
    //二维码
    if (option.scene) {
      var scenes = option.scene.split("_")
      wx.setStorageSync('share_userid', scenes[0])
      var sy70c = '5bda65617c65fac03d619994'
      var sy55u = '5bda65617c65fac03d619993'
      if (scenes[1] == 'sy70c') {
        wx.setStorageSync('product_id', sy70c)
      }
      else {
        wx.setStorageSync('product_id', sy55u)
      }
    }
    else
    {
      
      //链接带userid
      if (option.userid) {
        wx.setStorageSync('share_userid', option.userid)
      }
      //带产品id

      if (option.product_id) {
        wx.setStorageSync('product_id', option.product_id)
      }
      else {
        wx.setStorageSync('product_id', '5bda65617c65fac03d619993')
      }
    }
    

    //加载图
    //this.picchange()
 
  },

  onHide:function(){
    this.setData({activity:''})
    console.log(this.data.interval)
    console.log(this.data.counttimeout)
    clearInterval(this.data.interval)
    clearTimeout(this.data.counttimeout)
    clearTimeout(this.data.activitytimeout)
    console.log('onhide')
  },

  onShow:function(){
    console.log('onshow')
    var _this =this
    _this.setData({ showwindow:false})
    _this.setData({ opacity:1})
    _this.getproduct()

 
    //_this.picchange()
    _this.setData({ setupid: [-1, -1, -1, -1, -1, -1] })
    _this.setData({ num0: 0 })
    _this.setData({ num1: 0 })
    _this.calprice()

  },


//活动信息
  getactivity() {
    console.log('get getactivity')
    var _this = this
      wx.request({
        url: 'https://'+app.globalData.host+'/api/activity/getactivity',
        data: {
          'user_id': wx.getStorageSync('user_id'),
          's_id': wx.getStorageSync('s_id'),
        },
        method: 'POST',
        header: {
          'content-type': 'application/json'
        }, // 设置请求的 header
        success: function (res) {
          console.log(res)
          if (!res.data.err) {
            //判断时间
            var nowtime = Date.parse(new Date()) / 1000
            var starttime = res.data.starttime
            var endtime = res.data.endtime
            console.log(util.formatDateTime(endtime))
            if(nowtime>=starttime && nowtime<=endtime)
            {
              //进行中
              _this.setData({ activitystatus: 1})
              _this.getping()
            }
            else if(nowtime< starttime)
            {
              //未开始
              _this.setData({ activitystatus: 2, starttime: util.formatDateTime(starttime)})
              _this.setData({activitystart:starttime})
              _this.startcountdown()
            }
            else
            {
              //已结束
              _this.setData({ activitystatus: 3})
            }


          }
          else {
           
            handlogin.handError(res,_this.getactivity)
          }
        }

      })
  },

  zhengce_tab: function () {
    console.log('zhengce')
    this.setData({
      showdetail: 1
    })

  },

  detail_tab: function () {
    console.log('detail')
    this.setData({
      showdetail: 2
    })

  },
  config_tab: function () {
    console.log('config')
    this.setData({
      showdetail: 3
    })
  },


getuserphone(){
  console.log('get phone')
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
        console.log(res)
        if (!res.data.err) {
          if (!res.data.phone) {
            _this.setData({hasphone:false})
          }
          else 
          {
            _this.setData({ hasphone: true })
          }
          if(res.data.name)
          {
            wx.setStorageSync('name',res.data.name)
          }
           
        }
        else {
          handlogin.handError(res, _this.getuserphone)
        }
      }

    })

  })
},

  zhengce_tab: function () {
    console.log('zhengce')
    this.setData({
      showdetail: 1
    })

  },

  detail_tab:function(){
    console.log('detail')
    this.setData({
      showdetail: 2
    })

  },
  config_tab: function () {
    console.log('config')
      this.setData({
        showdetail:3
      })
  },

  //产品
  getproduct(){
    console.log('getproduct')
    var _this=this

      handlogin.isLogin(()=>{
        wx.request({
          url: 'https://'+app.globalData.host+'/api/product',
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
              _this.getuserphone()
              _this.setData({selectedinfo:res.data.product.name})
              _this.setData({ product: res.data.product })
              _this.setData({price:res.data.product.price_origin})
              _this.getactivity()
              _this.setData({ creditdesc:'仅供展示，以'+res.data.product.price_origin/10000+'万元为基数'})
              _this.calprice()
              //清除定时任务 再开启
              clearInterval(_this.data.interval)
              console.log(res.data.version)
              wx.setStorageSync('picversion',res.data.version)
              _this.picchange()
              var interval = setInterval(function () { 
                  _this.getactivity()
               
              }, 30000) //循环 
              _this.setData({ interval: interval })
              
              //首次启动弹窗
              var indexshow = wx.getStorageSync('indexshow')

              if (!indexshow || indexshow == '') {
                _this.setData({ showmodal: true })
                _this.setData({ opacity: 0.1 })
                wx.setStorageSync('indexshow', 'showmodal')
              }
          
            }
            else {
              console.log(res)
              handlogin.handError(res,_this.getproduct)
            }
          },
          complete:function(res){
            wx.hideLoading()
          }
        })
      })
  },

  closemodal: function () {
    var _this = this
    _this.setData({ showmodal: false })
    if (_this.data.opacity == 0.1) {
      _this.setData({ opacity: 1 })
    }

  },

  //显示活动红包
  showhongbao: function () {
    var _this = this
    _this.setData({ showmodal: true })
    _this.setData({ opacity: 0.1 })
  },

//图片
// getpics(){
//   console.log('get-getpics')
//   var version = 'v001'
//   if (wx.getStorageSync('picversion'))
//   {
//     console.log(wx.getStorageSync('picversion'))
//     version = wx.getStorageSync('picversion')
//   }
    
//   //pics
//   var _this =this
//   wx.getFileInfo({
//     filePath: wx.env.USER_DATA_PATH + '/' + version+'top.jpg',
//     success: res => {
//       console.log('open loacl success')
//       _this.setData({ top: wx.env.USER_DATA_PATH + '/' + version +'top.jpg' })
//     },
//     fail: res => {
//       console.log('save')
//       app.saveindexfile('https://ping-1257242347.cos.ap-chongqing.myqcloud.com/' + version +'/truck.jpg', wx.env.USER_DATA_PATH + '/'  + version+'toppic.jpg')
//       _this.setData({ toppic: 'https://ping-1257242347.cos.ap-chongqing.myqcloud.com/' + version +'/truck.jpg' })
//     }
//   })

//   wx.getFileInfo({
//     filePath: wx.env.USER_DATA_PATH + '/' + version +'detail.jpg',
//     success: res => {
//       console.log('open loacl success')
//       _this.setData({ detail: wx.env.USER_DATA_PATH + '/' + version +'detail.jpg' })
//     },
//     fail: res => {
//       console.log('save')
//       app.saveindexfile('https://ping-1257242347.cos.ap-chongqing.myqcloud.com/' + version + '/detail.jpg', wx.env.USER_DATA_PATH + '/' + version +'detail.jpg')
//       _this.setData({ detail: 'https://ping-1257242347.cos.ap-chongqing.myqcloud.com/' + version +'/detail.jpg' })
//     }
//   })

//   wx.getFileInfo({
//     filePath: wx.env.USER_DATA_PATH + '/' + version +'zhengce.jpg',
//     success: res => {
//       console.log('open loacl success')
//       _this.setData({ zhengce: wx.env.USER_DATA_PATH + '/' + version +'zhengce.jpg' })
//     },
//     fail: res => {
//       console.log('save')
//       app.saveindexfile('https://ping-1257242347.cos.ap-chongqing.myqcloud.com/' + version + '/policy.jpg', wx.env.USER_DATA_PATH + '/' + version +'zhengce.jpg')
//       _this.setData({ zhengce: 'https://ping-1257242347.cos.ap-chongqing.myqcloud.com/' + version +'/policy.jpg' })
//     }
//   })

//   wx.getFileInfo({
//     filePath: wx.env.USER_DATA_PATH + '/' + version +'config.jpg',
//     success: res => {
//       console.log('open loacl success')
//       _this.setData({ config: wx.env.USER_DATA_PATH + '/' + version +'config.jpg' })
//     },
//     fail: res => {
//       console.log(res)
//       console.log('save')
//       app.saveindexfile('https://ping-1257242347.cos.ap-chongqing.myqcloud.com/' + version + '/config.jpg', wx.env.USER_DATA_PATH + '/' + version +'config.jpg')
//       _this.setData({ config: 'https://ping-1257242347.cos.ap-chongqing.myqcloud.com/' + version +'/config.jpg' })
//     }
//   })

//   wx.getFileInfo({
//     filePath: wx.env.USER_DATA_PATH + '/' + version + 'config.jpg',
//     success: res => {
//       console.log('open loacl success')
//       _this.setData({ config: wx.env.USER_DATA_PATH + '/' + version + 'config.jpg' })
//     },
//     fail: res => {
//       console.log(res)
//       console.log('save')
//       app.saveindexfile('https://ping-1257242347.cos.ap-chongqing.myqcloud.com/' + version + '/config.jpg', wx.env.USER_DATA_PATH + '/' + version + 'config.jpg')
//       _this.setData({ config: 'https://ping-1257242347.cos.ap-chongqing.myqcloud.com/' + version + '/config.jpg' })
//     }
//   })

// },


//拼团
getping(){
  console.log('get-pingp')
  var _this = this
  console.log('product_id')
  console.log(wx.getStorageSync('product_id'))
  //加载拼团
  wx.request({
    url: 'https://'+app.globalData.host+'/api/ping/currentPing',
    data: {
      'user_id': wx.getStorageSync('user_id'),
      's_id': wx.getStorageSync('s_id'),
      'product_id':wx.getStorageSync('product_id')
    },
    method: 'POST',
    header: {
      'content-type': 'application/json'
    }, // 设置请求的 header
    success: function (res) {
      console.log('pinginfo')
      console.log(res)
      console.log(res.data.ok != '0')
      if (!res.data.err && res.data.ok !='0') {
        var expire = res.data.ping.expire
        var ser_utc = res.data.server_ts
        var now_utc = Date.parse(new Date()) / 1000
        var dis_utc = ser_utc - now_utc
        console.log(res.data.ping.finish_num )
        console.log('---')
        console.log(ser_utc)
        console.log(expire)
        if (expire > ser_utc) {
          _this.setData({ hasping: true })
          var rules = res.data.ping.rules
          var finish_num = res.data.ping.finish_num
          var i = 0
          var bonus = 0
          for (i = 0; i < rules.length; i++) {
            if (finish_num >= rules[i].num) {
              bonus = rules[i].bonus;
            }
          }
          res.data.ping.bonus = bonus
          _this.setData({ ping: res.data.ping })
          console.log(dis_utc);
          _this.setData({ expire: res.data.ping.expire, ser_utc: res.data.server_ts, dis_utc: dis_utc })
          // 执行倒计时函数
          _this.countDown();
        }
        else {
          console.log('no hasping')
          _this.setData({ hasping: false })
        }

      }
      else
      {
        _this.setData({ hasping: false })
        handlogin.handError(res,_this.getping)
      }



    },
    fail:function(res){
      console.log('no hasping1')
      _this.setData({ hasping: false })
    },
    complete: function (res) {
      wx.hideLoading()
    }
    
  })

},

//下拉刷新
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh();
    this.getproduct();
   
  },

  //活动开始倒计时
  startcountdown:function(){
    var _this = this;
    var activitystart = this.data.activitystart

    clearTimeout(this.data.activitytimeout)
    let endTime = activitystart;
    let newTime = Date.parse(new Date());
    let startexpired = '';
    if (newTime / 1000  <= endTime) {
      // 对结束时间进行处理渲染到页面
      // console.log('countdwom')
      let obj = null;
      // 如果活动未结束，对时间进行处理

      let time = parseInt(endTime  - Date.parse(new Date()) / 1000);
      // 获取天、时、分、秒
      let day = parseInt(time / (60 * 60 * 24));
      let hou = parseInt(time % (60 * 60 * 24) / 3600);
      let min = parseInt(time % (60 * 60 * 24) % 3600 / 60);
      let sec = parseInt(time % (60 * 60 * 24) % 3600 % 60);
      obj = {
        day: this.timeFormat(day),
        hou: this.timeFormat(hou),
        min: this.timeFormat(min),
        sec: this.timeFormat(sec)
      }

      startexpired = obj.day + '天' + obj.hou + '小时' + obj.min + '分' + obj.sec + '秒'

      // 渲染，然后每隔一秒执行一次倒计时函数
      this.setData({ startexpired: startexpired })
      var activitytimeout = setTimeout(this.startcountdown, 1000);
      this.setData({ activitytimeout: activitytimeout })

      if (obj.day == '00' && obj.hou == '00' && obj.min == '00' && obj.sec == '05')
      {
        console.log('aaaaaa--')
        clearInterval(_this.data.activityping)
        var activityping = setInterval(function () {
          _this.getping()
          console.log('bbbb--')
        }, 1000) //循环 
        _this.setData({ activityping: activityping })
      }

    }
    else {
      this.setData({ activitystatus: 1 })
      this.getping()
      clearInterval(_this.data.activityping)
      this.setData({ hasping: true })

    }

  },

  timeFormat:function(param) {//小于10的格式化函数
    return param < 10 ? '0' + param : param;
  },

//开团倒计时
  countDown: function () {//倒计时函数
    clearTimeout(this.data.counttimeout)
    // 获取当前时间，同时得到活动结束时间数组
    let endTime = this.data.expire;
    let newTime = Date.parse(new Date());
    let expired = '';
    if (newTime / 1000 + this.data.dis_utc <= endTime) {
      // 对结束时间进行处理渲染到页面
     // console.log('countdwom')
      let obj = null;
      // 如果活动未结束，对时间进行处理

      let time = parseInt(endTime - this.data.dis_utc - Date.parse(new Date()) / 1000);
      // 获取天、时、分、秒
      let day = parseInt(time / (60 * 60 * 24));
      let hou = parseInt(time % (60 * 60 * 24) / 3600);
      let min = parseInt(time % (60 * 60 * 24) % 3600 / 60);
      let sec = parseInt(time % (60 * 60 * 24) % 3600 % 60);
      obj = {
        day: this.timeFormat(day),
        hou: this.timeFormat(hou),
        min: this.timeFormat(min),
        sec: this.timeFormat(sec)
      }

      expired = obj.day + '天' + obj.hou + '小时' + obj.min + '分' + obj.sec + '秒'

      // 渲染，然后每隔一秒执行一次倒计时函数
      this.setData({ expired: expired })
      //var countInterval = setInterval(function() {
     //   this.countDown
     // }, 1000)
      var counttimeout  = setTimeout(this.countDown, 1000);
      this.setData({ counttimeout: counttimeout})
      
    }
    else {
      this.setData({ hasping: false }) 
    }
  },

  //关闭弹窗
  close_tc:function(){
    var _this = this
    _this.setData({opacity:1})
    _this.setData({showwindow:false})
  },

  //配置切换
  setup_choice:function(e){
    console.log(e)
    var _this = this
    var setupid = e.currentTarget.dataset.setup_id
    
    //0,1可多选
    //小斗
    if(setupid ==0 || setupid ==1)
    {
      var setup = _this.data.setupid
      var setupinfo ={}
      var numinfo ={}
      console.log(_this.data.setupid[setupid])
      if(_this.data.setupid[setupid] == -1)
      {
        setupinfo["setupid["+setupid+"]"] = setupid
        numinfo["num"+setupid] =1
        console.log(setupinfo)
        _this.setData(setupinfo)
        
        _this.setData(numinfo)
        
      }
      else
      {
        setupinfo["setupid[" + setupid + "]"] = -1
        numinfo["num" + setupid] = 0
        _this.setData(setupinfo)
        _this.setData(numinfo)
       
      }
     
    }
   
    //大斗
    else if (setupid == 2 || setupid == 3 || setupid == 4 || setupid == 5)
    {
      var setup = _this.data.setupid
      var setupinfo = {}
      console.log(_this.data.setupid[setupid])
      if (_this.data.setupid[setupid] == -1) {
        //互斥
        setupinfo["setupid[" + setupid + "]"] = setupid
        console.log(setupinfo)
        _this.setData(setupinfo)
      

        //判断另一个状态
        var nosetupid = -1
        if(setupid ==2 )
        {
          nosetupid =3
        }
        else if(setupid == 3)
        {
          nosetupid = 2
        }
        else if (setupid == 4) {
          nosetupid = 5
        }

        else if (setupid == 5) {
          nosetupid = 4
        }

        if(_this.data.setupid[nosetupid] == nosetupid)
        {
          console.log('----')
          setupinfo["setupid[" + nosetupid + "]"] = -1
          _this.setData(setupinfo)
         
        }
        else
        {
          console.log('do nothing')
        }
      }
      else {
        setupinfo["setupid[" + setupid + "]"] = -1
        _this.setData(setupinfo)
      
      }
    }

    _this.calprice()
  },

num0_change:function(num){
  var _this = this

  var setupinfo = {}
  if (num > 0) {
    console.log(num)
    console.log()
    if (_this.data.setupid[0] == -1) {
      setupinfo["setupid[0]"] = 0
      _this.setData(setupinfo)
     
    }
    _this.setData({ num0: num })
  }
  else {
    _this.setData({ num0: 0 })
    setupinfo["setupid[0]"] = -1
    _this.setData(setupinfo)
  }
  _this.calprice()
},
  //填数量
  num0_input:function(e){
    var _this = this
    var num = e.detail.value
    _this.num0_change(num)
  },
  num0min:function(){
    var _this = this
    var num = _this.data.num0
    if(num>0)
    {
      num =num -1
    }
    else
    {
      num =0
    }
    _this.num0_change(num)
  },
  num0add: function () {
    var _this = this
    var num = _this.data.num0
    
      num = num+1
    
    _this.num0_change(num)
  },


  num1_change: function (num) {
    var _this = this

    var setupinfo = {}
    if (num > 0) {
      console.log(num)
      console.log()
      if (_this.data.setupid[1] == -1) {
        setupinfo["setupid[1]"] = 1
        _this.setData(setupinfo)

      }
      _this.setData({ num1: num })
    }
    else {
      _this.setData({ num1: 0 })
      setupinfo["setupid[1]"] = -1
      _this.setData(setupinfo)
    }
    _this.calprice()
  },
  //填数量
  num1_input: function (e) {
    var _this = this
    var num = e.detail.value
    _this.num1_change(num)
  },
  num1min: function () {
    var _this = this
    var num = _this.data.num1
    if (num > 0) {
      num = num - 1
    }
    else {
      num = 0
    }
    _this.num1_change(num)
  },
  num1add: function () {
    var _this = this
    var num = _this.data.num1

    num = num + 1

    _this.num1_change(num)
  },

  //参团
  joinpin:function(){
    var _this = this
    var pt_id = _this.data.ping._id
    var setupdetails = _this.data.setupdetails
    var price = _this.data.price
    var product_id = wx.getStorageSync('product_id')
    console.log('clear interval')
    clearInterval(_this.data.interval)
    clearTimeout(_this.data.counttimeout)
    clearTimeout(_this.data.activitytimeout)
    console.log(pt_id)
    wx.navigateTo({
      url: '../order_other/index?id=' + pt_id + '&setupdetails=' + JSON.stringify(setupdetails) + '&price='+price +'&product='+product_id
    })
  },
  

  //产品切换
  product_change:function(){
    var _this = this
    clearInterval(_this.data.interval)
    clearTimeout(_this.data.counttimeout)
    clearTimeout(_this.data.activitytimeout)

    var sy70c =  '5bda65617c65fac03d619994'
    var sy55u =  '5bda65617c65fac03d619993'
    if (wx.getStorageSync('product_id') == sy70c){
      wx.setStorageSync('product_id', sy55u)
    }
    else{
      wx.setStorageSync('product_id', sy70c)
    }
    _this.closemodal()
    _this.close_tc()
    _this.getproduct()
    _this.picchange()
    _this.setData({ setupid: [-1, -1, -1, -1, -1, -1]})
    _this.setData({num0:0})
    _this.setData({num1:0})
    _this.calprice()
  },

//计算价格
calprice:function(){
  var _this = this
  console.log(_this.data.product)
  var price  = _this.data.product.price_origin
  var selectedinfo = _this.data.product.name
  var setupdetail =new Array()
  console.log('selectinfo: '+selectedinfo)
  console.log("push")
  var setupdetails = []
  setupdetail = {
    desc: selectedinfo,
    num: 1
  }
  setupdetails.push(setupdetail)
  //30公分小斗
  if(_this.data.setupid[0] == 0)
  {
    var num0 = _this.data.num0
    price = price + (_this.data.product.setup[0].price * num0)
    selectedinfo = selectedinfo + "+" + _this.data.product.setup[0].desc+" x "+num0

    setupdetail = {
      desc: _this.data.product.setup[0].desc,
      num:num0
    }

    setupdetails.push(setupdetail)
  }
  //40公分小斗
  if (_this.data.setupid[1] == 1) {
    var num1 = _this.data.num1
    price = price + (_this.data.product.setup[1].price * num1)
    selectedinfo = selectedinfo + "+" + _this.data.product.setup[1].desc + " x " + num1
    setupdetail = {
      desc: _this.data.product.setup[1].desc,
      num: num1
    }

    setupdetails.push(setupdetail)

  }
  //换装加大斗
  if (_this.data.setupid[2] == 2) {
    price = price + _this.data.product.setup[2].price
    selectedinfo = selectedinfo + "+" + _this.data.product.setup[3].desc + " x 1"
    setupdetail = {
      desc: _this.data.product.setup[3].desc,
      num: 1
    }

    setupdetails.push(setupdetail)

  }
  //加大斗
  if (_this.data.setupid[3] == 3) {
    price = price + _this.data.product.setup[3].price
    selectedinfo = selectedinfo + "+" + _this.data.product.setup[3].desc + " x 1"
    setupdetail = {
      desc: _this.data.product.setup[3].desc,
      num: 1
    }

    setupdetails.push(setupdetail)

  }
  //破碎锤及管路
  if (_this.data.setupid[4] == 4) {
    price = price + _this.data.product.setup[4].price
    selectedinfo = selectedinfo + "+" + _this.data.product.setup[4].desc + " x 1"
    setupdetail = {
      desc: _this.data.product.setup[4].desc,
      num: 1
    }
    setupdetails.push(setupdetail)

  }
  //SYB40
  if (_this.data.setupid[5] == 5) {
    price = price + _this.data.product.setup[5].price
    selectedinfo = selectedinfo + "+" + _this.data.product.setup[5].desc + " x 1"
    setupdetail = {
      desc: _this.data.product.setup[5].desc,
      num: 1
    }
    setupdetails.push(setupdetail)
  }
  console.log(setupdetails)
  _this.setData({ setupdetails: setupdetails })
  _this.setData({price:price})
  _this.setData({ selectedinfo: selectedinfo})
},
  //change图片
  picchange: function () {
    var _this =this
    var version = wx.getStorageSync('picversion')
    if(!version) 
      version='v001'
    var product_id  = wx.getStorageSync('product_id')

//config
    wx.getFileInfo({
      filePath: wx.env.USER_DATA_PATH + '/' + version + '/'+product_id+'_config.jpg',
      success: res => {
        console.log('open loacl success')
        _this.setData({ config: wx.env.USER_DATA_PATH + '/' + version + '/' + product_id + '_config.jpg' })
      },
      fail: res => {
        console.log(res)
        console.log('save')
        app.saveindexfile(app.globalData.cdnhost + '/' + version + '/' + product_id + '_config.jpg',wx.env.USER_DATA_PATH + '/' + version + '/' + product_id + '_config.jpg')
        _this.setData({ config: app.globalData.cdnhost + '/' + version + '/' + product_id + '_config.jpg'})
      }
    })

    //政策
    wx.getFileInfo({
      filePath: wx.env.USER_DATA_PATH + '/' + version + '/' + product_id + '_zhengce.jpg',
      success: res => {
        console.log('open loacl success')
        _this.setData({ zhengce: wx.env.USER_DATA_PATH + '/' + version + '/' + product_id + '_zhengce.jpg' })
      },
      fail: res => {
        console.log(res)
        console.log('save')
        app.saveindexfile(app.globalData.cdnhost + '/' + version + '/' + product_id + '_zhengce.jpg', wx.env.USER_DATA_PATH + '/' + version + '/' + product_id + '_zhengce.jpg')
        _this.setData({ zhengce: app.globalData.cdnhost + '/' + version + '/' + product_id +'_zhengce.jpg' })
      }
    })


//detail
    wx.getFileInfo({
      filePath: wx.env.USER_DATA_PATH + '/' + version + '/' + product_id + '_detail.jpg',
      success: res => {
        console.log('open loacl success')
        _this.setData({ detail: wx.env.USER_DATA_PATH + '/' + version + '/' + product_id + '_detail.jpg' })
      },
      fail: res => {
        console.log(res)
        console.log('save')
        app.saveindexfile(app.globalData.cdnhost + '/' + version + '/' + product_id + '_detail.jpg', wx.env.USER_DATA_PATH + '/' + version + '/' + product_id + '_detail.jpg')
        _this.setData({ detail: app.globalData.cdnhost + '/' + version + '/' + product_id + '_detail.jpg' })
      }
    })
    
    //top
    wx.getFileInfo({
      filePath: wx.env.USER_DATA_PATH + '/' + version + '/' + product_id + '_top.jpg',
      success: res => {
        console.log('open loacl success')
        _this.setData({ toppic: wx.env.USER_DATA_PATH + '/' + version + '/' + product_id + '_top.jpg' })
      },
      fail: res => {
        console.log(res)
        console.log('save')
        console.log(app.globalData.cdnhost + '/' + version + '/' + product_id + '_top.jpg')
        app.saveindexfile(app.globalData.cdnhost + '/' + version + '/' + product_id + '_top.jpg', wx.env.USER_DATA_PATH + '/' + version + '/' + product_id + '_top.jpg')
        _this.setData({ toppic: app.globalData.cdnhost + '/' + version + '/' + product_id + '_top.jpg' })
      }
    })

  },

  /**
 * 用户点击右上角分享
 */
  onShareAppMessage: function () {
    //带用户ID 带拼团ID
    var user_id = wx.getStorageSync('user_id');
    var product_id = wx.getStorageSync('product_id');
    var name = wx.getStorageSync('name')
    var path = 'pages/index/index?userid=' + user_id +'&product_id='+product_id;
    var imgurl=''
    var sy70c = '5bda65617c65fac03d619994'
    var sy55u = '5bda65617c65fac03d619993'
    if (wx.getStorageSync('product_id') == sy70c) {
      imgurl='/images/share_70c.jpg'
    }
    else {
      imgurl = '/images/share_55u.jpg'
    }

    name = name.substring(0,4)
    return {
      title: '【' + name + '】喊你来拼团，' + '拼得越多，优惠越多',
      imageUrl: imgurl,
      path: path
    }
  }

})