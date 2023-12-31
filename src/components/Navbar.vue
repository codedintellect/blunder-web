<script lang="ts" setup>
const props = defineProps(["routes"]);
</script>

<template>
  <div id="navbar">
    <div id="nav-upper"></div>
    <div id="nav-center">
      <a
        v-for="(value, route) in props['routes']"
        :key="route"
        :href="'#' + route"
      >
        {{ value.iconAlt }}
      </a>
    </div>
    <div id="nav-lower"></div>
  </div>
</template>

<style lang="scss" scoped>
@import "node_modules/nord/src/sass/nord.scss";

#navbar {
  --angle: 22deg;

  position: relative;
  height: 100%;
  width: 100px;
  margin-right: var(--border-width);

  display: flex;
  flex-direction: column;

  #nav-upper,
  #nav-lower {
    position: relative;
    width: 100%;

    background-color: $nord1;
    border-style: none;
    border-right-style: solid;
    border-width: var(--border-width);
    border-color: var(--border-color);

    box-sizing: content-box;
  }

  @mixin angled-pseudo-wedges($pos-offset, $angle-mult) {
    content: "";

    position: absolute;
    height: calc(2 * var(--border-radius));
    width: calc(
      (var(--inner-radius) + var(--border-radius)) * tan(var(--angle))
    );

    #{$pos-offset}: calc(-1 * var(--border-width));
    right: var(--inner-radius);

    transform-origin: 100% var(--border-radius);
    transform: rotate(calc($angle-mult * max(min(var(--angle), 90deg), 0deg)));

    background-color: inherit;
    border-style: none;
    #{"border-" + $pos-offset + "-style"}: solid;
    border-width: inherit;
    border-color: inherit;
  }

  #nav-upper {
    aspect-ratio: 1;

    border-bottom-style: solid;
    border-bottom-right-radius: var(--border-radius);

    &:after {
      @include angled-pseudo-wedges(bottom, -1);
    }
  }
  #nav-lower {
    flex: 1;

    border-top-style: solid;
    border-top-right-radius: var(--border-radius);

    &:before {
      @include angled-pseudo-wedges(top, 1);
    }
  }
  #nav-center {
    $gap: "(var(--inner-radius) + var(--border-radius)) * (1 / cos(var(--angle)) - 1)";

    position: relative;
    width: calc(2 * var(--inner-radius));
    min-height: calc(2 * var(--inner-radius));
    margin-block: calc(#{$gap});

    align-self: flex-end;
    display: flex;
    flex-direction: column;
    align-items: stretch;

    border-radius: var(--inner-radius);

    z-index: 1;

    &:before {
      content: "";

      position: absolute;
      height: 100%;
      width: 100%;

      border-radius: inherit;
      outline: solid var(--border-width) var(--border-color);
      box-shadow: 0px 0px 0px 100px $nord1;

      clip-path: inset(
        calc(-1 * #{$gap} - var(--border-width))
          calc(50% + var(--inner-radius) * sin(var(--angle)))
          calc(-1 * #{$gap} - var(--border-width)) -100px
      );
    }

    & > * {
      aspect-ratio: 1;

      margin: 10%;

      text-align: center;
    }
  }
}
</style>
