import Index  from './components/Index.vue';
import Login from './views/Login.vue';
import Chat from './views/Chat.vue';
import Home from './views/Home.vue';
import Register from "./views/Register.vue";
import Oauth from './components/Oauth.vue';
import Game from './views/Game.vue';
import FriendsList from './components/friends/FriendsList.vue'
import { authenticationGuard, loggedUserGuard } from './guards/index';
import { createRouter, createWebHistory } from "vue-router";
import { user } from './user';

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
		name: 'oauth',
		path: '/oauth',
		component: Oauth,
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
	{
		name: 'friends',
		path: '/friends',
		component: FriendsList,
		beforeEnter: authenticationGuard
	},
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

router.beforeEach(async (to, from) => {
	if (user.token) {
		const validToken = await user.validateToken(user.token);
		if (!validToken)
			user.logout();
		return;
	}

	const validLocalStorageToken = await user.checkLocalStorage();
	if (!validLocalStorageToken)
		user.logout();
	else
		await user.auth(validLocalStorageToken);
});

export default router;
