<script setup lang="ts">
	import { spectatorController } from '@/spectatorController';
	import { user } from '../../user'
</script>

<template>
	<div class="ongoing-matches">
		<div class="match-exterior-container"
			v-for="game in spectatorController.ongoingGames"
			v-if="!spectatorController.ongoingGames.find((game) => game.player1 === user.username || game.player2 === user.username)"
			@click="spectatorController.watchGame(game.name)"
		>
			
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

		<div v-if="
				spectatorController.ongoingGames.length == 0
				|| 
				(spectatorController.ongoingGames.length === 1
				&& spectatorController.ongoingGames.find((game) => game.player1 === user.username
				|| game.player2 === user.username)
				)">
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
