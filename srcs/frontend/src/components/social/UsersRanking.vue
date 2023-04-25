<script setup lang="ts">

	import { onBeforeMount, ref } from "vue";
	import { user } from "../../user";
	import Table from "../ui/Table.vue";
	import type { UserData } from "@/interfaces";
	import { computed } from "@vue/reactivity";
	import TextInputField from "../ui/TextInputField.vue";

	async function getUsers(): Promise<UserData[] | null> {
		const usersRequest = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users`, {
			headers: {
				"Authorization": `Bearer ${user.token}`
			}
		});

		if (usersRequest.status != 200) {
			return null;
		}

		const users: UserData[] = await usersRequest.json();
		users.map(user => {
			user.avatarURL = `${import.meta.env.VITE_BACKEND_URL}/users/avatar/${user.id}`
		})

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
		if (users.value)
			users.value!.sort((e1, e2) => e2.elo - e1.elo);
	})

</script>

<template>

	<div class="search-bar">
		<TextInputField v-model="input" placeholderText="SEARCH PEOPLE..."/>
	</div>
	
	<Table class="users-table">
		<template #head>
			<tr>
				<th>#</th>
				<th class="user-column">user</th>
				<th>elo</th>
				<th class="mobile-hidden">wins</th>
				<th class="mobile-hidden">losses</th>
				<th class="mobile-hidden">W/L</th>
			</tr>
		</template>
		<template #body>
			<tr v-for="(userRow, index) in filteredUsers">
				<td>
					<div class="table-square">
						<span>{{ index + 1 }}</span>
					</div>
				</td>
				<td>
					<div class="table-user">
						<span class="table-user-img">
							<img :src=userRow.avatarURL />
						</span>
						<span class="table-username">
							<div class="truncate">
								{{ userRow.username }}
							</div>
						</span>
					</div>
				</td>
				<td>{{ userRow.elo }}</td>
				<td class="mobile-hidden">{{ userRow.stats.wonGames }}</td>
				<td class="mobile-hidden">{{ userRow.stats.lostGames }}</td>
				<td class="mobile-hidden">{{ (userRow.stats.lostGames == 0) ? 0 : (userRow.stats.wonGames / userRow.stats.lostGames).toFixed(2) }}</td>
			</tr>
			<td colspan="2" v-if="input && filteredUsers.length === 0">
				<p>No users found!</p>
			</td>
		</template>
	</Table>
	
</template>

<style scoped>
	.search-bar {
		padding: 0px 8px;
	}

	.search-bar input {
		height: 46px;
	}

	.users-table {
		margin-top: 24px;
		width: 100%;
		table-layout: fixed;
	}

	th {
		width: 2%;
	}

	.user-column {
		width: 10%;
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
	}

	.table-user-img {
		display: flex;
	}

	.table-user-img img {
		width: 36px;
		height: 36px;
	}

	.table-username {
		margin-left: 12px;
		display: table;
		table-layout: fixed;
		width: 100%;
	}

	.truncate {
		display: table-cell;
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
	}

	.mobile-hidden {
		display: none;
	}

	/* Everything bigger than 850px */
	@media only screen and (min-width: 850px) {

		.mobile-hidden {
			display: table-cell;
		}
	
	}

</style>
