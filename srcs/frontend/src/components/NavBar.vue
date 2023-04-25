<script setup lang="ts">
	import { ref } from "vue";
	import { user } from "../user";
	import { useRoute } from "vue-router";
	import Button from "./ui/Button.vue"
	import BurguerMenu from "./icons/BurguerMenu.vue";
	import CrossIcon from "./icons/CrossIcon.vue";

	const menuClosed = ref(true);

	function toggleMenu() {
		menuClosed.value = !menuClosed.value;
	}

	function closeMenu() {
		menuClosed.value = true;
	}

	const route = useRoute();

</script>

<template>
	<div class="nav-header" :class="{openmenu: !menuClosed}">
		<div class="nav-buttons" :class="{ hiddenMenu: menuClosed}">
			<router-link to="/game">
				<Button @click="closeMenu()" :selected="route.path == '/game'">PONG.EXE</Button>
			</router-link>

			<router-link to="/social">
				<Button @click="closeMenu()" :selected="route.path == '/social'">SOCIAL</Button>
			</router-link>

			<router-link to="/profile">
				<Button @click="closeMenu()" :selected="route.path == '/profile'">PROFILE</Button>
			</router-link>

			<router-link to="/help">
				<Button @click="closeMenu()" :selected="route.path == '/help'">HELP</Button>
			</router-link>
		</div>
		<div class="right-nav-container">
			<div class="hamburger-menu">
				<BurguerMenu v-if="menuClosed" :w="48" :h="48" class="burguer-menu" @click="toggleMenu()"/>
				<CrossIcon v-else :w="48" :h="48" class="burguer-menu" @click="toggleMenu()"/>
			</div>
			<div class="user-info">
				<div class="user-stats">
					<div>{{ user.username }}</div>
					<div>elo: {{ user.elo }}</div>
				</div>
				<div class="user-image">
					<img :src=user.avatarImageURL />
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>

	.nav-header {
		display: flex;
		flex-direction: column-reverse;
		position: relative;
		background-color: #08150C;
		box-sizing: border-box;
	}

	.openmenu {
		position: fixed;
		top: 0;
		left: 0;
		height: 100%;
		width: 100%;
		padding: 24px 24px;
		z-index: 1;
	}

	.burguer-menu {
		color: #4BFE65;
		cursor: pointer;
	}

	.nav-buttons {
		display: flex;
		flex-direction: column;
		gap: 24px;
		margin-top: 24px;
		background-color: #08150C;
		height: 100%;
	}

	.hiddenMenu {
		display: none;
	}

	.right-nav-container {
		flex: 1;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.user-info {
		display: flex;
		align-items: center;
	}

	.user-stats {
		margin-right: 15px;
	}
	
	.user-image {
		display: flex;
		align-items: center;
		justify-content: center;
		border: 4px solid #4BFE65;
		padding: 4px;
	}

	.user-image img {
		height: 75px;
		width: 75px;
	}

	/* Everything bigger than 850px */
	@media only screen and (min-width: 850px) {

		.burguer-menu {
			display: none;
		}

		.hiddenMenu {
			display: block;
		}

		.nav-header {
			flex-direction: row;
			position: relative;
		}

		.nav-buttons {
			display: flex;
			flex-direction: row;
			align-items: center;
			margin-top: 0;
		}

		.nav-buttons button {
			padding: 20px 42px;
		}
	}


</style>