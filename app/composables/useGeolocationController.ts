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
      geolocationStore.samples.getCurrentPositionResults.push(geolocationStore.latest.getCurrentPositionResult ?? null)
      geolocationStore.samples.watchPositionResults.push(geolocationStore.latest.watchPositionResult ?? null)
      geolocationStore.samples.accelerationSamples.push(geolocationStore.latest.acceleration ?? null)

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

  return {
    startGeolocationByGetCurrentPosition,
    startWatchingPosition,
    startWatchingAcceleration,
    startSamplingPosition,
    stopLocationTracking,
  }
}
