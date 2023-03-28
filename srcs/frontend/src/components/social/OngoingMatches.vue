<script setup lang="ts">
	import { onBeforeMount, onBeforeUnmount, ref, type Ref } from 'vue';
	import { user } from "../../user"
	import router from "../../router"
import path from 'path';

	//FIXME: find better name and move the interface from here
	interface Game {
		name: string;
		player1: string;
		player2: string;
	}

	const ongoingGames: Ref<Game[]> = ref([]);

	function onNewGame(game: Game) {
		ongoingGames.value.push(game);
	}

	function onEndGame(gameName: string) {
		const gameIndex = ongoingGames.value.findIndex(game => game.name == gameName);
		if (gameIndex != -1)
			ongoingGames.value.splice(gameIndex, 1);
	}

	function fetchOngoingGames(games: Game[]) {
		ongoingGames.value = games;
	}

	function watchGame(gameName: string) {
		router.push({
			name: "spectate",
			params: { matchId: gameName }
		})
	}

	onBeforeMount(() => {
		user.socket?.on("ongoing-games", (games) => { fetchOngoingGames(games) });
		user.socket?.emit("ongoing-games");
		user.socket?.on("spectator-new-game", (game) => { onNewGame(game) });
		user.socket?.on("spectator-end-game", (gameId) => { onEndGame(gameId) });
	})

	onBeforeUnmount(() => {
		user.socket?.off("spectator-new-game");
		user.socket?.off("spectator-end-game");
		user.socket?.off("ongoing-games");
	})

</script>

<template>
	<h1>Ongoing </h1>

	<li v-for="game in ongoingGames">
		{{ game.name }} | {{ game.player1 }} vs {{ game.player2 }} |
		<button @click="watchGame(game.name)">Watch</button>
	</li>
</template>

<style scoped>


</style>
