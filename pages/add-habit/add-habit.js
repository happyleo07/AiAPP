Page({
  data: {
    icons1: ['☀️', '📺', '⏰', '🪥', '🍺', '💻', '🏃', '🐹', '👨‍🍳', '🚲', '🎮', '🎬', '📓', '🧘', '🍵', '🎸', '🍰', '💡', '📱', '💊', '😴', '🚲', '💰', '⚽️'],
    icons2: ['🎨', '🎭', '🎬', '🎤', '🎧', '🎷', '🎸', '🎹', '🎻', '🎲', '♟️', '🎯', '🎳', '🎮', '🎰', '🚣', '🏊', '🏄', '🛀', '🛌', '🏋️', '🚴', '🚵', '🤸'],
    selectedIcon: '☀️',
    habitName: '',
    weekdays: [
      { name: '一', selected: true },
      { name: '二', selected: true },
      { name: '三', selected: true },
      { name: '四', selected: true },
      { name: '五', selected: true },
      { name: '六', selected: true },
      { name: '日', selected: true }
    ],
    deadline: ''
  },

  selectIcon(e) {
    this.setData({ selectedIcon: e.currentTarget.dataset.icon });
  },

  onNameInput(e) {
    this.setData({ habitName: e.detail.value });
  },

  onDeadlineInput(e) {
    this.setData({ deadline: e.detail.value });
  },

  toggleDay(e) {
    const index = e.currentTarget.dataset.index;
    const weekdays = this.data.weekdays;
    weekdays[index].selected = !weekdays[index].selected;
    this.setData({ weekdays });
  },

  saveHabit() {
    if (!this.data.habitName) {
      wx.showToast({ title: '请输入习惯名称', icon: 'none' });
      return;
    }
    // 这里可以添加保存到数据库的逻辑
    wx.showToast({ title: '保存成功' });
    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  }
})