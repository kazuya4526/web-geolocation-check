export const useGeolocationStore = defineStore('geolocation', () => {
  const geolocationByGetCurrentPosition = ref<GeolocationPosition | null>(null);
  const getCurrentPositionError = ref<string>('');
  const geolocationByWatchPosition = ref<GeolocationPosition | null>(null);
  const watchPositionError = ref<string>('');
  const acceleration = ref<DeviceMotionEventAcceleration | null>(null);
  const getAccelerationError = ref<string>('');

  const setGeolocation = (geolocation: GeolocationPosition, type: 'getCurrentPosition' | 'watchPosition') => {
    if (type === 'getCurrentPosition') {
      geolocationByGetCurrentPosition.value = geolocation;
    } else {
      geolocationByWatchPosition.value = geolocation;
    }
  }

  const setAcceleration = (accelerationData: DeviceMotionEventAcceleration) => {
    acceleration.value = accelerationData;
  }

  return {
    geolocationByGetCurrentPosition,
    geolocationByWatchPosition,
    acceleration,
    getCurrentPositionError,
    watchPositionError,
    getAccelerationError,
    setGeolocation,
    setAcceleration,
  }
});