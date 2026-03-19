Page({
    data: {
        activeTab: 'square',
        notes: [],
        page: 0
    },
    onLoad() {
        this.loadNotes(true);
    },
    onShow() {
        if (this.data.activeTab === 'square') {
            this.loadNotes();
        }
    },
    switchTab(e) {
        const tab = e.currentTarget.dataset.tab;
        this.setData({ activeTab: tab });
        if (tab === 'square') {
            this.loadNotes(true);
        }
    },
    loadNotes(reset = false) {
        if (reset) {
            this.setData({ page: 0, notes: [] });
        }
        const db = wx.cloud.database();
        db.collection('ImgData')
            .orderBy('createTime', 'desc')
            .skip(this.data.page * 10)
            .limit(10)
            .get()
            .then(res => {
                this.setData({
                    notes: reset ? res.data : [...this.data.notes, ...res.data],
                    page: this.data.page + 1
                });
            });
    },
    downloadImage(e) {
        const url = e.currentTarget.dataset.url;
        wx.showActionSheet({
            itemList: ['保存图片到相册'],
            success: (res) => {
                if (res.tapIndex === 0) {
                    wx.showLoading({ title: '保存中...' });
                    wx.cloud.downloadFile({
                        fileID: url,
                        success: res => {
                            wx.saveImageToPhotosAlbum({
                                filePath: res.tempFilePath,
                                success: () => {
                                    wx.hideLoading();
                                    wx.showToast({ title: '已保存到相册' });
                                },
                                fail: (err) => {
                                    wx.hideLoading();
                                    if (err.errMsg.includes('auth deny')) {
                                        wx.showModal({
                                            title: '提示',
                                            content: '需要您的相册授权才能保存图片',
                                            showCancel: false
                                        });
                                    }
                                }
                            });
                        }
                    });
                }
            }
        });
    },
    navToAddHabit() {
        wx.navigateTo({
            url: '/pages/add-habit/add-habit',
        })
    },
    navToAddNote() {
        wx.navigateTo({
            url: '/pages/add-note/add-note',
        })
    },
    navToAddReward() {
        wx.navigateTo({
            url: '/pages/add-reward/add-reward',
        })
    }
})