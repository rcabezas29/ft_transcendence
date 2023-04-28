<script setup lang="ts">
	import { onBeforeMount, ref } from "vue";
	import { user } from "../../../user";
	import Table from "../../ui/Table.vue";
	import { computed } from "@vue/reactivity";
	import TextInputField from "../../ui/TextInputField.vue";
	import router from '../../../router';
	import { FriendshipStatus, type UserFriend } from "@/interfaces/user-data.interface";

	interface Props {
		userId: number
	}

	const props = withDefaults(defineProps<Props>(), {
		userId: user.id
	});

	async function getFriends(): Promise<UserFriend[] | null> {
		const usersRequest = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/${props.userId}/friends`, {
			headers: {
				"Authorization": `Bearer ${user.token}`
			}
		});

		if (usersRequest.status != 200) {
			return null;
		}

		const users: UserFriend[] = (await usersRequest.json()).filter((u: UserFriend) => u.friendshipStatus === FriendshipStatus.Active);

		users.map(user => {
			user.avatarURL = `${import.meta.env.VITE_BACKEND_URL}/users/avatar/${user.userId}`
		});

		return users;
	}

	const users = ref<UserFriend[] | null>([]);
	const input = ref<string>("");
	const filteredUsers = computed(() => {
		if (users.value == null)
			return [];

		return users.value?.filter( (user) => user.username.toLowerCase().includes(input.value.toLowerCase()) );
	});

	onBeforeMount(async () => {
		users.value = await getFriends();
	})

	function redirectToUserProfile(userId: number) {
		router.push(`/profile/${userId}`);
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
				<th class="user-column">user</th>
				<th>elo</th>
				<th class="mobile-hidden">wins</th>
				<th class="mobile-hidden">losses</th>
				<th class="mobile-hidden">W/L</th>
			</tr>
		</template>
		<template #body>
			<tr v-for="(userRow, index) in filteredUsers" :key="userRow.userId" @click="redirectToUserProfile(userRow.userId)">
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
				<td class="mobile-hidden">{{ userRow.wonGames }}</td>
				<td class="mobile-hidden">{{ userRow.lostGames }}</td>
				<td class="mobile-hidden">{{ (userRow.lostGames == 0) ? 0 : (userRow.wonGames / userRow.lostGames).toFixed(2) }}</td>
			</tr>
			<td colspan="2" v-if="filteredUsers.length === 0">
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
