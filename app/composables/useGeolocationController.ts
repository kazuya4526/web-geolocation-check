import JSZip from 'jszip'

/**
 * 位置情報の測位や加速度の取得を制御するComposable
 */
export const useGeolocationController = () => {
  const geolocationStore = useGeolocationStore()
  const { getCurrentPosition, startWatchingPosition, startWatchingAcceleration } = useGeolocationLogic()

  /**
   * getCurrentPositionで位置情報の測位を開始する
   *
   * @param interval 位置情報の取得を繰り返す間隔（ミリ秒）
   * @param enableHighAccuracy 高精度な位置情報を取得するかどうか
   * @param timeout 位置情報の取得にかかる最大時間（ミリ秒）
   * @param maximumAge キャッシュされた位置情報を許可する時間（ミリ秒）
   */
  const startGeolocationByGetCurrentPosition = (
    interval = 1000,
    enableHighAccuracy = true,
    timeout = 5000,
    maximumAge = 0,
  ) => {
    // intervalの間隔でgetCurrentPositionを呼び出すための再帰的な関数
    // 前回の実行から最低1秒は空ける。1秒以上かかる場合は次の呼び出しを即座に行う
    const setTimeoutCallback = async () => {
      if (!geolocationStore.isTracking) {
        return
      }
      const startTime = Date.now()
      await getCurrentPosition(enableHighAccuracy, timeout, maximumAge)
      const elapsedTime = Date.now() - startTime
      setTimeout(setTimeoutCallback, Math.max(0, interval - elapsedTime))
    }

    // 最初の呼び出しは即座に実行する
    setTimeout(setTimeoutCallback, 0)
  }

  /**
   * 最新の位置情報を指定間隔でサンプリングして更新する
   *
   * @param interval サンプリングの間隔（ミリ秒）
   */
  const startSamplingPosition = (
    interval = 1000,
  ) => {
    geolocationStore.samplingIntervalTimeout = setInterval(() => {
      // 測位が開始されていない場合はサンプリングを行わない
      if (!geolocationStore.isTracking) {
        return
      }

      // 最新の位置情報をサンプル履歴として保存する
      geolocationStore.samples.getCurrentPositionResults.push({
        samplingDatetime: new Date(),
        result: geolocationStore.latest.getCurrentPositionResult,
      })
      geolocationStore.samples.watchPositionResults.push({
        samplingDatetime: new Date(),
        result: geolocationStore.latest.watchPositionResult,
      })
      geolocationStore.samples.accelerationSamples.push({
        samplingDatetime: new Date(),
        result: geolocationStore.latest.acceleration,
      })

      // 最新の位置情報をサンプルの最新として保存する
      geolocationStore.samplesLatest.getCurrentPositionResult = geolocationStore.latest.getCurrentPositionResult
      geolocationStore.samplesLatest.watchPositionResult = geolocationStore.latest.watchPositionResult
      geolocationStore.samplesLatest.acceleration = geolocationStore.latest.acceleration
    }, interval)
  }

  /**
   * 位置情報の測位を停止する関数
   */
  const stopLocationTracking = () => {
    geolocationStore.isTracking = false
    if (geolocationStore.latest.watchId !== null) {
      navigator.geolocation.clearWatch(geolocationStore.latest.watchId)
      geolocationStore.latest.watchId = null
    }
    if (geolocationStore.samplingIntervalTimeout !== null) {
      clearInterval(geolocationStore.samplingIntervalTimeout)
      geolocationStore.samplingIntervalTimeout = null
    }
  }

  /**
   * サンプリング結果をリセットする関数
   */
  const resetSamples = () => {
    geolocationStore.samples.getCurrentPositionResults = []
    geolocationStore.samples.watchPositionResults = []
    geolocationStore.samples.accelerationSamples = []
    geolocationStore.samplesLatest.getCurrentPositionResult = null
    geolocationStore.samplesLatest.watchPositionResult = null
    geolocationStore.samplesLatest.acceleration = null
  }

  /**
   * 測位結果をそれぞれCSV形式に変換し、ZIPファイルとしてダウンロードする関数
   */
  const downloadResultsAsZIP = () => {
    const header = 'サンプリング時刻,緯度,経度,精度（m）,高度（m）,高度精度（m）,方位（°）,速度（m/s）,タイムスタンプ\n'

    // getCurrentPosition
    const getCurrentPositionResultRows = geolocationStore.samples.getCurrentPositionResults.map((sample) => {
      const position = sample.result
      if (!position) {
        return '---,---,---,---,---,---,---,---,---'
      }
      const { timestamp, coords } = position
      const { samplingDatetime } = sample
      return `${_dateObjectToDateTimeString(samplingDatetime)},${coords.latitude},${coords.longitude},${coords.accuracy},${coords.altitude ?? '---'},${coords.altitudeAccuracy ?? '---'},${coords.heading ?? '---'},${coords.speed ?? '---'},${timestamp}`
    })

    // watchPosition
    const watchPositionResultRows = geolocationStore.samples.watchPositionResults.map((sample) => {
      const position = sample.result
      if (!position) {
        return '---,---,---,---,---,---,---,---,---'
      }
      const { timestamp, coords } = position
      const { samplingDatetime } = sample
      return `${_dateObjectToDateTimeString(samplingDatetime)},${coords.latitude},${coords.longitude},${coords.accuracy},${coords.altitude ?? '---'},${coords.altitudeAccuracy ?? '---'},${coords.heading ?? '---'},${coords.speed ?? '---'},${timestamp}`
    })

    // acceleration
    const headerForAcceleration = 'サンプリング時刻,x,y,z\n'
    const accelerationRows = geolocationStore.samples.accelerationSamples.map((sample) => {
      const acceleration = sample.result
      if (!acceleration) {
        return '---,---,---,---'
      }
      const samplingDatetime = sample.samplingDatetime
      return `${_dateObjectToDateTimeString(samplingDatetime)},${acceleration.x ?? '---'},${acceleration.y ?? '---'},${acceleration.z ?? '---'}`
    })

    const zip = new JSZip()
    zip.file('getCurrentPositionResults.csv', header + getCurrentPositionResultRows.join('\n'))
    zip.file('watchPositionResults.csv', header + watchPositionResultRows.join('\n'))
    zip.file('accelerationSamples.csv', headerForAcceleration + accelerationRows.join('\n'))

    zip.generateAsync({ type: 'blob' }).then((content) => {
      const url = URL.createObjectURL(content)
      const a = document.createElement('a')
      a.href = url
      a.download = 'geolocation_results.zip'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    })
  }

  /**
   * 日付オブジェクトをyyyyMMddHHmmssSSS形式の文字列に変換する関数
   *
   * @param date 変換する日付オブジェクト
   * @returns 変換された日付文字列
   */
  const _dateObjectToDateTimeString = (date: Date | null): string => {
    if (!date) {
      return '---'
    }
    const yyyy = date.getFullYear().toString()
    const MM = (date.getMonth() + 1).toString().padStart(2, '0')
    const dd = date.getDate().toString().padStart(2, '0')
    const HH = date.getHours().toString().padStart(2, '0')
    const mm = date.getMinutes().toString().padStart(2, '0')
    const ss = date.getSeconds().toString().padStart(2, '0')
    const SSS = date.getMilliseconds().toString().padStart(3, '0')
    return `${yyyy}${MM}${dd}${HH}${mm}${ss}${SSS}`
  }

  return {
    startGeolocationByGetCurrentPosition,
    startWatchingPosition,
    startWatchingAcceleration,
    startSamplingPosition,
    stopLocationTracking,
    downloadResultsAsZIP,
    resetSamples,
  }
}
