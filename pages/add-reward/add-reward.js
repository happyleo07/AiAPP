Page({
  data: {
    users: [
      { avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0' },
      { avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0' }
    ],
    selectedUser: 0,
    habits: [
      { icon: '💄', name: '涂口红！' },
      { icon: '🏃', name: '跑步' },
      { icon: '🪥', name: '刷牙' }
    ],
    selectedHabit: 0,
    rewardName: '',
    motivationalText: '',
    targetCount: 30
  },

  selectUser(e) {
    this.setData({ selectedUser: e.currentTarget.dataset.index });
  },

  selectHabit(e) {
    this.setData({ selectedHabit: e.currentTarget.dataset.index });
  },

  onRewardInput(e) {
    this.setData({ rewardName: e.detail.value });
  },

  onMottoInput(e) {
    this.setData({ motivationalText: e.detail.value });
  },

  onCountChange(e) {
    this.setData({ targetCount: e.detail.value });
  },

  saveReward() {
    if (!this.data.rewardName) {
      wx.showToast({ title: '请输入奖励名称', icon: 'none' });
      return;
    }
    wx.showToast({ title: '保存成功' });
    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  }
})