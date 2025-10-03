import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';

import 'bootstrap-icons/font/bootstrap-icons.css';

import PrimeVue from 'primevue/config';
import { definePreset } from '@primeuix/themes';
import Nora from '@primeuix/themes/nora';
import VueApexCharts from "vue3-apexcharts";

// PrimeVue CSS
import 'primeicons/primeicons.css';
import './style.css';
import ToastService from 'primevue/toastservice'
import Toast from 'primevue/toast'

// Map CSS variables to a preset
const MyPreset = definePreset(Nora, {
  semantic: {
    colorScheme: {
      dark: {
        primary: {
          50: 'hsl(var(--primary))', 
          color: 'hsl(var(--primary-foreground))', 
          hoverColor: 'hsl(var(--primary-foreground))',
          activeColor: 'hsl(var(--primary-foreground))',
          inverseColor: 'hsl(var(--secondary-foreground))' 
        },
        secondary: {
          50: 'hsl(var(--secondary))',
          color: 'hsl(var(--secondary-foreground))',
          hoverColor: 'hsl(var(--secondary-foreground))',
          activeColor: 'hsl(var(--secondary-foreground))',
          inverseColor: 'hsl(var(--primary-foreground))'
        },
        surface: {
          0: 'hsl(var(--card))',
          color: 'hsl(var(--card-foreground))'
        },
        formField: {
          hoverBorderColor: 'hsl(var(--primary-foreground))'
        }
      }
    }
  }
});

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(router);
app.use(PrimeVue, { theme: { preset: MyPreset } });
app.use(VueApexCharts);

// Primevue notif
app.use(ToastService)        
app.component('Toast', Toast) 

// Fetch user if token exists
import { useAuthStore } from './stores/auth';
const auth = useAuthStore(pinia);
if (auth.token) {
  auth.fetchMe();
}

app.mount('#app');
