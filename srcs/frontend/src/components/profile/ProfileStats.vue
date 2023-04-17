<script setup lang="ts">

	import { onBeforeMount, ref } from "vue";
	import { user } from "../../user"
	import StatBox from "./StatBox.vue";
	import Table from "../ui/Table.vue"
	import type { UserData } from "@/interfaces";
	import { computed } from "@vue/reactivity";
	import TextInputField from "../ui/TextInputField.vue";



	async function getUsers(): Promise<UserData[] | null> {
		const usersRequest = await fetch("http://localhost:3000/users", {
			headers: {
				"Authorization": `Bearer ${user.token}`
			}
		});

		if (usersRequest.status != 200) {
			return null;
		}

		const users: UserData[] = await usersRequest.json();

		return users;
	}

	// async function getWins(): Promise<UserData[] | null> {
	// 	users.value = await getUsers();
	// 	const wins: UserData[] = users.value?.keys;
	// 	return wins;
	// }

</script>

<template>
	<!-- Square boxes with a title and info of the profile separated by equal spacing an responsive-->
	<div class="SquareStatsGrid">
		<StatBox title="WINS" stat="1000"/>
		<StatBox title="LOSSES" stat="1000"/>
		<StatBox title="W/L" stat="1000"/>
		<StatBox title="SCORED GOALS" stat="1000"/>
		<StatBox title="RECEIVED GOALS" stat="1000"/>
		<StatBox title="TOTAL MATCHES" stat="1000"/>
		<StatBox title="S/R" stat="1000"/>
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
