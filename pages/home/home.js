Page({
    data: {
        latitude: 0,
        longitude: 0,
        markers: [],
        hasLocation: false,
        db: null,
        showEditModal: false,
        editingMarkerName: '',
        editingMarkerId: '',
        isSpecialUser: false
    },
    onLoad() {
        try {
            this.db = wx.cloud.database();
            this.checkUserOpenId();
            this.getLocation();
        } catch (e) {
            console.error('数据库初始化失败', e);
            wx.showModal({
                title: '初始化失败',
                content: '请检查是否已在微信开发者工具中开通“云开发”功能',
                showCancel: false
            });
        }
    },
    async checkUserOpenId() {
        try {
            const res = await wx.cloud.callFunction({
                name: 'login' // 假设你有一个名为 login 的云函数来获取 openid
            });
            const openid = res.result.openid;
            const specialOpenId = 'o2GwX0TRL-VXXULZ3QDZTjs_IEpw';
            if (openid === specialOpenId) {
                this.setData({ isSpecialUser: true });
                // 重新渲染当前位置标记
                this.getLocation();
            }
        } catch (e) {
            // 如果没有云函数，可以尝试通过其他方式获取或在测试时手动设置
            // console.error('获取 openid 失败', e);
        }
    },
    loadMarkers() {
        if (!this.db) return;
        wx.showLoading({ title: '加载标记中' });
        this.db.collection('markers').get().then(res => {
            const dbMarkers = res.data.map(m => ({
                id: m._id,
                latitude: m.latitude,
                longitude: m.longitude,
                title: m.name,
                iconPath: '/images/marker.png',
                width: 32,
                height: 32,
                callout: {
                    content: m.name,
                    padding: 6,
                    borderRadius: 4,
                    display: 'ALWAYS'
                }
            }));

            const currentLocation = this.data.markers.find(m => m.id === 'current_location');
            const newMarkers = currentLocation ? [currentLocation, ...dbMarkers] : dbMarkers;

            this.setData({ markers: newMarkers });
            wx.hideLoading();
        }).catch(err => {
            wx.hideLoading();
            console.error('获取标记失败', err);
            if (err.errMsg.includes('collection.get:fail')) {
                wx.showModal({
                    title: '加载失败',
                    content: '请确认已在云开发控制台创建了名为 "markers" 的集合',
                    showCancel: false
                });
            }
        });
    },
    getLocation() {
        wx.getLocation({
            type: 'gcj02',
            success: (res) => {
                const latitude = res.latitude
                const longitude = res.longitude
                const isSpecialUser = this.data.isSpecialUser;
                const currentMarker = {
                    id: 'current_location',
                    latitude,
                    longitude,
                    iconPath: isSpecialUser ? '/images/monkey.png' : '', // 如果是特殊用户展示猴子，否则不设置 iconPath (使用默认定位点)
                    width: isSpecialUser ? 40 : 28,
                    height: isSpecialUser ? 40 : 28,
                    title: '我的位置',
                    callout: {
                        content: '您在这里\n点击导航',
                        padding: 8,
                        borderRadius: 4,
                        display: 'ALWAYS',
                        bgColor: '#ffffff',
                        fontSize: 12,
                        textAlign: 'center'
                    }
                };
                this.setData({
                    latitude,
                    longitude,
                    markers: [currentMarker],
                    hasLocation: true
                });
                this.loadMarkers();
            },
            fail: () => {
                this.setData({ hasLocation: false });
                this.loadMarkers();
            }
        })
    },
    addMarker(e) {
        if (!this.db) {
            wx.showToast({ title: '数据库未就绪', icon: 'error' });
            return;
        }
        const { latitude, longitude } = e.detail;
        wx.showModal({
            title: '添加新标记',
            content: '请为此位置输入名称',
            editable: true,
            placeholderText: '例如：我的秘密基地',
            confirmText: '保存',
            cancelText: '取消',
            showCancel: true,
            success: (res) => {
                if (res.confirm && res.content) {
                    const markerName = res.content;
                    wx.showLoading({ title: '保存中' });
                    this.db.collection('markers').add({
                        data: {
                            name: markerName,
                            latitude,
                            longitude,
                            createTime: this.db.serverDate()
                        }
                    }).then(dbRes => {
                        const newMarker = {
                            id: dbRes._id,
                            latitude,
                            longitude,
                            iconPath: '/images/marker.png',
                            width: 32,
                            height: 32,
                            title: markerName,
                            callout: {
                                content: markerName,
                                padding: 6,
                                borderRadius: 4,
                                display: 'ALWAYS'
                            }
                        };
                        this.setData({
                            markers: [...this.data.markers, newMarker]
                        });
                        wx.hideLoading();
                        wx.showToast({ title: '保存成功' });
                    }).catch(err => {
                        wx.hideLoading();
                        console.error('保存具体错误', err);
                        let errorMsg = '保存失败，请检查网络';
                        if (err.errMsg.includes('collection.add:fail')) {
                            errorMsg = '请检查是否已创建 "markers" 集合及权限设置';
                        }
                        wx.showModal({
                            title: '保存失败',
                            content: errorMsg + '\n\n详情: ' + err.errMsg,
                            showCancel: false
                        });
                    });
                }
            }
        });
    },
    onMarkerTap(e) {
        const markerId = e.detail.markerId;
        if (markerId === 'current_location') return;

        const marker = this.data.markers.find(m => m.id === markerId);
        if (marker) {
            this.setData({
                showEditModal: true,
                editingMarkerId: markerId,
                editingMarkerName: marker.title
            });
        }
    },
    closeEditModal() {
        this.setData({ showEditModal: false });
    },
    stopBubble() {},
    onInputMarkerName(e) {
        this.setData({ editingMarkerName: e.detail.value });
    },
    updateMarkerName() {
        const { editingMarkerId, editingMarkerName } = this.data;
        if (!editingMarkerName) {
            wx.showToast({ title: '名称不能为空', icon: 'none' });
            return;
        }
        wx.showLoading({ title: '更新中' });
        this.db.collection('markers').doc(editingMarkerId).update({
            data: { name: editingMarkerName }
        }).then(() => {
            const updatedMarkers = this.data.markers.map(m => {
                if (m.id === editingMarkerId) {
                    return {...m, title: editingMarkerName, callout: {...m.callout, content: editingMarkerName } };
                }
                return m;
            });
            this.setData({
                markers: updatedMarkers,
                showEditModal: false
            });
            wx.hideLoading();
            wx.showToast({ title: '更新成功' });
        }).catch(err => {
            wx.hideLoading();
            console.error('更新失败', err);
        });
    },
    deleteMarker() {
        const { editingMarkerId } = this.data;
        wx.showModal({
            title: '确认删除',
            content: '确定要删除这个标记吗？',
            success: (res) => {
                if (res.confirm) {
                    wx.showLoading({ title: '删除中' });
                    this.db.collection('markers').doc(editingMarkerId).remove().then(() => {
                        const remainingMarkers = this.data.markers.filter(m => m.id !== editingMarkerId);
                        this.setData({
                            markers: remainingMarkers,
                            showEditModal: false
                        });
                        wx.hideLoading();
                        wx.showToast({ title: '已删除' });
                    }).catch(err => {
                        wx.hideLoading();
                        console.error('删除失败', err);
                    });
                }
            }
        });
    },
    navToMarker() {
        const { editingMarkerId, markers } = this.data;
        const marker = markers.find(m => m.id === editingMarkerId);
        if (marker) {
            wx.openLocation({
                latitude: marker.latitude,
                longitude: marker.longitude,
                name: marker.title,
                address: '选定的标记位置',
                scale: 18,
                success: () => {
                    this.closeEditModal();
                }
            });
        }
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