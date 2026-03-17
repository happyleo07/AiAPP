Page({
  data: {
    userInfo: null,
    genderText: ''
  },
  getUserProfile() {
    wx.getUserProfile({
      desc: '用于完善个人资料',
      success: (res) => {
        const info = res.userInfo || null
        let genderText = ''
        if (info) {
          genderText = info.gender === 1 ? '男' : (info.gender === 2 ? '女' : '未知')
        }
        this.setData({
          userInfo: info,
          genderText
        })
      }
    })
  }
})
