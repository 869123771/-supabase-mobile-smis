export interface CapturedLocation {
  longitude: number
  latitude: number
  accuracyM?: number
  locationText?: string
  poiName?: string
  addressText?: string
}

interface AmapGeocoder {
  getAddress(location: [number, number], callback: (status: string, result: unknown) => void): void
}

export interface AmapMapHandle {
  destroy?: () => void
}

interface AmapApi {
  Geocoder?: new (options?: Record<string, unknown>) => AmapGeocoder
  Map?: new (container: string, options?: Record<string, unknown>) => AmapMapHandle & { add?: (overlay: unknown) => void }
  Marker?: new (options?: Record<string, unknown>) => unknown
  plugin?: (plugins: string[], callback: () => void) => void
}

declare global {
  interface Window {
    AMap?: AmapApi
    _AMapSecurityConfig?: { securityJsCode: string }
  }
}

let amapLoader: Promise<AmapApi> | undefined

export function getCurrentGcj02Location(): Promise<CapturedLocation> {
  // #ifdef H5
  return getBrowserLocation()
  // #endif

  // #ifndef H5
  return getNativeLocation()
  // #endif
}

function getNativeLocation(): Promise<CapturedLocation> {
  return new Promise((resolve, reject) => {
    const locate = () => {
      uni.getLocation({
        type: 'gcj02',
        geocode: true,
        isHighAccuracy: true,
        highAccuracyExpireTime: 12000,
        success(result) {
          const address = formatAddress(result.address)
          resolve({
            longitude: result.longitude,
            latitude: result.latitude,
            accuracyM: result.accuracy,
            ...address
          })
        },
        fail(error) {
          const raw = error.errMsg || ''
          reject(new Error(/auth deny|authorize|permission|denied/i.test(raw)
            ? '定位权限未开启，请在应用设置中允许访问位置后重试'
            : '暂时无法获取位置，请开启系统定位后重试'))
        }
      })
    }

    // #ifdef MP-WEIXIN
    uni.authorize({
      scope: 'scope.userLocation',
      success: locate,
      fail: () => reject(new Error('定位权限未开启，请在小程序设置中允许位置信息'))
    })
    // #endif

    // #ifndef MP-WEIXIN
    locate()
    // #endif
  })
}

function getBrowserLocation(): Promise<CapturedLocation> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('当前浏览器不支持定位，请使用手机系统浏览器打开'))
      return
    }
    if (!window.isSecureContext && window.location.hostname !== 'localhost') {
      reject(new Error('手机网页定位需要 HTTPS，请使用安全链接重新打开'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const [longitude, latitude] = wgs84ToGcj02(position.coords.longitude, position.coords.latitude)
        const address = await reverseGeocode(longitude, latitude)
        resolve({
          longitude,
          latitude,
          accuracyM: position.coords.accuracy,
          ...address
        })
      },
      (error) => {
        const messages: Record<number, string> = {
          1: '定位权限未开启，请在浏览器设置中允许访问位置',
          2: '暂时无法获取位置，请开启手机定位服务后重试',
          3: '定位超时，请移至开阔区域后重试'
        }
        reject(new Error(messages[error.code] || '定位失败，请稍后重试'))
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    )
  })
}

async function reverseGeocode(longitude: number, latitude: number) {
  const key = import.meta.env.VITE_AMAP_KEY
  if (!key) return undefined
  try {
    const AMap = await loadAmap(key)
    if (!AMap.Geocoder) return undefined
    const geocoder = new AMap.Geocoder({ extensions: 'all' })
    return await new Promise<ReturnType<typeof formatAddress>>((resolve) => {
      geocoder.getAddress([longitude, latitude], (status, result) => {
        if (status !== 'complete' || !result || typeof result !== 'object') {
          resolve(undefined)
          return
        }
        resolve(formatAddress((result as { regeocode?: unknown }).regeocode))
      })
    })
  } catch {
    return undefined
  }
}

