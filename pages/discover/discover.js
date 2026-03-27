Page({
    data: {
        activeTab: 'square',
        notes: [],
        page: 0,
        openid: '',
        loading: false,
        hasMore: true
    },
    onLoad() {
        this.getUserOpenid();
        this.loadNotes(true);
    },
    getUserOpenid() {
        wx.cloud.callFunction({
            name: 'login'
        }).then(res => {
            this.setData({ openid: res.result.openid });
        });
    },
    onShow() {
        if (this.data.activeTab === 'square') {
            this.loadNotes(true);
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
        if (this.data.loading || (!reset && !this.data.hasMore)) return;

        this.setData({ loading: true });

        if (reset) {
            this.setData({ page: 0, notes: [], hasMore: true });
        }

        const db = wx.cloud.database();
        db.collection('ImgData')
            .orderBy('createTime', 'desc')
            .skip(this.data.page * 10)
            .limit(10)
            .get()
            .then(res => {
                const newNotes = res.data;
                this.setData({
                    notes: reset ? newNotes : [...this.data.notes, ...newNotes],
                    page: this.data.page + 1,
                    loading: false,
                    hasMore: newNotes.length === 10
                });
            })
            .catch(err => {
                console.error('加载随笔失败', err);
                this.setData({ loading: false });
            });
    },
    loadMoreNotes() {
        this.loadNotes();
    },
    previewImage(e) {
        const url = e.currentTarget.dataset.url;
        wx.previewImage({
            urls: [url],
            current: url
        });
    },
    deleteNote(e) {
        const { id, fileid } = e.currentTarget.dataset;
        wx.showModal({
            title: '提示',
            content: '确定要删除这条随笔吗？',
            success: (res) => {
                if (res.confirm) {
                    wx.showLoading({ title: '删除中...' });
                    const db = wx.cloud.database();
                    db.collection('ImgData').doc(id).remove().then(() => {
                        // 如果有图片，删除云存储中的图片
                        if (fileid) {
                            wx.cloud.deleteFile({
                                fileList: [fileid]
                            });
                        }
                        wx.hideLoading();
                        wx.showToast({ title: '删除成功' });
                        this.loadNotes(true);
                    }).catch(err => {
                        wx.hideLoading();
                        wx.showToast({ title: '删除失败', icon: 'none' });
                        console.error('删除失败', err);
                    });
                }
            }
        });
    },
    editNote(e) {
        const { id, content } = e.currentTarget.dataset;
        wx.showModal({
            title: '编辑随笔',
            editable: true,
            placeholderText: '请输入随笔内容',
            content: content,
            success: (res) => {
                if (res.confirm) {
                    if (!res.content.trim()) {
                        wx.showToast({ title: '内容不能为空', icon: 'none' });
                        return;
                    }
                    wx.showLoading({ title: '修改中...' });
                    const db = wx.cloud.database();
                    db.collection('ImgData').doc(id).update({
                        data: {
                            content: res.content
                        }
                    }).then(() => {
                        wx.hideLoading();
                        wx.showToast({ title: '修改成功' });
                        this.loadNotes(true);
                    }).catch(err => {
                        wx.hideLoading();
                        wx.showToast({ title: '修改失败', icon: 'none' });
                        console.error('修改失败', err);
                    });
                }
            }
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