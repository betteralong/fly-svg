import FlySvg from './index.vue'
export default FlySvg
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.component(FlySvg.name, FlySvg);
}