import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router'; 

import './style.css';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap'; 

const app = createApp(App);

// ✅ install Pinia
app.use(createPinia());

// ✅ install router
app.use(router);

app.mount('#app');
