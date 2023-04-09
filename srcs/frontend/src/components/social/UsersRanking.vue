<script setup lang="ts">

	import { onBeforeMount, ref } from "vue";
	import { user } from "../../user"
	import Table from "../ui/Table.vue"
	import FriendSearchBar from "@/components/friends/FriendSearchBar.vue";


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

	<div class="search-bar">
		<FriendSearchBar/>
	</div>
	
	<Table class="users-table">
		<template #head>
			<tr>
				<th>#</th>
				<th>user</th>
				<th>elo</th>
				<th>wins</th>
				<th>losses</th>
				<th>W/L</th>
			</tr>
		</template>
		<template #body>
			<tr v-for="userRow in users">
				<td>
					<div class="table-square">
						<span>1</span>
					</div>
				</td>
				<td>
					<div class="table-user">
						<span class="table-user-img">
							<img :src=user.avatarImageURL />
						</span>
						<span class="table-username">
							{{ userRow["username"] }}
						</span>
					</div>
				</td>
				<td>{{ userRow["elo"] }}</td>
				<td>123123</td>
				<td>123123</td>
				<td>12</td>
			</tr>
		</template>
	</Table>
</template>

<style scoped>
	.users-table {
		margin-top: 24px;
	}

	.table-square {
		background-color: #4BFE65;
		color: #08150C;
		width: 50px;
		height: 50px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.table-user {
		display: flex;
		align-items: center;
		width: fit-content;
	}

	.table-user-img img {
		width: 36px;
		height: 36px;
	}

</style>
