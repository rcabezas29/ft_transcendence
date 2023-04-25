<script setup lang="ts">
  import { onBeforeMount, ref } from "vue";
  import { user } from "../../user";
  import StatBox from "./StatBox.vue";
  import type { UserData } from "@/interfaces";

  let currentUser: UserData | null = null;

  let totalWins = ref<number>(0);
  let totalLosses = ref<number>(0);
  let winLossRatio = ref<number>(0);
  let scoredGoals = ref<number>(0);
  let receivedGoals = ref<number>(0);
  let totalMatches = ref<number>(0);
  let scoreRatio = ref<number>(0);

  onBeforeMount(async () => {
    currentUser = await getCurrentUser();

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
    const usersRequest = await fetch(`http://localhost:3000/users/${user.id}`, {
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
  <div class="SquareStatsGrid">
    <StatBox title="WINS" :stat="totalWins"/>
    <StatBox title="LOSSES" :stat="totalLosses"/>
    <StatBox title="W/L" :stat="winLossRatio"/>
    <StatBox title="SCORED GOALS" :stat="scoredGoals"/>
    <StatBox title="RECEIVED GOALS" :stat="receivedGoals"/>
    <StatBox title="TOTAL MATCHES" :stat="totalMatches"/>
    <StatBox title="S/R" :stat="scoreRatio"/>
  </div>
</template>

<style scoped>
  .StatSquare{
    display: flex;
    align-items: center;
    justify-content: center;
    border: 4px solid #4BFE65;
    padding: 4px;
  }
  .SquareStatsGrid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    grid-gap: 1rem;
  }
</style>
