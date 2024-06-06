import Vue from 'vue';
import App from './App.vue';
import router from './router';
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue';
import store from './store';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import Toasted from 'vue-toasted';
import './assets/style.css'

library.add(faPencilAlt);

Vue.use(BootstrapVue);
Vue.use(IconsPlugin);
Vue.use(Toasted);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
