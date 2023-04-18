<script setup lang="ts">
  import { onBeforeMount, ref } from "vue";
  import { user } from "../../user";
  import StatBox from "./StatBox.vue";
  import Table from "../ui/Table.vue";
  import type { UserData } from "@/interfaces";
  import { computed } from "@vue/reactivity";
  import TextInputField from "../ui/TextInputField.vue";

  let currentUser: UserData | null = null;

  onBeforeMount(async () => {
    currentUser = await getCurrentUser();
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

  const totalWins = computed(() => currentUser?.stats.wins ?? 0);
  const totalLosses = computed(() => currentUser?.stats.lostGames ?? 0);
  const winLossRatio = computed(() => totalWins.value / totalLosses.value);
  const scoredGoals = computed(() => currentUser?.stats.scoredGoals ?? 0);
  const receivedGoals = computed(() => currentUser?.stats.receivedGoals ?? 0);
  const totalMatches = computed(() => totalWins.value + totalLosses.value);
  const scoreRatio = computed(() => scoredGoals.value / receivedGoals.value);
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
