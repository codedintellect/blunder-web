<!--  Blood on the Clocktower  -->

<script lang="ts" setup>
import { Ref, computed, ref, watch } from 'vue';
import Communication from '../utils/jitsi';
import JitsiControls from '../components/jitsi/JitsiControls.vue';
import Player from '../components/botc/Player.vue';

import Hand from '../assets/icons/hand.vue';

import { Session } from "../utils/games/botc";

const self = Communication.self;
const users = Communication.users;

const session = new Session("test", self.value?.id, true);
const sessionState: Ref<any> = session.state;
watch(self, function () {
  session.connect("test", self.value?.id);
});

const participants = computed(function() {
  return new Map([...users.value].filter(
    x => Object.keys(sessionState.value).indexOf(x[0]) >= 0)
  );
})

const total = computed(function() {
  return participants.value.size;
});
const aspect = 16 / 10;

const circularPosition: any = computed(function() {
  // Skip update if amount of users unchanged
  if (circularPosition.value?.length === total.value) {
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
    for (let id = 1; id < total.value; id++) {
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
      if (positions.length < total.value) { // Overflow
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

  if (positions.length < total.value) {
    binSearch(10, 25); // Largest size overflows -> find smaller size
  } else if (total.value > 1) {
    binSearch(0, 50, true); // Largest size doesn't overflow -> enlarge dist
  }

  console.log(`Execution time: ${window.performance.now() - start} ms`);
  console.log(`Iterations run: ${debugCount} times`); // TODO: REMOVE
  if (total.value % 2 == 1 && total.value > 1) {
    console.log(`Symmetry error margin: ${Math.abs(
      positions[Math.floor(total.value / 2)][0] + positions[Math.ceil(total.value / 2)][0]
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

  console.log(styles.length);

  return styles;
});

const helpRequested = ref(false);
watch(helpRequested, () => {
  session.updatePresence("help", helpRequested.value);
})
</script>

<template>
  <div id="play-circle"
    :style="{
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

  <div id="bottom">
    <div id="bluffs" class="container"></div>
    <div id="panel">
      <div id="view-switcher" class="panel-buttons">
        <button />
        <button />
      </div>
      <JitsiControls />
    </div>
    <div style="flex: 1;"></div>
    <div id="storytellers">
      <div id="main-storyteller" class="container">
        <button
          @click="(event) => {
            let pos = (event.target as HTMLElement).getBoundingClientRect();
            let X = (event.x - pos.left) / (pos.right - pos.left) * 100;
            let Y = (event.y - pos.top) / (pos.bottom - pos.top) * 100;
            (event.target as HTMLElement).style.setProperty(
              '--click-position', `${100-X}% ${Y}%`
            );
            helpRequested = !helpRequested;
          }"
          :class="{
            active: helpRequested,
          }"
        >
          <Hand />
          <Hand />
          <Hand />
        </button>
      </div>
      <!-- <video class="container"></video> -->
    </div>
    <div id="stage-switcher" class="panel-buttons">
      <button />
      <button />
      <button />
    </div>
  </div>
  
  <div id="folders" class="closed">
    <div id="tabs">
      <button>Rooms</button>
      <button>Roles</button>
      <button>Order</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "node_modules/nord/src/sass/nord.scss";

#play-circle {
  position: absolute;
  height: 100%;
  width: auto;

  left: 50%;
  transform: translateX(-50%);

  aspect-ratio: 1;

  margin-right: var(--border-width);

  // background-color: rgba($nord10, 0.7);
  border-radius: 50%;

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

#bottom {
  position: absolute;
  height: 10rem;
  width: 100%;

  bottom: 0;

  padding-right: var(--border-width);

  display: flex;
  align-items: flex-end;
  gap: var(--border-width);

  pointer-events: none;

  & > * {
    pointer-events: all;
  }

  #bluffs {
    position: relative;
    height: 10rem;
    width: 10rem;

    border-radius: 2rem var(--border-radius) 2rem 1rem;
  }

  #panel {
    display: flex;
    flex-direction: column;
    gap: inherit;

    #communication-controls {
      border-radius: 1rem 2rem;
    }

    #view-switcher {
      border-radius: 2rem;
      border-bottom-left-radius: 1rem;
    }
  }

  #storytellers {
    display: flex;
    flex-direction: row-reverse;
    gap: inherit;

    #main-storyteller {
      position: relative;
      height: 4rem;
      width: 4rem;

      border-radius: 1rem 1.4rem;

      overflow: hidden;

      & > button {
        height: 100%;
        width: 100%;

        transform: scaleX(-1);

        --click-position: 50% 50%;
        @keyframes open {
          from { 
            clip-path: circle(0% at var(--click-position));
          }
          to { 
            clip-path: circle(100% at var(--click-position));
          }
        }

        &:hover:not(.active) {
          svg:first-child {
            filter: 
              drop-shadow(-1px -1px 0.4px rgba($nord4, 0.7))
              drop-shadow( 1px -1px 0.4px rgba($nord4, 0.7))
              drop-shadow( 1px  1px 0.4px rgba($nord4, 0.7))
              drop-shadow(-1px  1px 0.4px rgba($nord4, 0.7));
          }
        }

        svg {
          position: absolute;
          inset: 0.2rem;

          color: $nord3;

          transform: translateX(2%);

          // transform: translateX(-2%) scaleX(-1);
          animation: none;

          pointer-events: none;

          &:first-child {
            filter: 
              drop-shadow(-1px -1px 0.4px rgba($nord0, 0.5))
              drop-shadow( 1px -1px 0.4px rgba($nord0, 0.5))
              drop-shadow( 1px  1px 0.4px rgba($nord0, 0.5))
              drop-shadow(-1px  1px 0.4px rgba($nord0, 0.5));

            transition: filter 100ms;
          }

          &:not(:first-child) {
            color: $nord13;

            clip-path: circle(0% at var(--click-position));
            // animation: open 300ms ease-out reverse forwards;

            &:last-child {
              opacity: 0.5;
            }
          }
        }

        &.active {
          svg:first-child {
            transition: filter 500ms;
          }

          svg:not(:first-child) {
            animation: open 300ms ease-in forwards;
            &:last-child {
              animation: open 120ms ease-in forwards;
            }
          }
        }
      }
    }
  }

  #stage-switcher {
    flex-direction: column;

    border-radius: 1rem 2rem;

    & > * {
      height: calc((10rem - 4 * var(--border-width)) / 3);
      width: calc((10rem - 4 * var(--border-width)) / 3);
    }
  }
}

#folders {
  position: fixed;
  height: 100%;
  width: 36rem;

  top: 0;
  right: 0;

  background-color: $nord1;
  border-style: none;
  border-left-style: solid;
  border-color: var(--border-color);
  border-width: var(--border-width);

  transition: transform 500ms;

  &.closed {
    transform: translateX(calc(100% - var(--border-width)));

    &:before {
      width: 0;
    }
  }

  &:before {
    content: "";

    position: absolute;
    height: 100%;
    width: 10rem;

    right: calc(100% + var(--border-width));

    background-image: linear-gradient(to left, rgba(black, 0.1), transparent);

    transition: width 500ms;

    z-index: -1;
  }

  #tabs {
    position: absolute;
    height: 100%;
    width: 3rem;

    right: 100%;

    padding-block: 0.5rem;

    border-style: none;
    border-right-style: solid;
    border-color: var(--border-color);
    border-width: var(--border-width);

    box-sizing: content-box;

    z-index: -1;
    overflow: hidden;

    pointer-events: none;

    display: flex;
    flex-direction: column;
    row-gap: 1.5rem;

    & > * {
      position: relative;
      height: auto;
      width: 100%;

      padding-inline-end: 1rem;

      background-color: $nord1;
      border: none;
      border-top: solid;
      border-left: solid;
      border-color: var(--border-color);
      border-width: var(--border-width);
      border-top-left-radius: 1rem;

      writing-mode: sideways-lr;

      pointer-events: all;

      &:after {
        content: "";

        position: absolute;
        height: 6rem;
        width: 3rem;

        top: calc(100% - 1.5rem);
        right: 0;

        background-color: inherit;
        border: inherit;
        border-top-left-radius: 1.5rem;

        transform-origin: 1.5rem 1.5rem;
        transform: rotateZ(-60deg);

        z-index: -2;
      }
    }
  }
}
</style>
