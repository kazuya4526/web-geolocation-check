export const useGeolocationLogic = () => {
  const geolocationStore = useGeolocationStore()

  /**
   * getCurrentPositionを定期的に呼び出して位置情報を更新する
   *
   * @param interval
   */
  const startWatchingCurrentPosition = (interval: number) => {
    setInterval(() => {
      _getCurrentPosition()
    }, interval)
  }

  /**
   * watchPositionを使用して位置情報をリアルタイムで更新する
   */
  const startWatchingPosition = () => {
    if (!navigator.geolocation) {
      geolocationStore.watchPositionError = 'GeolocationAPIがサポートされていません'
      return
    }

    navigator.geolocation.watchPosition(
      (position) => {
        geolocationStore.watchPositionError = ''
        geolocationStore.setGeolocation(position, 'watchPosition')
      },
      (error) => {
        geolocationStore.watchPositionError = `エラーが発生しました。${error.message}`
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      },
    )
  }

  /**
   * DeviceMotionEventを使用して加速度をリアルタイムで取得する
   */
  const startWatchingAcceleration = () => {
    if (!window.DeviceMotionEvent) {
      geolocationStore.getAccelerationError = 'DeviceMotionEventがサポートされていません'
      return
    }

    window.addEventListener('devicemotion', (event) => {
      const acceleration = event.acceleration
      if (acceleration) {
        geolocationStore.setAcceleration(acceleration)
      }
      else {
        geolocationStore.getAccelerationError = '加速度データが利用できません'
      }
    })
  }

  /**
   * 現在の位置情報を一度だけ取得して更新する
   */
  const _getCurrentPosition = () => {
    if (!navigator.geolocation) {
      geolocationStore.getCurrentPositionError = 'GeolocationAPIがサポートされていません'
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        geolocationStore.getCurrentPositionError = ''
        geolocationStore.setGeolocation(position, 'getCurrentPosition')
      },
      (error) => {
        geolocationStore.getCurrentPositionError = `エラーが発生しました。${error.message}`
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      },
    )
  }

  return {
    startWatchingPosition,
    startWatchingCurrentPosition,
    startWatchingAcceleration,
  }
}
