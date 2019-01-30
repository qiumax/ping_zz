// pages/policy/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var _this =this
    var version = 'v001'
    if (wx.getStorageSync('picversion')) {
      console.log(wx.getStorageSync('picversion'))
      version = wx.getStorageSync('picversion')
    }
    //政策
    wx.getFileInfo({
      filePath: wx.env.USER_DATA_PATH + '/' + version + '/' + 'zhengce.jpg',
      success: res => {
        console.log('open loacl success')
        _this.setData({ zhengce: wx.env.USER_DATA_PATH + '/' + version + '/' + 'zhengce.jpg' })
      },
      fail: res => {
        console.log(res)
        console.log('save')
        app.saveindexfile(app.globalData.cdnhost + '/' + version + '/' + 'zhengce.jpg', wx.env.USER_DATA_PATH + '/' + version + '/' + 'zhengce.jpg')
        _this.setData({ zhengce: app.globalData.cdnhost + '/' + version + '/' + 'zhengce.jpg' })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})