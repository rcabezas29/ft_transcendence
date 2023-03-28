import { createRouter, createWebHistory } from "vue-router";

import Index  from './components/Index.vue';
import Login from './views/Login.vue';
import Chat from './views/Chat.vue';
import Home from './views/Home.vue';
import Register from "./views/Register.vue";
import Oauth from './components/Oauth.vue';
import Game from './views/Game.vue';
import Friends from './views/Friends.vue';
import TwoFactorAuthentication from './components/TwoFactorAuthentication.vue';
import Social from './views/Social.vue'
import Profile from './views/Profile.vue';
import FirstTimeLogin from './views/FirstTimeLogin.vue';
import Spectator from './views/Spectator.vue';
import NotFound from './views/NotFound.vue'

import {
	authenticationGuard,
	firstFactorAuthenticationGuard,
	firstLoginGuard,
	loggedUserGuard
} from './guards/index';

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
		component: Friends,
		beforeEnter: authenticationGuard
	},
	{
		name: '2fa-auth',
		path: '/2fa-auth',
		component: TwoFactorAuthentication,
		beforeEnter: firstFactorAuthenticationGuard
	},
	{
		name: 'profile',
		path: '/profile',
		component: Profile,
		beforeEnter: authenticationGuard
	},
	{
		name: 'social',
		path: '/social',
		component: Social,
		beforeEnter: authenticationGuard
	},
	{
		name: 'first-login',
		path: '/first-login',
		component: FirstTimeLogin,
		beforeEnter: firstLoginGuard
	},
	{
		name: 'spectate',
		path: '/spectate/:matchId',
		component: Spectator
	},
	{
		name: "not-found",
		path: "/:pathMatch(.*)*",
		component: NotFound
	}
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
