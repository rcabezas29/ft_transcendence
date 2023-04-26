<script setup lang="ts">
  import { onBeforeMount, ref } from "vue";
  import { user } from "../../user";
  import StatBox from "./StatBox.vue";
  import type { UserData } from "@/interfaces";

  interface Props {
    userId: number
  }

  const props = withDefaults(defineProps<Props>(), {
    userId: user.id
  });

  let currentUser: UserData | null = null;

  let totalWins = ref<number>(0);
  let totalLosses = ref<number>(0);
  let winLossRatio = ref<number>(0);
  let scoredGoals = ref<number>(0);
  let receivedGoals = ref<number>(0);
  let totalMatches = ref<number>(0);
  let scoreRatio = ref<number>(0);
  let username = ref<string>("");
  let elo = ref<number>(0);
  let avatarUrl = ref<string>("");

  onBeforeMount(async () => {
    currentUser = await getCurrentUser();
    if (!currentUser) {
      return;
    }
	
	username.value = currentUser?.username;
	elo.value = currentUser?.elo;
	avatarUrl.value = `${import.meta.env.VITE_BACKEND_URL}/users/avatar/${currentUser.id}`;
    totalWins.value = currentUser?.stats.wonGames ?? 0;
    totalLosses.value = currentUser?.stats.lostGames ?? 0;
    if (totalLosses.value === 0) {
      winLossRatio.value = 1;
    } else {
      winLossRatio.value = totalWins.value / totalLosses.value ?? 0;
    }
    scoredGoals.value = currentUser?.stats.scoredGoals ?? 0;
    receivedGoals.value = currentUser?.stats.receivedGoals ?? 0;
    totalMatches.value = totalWins.value + totalLosses.value ?? 0;
    if (receivedGoals.value === 0) {
      scoreRatio.value = 1;
    } else {
      scoreRatio.value = scoredGoals.value / receivedGoals.value ?? 0;
    }
  });

	async function getCurrentUser() {
		const usersRequest = await fetch(`http://localhost:3000/users/${props.userId}`, {
			headers: {
			"Authorization": `Bearer ${user.token}`
			}
		});

		if (usersRequest.status != 200) {
			return null;
		}

		const userData: UserData = await usersRequest.json();
		return userData;
	}
</script>

<template>
	<div class="user-data-container">
		<div class="user-image">
			<div class="user-image">
				<img :src=avatarUrl />
			</div>
		</div>
		<div class="user-data">
			<h1>{{ username }}</h1>
			<h2>ELO: {{ elo }}</h2>
		</div>
	</div>
	<div class="square-stats-grid">
		<StatBox title="WINS" :stat="totalWins"/>
		<StatBox title="LOSSES" :stat="totalLosses"/>
		<StatBox title="W/L" :stat="winLossRatio.toFixed(2)"/>
		<StatBox title="SCORED GOALS" :stat="scoredGoals"/>
		<StatBox title="RECEIVED GOALS" :stat="receivedGoals"/>
		<StatBox title="TOTAL MATCHES" :stat="totalMatches"/>
		<StatBox title="S/R" :stat="scoreRatio.toFixed(2)"/>
	</div>
</template>

<style scoped>

.user-data-container {
	display: flex;
	margin: auto;
}

.user-data {
	margin-left: 24px;
}

.square-stats-grid {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  flex-flow: row wrap;
  gap: 24px;
  box-sizing: border-box;
  padding-bottom: 20px;
  margin-top: 24px;
}

  /* Everything bigger than 850px */
@media only screen and (min-width: 850px) {
  .square-stats-grid {
    justify-content: space-between;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    grid-gap: 1rem;
    gap: 42px;
  }

  .user-data-container {
	margin-left: 0;
  }
}
</style>
