<script setup lang="ts">

	import { onBeforeMount, ref } from "vue";
	import { user } from "../../user";
	import Table from "../ui/Table.vue";
	import type { UserData } from "@/interfaces";
	import { computed } from "@vue/reactivity";
	import TextInputField from "../ui/TextInputField.vue";
	import Button from "../ui/Button.vue";
	import { UserRole } from "@/interfaces/user-data.interface";
	import CrossIcon from "../icons/CrossIcon.vue";

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

	function userIsOwner(user: UserData) {
		return user.role == UserRole.OWNER;
	}

	async function makeWebsiteAdmin() {
		if (!user.isWebsiteOwner() || !currentUser.value || currentUser.value.role != UserRole.USER)
			return;

		const httpResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/role/${currentUser.value.id}`, {
			method: "PATCH",
			headers: {
				"Authorization": `Bearer ${user.token}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({role: UserRole.ADMIN})
		});

		if (httpResponse.status != 200) {
			console.log("error while making admin");
			return;
		}

		user.socket?.emit("new-website-admin", currentUser.value.id);
		const updatedUser = users.value?.find((u) => u.id == currentUser.value?.id);
		updatedUser!.role = UserRole.ADMIN;
	}

	async function removeWebsiteAdmin() {
		if (!user.isWebsiteOwner() || !currentUser.value || currentUser.value.role != UserRole.ADMIN)
			return;

		const httpResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/role/${currentUser.value.id}`, {
			method: "PATCH",
			headers: {
				"Authorization": `Bearer ${user.token}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({role: UserRole.USER})
		});

		if (httpResponse.status != 200) {
			console.log("error while removing admin");
			return;
		}

		user.socket?.emit("remove-website-admin", currentUser.value.id);
		const updatedUser = users.value?.find((u) => u.id == currentUser.value?.id);
		updatedUser!.role = UserRole.USER;
	}

	async function banFromWebsite() {
		if (!user.isWebsiteAdmin() || !currentUser.value || currentUser.value.role == UserRole.OWNER)
			return;

		const httpResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/${currentUser.value.id}/ban`, {
			method: "PATCH",
			headers: {
				"Authorization": `Bearer ${user.token}`,
			}
		});

		if (httpResponse.status != 200) {
			console.log("error while banning user");
			return;
		}

		user.socket?.emit("ban-from-website", currentUser.value.id);

		const updatedUser = users.value?.find((u) => u.id == currentUser.value?.id);
		updatedUser!.isBanned = true;
	}

	async function unbanFromWebsite() {
		if (!user.isWebsiteAdmin() || !currentUser.value || currentUser.value.role == UserRole.OWNER)
			return;

		const httpResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/${currentUser.value.id}/unban`, {
			method: "PATCH",
			headers: {
				"Authorization": `Bearer ${user.token}`,
			}
		});

		if (httpResponse.status != 200) {
			console.log("error while unbanning user");
			return;
		}

		const updatedUser = users.value?.find((u) => u.id == currentUser.value?.id);
		updatedUser!.isBanned = false;
	}

	const currentUser = ref<UserData | null>(null);
	function setCurrentUser(selectedUser: UserData): void {
		if (!userIsOwner(selectedUser) && selectedUser.id != user.id)
			currentUser.value = selectedUser;
	}

	function unsetCurrentUser():void {
		currentUser.value = null;
	}

	function isCurrentUser(selectedUser: UserData): boolean {
		return selectedUser === currentUser.value;
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
			</tr>
		</template>
		<template #body>
			<tr class="table-row" v-for="userRow in filteredUsers" :key="userRow.id" @click="setCurrentUser(userRow)" @mouseenter="setCurrentUser(userRow)" @mouseleave="unsetCurrentUser">
				<td v-show="!isCurrentUser(userRow)" class="table-square" :class="{banned: userRow.isBanned}">
					<span>{{ userRow.id }}</span>
				</td>
				<td v-show="!isCurrentUser(userRow)">
					<div class="table-user">
						<span class="table-user-img">
							<img :src=userRow.avatarURL />
						</span>
						<span class="table-username">
							{{ userRow.username }}
						</span>
					</div>
				</td>
				<td v-show="!isCurrentUser(userRow)">
					<span>{{ userRow.role }}</span>
				</td>
				<td class="hovering-row" v-show="isCurrentUser(userRow)" colspan="3">
					<div class="buttons">
						<div class="option-buttons" v-if="user.isWebsiteOwner() && !userIsOwner(userRow)">
							<Button class="row-button" v-if="!userIsAdmin(userRow)" @click.stop="makeWebsiteAdmin()" :selected="true">
								PROMOTE TO ADMIN
							</Button>
							<Button class="row-button" v-else @click.stop="removeWebsiteAdmin()" :selected="true">
								REMOVE ADMIN
							</Button>
						</div>
						<div class="option-buttons" v-if="!userIsOwner(userRow)">
							<Button class="row-button" v-if="!userRow.isBanned" @click.stop="banFromWebsite()" :selected="true">
								BAN USER
							</Button>
							<Button class="row-button" v-else @click.stop="unbanFromWebsite()" :selected="true">
								UNBAN USER
							</Button>
						</div>
						<div class="option-buttons cross-button desktop-hidden">
							<Button class="row-button" :selected="true" @click.stop="unsetCurrentUser">
								<CrossIcon/>
							</Button>
						</div>
					</div>
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

	.banned {
		background-color: gray;
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

	.table-row {
		height: 50px;
		cursor: default;
		box-sizing: border-box;
	}

	.table-row:hover {
		background-color: #08150C;
		color: #B3F9D7;
	}

	.hovering-row {
		height: 100%;
		box-sizing: border-box;
		padding: 2px;
	}

	.buttons {
		height: 100%;
		display: flex;
		flex-direction: row;
		gap: 2px;
		box-sizing: border-box;
	}

	.option-buttons {
		height: 100%;
		display: flex;
		box-sizing: border-box;
		flex: 1;
	}

	.cross-button {
		flex: 0.25;
	}

	.row-button {
		box-sizing: border-box;
		padding: 9px 12px;
		border-width: 1px;
	}

	/* Everything bigger than 850px */
	@media only screen and (min-width: 850px) {
		.desktop-hidden {
			display: none;
		}
	}

</style>
