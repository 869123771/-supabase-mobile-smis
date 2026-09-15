export function chooseImages(count = 3) {
  return new Promise<string[]>((resolve, reject) => {
    uni.chooseImage({
      count: Math.max(1, count),
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success(result) {
        const paths = result.tempFilePaths
        resolve(Array.isArray(paths) ? paths : paths ? [paths] : [])
      },
      fail(error) {
        if (error.errMsg?.toLowerCase().includes('cancel')) {
          resolve([])
          return
        }
        reject(new Error(error.errMsg || '选择照片失败'))
      }
    })
  })
}
