export const useGeolocationStore = defineStore('geolocation', () => {
  const latest = {
    getCurrentPositionResult: null as GeolocationPosition | null,
    watchPositionResult: null as GeolocationPosition | null,
    acceleration: null as DeviceMotionEventAcceleration | null,
    watchId: null as number | null,
    getCurrentPositionError: '',
    watchPositionError: '',
    getAccelerationError: '',
  }
  const samples = {
    getCurrentPositionResults: [] as (GeolocationPosition | null)[],
    watchPositionResults: [] as (GeolocationPosition | null)[],
    accelerationSamples: [] as (DeviceMotionEventAcceleration | null)[],
  }
  const samplesLatest = {
    getCurrentPositionResult: null as GeolocationPosition | null,
    watchPositionResult: null as GeolocationPosition | null,
    acceleration: null as DeviceMotionEventAcceleration | null,
  }

  /** 測位中かどうか */
  const isTracking = ref(false)
  /** サンプリングのInterval */
  const samplingIntervalTimeout = ref<NodeJS.Timeout | null>(null)

  return {
    latest,
    samples,
    samplesLatest,
    isTracking,
    samplingIntervalTimeout,
  }
})
