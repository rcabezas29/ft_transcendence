import Index  from './components/Index.vue';
import Login from './views/Login.vue';
import Chat from './views/Chat.vue';

import { createRouter, createWebHistory } from "vue-router";

const routes = [
	{ path: '/', component: Index},
	{ path: '/login', component: Login},
	{ path: '/chat', component: Chat},
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

export default router;