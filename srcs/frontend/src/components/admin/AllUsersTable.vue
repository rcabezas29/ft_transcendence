<script setup lang="ts">

	import { onBeforeMount, ref } from "vue";
	import { user } from "../../user";
	import Table from "../ui/Table.vue";
	import type { UserData } from "@/interfaces";
	import { computed } from "@vue/reactivity";
	import TextInputField from "../ui/TextInputField.vue";
	import Button from "../ui/Button.vue";
	import { UserRole } from "@/interfaces/user-data.interface";

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
	})

	function userIsAdmin(user: UserData) {
		return user.role == UserRole.ADMIN || user.role == UserRole.OWNER;
	}

	function makeAdmin(user: UserData) {
		console.log("making admin")
	}

</script>

<template>

	<div class="search-bar">
		<TextInputField v-model="input" placeholderText="SEARCH PEOPLE..."/>
	</div>
	
	<Table class="users-table">
		<template #head>
			<tr>
				<th>#</th>
				<th>USER</th>
				<th>ROLE</th>
				<th></th>
			</tr>
		</template>
		<template #body>
			<tr v-for="(userRow, index) in filteredUsers">
				<td>
					<div class="table-square">
						<span>{{ userRow.id }}</span>
					</div>
				</td>
				<td>
					<div class="table-user">
						<span class="table-user-img">
							<img :src=userRow.avatarURL />
						</span>
						<span class="table-username">
							{{ userRow.username }}
						</span>
					</div>
				</td>
				<td>{{ userRow.role }}</td>
				<td >
					<a href="#" v-if="!userIsAdmin(userRow)" @click="makeAdmin(userRow)">Promote to admin</a>
				</td>
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

	.table-username {
		margin-left: 12px;
	}

	/* Everything bigger than 850px */
	@media only screen and (min-width: 850px) {

		.mobile-hidden {
			display: table-cell;
		}
	
	}

</style>