function formatAddress(address: unknown) {
  if (typeof address === 'string') {
    const addressText = address.trim()
    return addressText ? { addressText, locationText: addressText } : undefined
  }
  if (!address || typeof address !== 'object') return undefined
  const value = address as Record<string, unknown>
  const formatted = [value.formattedAddress, value.formatted_address, value.address]
    .find((item): item is string => typeof item === 'string' && Boolean(item.trim()))
  const addressText = formatted?.trim() || [value.province, value.city, value.district, value.street, value.streetNum]
    .filter((item): item is string => typeof item === 'string' && Boolean(item.trim()))
    .join('') || undefined
  const pois = Array.isArray(value.pois) ? value.pois : []
  const firstPoi = pois.find((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
  const poiName = [value.poiName, firstPoi?.name]
    .find((item): item is string => typeof item === 'string' && Boolean(item.trim()))
    ?.trim()
  const locationText = poiName && addressText && !addressText.includes(poiName)
    ? `${poiName} · ${addressText}`
    : poiName || addressText
  return locationText ? { poiName, addressText, locationText } : undefined
}

function loadAmap(key: string): Promise<AmapApi> {
  if (window.AMap?.Geocoder) return Promise.resolve(window.AMap)
  if (amapLoader) return amapLoader

  const securityJsCode = import.meta.env.VITE_AMAP_SECURITY_JS_CODE
  if (securityJsCode) window._AMapSecurityConfig = { securityJsCode }

  amapLoader = new Promise<AmapApi>((resolve, reject) => {
    const finish = () => {
      const AMap = window.AMap
      if (!AMap) {
        reject(new Error('高德地图服务加载失败'))
        return
      }
      if (AMap.Geocoder) {
        resolve(AMap)
        return
      }
      AMap.plugin?.(['AMap.Geocoder'], () => AMap.Geocoder ? resolve(AMap) : reject(new Error('地址解析服务不可用')))
    }

    const existing = document.querySelector<HTMLScriptElement>('script[data-smis-amap-geocoder]')
    if (existing) {
      existing.addEventListener('load', finish, { once: true })
      existing.addEventListener('error', () => reject(new Error('高德地图服务加载失败')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.dataset.smisAmapGeocoder = 'true'
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${encodeURIComponent(key)}&plugin=AMap.Geocoder`
    script.async = true
    script.onload = finish
    script.onerror = () => reject(new Error('高德地图服务加载失败'))
    document.head.appendChild(script)
  }).catch((error) => {
    amapLoader = undefined
    throw error
  })

  return amapLoader
}

export async function createAmapPointMap(containerId: string, point: CapturedLocation): Promise<AmapMapHandle | undefined> {
  const key = import.meta.env.VITE_AMAP_KEY
  if (!key) return undefined
  const AMap = await loadAmap(key)
  if (!AMap.Map || !AMap.Marker) return undefined

  const map = new AMap.Map(containerId, {
    zoom: 16,
    center: [point.longitude, point.latitude],
    resizeEnable: true,
    dragEnable: true,
    zoomEnable: true,
    viewMode: '2D',
    features: ['bg', 'road', 'point']
  })
  const marker = new AMap.Marker({
    position: [point.longitude, point.latitude],
    title: point.poiName || point.locationText || '隐患位置',
    anchor: 'bottom-center'
  })
  map.add?.(marker)
  return map
}

function wgs84ToGcj02(longitude: number, latitude: number): [number, number] {
  if (longitude < 72.004 || longitude > 137.8347 || latitude < 0.8293 || latitude > 55.8271) {
    return [longitude, latitude]
  }
  const a = 6378245
  const eccentricity = 0.006693421622965943
  let latitudeOffset = transformLatitude(longitude - 105, latitude - 35)
  let longitudeOffset = transformLongitude(longitude - 105, latitude - 35)
  const radians = (latitude / 180) * Math.PI
  const magic = 1 - eccentricity * Math.sin(radians) ** 2
  const sqrtMagic = Math.sqrt(magic)
  latitudeOffset = (latitudeOffset * 180) / (((a * (1 - eccentricity)) / (magic * sqrtMagic)) * Math.PI)
  longitudeOffset = (longitudeOffset * 180) / ((a / sqrtMagic) * Math.cos(radians) * Math.PI)
  return [longitude + longitudeOffset, latitude + latitudeOffset]
}

function transformLatitude(longitude: number, latitude: number) {
  let value = -100 + 2 * longitude + 3 * latitude + 0.2 * latitude ** 2 + 0.1 * longitude * latitude + 0.2 * Math.sqrt(Math.abs(longitude))
  value += ((20 * Math.sin(6 * longitude * Math.PI) + 20 * Math.sin(2 * longitude * Math.PI)) * 2) / 3
  value += ((20 * Math.sin(latitude * Math.PI) + 40 * Math.sin((latitude / 3) * Math.PI)) * 2) / 3
  value += ((160 * Math.sin((latitude / 12) * Math.PI) + 320 * Math.sin((latitude * Math.PI) / 30)) * 2) / 3
  return value
}

function transformLongitude(longitude: number, latitude: number) {
  let value = 300 + longitude + 2 * latitude + 0.1 * longitude ** 2 + 0.1 * longitude * latitude + 0.1 * Math.sqrt(Math.abs(longitude))
  value += ((20 * Math.sin(6 * longitude * Math.PI) + 20 * Math.sin(2 * longitude * Math.PI)) * 2) / 3
  value += ((20 * Math.sin(longitude * Math.PI) + 40 * Math.sin((longitude / 3) * Math.PI)) * 2) / 3
  value += ((150 * Math.sin((longitude / 12) * Math.PI) + 300 * Math.sin((longitude / 30) * Math.PI)) * 2) / 3
  return value
}
