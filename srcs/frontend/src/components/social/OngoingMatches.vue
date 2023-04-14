<script setup lang="ts">
	import { onBeforeMount, onBeforeUnmount, ref, type Ref } from 'vue';
	import { user } from "../../user"
	import router from "../../router"

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

	<div class="ongoin-matches">

		<div class="match-exterior-container" v-for="game in ongoingGames" @click="watchGame(game.name)">
			
			<div class="match-interior-container">

				<div class="player player-left">
					<span class="player-name">{{ game.player1 }}</span>
					<div class="player-img">
						<img id="user-image" :src="user.avatarImageURL" />
					</div>
					<div class="player-score">
						<span>1</span>
					</div>
				</div>

				<div class="vs-block">
					<span>vs</span>
				</div>

				<div class="player player-right">
					<div class="player-score">
						<span>1</span>
					</div>
					<div class="player-img">
						<img id="user-image" :src="user.avatarImageURL" />
					</div>
					<span class="player-name">{{ game.player2 }}</span>
				</div>

			</div>

		</div>

		<div v-if="ongoingGames.length == 0">
			NOBODY IS PLAYING RIGHT NOW :(
		</div>

	</div>
</template>

<style scoped>

	.match-exterior-container {
		border: 1px solid #4BFE65;
		height: 50px;
	}

	.match-interior-container {
		margin: auto;
		display: flex;
		width: fit-content;
	}

	.player {
		display: flex;
		align-items: center;
		height: 50px;
	}

	.player-img {
		display: flex;
	}

	.player-img img {
		width: 50px;
		height: 50px;
	}

	.player-name {
		display: none;
	}

	.player-score {
		background-color: #4BFE65;
		display: flex;
		justify-content: center;
		align-items: center;
		box-sizing: border-box;
		padding: 24px;
		color: black;
		height: 50px;
	}

	.vs-block {
		display: flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
		padding: 24px;
		height: 50px;
	}

	/* Everything bigger than 850px */
	@media only screen and (min-width: 850px) {
		.player-name {
			display: block;
		}

		.player-left .player-img {
			margin-right: 20px;
		}

		.player-right .player-img {
			margin-left: 20px;
		}

		.player-left .player-name {
			margin-right: 20px;
		}

		.player-right .player-name {
			margin-left: 20px;
		}
	}


</style>
