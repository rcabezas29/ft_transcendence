<script setup lang="ts">

	import { onBeforeMount, ref } from "vue";
	import { user } from "../../user"
	import StatBox from "./StatBox.vue";
	import Table from "../ui/Table.vue"
	import type { UserData } from "@/interfaces";
	import { computed } from "@vue/reactivity";
	import TextInputField from "../ui/TextInputField.vue";


	// async function getUsers(): Promise<UserData[] | null> {
	// 	const usersRequest = await fetch("http://localhost:3000/users", {
	// 		headers: {
	// 			"Authorization": `Bearer ${user.token}`
	// 		}
	// 	});

	// 	if (usersRequest.status != 200) {
	// 		return null;
	// 	}

	// 	const users: UserData[] = await usersRequest.json();

	// 	return users;
	// }

	async function getCurrentUser(){
		const usersRequest = await fetch(`http://localhost:3000/users/${user.id}`, {
			headers: {
				"Authorization": `Bearer ${user.token}`
			}
		});

		if (usersRequest.status != 200) {
			return null;
		}

		const usernameUpdateOk: UserData[] = await usersRequest.json();

		return user;
	}

	console.log(user.token);
	

	async function totalWins() {
		const user = await getCurrentUser();
		const wins = users?.filter(user => user.stats.wonGames > 0);
		return wins?.length;
	}

	async function totalLosses() {
		const users = await getCurrentUser();
		const losses = users?.filter(user => user.stats.lostGames > 0);
		return losses?.length;
	}

	// async function winsLosses() {
	// 	const wins: number = await totalWins();
	// 	const losses: number = await totalLosses();
	// 	const wL = wins / losses;
	// 	return wL;
	// }

	async function scoredGoals() {
		const users = await getCurrentUser();
		const goals = users?.map(user => user.stats.scoredGoals >);
		return goals;
	}
	

</script>

<template>
	<!-- Square boxes with a title and info of the profile separated by equal spacing an responsive-->
	<div class="SquareStatsGrid">
		<StatBox title="WINS" stat="1000000000"/>
		<StatBox title="LOSSES" stat="1000"/>
		<StatBox title="W/L" stat="1000"/>
		<StatBox title="SCORED GOALS" stat="1000"/>
		<StatBox title="RECEIVED GOALS" stat="1000"/>
		<StatBox title="TOTAL MATCHES" stat="1000"/>
		<StatBox title="S/R" stat="1000"/>
	</div>

</template>

<style scoped>

</style>
