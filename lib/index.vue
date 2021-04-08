<template>
  <svg width="100%" height="100%" :viewBox="viewBox" class="fly-svg__wrapper" :style="{'stroke-dasharray': strokeDasharray, 'stroke-dashoffset': strokeDashoffset}">
    <slot></slot>
  </svg>
</template>

<script>
import {onMounted, ref, getCurrentInstance, computed } from 'vue'
import { requestAnimationFrame, cancelAnimationFrame } from './requestAnimationFrame'

export default {
  name: 'FlySvg',
  props: {
    autoStart: {
      type: Boolean,
      default: true
    },
    loop: {
      type: Boolean,
      default: false
    },
    duration: {
      type: Number,
      default: 3000
    },
    useEasing: {
      type: Boolean,
      required: false,
      default: true
    },
    easingFn: {
      type: Function,
      default (currentTime, startValue, changeValue, duration) {
        currentTime /= duration;
        return changeValue * currentTime * currentTime + startValue
      }
    },
    viewWidth: {
      type: Number,
      required: false,
      default: 1024
    },
    viewHeight: {
      type: Number,
      required: false,
      default: 1024
    }
  },
  emits: ['down'],
  setup(props, context) {
    let path, rAF, pathLength, progress
    let startTime = 0
    const strokeDasharray = ref(0)
    const strokeDashoffset = ref(0)

    const render = (timestamp) => {
      if (!startTime) startTime = timestamp
      progress = timestamp - startTime
      let value
      if (props.useEasing) {
        value = pathLength - props.easingFn(progress, 0, pathLength ,props.duration)
        strokeDashoffset.value = value > 0 ? value : 0
      } else {
        value = (1 - (progress / props.duration)) * pathLength
        strokeDashoffset.value = value > 0 ? value : 0
      }
      if (progress < props.duration) {
        rAF = requestAnimationFrame(render)
      } else {
        context.emit('down')
        if (props.loop) {
          reset()
          rAF = requestAnimationFrame(render)
        }
      }
    }

    const reset = () => {
      startTime = 0
      cancelAnimationFrame(rAF)
      strokeDasharray.value = pathLength
      strokeDashoffset.value = pathLength
    }

    onMounted(() => {
      const instance = getCurrentInstance()
      path = instance.ctx.$el.firstElementChild
      pathLength = path.getTotalLength()
      strokeDasharray.value = pathLength
      strokeDashoffset.value = pathLength
      if (props.autoStart) {
        rAF = requestAnimationFrame(render)
      }
    })
    const viewBox = computed(() => {
      return `0 0 ${props.viewWidth} ${props.viewHeight}`
    })
     return {
      viewBox,
      strokeDasharray,
      strokeDashoffset
    }
  }
}
</script>