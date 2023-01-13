import Index  from './components/Index.vue';
import Login from './views/Login.vue';
import Chat from './views/Chat.vue';
import Home from './views/Home.vue';
import { authenticationGuard } from './auth.guard';
import { createRouter, createWebHistory } from "vue-router";

const routes = [
	{
		name: 'index',
		path: '/',
		component: Index,
	},
	{
		name: 'login',
		path: '/login',
		component: Login,
	},
	{
		name: 'home',
		path: '/home',
		component: Home,
		beforeEnter: authenticationGuard
	},
	{
		name: 'chat',
		path: '/chat',
		component: Chat,
		beforeEnter: authenticationGuard
	},
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});


export default router;