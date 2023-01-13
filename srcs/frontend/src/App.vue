<script setup lang="ts">
	import "./assets/main.css"
	import { user } from "./user";
	import router from './router';

</script>

<template>
		<h1>FT_TRANSCENDENCE</h1>

		<div class="dev">
			<h3>Dev data</h3>
			
			<div v-if="user.isLogged()">
				<h4 >User</h4>
				<p>isLogged: {{ user.isLogged() }}</p>
				<p>token: {{ user.token }}</p>
			</div>
		
			<h4>Navigation</h4>
			<div class="dev-links">
				<div>
					<router-link to="/">index</router-link>
				</div>
				<div>
					<router-link to="/login">login</router-link>
				</div>
				<div>
					<router-link to="/home">home</router-link>
				</div>
			</div>

		</div>

	

		<router-view/>
</template>

<style scoped>

	.dev {
		border: 1px solid black;
	}

	.dev-links {
		display: flex;
	}

	.dev-links div {
		margin-right: 10px;
	}

</style>