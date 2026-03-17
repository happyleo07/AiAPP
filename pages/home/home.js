Page({
  data: {
    latitude: 0,
    longitude: 0,
    markers: [],
    hasLocation: false
  },
  onLoad() {
    this.getLocation()
  },
  getLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        const latitude = res.latitude
        const longitude = res.longitude
        this.setData({
          latitude,
          longitude,
          markers: [{
            id: 1,
            latitude,
            longitude,
            width: 28,
            height: 28
          }],
          hasLocation: true
        })
      },
      fail: () => {
        this.setData({ hasLocation: false })
      }
    })
  },
  openMap() {
    if (!this.data.hasLocation) return
    wx.openLocation({
      latitude: this.data.latitude,
      longitude: this.data.longitude,
      name: '当前位置',
      scale: 18
    })
  }
})
