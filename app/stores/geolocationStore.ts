export const useGeolocationStore = defineStore('geolocation', () => {
  type PositionSample = {
    samplingDatetime: Date
    result: GeolocationPosition | null
  }
  type AccelerationSample = {
    samplingDatetime: Date
    result: DeviceMotionEventAcceleration | null
  }

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
    getCurrentPositionResults: [] as PositionSample[],
    watchPositionResults: [] as PositionSample[],
    accelerationSamples: [] as AccelerationSample[],
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
