<script setup lang="ts">

	import { onBeforeMount, ref } from "vue";
	import { user } from "../../user"

	async function getUsers() {

		const usersRequest = await fetch("http://localhost:3000/users", {
			headers: {
				"Authorization": `Bearer ${user.token}`
			}
		});

		if (usersRequest.status != 200) {
			return null;
		}

		return await usersRequest.json()
	}

	const users = ref([])

	onBeforeMount(async () => {
		users.value = await getUsers()
		users.value.sort((e1, e2) => e2["elo"] - e1["elo"])
	})

</script>

<template>
	<h2>Users ranking</h2>

	<li v-for="user in users">
		{{ user["username"] }} - {{ user["elo"] }}
	</li>

</template>

<style scoped>


</style>
