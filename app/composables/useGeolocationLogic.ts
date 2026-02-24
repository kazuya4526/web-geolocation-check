/**
 * 位置情報の測位や加速度を取得するComposable
 */
export const useGeolocationLogic = () => {
  const geolocationStore = useGeolocationStore()

  /**
   * watchPositionを使用して位置情報をリアルタイムで更新する
   *
   * @param enableHighAccuracy 高精度な位置情報を取得するかどうか
   * @param timeout 位置情報の取得にかかる最大時間（ミリ秒）
   * @param maximumAge キャッシュされた位置情報を許可する時間（ミリ秒）
   */
  const startWatchingPosition = (
    enableHighAccuracy = true,
    timeout = 5000,
    maximumAge = 0,
  ) => {
    if (!navigator.geolocation) {
      geolocationStore.latest.watchPositionError = 'GeolocationAPIがサポートされていません'
      return
    }

    geolocationStore.latest.watchId = navigator.geolocation.watchPosition(
      (position) => {
        geolocationStore.latest.watchPositionError = ''
        geolocationStore.latest.watchPositionResult = position
      },
      (error) => {
        geolocationStore.latest.watchPositionError = `エラーが発生しました。${error.message}`
      },
      {
        enableHighAccuracy,
        timeout,
        maximumAge,
      },
    )
  }

  /**
   * 現在の位置情報を一度だけ取得して更新する
   *
   * @param enableHighAccuracy 高精度な位置情報を取得するかどうか
   * @param timeout 位置情報の取得にかかる最大時間（ミリ秒）
   * @param maximumAge キャッシュされた位置情報を許可する時間（ミリ秒）
   * @returns 位置情報の結果とエラーメッセージ
   */
  const getCurrentPosition = async (
    enableHighAccuracy = true,
    timeout = 5000,
    maximumAge = 0,
  ): Promise<void> => {
    if (!navigator.geolocation) {
      geolocationStore.latest.getCurrentPositionError = 'GeolocationAPIがサポートされていません'
      return
    }

    return new Promise(resolve => navigator.geolocation.getCurrentPosition(
      (position) => {
        geolocationStore.latest.getCurrentPositionError = ''
        geolocationStore.latest.getCurrentPositionResult = position
        resolve()
      },
      (error) => {
        geolocationStore.latest.getCurrentPositionError = `エラーが発生しました。${error.message}`
        resolve()
      },
      {
        enableHighAccuracy,
        timeout,
        maximumAge,
      },
    ))
  }

  /**
   * DeviceMotionEventを使用して加速度をリアルタイムで取得する
   */
  const startWatchingAcceleration = () => {
    if (!window.DeviceMotionEvent) {
      geolocationStore.latest.getAccelerationError = 'DeviceMotionEventがサポートされていません'
      return
    }

    // iOS 13以降では、ユーザーの許可が必要
    if (typeof (DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> })?.requestPermission === 'function') {
      (DeviceMotionEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission()
        .then((response) => {
          if (response === 'granted') {
            _addDeviceMotionListener()
          }
          else {
            geolocationStore.latest.getAccelerationError = '加速度の使用が許可されませんでした'
          }
        })
        .catch((error) => {
          geolocationStore.latest.getAccelerationError = `エラーが発生しました。${error.message}`
        })
    }
    // iOS 13未満や他のブラウザでは、直接リスナーを追加
    else {
      _addDeviceMotionListener()
    }
  }

  /**
   * DeviceMotionEventのリスナーを追加して加速度を更新する
   */
  const _addDeviceMotionListener = () => {
    window.addEventListener('devicemotion', (event) => {
      const acceleration = event.acceleration
      if (acceleration) {
        geolocationStore.latest.acceleration = acceleration
      }
      else {
        geolocationStore.latest.getAccelerationError = '加速度データが利用できません'
      }
    })
  }

  return {
    startWatchingPosition,
    getCurrentPosition,
    startWatchingAcceleration,
  }
}
