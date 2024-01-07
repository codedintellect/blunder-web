<script lang="ts" setup>
import { Ref, computed } from 'vue';
import Communication from '../../utils/jitsi';
import Player from './Player.vue';

const props = defineProps(["session"]);
const sessionState: Ref<any> = props.session.state;

const users = Communication.users;

const participants = computed(function() {
  return new Map([...users.value].filter(
    x => Object.keys(sessionState.value).indexOf(x[0]) >= 0)
  );
})

const aspect = 16 / 10;

const circularPosition: any = computed(function() {
  // Skip update if amount of users unchanged
  if (circularPosition.value?.length === participants.value.size) {
    return circularPosition.value;
  }

  const circleCoord = (axis: number, radius: number): number => {
    return Math.sqrt(radius ** 2 - axis ** 2);
  }
  const angleDiff = (a: number, b: number) => {
    if (isNaN(a) || isNaN(b)) return Infinity;
    a = (a + Math.PI) % (2 * Math.PI);
    b = (b + Math.PI) % (2 * Math.PI);
    const results = a > b ? a - b : b - a;
    return (results < 0 ? 2 * Math.PI - results : results) / Math.PI;
  }

  let debugCount = 0; // TODO: REMOVE

  let height!: number, width: number, radius: number, dist: number;
  let positions: number[][] = [];
  const run = () => {
    positions = [[0, radius + height / 2]];

    let finalAngle = Math.PI / 2;
    for (let id = 1; id < participants.value.size; id++) {
      debugCount++; // TODO: REMOVE
      let lastPos = positions[positions.length - 1];
      let lastAngle = Math.atan2(lastPos[1], lastPos[0]);

      // Determine in which direction we are wrapping around the circle
      let dirX = -Math.sign(lastPos[1]);
      let dirY =  Math.sign(lastPos[0]);
      if (lastPos[0] === 0) dirY =  dirX;
      if (lastPos[1] === 0) dirX = -dirY;

      // h - Horizontal Displacement
      let hX: number = lastPos[0] + (width + dist) * dirX;
      let hY: number = circleCoord(hX + width / 2 * -Math.sign(hX), radius);
      if (hY !== 0) hY = -dirX * (hY + height / 2);
      if (Math.abs(hX) <=  width / 2) hY = (radius + height / 2) * dirY;
      if (Math.abs(hY) <= height / 2) hX = (radius +  width / 2) * dirX;
      let hAngle = Math.atan2(hY, hX);

      // v - Vertical Displacement
      let vY: number = lastPos[1] + (height + dist) * dirY;
      let vX: number = circleCoord(vY + height / 2 * -Math.sign(vY), radius);
      if (vX !== 0) vX = dirY * (vX + width / 2);
      if (Math.abs(vX) <=  width / 2) vY = (radius + height / 2) * dirY;
      if (Math.abs(vY) <= height / 2) vX = (radius +  width / 2) * dirX;
      let vAngle = Math.atan2(vY, vX);

      const overflowCheck = (angle: number) => {
        return lastAngle <= finalAngle && angle - finalAngle > 10e-16;
      }

      if (isNaN(hAngle) && isNaN(vAngle)) break; // No options -> dist too big;

      if (angleDiff(lastAngle, hAngle) < angleDiff(lastAngle, vAngle)) {
        if (id === 1) finalAngle = Math.PI * Math.sign(hAngle) - hAngle;
        else if (overflowCheck(hAngle)) break;
        positions.push([hX, hY]);
      } else {
        if (id === 1) finalAngle = Math.PI * Math.sign(vAngle) - vAngle;
        else if (overflowCheck(vAngle)) break;
        positions.push([vX, vY]);
      }
    }
  }

  const binSearch = (min: number, max: number, second?: boolean) => {
    let minimum = min;
    let maximum = max;
    while (minimum != maximum) {
      height = !second ? (minimum + maximum) / 2 : 25;
      width = height * aspect;
      radius = 50 - height;
      dist = second ? (minimum + maximum) / 2 : 2;
      if (debugCount > 10000) {
        console.error("Iteration limit reached!");
        break;
      }
      
      run()

      let lastPos = positions[positions.length - 1];
      let goalPos = [-positions[1][0], positions[1][1]];
      let diffPos = [goalPos[0] - lastPos[0], goalPos[1] - lastPos[1]];
      if (positions.length < participants.value.size) { // Overflow
        maximum = second ? dist : height;
      } else if (Math.sqrt(diffPos[0] ** 2 + diffPos[1] ** 2) > 10e-5) {
        minimum = second ? dist : height;
      } else {
        break;
      }
    }
  }

  let start = window.performance.now();

  height = 25;
  width = height * aspect;
  radius = 50 - height;
  dist = 2;

  run();

  if (positions.length < participants.value.size) {
    binSearch(10, 25); // Largest size overflows -> find smaller size
  } else if (participants.value.size > 1) {
    binSearch(0, 50, true); // Largest size doesn't overflow -> enlarge dist
  }

  console.log(`Execution time: ${window.performance.now() - start} ms`);
  console.log(`Iterations run: ${debugCount} times`); // TODO: REMOVE
  if (participants.value.size % 2 == 1 && participants.value.size > 1) {
    console.log(`Symmetry error margin: ${Math.abs(
      positions[Math.floor(participants.value.size / 2)][0]
      + positions[Math.ceil(participants.value.size / 2)][0]
    )} %`);
  }

  let styles = [];

  for (let pos of positions) {
    styles.push({
      'position': 'absolute',
      'height': `${height}%`,
      'width': `${height * aspect}%`,

      'left': `${pos[0] + 50}%`,
      'top': `${pos[1] + 50}%`,

      'transform': 'translate(-50%, -50%)',
    });
  }

  return styles;
});

const circleScale = computed(function () {
  let pos = circularPosition.value;
  if (pos.length < 2) return 1;
  let topElement = pos[Math.floor(pos.length / 2)];
  let height = parseFloat(topElement["height"]);
  let posY = parseFloat(topElement["top"]);
  let top = posY - height / 2;
  return 100 / (100 - top);
});
</script>

<template>
  <div id="play-circle"
    :style="{
      'height': `calc(100% * ${circleScale})`,
      '--radius': `calc(48% - ${circularPosition[0]['height']})`,
    }"
  >
    <Player
      v-for="[key, value], index of participants.entries()"
      :key="key"
      :jitsi-id="key"
      :jitsi-data="value"
      :player-data="sessionState[key][0]"
      :style="circularPosition[index]"
    />
    <div id="safe-zone" v-if="true"></div>
  </div>
</template>

<style lang="scss" scoped>
@import "node_modules/nord/src/sass/nord.scss";

#play-circle {
  position: absolute;
  width: auto;

  left: 50%;
  transform: translateX(-50%);
  bottom: 0;

  aspect-ratio: 1;

  margin-right: var(--border-width);

  // background-color: rgba($nord10, 0.7);
  border-radius: 50%;

  transition: height 200ms linear;

  #safe-zone {
    position: absolute;
    height: calc(2 * var(--radius));
    width: auto;

    aspect-ratio: 1;

    left: 50%;
    top: 50%;
    
    transform: translate(-50%, -50%);

    border-style: solid;
    border-color: rgba($nord5, 0.5);
    border-width: 1px;
    border-radius: 50%;
  }
}
</style>
