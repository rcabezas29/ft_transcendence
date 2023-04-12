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

	const users = ref<UserData[] | null>([]);
	const input = ref<string>("");
	const filteredUsers = computed(() => {
		if (users.value == null)
			return [];

		return users.value?.filter( (user) => user.username.toLowerCase().includes(input.value.toLowerCase()) );
	});

	onBeforeMount(async () => {
		users.value = await getUsers();
		users.value!.sort((e1, e2) => e2.elo - e1.elo);
	})

</script>

<template>
	<!-- Square boxes with a title and info of the profile separated by equal spacing an responsive-->
	<div class="SquareStatsGrid">
		<StatBox title="ELO" stat="1000"/>
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
