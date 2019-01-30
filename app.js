//app.js
var util = require('./utils/util.js');
App({
  
  onLaunch: function (options) {

    

    console.log('onLauch');

    console.log('options');
    console.log(options);

    if (options.scene == 1044) {
      console.log(options.shareTicket)
    }

    //基础库版本
    wx.getSystemInfo({
      success(res) {
        console.log(util.compareVersion(res.SDKVersion, '1.9.9'))
        if (util.compareVersion(res.SDKVersion, '1.9.9') < 0)   
        wx.showModal({
          title: '提示',
          content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
        })      
      }
    })

/*
    if (wx.canIUse('getUpdateManager')) {
        const updateManager = wx.getUpdateManager()

        updateManager.onCheckForUpdate(function (res) {
          // 请求完新版本信息的回调
          console.log(res.hasUpdate)
        })
        updateManager.onUpdateReady(function () {
          wx.showModal({
            title: '更新提示',
            content: '新版本已经准备好，是否重启应用？',
            success: function (res) {
              if (res.confirm) {
                // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                updateManager.applyUpdate()
              }
            }
          })
        })

      updateManager.onUpdateFailed(function () {
        // 新的版本下载失败
        wx.showModal({
          title: '更新提示',
          content: '新版本下载失败，请重试',
          showCancel: false
        })
      })
        
    }
    else{

      wx.showModal({
        title: '提示1',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })

    }
*/
    // 登录
    //wx.login({
    //  success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
    //    console.log(res);
    //  }
    //})
    // 获取用户信息
    // wx.getSetting({
    //   success: res => {
    //     console.log(res)
    //     if (res.authSetting['scope.userInfo']) {
    //       console.log('1')
    //       // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
    //       wx.getUserInfo({
    //         success: res => {
    //           console.log(2);
    //           console.log(res);

    //           // 可以将 res 发送给后台解码出 unionId
    //           this.globalData.userInfo = res.userInfo

    //           // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
    //           // 所以此处加入 callback 以防止这种情况
    //           if (this.userInfoReadyCallback) {
    //             console.log('hhh');
    //             this.userInfoReadyCallback(res)
    //           }
    //         }
    //       })
    //     }
    //   }
    // })

    console.log('onlanch end');
  },

  globalData: {
    userInfo: null,
    accesstoken: null,
    logged_in: 0,
    host: 'ping-zzxy.quxunbao.cn',
    cdnhost:'https://ping-1258589173.cos.ap-shanghai.myqcloud.com'

  },


  getUseridandSess: function(userinfo,userid) {
    return new Promise(function (resolve, reject) {
    console.log('getUseridandSess');
    //console.log(userinfo)
    //console.log(userid)
    wx.showLoading({
      title: '正在登录...',
      mask: true,
      icon: 'loading'
    });

      wx.login({
        success: res => {
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
        //  console.log(res);
          if (res.code) {
            var code = res.code;

            //请求服务器
            wx.request({
              url: "https://"+this.globalData.host+"/wx/getWxUserInfo",
              data: {
                code: code,
                refer_id:userid,
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
                wx.hideLoading();
                try {
                  wx.setStorageSync('user_id', res.data.user_id);
                } catch (e) { console.log(e) }
                wx.setStorageSync('s_id', res.data.s_id);
                wx.setStorageSync('name', userinfo.nickName);
                wx.setStorageSync('avatar', userinfo.avatarUrl);
                
                resolve(res);
              },
              fail: function () {
                // fail
                wx.hideToast();
              },
              complete: function () {
                // complete
              }
            })
          }
        }
      })}
    )
 },

//获取用户所有的拼团
 getUserpings:function(){
   let that = this
   return new Promise(function (resolve, reject) {
   wx.request({
     url: 'https://' + that.globalData.host+'/api/user/userpings',
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
       var pings =[]
       
      if(res)
      {
        var m = 0
        res.data.forEach((v,k)=>{
         
          //获取当前拼团 人数对应的优惠金额
         
         var rules = v.ping_id.rules
          var finish_num = v.ping_id.finish_num
          var i = 0
          var bonus = 0
          for (i = 0; i < rules.length; i++) {
            if (finish_num >= rules[i].num) {
              bonus = rules[i].bonus;
            }
          }
          v.ping_id.bonus = bonus
          v.ping_id.expired = util.calRemaintime(v.ping_id.expire)
          
          that.getavatarsfrompingid(v.ping_id._id).then(function(resavatar){
            v.avatars = resavatar.data 
           pings.push(v)
           //console.log(res.data.length)
          // console.log(k+1)
            m= m+1
            console.log("m--k:"+m+"---"+k)
            console.log(res.data.length)
           if(res.data.length == m)
           {
             console.log('resove ok')
             resolve(res);
           }
            
          })

        })

        console.log('resove none ok')
      }
      

     },
     complete: function (res) {
       wx.hideNavigationBarLoading()
       wx.hideLoading()
     }

   })
   })
 },

//获取用户单个拼团信息
  getUserping: function (user_ping_id) {
    let that = this
    return new Promise(function (resolve, reject) {
      wx.request({
        url: 'https://' + that.globalData.host +'/api/user/userping',
        data: {
          'user_ping_id': user_ping_id,
          'user_id': wx.getStorageSync('user_id'),
          's_id': wx.getStorageSync('s_id'),
        },
        method: 'POST',
        header: {
          'content-type': 'application/json'
        }, // 设置请求的 header
        success: function (res) {



          //获取当前拼团 人数对应的优惠金额
   
          var rules = res.data.ping_id.rules
          var finish_num = res.data.ping_id.finish_num
           var i = 0
           var bonus = 0
           for (i = 0; i < rules.length; i++) {
             if (finish_num >= rules[i].num) {
               bonus = rules[i].bonus;
             }
           }
          res.data.ping_id.bonus = bonus
          res.data.ping_id.expired = util.calRemaintime(res.data.ping_id.expire)

          console.log(res)
          resolve(res);

        },
        complete: function (res) {
          wx.hideNavigationBarLoading()
          wx.hideLoading()
        }

      })
    })
  },


  //获取用户信息
  getUserinfo: function (user_ping_id) {
    let that = this
    return new Promise(function (resolve, reject) {
      wx.request({
        url: 'https://'+that.globalData.host+'/api/user/userinfo',
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
          resolve(res);

        },
        complete: function (res) {
          wx.hideNavigationBarLoading()
          wx.hideLoading()
        }

      })
    })
  },

