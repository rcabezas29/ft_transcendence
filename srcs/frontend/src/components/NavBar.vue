<script setup lang="ts">
	import { ref } from "vue";
	import { user } from "../user";
	import Button from "./ui/Button.vue"
	import BurguerMenu from "./icons/BurguerMenu.vue";

	const menuOpened = ref(true);

	function toggleMenu() {
		menuOpened.value = !menuOpened.value;
	}

</script>

<template>
	<div class="nav-header">
		<div class="nav-buttons" :class="{ hiddenMenu: menuOpened}">
			<router-link to="home">
				<Button @click="toggleMenu()">PONG.EXE</Button>
			</router-link>

			<router-link to="social">
				<Button @click="toggleMenu()">SOCIAL</Button>
			</router-link>

			<router-link to="profile">
				<Button @click="toggleMenu()">PROFILE</Button>
			</router-link>
		</div>
		<div class="right-nav-container">
			<div class="hamburger-menu">
				<BurguerMenu :w="48" :h="48" class="burguer-menu" @click="toggleMenu()"/>
			</div>
			<div class="user-info">
				<div class="user-stats">
					<div>{{ user.username }}</div>
					<div>elo: 69</div>
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
	}


</style>