App({
    onLaunch() {
        if (!wx.cloud) {
            console.error('请使用 2.2.3 或以上的基础库以使用云能力')
        } else {
            wx.cloud.init({
                // 请在下方引号内填入你的云开发环境 ID (可在云开发控制台概览页查看)
                env: 'cloud1-8g58b87z753b496c',
                traceUser: true,
            })
        }
    }
})