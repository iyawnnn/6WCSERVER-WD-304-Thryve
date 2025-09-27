import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router'; 
import { useAuthStore } from "./stores/auth";

import './style.css';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap'; 

const app = createApp(App);

// install Pinia first
const pinia = createPinia();
app.use(pinia);

// install router
app.use(router);

// mount app
app.mount('#app');

// now you can safely use the store
const auth = useAuthStore();
if (auth.token) {
  auth.fetchMe(); // ensures auth.user is set on reload
}
