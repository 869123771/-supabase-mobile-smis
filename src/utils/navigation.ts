export function go(url: string) { uni.navigateTo({ url }) }
export function relaunch(url: string) { uni.reLaunch({ url }) }
export function back() {
  const pages = getCurrentPages()
  pages.length > 1 ? uni.navigateBack() : uni.reLaunch({ url: '/pages/home/index' })
}
