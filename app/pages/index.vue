<template>
  <div>
    <div class="d-flex align-center">
      <label
        for="sampling-interval"
        class="setting-label"
      >
        サンプリング間隔:
      </label>
      <v-text-field
        id="sampling-interval"
        v-model="samplingInterval"
        variant="outlined"
        color="primary"
        class="ml-4 setting-value"
        inputmode="numeric"
        hide-details
      />
      <span class="ml-2">ミリ秒/回</span>
    </div>
    <div class="d-flex align-center mt-2">
      <label
        for="enable-high-accuracy"
        class="setting-label"
      >
        高精度測位を有効にする:
      </label>
      <v-switch
        id="enable-high-accuracy"
        v-model="enableHighAccuracy"
        class="ml-4 setting-value"
        color="primary"
        hide-details
        inset
      />
    </div>
    <div class="d-flex align-center mt-2">
      <label
        for="timeout"
        class="setting-label"
      >
        タイムアウト時間:
      </label>
      <v-text-field
        id="timeout"
        v-model="timeout"
        variant="outlined"
        color="primary"
        class="ml-4 setting-value"
        inputmode="numeric"
        hide-details
      />
      <span class="ml-2">ミリ秒</span>
    </div>
    <div class="d-flex align-center mt-2">
      <label
        for="maximum-age"
        class="setting-label"
      >
        測位結果のキャッシュ時間:
      </label>
      <v-text-field
        id="maximum-age"
        v-model="maximumAge"
        variant="outlined"
        color="primary"
        class="ml-4 setting-value"
        inputmode="numeric"
        hide-details
      />
      <span class="ml-2">ミリ秒</span>
    </div>
    <div class="d-flex align-center mt-2">
      <label
        for="get-current-position-interval"
        class="setting-label"
      >
        getCurrentPositionの<br>実行間隔:
      </label>
      <v-text-field
        id="get-current-position-interval"
        v-model="getCurrentPositionInterval"
        variant="outlined"
        color="primary"
        class="ml-4 setting-value"
        inputmode="numeric"
        hide-details
      />
      <span class="ml-2">ミリ秒/回</span>
    </div>
    <v-btn
      v-if="!geolocationStore.isTracking"
      class="mt-4"
      color="primary"
      @click="startLocationTracking()"
    >
      測位を開始
    </v-btn>
    <v-btn
      v-else
      class="mt-4"
      color="error"
      @click="geolocationController.stopLocationTracking()"
    >
      測位を停止
    </v-btn>
    <!-- getCurrentPosition、watchPosition、加速度センサでの取得結果を横並びで表示（単位も表示） -->
    <div
      class="d-flex flex-row mt-4"
      style="overflow-x: auto;"
    >
      <div>
        <v-card class="info-block">
          <v-card-title>getCurrentPosition</v-card-title>
          <v-card-text>
            <div>
              <p>
                経度:
                {{ displayedGeolocationResult.getCurrentPositionResult?.coords.longitude ?? '-' }}
              </p>
              <p>
                緯度:
                {{ displayedGeolocationResult.getCurrentPositionResult?.coords.latitude ?? '-' }}
              </p>
              <p>
                精度:
                {{ displayedGeolocationResult.getCurrentPositionResult?.coords.accuracy ?? '-' }}
                m
              </p>
              <p>
                高度:
                {{ displayedGeolocationResult.getCurrentPositionResult?.coords.altitude ?? '-' }}
                m
              </p>
              <p>
                高度精度:
                {{ displayedGeolocationResult.getCurrentPositionResult?.coords.altitudeAccuracy ?? '-' }}
                m
              </p>
              <p>
                方位:
                {{ displayedGeolocationResult.getCurrentPositionResult?.coords.heading ?? '-' }}
                度
              </p>
              <p>
                速度:
                {{
                  displayedGeolocationResult.getCurrentPositionResult?.coords.speed === null || displayedGeolocationResult.getCurrentPositionResult?.coords.speed === undefined

                    ? '-'
                    : convertSpeedToKmPerHour(
                      displayedGeolocationResult.getCurrentPositionResult?.coords
                        .speed ?? 0,
                    )
                }}
                km/h
              </p>
            </div>
          </v-card-text>
        </v-card>

        <v-card
          v-if="geolocationStore.latest.getCurrentPositionError"
          color="error"
          class="mt-4 error-block"
        >
          <v-card-text>
            {{ geolocationStore.latest.getCurrentPositionError }}
          </v-card-text>
        </v-card>
      </div>
      <div>
        <v-card class="info-block">
          <v-card-title>watchPosition</v-card-title>
          <v-card-text>
            <p v-if="geolocationStore.latest.watchPositionError">
              {{ geolocationStore.latest.watchPositionError }}
            </p>
            <p>
              経度:
              {{
                displayedGeolocationResult.watchPositionResult?.coords.longitude ?? '-'
              }}
            </p>
            <p>
              緯度:
              {{
                displayedGeolocationResult.watchPositionResult?.coords.latitude ?? '-'
              }}
            </p>
            <p>
              精度:
              {{
                displayedGeolocationResult.watchPositionResult?.coords.accuracy ?? '-'
              }}
              m
            </p>
            <p>
              高度:
              {{
                displayedGeolocationResult.watchPositionResult?.coords.altitude ?? '-'
              }}
              m
            </p>
            <p>
              高度精度:
              {{
                displayedGeolocationResult.watchPositionResult?.coords.altitudeAccuracy ?? '-'
              }}
              m
            </p>
            <p>
              方位:
              {{
                displayedGeolocationResult.watchPositionResult?.coords.heading ?? '-'
              }}
              度
            </p>
            <p>
              速度:
              {{
                displayedGeolocationResult.watchPositionResult?.coords.speed === null || displayedGeolocationResult.watchPositionResult?.coords.speed === undefined
                  ? '-'
                  : convertSpeedToKmPerHour(
                    displayedGeolocationResult.watchPositionResult?.coords
                      .speed ?? 0,
                  )
              }}
              km/h
            </p>
          </v-card-text>
        </v-card>

        <v-card
          v-if="geolocationStore.latest.watchPositionError"
          color="error"
          class="mt-4 error-block"
        >
          <v-card-text>
            {{ geolocationStore.latest.watchPositionError }}
          </v-card-text>
        </v-card>
      </div>
      <div>
        <v-card class="info-block">
          <v-card-title>加速度センサ</v-card-title>
          <v-card-text>
            <p v-if="geolocationStore.latest.getAccelerationError">
              {{ geolocationStore.latest.getAccelerationError }}
            </p>
            <p>
              X:
              {{ displayedGeolocationResult.acceleration?.x ?? '-' }}
              m/s²
            </p>
            <p>
              Y:
              {{ displayedGeolocationResult.acceleration?.y ?? '-' }}
              m/s²
            </p>
            <p>
              Z:
              {{ displayedGeolocationResult.acceleration?.z ?? '-' }}
              m/s²
            </p>
          </v-card-text>
        </v-card>

        <v-card
          v-if="geolocationStore.latest.getAccelerationError"
          color="error"
          class="mt-4 error-block"
        >
          <v-card-text>
            {{ geolocationStore.latest.getAccelerationError }}
          </v-card-text>
        </v-card>
      </div>
    </div>

    <div
      ref="mapContainer"
      class="map-container"
    />
  </div>
