Page({
    data: {
        currentDate: '2026-03-19',
        photoPath: '',
        visibility: 'we',
        content: ''
    },

    onLoad() {
        const now = new Date();
        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        this.setData({ currentDate: dateStr });
    },

    chooseImage() {
        wx.chooseImage({
            count: 1,
            success: (res) => {
                this.setData({ photoPath: res.tempFilePaths[0] });
            }
        });
    },

    onVisibilityChange(e) {
        this.setData({ visibility: e.detail.value });
    },

    onContentInput(e) {
        this.setData({ content: e.detail.value });
    },

    async saveNote() {
        if (!this.data.content && !this.data.photoPath) {
            wx.showToast({ title: '写点什么吧', icon: 'none' });
            return;
        }

        wx.showLoading({ title: '正在保存...' });

        try {
            let fileId = '';
            // 如果有图片，先上传到云存储
            if (this.data.photoPath) {
                const uploadRes = await wx.cloud.uploadFile({
                    cloudPath: `notes/${Date.now()}-${Math.floor(Math.random() * 1000)}.jpg`,
                    filePath: this.data.photoPath
                });
                fileId = uploadRes.fileID;
            }

            // 调用云函数保存到 ImgData 数据库
            await wx.cloud.callFunction({
                name: 'addNote',
                data: {
                    content: this.data.content,
                    fileId: fileId,
                    visibility: this.data.visibility,
                    date: this.data.currentDate
                }
            });

            wx.hideLoading();
            wx.showToast({ title: '保存成功' });
            setTimeout(() => {
                wx.navigateBack();
            }, 1500);
        } catch (e) {
            wx.hideLoading();
            console.error('保存失败', e);
            wx.showToast({ title: '保存失败', icon: 'error' });
        }
    }
})