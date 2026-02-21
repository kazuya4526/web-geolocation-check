export const useWatchPositionLogic = () => {
  const geolocationStore = useGeolocationStore();

  const geolocationByWatchPosition = ref<GeolocationPosition | null>(null);
  const geolocationByGetCurrentPosition = ref<GeolocationPosition | null>(null);
  const acceleration = ref<DeviceMotionEventAcceleration | null>(null);

  /**
   * 指定した間隔で位置情報を参照する
   */
  const getPositionByInterval = (interval: number) => {
    setInterval(() => {
      geolocationByGetCurrentPosition.value = geolocationStore.geolocationByGetCurrentPosition;
      geolocationByWatchPosition.value = geolocationStore.geolocationByWatchPosition;
      acceleration.value = geolocationStore.acceleration;
    }, interval);
  }

  return {
    geolocationByWatchPosition,
    geolocationByGetCurrentPosition,
    acceleration,
    getPositionByInterval,
  }
}