</template>

<script setup lang="ts">
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'

const geolocationStore = useGeolocationStore()
const geolocationController = useGeolocationController()

const runtimeConfig = useRuntimeConfig()

/** GoogleMapを表示するコンテナ要素 */
const mapContainer = ref<HTMLElement>()
/** GoogleMapのインスタンス */
let map: google.maps.Map | null = null
/** 現在地を示すマーカー（watchPosition用） */
let currentLocationMarkerForWatchPosition: google.maps.marker.AdvancedMarkerElement | null = null
/** 精度を示す円（watchPosition用） */
let accuracyCircleForWatchPosition: google.maps.Circle | null = null
/** 現在地を示すマーカー（getCurrentPosition用） */
let currentLocationMarkerForGetCurrentPosition: google.maps.marker.AdvancedMarkerElement | null = null
/** 精度を示す円（getCurrentPosition用） */
let accuracyCircleForGetCurrentPosition: google.maps.Circle | null = null
/** 精度を調整するスケール */
const accuracyScale = 0.5

/**
 * サンプリング間隔（ミリ秒）
 *
 * 0の場合はサンプリングを行わず、測位結果を即時に表示する
 */
const samplingInterval = ref(1000)
/** 高精度測位を有効にするかどうか */
const enableHighAccuracy = ref(true)
/** 位置情報のタイムアウト時間（ミリ秒） */
const timeout = ref(10000)
/** 測位結果のキャッシュ時間（ミリ秒） */
const maximumAge = ref(0)
/** getCurrentPositionの実行間隔（ミリ秒） */
const getCurrentPositionInterval = ref(1000)
const samplingIntervalAsNumber = computed(() => Number(samplingInterval.value))
const displayedGeolocationResult = computed(() =>
  samplingIntervalAsNumber.value > 0
    ? geolocationStore.samplesLatest
    : geolocationStore.latest,
)

onMounted(async () => {
  // Google Maps APIの読み込み
  setOptions({
    key: runtimeConfig.public.scripts.googleMaps.apiKey,
    v: 'weekly',
  })

  const { Map } = (await importLibrary('maps'))

  const mapOptions: google.maps.MapOptions = {
    center: { lat: 35.6895, lng: 139.6917 }, // 東京の緯度経度
    zoom: 20,
    mapId: runtimeConfig.public.scripts.googleMaps.mapId,
  }

  map = new Map(
    mapContainer.value as HTMLElement,
    mapOptions,
  )
})