//根据id获取拼团信息
 getpingInfo:function(pingid){
   let that = this
   return new Promise(function (resolve, reject) {
   wx.request({
     url: 'https://'+that.globalData.host+'/api/ping',
     data: {
       //'id': '5bdc1892fbc5b0186164bb86',
       'id': pingid,
       'user_id': wx.getStorageSync('user_id'),
       's_id': wx.getStorageSync('s_id'),
     },
     method: 'POST',
     header: {
       'content-type': 'application/json'
     }, // 设置请求的 header
     success: function (res) {
       console.log(res.data);
       //计算拼团剩余时间
       var expire = parseInt(res.data[0].expire - Date.parse(new Date()) / 1000);
       var day = 0
       var hour = 0
       var minute = 0
       var second = 0
       //
       day = parseInt(expire / 86400)
       hour = parseInt(expire % 86400 / 3600)
       minute = parseInt(expire % 86400 % 3600 / 60)
       second = parseInt(expire % 86400 % 3600 % 60)
       var expire
       expire = day > 0 ? (day.toString() + "天") : ''

       expire = expire + (hour > 0 ? (hour.toString() + "小时") : '')

       expire = expire + (minute > 0 ? (minute.toString() + "分") : '')
       expire = expire + (second > 0 ? (second.toString() + "秒") : '')
      if(day==0 && hour==0 && minute==0 && second==0)
      {
        expire=0
      }
       res.data[0]['expired'] = expire


       //获取当前拼团 人数对应的优惠金额
       var rules = res.data[0].rules
       var finish_num = res.data[0].finish_num
       var i = 0
       var bonus = 0
       for (i = 0; i < rules.length; i++) {
         if (finish_num >= rules[i].num) {
           bonus = rules[i].bonus;
         }
       }
       res.data[0].bonus = bonus

       resolve(res);
     },
     complete: function (res) {
       wx.hideNavigationBarLoading()
       wx.hideLoading()
     }

   })
   })
 },


//根据拼团id获取头像信息
getavatarsfrompingid:function(pingid){
  let that = this
  return new Promise(function (resolve, reject) {
    wx.request({

      url: 'https://' + that.globalData.host +'/api/ping/avatars',
      data: {
        'ping_id': pingid,
        'user_id': wx.getStorageSync('user_id'),
        's_id': wx.getStorageSync('s_id'),
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      }, // 设置请求的 header
      success: function (res) {
       // console.log(res.data);
        var i = 4
        var len =  res.data.length
       // console.log(len)
        for (i = 4; i >= len; i--) {
          res.data.push('/images/nobody.png')
        }
        resolve(res);
      },
      complete: function (res) {
        wx.hideNavigationBarLoading()
        wx.hideLoading()
      }

    })

  })
},

  checkUserLogin() {
    var user_id = wx.getStorageSync('user_id');
    var s_id = wx.getStorageSync('s_id');
    if (!user_id || !s_id || !this.globalData.userInfo) {
      return false;
      console.log('false')
    }
    else {
      return true;
      console.log('true')
    }

  },

  
  //accesstoken






saveindexfile:function(url,name){
  wx.downloadFile({
    url:url,
    success(res){
      var fs = wx.getFileSystemManager()
      fs.saveFile({
        tempFilePath: res.tempFilePath,
        filePath: name,
        success: res => {
          console.log('save sucess')
        },
        fail: res => {
          console.log(res)
          console.log('save failed')
        }
      })
    }
  })
  
}
  
})