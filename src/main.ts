import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import { GridLayout, GridItem } from 'grid-layout-plus';
import widgets from './widgets/index';

const app = createApp(App);

app.component('GridLayout', GridLayout);
app.component('GridItem', GridItem);

Object.keys(widgets).forEach((key) => {
    app.component(key, widgets[key]);
});

app.use(ElementPlus);
app.mount('#app');
