<script setup lang="ts">
	import { onBeforeMount, ref, type Ref } from 'vue';
	import { user } from "../../user";
	
	interface MatchHistory {
		id: number;
		user1Id: number;
		user2Id: number;
		winner: number;
		loser: number;
		score: number[];
		username1: string;
		username2: string;
	}

	const matchHistory: Ref<MatchHistory[] | null> = ref(null);
	
	onBeforeMount(async () => {
		const httpResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/match-history/${user.id}`, {
			method: "GET",
			headers: {
				"Authorization": `Bearer ${user.token}`,
			}
		});

		if (httpResponse.status != 200) {
			return;
		}

		matchHistory.value = await httpResponse.json();
		console.log(matchHistory.value);
	})

	function getUserImageUrl(userId: number) {
		return `${import.meta.env.VITE_BACKEND_URL}/users/avatar/${userId}`;
	}

</script>

<template>

	<div>

		<div class="match-exterior-container" v-for="match in matchHistory">
			
			<div class="match-interior-container">

				<div class="player player-left">
					<span class="player-name">
						<div class="truncate">
							{{match.username1}}
						</div>
					</span>
					<div class="player-img">
						<img id="user-image" :src="getUserImageUrl(match.user1Id)" />
					</div>
					<div class="player-score">
						<span>{{match.score[0]}}</span>
					</div>
				</div>

				<div class="vs-block">
					<span>vs</span>
				</div>

				<div class="player player-right">
					<div class="player-score">
						<span>{{match.score[1]}}</span>
					</div>
					<div class="player-img">
						<img id="user-image" :src="getUserImageUrl(match.user2Id)"/>
					</div>
					<span class="player-name">
						<div class="truncate">
							{{match.username2}}
						</div>
					</span>
				</div>

			</div>
		</div>

		<div v-if="matchHistory?.length == 0">
			NO MATCHES PLAYED
		</div>

	</div>
</template>

<style scoped>

	.match-exterior-container {
		border: 1px solid #4BFE65;
		height: 50px;
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
