import Index  from './components/Index.vue';
import Login from './views/Login.vue';
import Chat from './views/Chat.vue';
import Home from './views/Home.vue';
import Register from "./views/Register.vue";
import Game from './views/Game.vue';
import { authenticationGuard, loggedUserGuard } from './guards/index';
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
		beforeEnter: loggedUserGuard
	},
	{
		name: 'register',
		path: '/register',
		component: Register,
		beforeEnter: loggedUserGuard
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
	{
		name: 'game',
		path: '/game',
		component: Game,
		beforeEnter: authenticationGuard
	},
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});


export default router;