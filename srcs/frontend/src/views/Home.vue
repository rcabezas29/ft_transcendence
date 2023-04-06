<script setup lang="ts">
	import { user } from "../user";
	import Button from "../components/ui/Button.vue"

</script>

<template>
	<div class="home-container">
		<div class="home-header">
			<div class="nav-buttons">
				<Button>PONG.EXE</Button>
				<Button>SOCIAL</Button>
				<Button>PROFILE</Button>
			</div>
			<div class="user-info">
				<div class="user-stats">
					<div>username</div>
					<div>elo: 69</div>
				</div>
				<div class="user-image">
					<img :src=user.avatarImageURL />
				</div>
			</div>
		</div>
		<div class="home-body">
			<slot/>
		</div>
	</div>
	
</template>

<style scoped>

	.home-container {
		box-sizing: border-box;
		max-width: 1200px;
		margin: auto;
	}

	.home-header {
		display: flex;
		justify-content: space-between;
		margin-top: 30px;
	}

	.nav-buttons {
		flex: 1;
		display: flex;
		gap: 30px;
		margin-right: 15px;
	}

	.user-info {
		display: flex;
		align-items: end;
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


</style>