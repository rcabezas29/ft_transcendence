<script setup lang="ts">
	import { onBeforeMount, onBeforeUnmount, ref, type Ref, computed } from 'vue';
	import { user } from "../../user"
	import router from "../../router"

	interface OngoingGame {
		name: string;
		player1: string;
		player1Id: number;
		player1AvatarURL: string;
		player1Score: number;
		player2: string;
		player2Id: number;
		player2AvatarURL: string;
		player2Score: number;
	}

	const ongoingGames: Ref<OngoingGame[]> = ref([]);

	function fetchOngoingGames(games: OngoingGame[]) {
		games.map(game => {
			game.player1AvatarURL = `${import.meta.env.VITE_BACKEND_URL}/users/avatar/${game.player1Id}`;
			game.player2AvatarURL = `${import.meta.env.VITE_BACKEND_URL}/users/avatar/${game.player2Id}`;
		})
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

	})

	onBeforeUnmount(() => {
		user.socket?.off("spectator-new-game");
		user.socket?.off("spectator-end-game");
		user.socket?.off("ongoing-games");
	})

</script>

<template>
	<div class="ongoing-matches">
		<div class="match-exterior-container" v-for="game in ongoingGames"  v-if="!ongoingGames.find((game) => game.player1 === user.username || game.player2 === user.username)" @click="watchGame(game.name)">
			
			<div class="match-interior-container">

				<div class="player player-left">
					<span class="player-name">
						<div class="truncate">
							{{ game.player1 }}
						</div>
					</span>
					<div class="player-img">
						<img id="user-image" :src="game.player1AvatarURL" />
					</div>
					<div class="player-score">
						<span>{{ game.player1Score }}</span>
					</div>
				</div>

				<div class="vs-block">
					<span>vs</span>
				</div>

				<div class="player player-right">
					<div class="player-score">
						<span>{{ game.player2Score }}</span>
					</div>
					<div class="player-img">
						<img id="user-image" :src="game.player2AvatarURL" />
					</div>
					<span class="player-name">
						<div class="truncate">
							{{ game.player2 }}
						</div>
					</span>
				</div>

			</div>
		</div>

		<div v-if="ongoingGames.length == 0 || (ongoingGames.length === 1 && ongoingGames.find((game) => game.player1 === user.username || game.player2 === user.username))">
			NOBODY IS PLAYING RIGHT NOW :(
		</div>
	</div>
</template>

<style scoped>

	.match-exterior-container {
		border: 1px solid #4BFE65;
		height: 50px;
		cursor: pointer;
		margin-bottom: 10px;
	}

	.match-interior-container {
		margin: auto;
		display: flex;
		justify-content: center;
	}

	.player {
		display: flex;
		align-items: center;
		height: 50px;
		flex: 1;
		min-width: 50px;
	}

	.player-img {
		display: none;
	}

	.player-img img {
		width: 50px;
		height: 50px;
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
		width: 50px;
	}

	.vs-block {
		display: flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
		width: 50px;
		height: 50px;
	}

	.player-left {
		text-align: right;
		justify-content: flex-end;
	}

	.player-right {
		text-align: left;
		justify-content: flex-start;
	}

	.player-name {
		display: block;
		width: 100%;
		min-width: 50px;
		padding: 0px 10px;
	}

	.truncate {
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
	}

	/* Everything bigger than 850px */
	@media only screen and (min-width: 850px) {

		.player-img {
			display: flex;
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