watch(
  () => [
    geolocationStore.latest.watchPositionResult,
    geolocationStore.latest.getCurrentPositionResult,
  ],
  async (newVal) => {
    if (newVal[0] && map) {
      // 中央を現在地に移動
      const { latitude, longitude, accuracy } = newVal[0].coords
      const newCenter = { lat: latitude, lng: longitude }
      map.setCenter(newCenter)

      // 既存のマーカーをクリア
      _clearMarkerAndAccuracyCircle()

      // マーカーを追加
      // watchPositionのマーカー
      const { marker, accuracyCircle } = await _createMarkerAndAccuracyCircle(
        newCenter,
        accuracy,
        '#1a73e8', // 青色
      )
      currentLocationMarkerForWatchPosition = marker
      accuracyCircleForWatchPosition = accuracyCircle

      // getCurrentPositionのマーカー
      const {
        marker: getCurrentPositionMarker,
        accuracyCircle: getCurrentPositionAccuracyCircle,
      } = await _createMarkerAndAccuracyCircle(
        newCenter,
        accuracy,
        '#34a853', // 緑色
      )
      currentLocationMarkerForGetCurrentPosition = getCurrentPositionMarker
      accuracyCircleForGetCurrentPosition = getCurrentPositionAccuracyCircle
    }
  },
)

/**
 * 秒速を時速に変換する関数
 */
const convertSpeedToKmPerHour = (speedInMetersPerSecond: number) => {
  return speedInMetersPerSecond * 3.6
}

/**
 * 位置情報の取得を開始する関数
 */
const startLocationTracking = () => {
  geolocationStore.isTracking = true
  geolocationController.startWatchingPosition(
    enableHighAccuracy.value,
    timeout.value,
    maximumAge.value,
  )
  geolocationController.startWatchingAcceleration()
  geolocationController.startGeolocationByGetCurrentPosition(
    getCurrentPositionInterval.value,
    enableHighAccuracy.value,
    timeout.value,
    maximumAge.value,
  )

  // サンプリング間隔が0より大きい場合は、サンプリングを開始する
  if (samplingIntervalAsNumber.value > 0) {
    geolocationController.startSamplingPosition(
      samplingIntervalAsNumber.value,
    )
  }
}

/**
 * 位置情報の位置と精度をもとに、マーカーと精度を示す円を作成する関数
 *
 * @param position 位置情報の緯度経度
 * @param accuracy 位置情報の精度（メートル単位）
 * @param color マーカーと円の色
 * @returns マーカーと精度を示す円のオブジェクト
 */
const _createMarkerAndAccuracyCircle = async (
  position: { lat: number, lng: number },
  accuracy: number,
  color: string,
) => {
  const { AdvancedMarkerElement } = (await importLibrary('marker'))

  // マーカーを作成
  const marker = new AdvancedMarkerElement({
    position,
    map,
    content: _createCurrentLocationDot(),
  })

  // 精度(accuracy[m])に応じた半径の円を作成
  const adjustedAccuracyRadius = Math.max(accuracy * accuracyScale, 1)

  const accuracyCircle = new google.maps.Circle({
    map,
    center: position,
    radius: adjustedAccuracyRadius,
    strokeColor: color,
    strokeOpacity: 0.4,
    strokeWeight: 1,
    fillColor: color,
    fillOpacity: 0.12,
    clickable: false,
  })

  return { marker, accuracyCircle }
}

/**
 * 現在地を示すドットを作成する関数
 */
const _createCurrentLocationDot = () => {
  const dot = document.createElement('div')
  dot.className = 'current-location-dot'
  return dot
}

/**
 * 既存のマーカーと精度を示す円をクリアする関数
 */
const _clearMarkerAndAccuracyCircle = () => {
  if (currentLocationMarkerForWatchPosition) {
    currentLocationMarkerForWatchPosition.map = null
    currentLocationMarkerForWatchPosition = null
  }
  if (currentLocationMarkerForGetCurrentPosition) {
    currentLocationMarkerForGetCurrentPosition.map = null
    currentLocationMarkerForGetCurrentPosition = null
  }
  if (accuracyCircleForWatchPosition) {
    accuracyCircleForWatchPosition.setMap(null)
    accuracyCircleForWatchPosition = null
  }
  if (accuracyCircleForGetCurrentPosition) {
    accuracyCircleForGetCurrentPosition.setMap(null)
    accuracyCircleForGetCurrentPosition = null
  }
}
</script>

<style scoped>
.setting-label {
  width: 200px;
}

.setting-value {
  flex: 1;
}

.info-block {
  min-width: 300px;
  max-width: 300px;
  min-height: 203px;
  max-height: 203px;
  margin-right: 16px;
}

.error-block {
  width: 300px;
}

.map-container {
  width: 100%;
  height: 400px;
  margin-top: 16px;
  overflow-x: hidden;
}

:global(.current-location-dot) {
  display: block;
  width: 14px;
  height: 14px;
  border: 2px solid #fff;
  border-radius: 9999px;
  background-color: #1a73e8;
}
</style>
