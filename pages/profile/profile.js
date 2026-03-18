Page({
  data: {
    userInfo: null,
    defaultAvatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
  },
  onLoad() {
    // 从缓存获取用户信息
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({ userInfo })
    }
  },
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    const userInfo = this.data.userInfo || {}
    userInfo.avatarUrl = avatarUrl
    this.setData({ userInfo })
    this.saveUserInfo()
  },
  onInputNickname(e) {
    const nickName = e.detail.value
    const userInfo = this.data.userInfo || {}
    userInfo.nickName = nickName
    this.setData({ userInfo })
    this.saveUserInfo()
  },
  saveUserInfo() {
    if (this.data.userInfo) {
      wx.setStorageSync('userInfo', this.data.userInfo)
    }
  },
  logout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('userInfo')
          this.setData({ userInfo: null })
        }
      }
    })
  }
})
