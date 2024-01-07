<script lang="ts" setup>
import { computed } from 'vue';

import Hand from '../../assets/icons/hand.vue';

const props = defineProps(["session"]);

const handRaised = computed(function () {
  if (props.session.state.value)
    return props.session.getValue("hand") ?? false;
  return false;
});
</script>

<template>
  <button
    @click="(event) => {
      let pos = (event.target as HTMLElement).getBoundingClientRect();
      let X = (event.x - pos.left) / (pos.right - pos.left) * 100;
      let Y = (event.y - pos.top) / (pos.bottom - pos.top) * 100;
      (event.target as HTMLElement).style.setProperty(
        '--click-position', `${100-X}% ${Y}%`
      );
      session.updatePresence('hand', !handRaised);
    }"
    :class="{
      active: handRaised,
    }"
  >
    <Hand />
    <Hand />
    <Hand />
  </button>
</template>

<style lang="scss" scoped>
@import "node_modules/nord/src/sass/nord.scss";

button {
  height: 100%;
  width: 100%;

  background-color: $nord1;
  border-style: solid;
  border-width: var(--border-width);
  border-color: var(--border-color);
  border-radius: 1rem 1.4rem;

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
</style>
