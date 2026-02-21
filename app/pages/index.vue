<template>
  <div>
    <!-- getCurrentPosition、watchPosition、加速度センサでの取得結果を横並びで表示（単位も表示）-->
    <div class="d-flex flex-row">
      <div class="p-2 info-block">
        <h3>getCurrentPosition</h3>
        <p v-if="geolocationStore.getCurrentPositionError">
          {{ geolocationStore.getCurrentPositionError }}
        </p>
        <p>
          経度:
          {{
            watchPositionLogic.geolocationByGetCurrentPosition.value?.coords
              .longitude
          }}
        </p>
        <p>
          緯度:
          {{
            watchPositionLogic.geolocationByGetCurrentPosition.value?.coords
              .latitude
          }}
        </p>
        <p>
          精度:
          {{
            watchPositionLogic.geolocationByGetCurrentPosition.value?.coords
              .accuracy
          }}
          m
        </p>
        <p>
          高度:
          {{
            watchPositionLogic.geolocationByGetCurrentPosition.value?.coords
              .altitude
          }}
          m
        </p>
        <p>
          高度精度:
          {{
            watchPositionLogic.geolocationByGetCurrentPosition.value?.coords
              .altitudeAccuracy
          }}
          m
        </p>
        <p>
          方位:
          {{
            watchPositionLogic.geolocationByGetCurrentPosition.value?.coords
              .heading
          }}
          度
        </p>
        <p>
          速度:
          {{
            convertSpeedToKmPerHour(
              watchPositionLogic.geolocationByGetCurrentPosition.value?.coords
                .speed || 0,
            )
          }}
          km/h
        </p>
      </div>
      <div class="p-2 info-block">
        <h3>watchPosition</h3>
        <p v-if="geolocationStore.watchPositionError">
          {{ geolocationStore.watchPositionError }}
        </p>
        <p>
          経度:
          {{
            watchPositionLogic.geolocationByWatchPosition.value?.coords
              .longitude
          }}
        </p>
        <p>
          緯度:
          {{
            watchPositionLogic.geolocationByWatchPosition.value?.coords.latitude
          }}
        </p>
        <p>
          精度:
          {{
            watchPositionLogic.geolocationByWatchPosition.value?.coords.accuracy
          }}
          m
        </p>
        <p>
          高度:
          {{
            watchPositionLogic.geolocationByWatchPosition.value?.coords.altitude
          }}
          m
        </p>
        <p>
          高度精度:
          {{
            watchPositionLogic.geolocationByWatchPosition.value?.coords
              .altitudeAccuracy
          }}
          m
        </p>
        <p>
          方位:
          {{
            watchPositionLogic.geolocationByWatchPosition.value?.coords.heading
          }}
          度
        </p>
        <p>
          速度:
          {{
            convertSpeedToKmPerHour(
              watchPositionLogic.geolocationByWatchPosition.value?.coords
                .speed || 0,
            )
          }}
          km/h
        </p>
      </div>
      <div class="p-2 info-block">
        <h3>加速度センサ</h3>
        <p v-if="geolocationStore.getAccelerationError">
          {{ geolocationStore.getAccelerationError }}
        </p>
        <p>X: {{ watchPositionLogic.acceleration.value?.x }} m/s²</p>
        <p>Y: {{ watchPositionLogic.acceleration.value?.y }} m/s²</p>
        <p>Z: {{ watchPositionLogic.acceleration.value?.z }} m/s²</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const geolocationStore = useGeolocationStore();
const geolocationLogic = useGeolocationLogic();
const watchPositionLogic = useWatchPositionLogic();

onMounted(() => {
  geolocationLogic.startWatchingCurrentPosition(1000);
  geolocationLogic.startWatchingPosition();
  geolocationLogic.startWatchingAcceleration();

  watchPositionLogic.getPositionByInterval(1000);
});

/**
 * 秒速を時速に変換する関数
 */
const convertSpeedToKmPerHour = (speedInMetersPerSecond: number) => {
  return speedInMetersPerSecond * 3.6;
};
</script>

<style scoped>
.info-block {
  min-width: 300px;
}
</style>
