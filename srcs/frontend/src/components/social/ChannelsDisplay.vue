<script setup lang="ts">
	import { channelController } from '@/channelController';
	import { ref } from 'vue';
	import Table from "../ui/Table.vue";
	import LockIcon from "../icons/LockIcon.vue";
	import Button from "../ui/Button.vue";
	import Modal from "../ui/Modal.vue";
	import TextInputField from "../ui/TextInputField.vue";
	import type { Channel } from "../../interfaces";

	const newChannelNameInput = ref("");
	const newChannelPasswordInput = ref("");
	const insertedPassword = ref("");
	const errorMessage = ref("");

	const createChannelModalVisible = ref<boolean>(false);
	function openCreateChannelModal() {
		createChannelModalVisible.value = true;
	}

	function closeCreateChannelModal() {
		createChannelModalVisible.value = false;
		newChannelNameInput.value = "";
		newChannelPasswordInput.value = "";
		errorMessage.value = "";
	}

	function createChat(e: Event) {
		if (newChannelNameInput.value.length == 0) {
			errorMessage.value = "please enter a name for the new channel";
			return;
		}

		if (newChannelNameInput.value.length > 20) {
			errorMessage.value = "channel name must be 20 characters max";
			return;
		}

		if (!channelController.createChannel(newChannelNameInput.value, newChannelPasswordInput.value)) {
			errorMessage.value = "channel name already in use. Choose a different one";
			return;
		}
		closeCreateChannelModal();
	}

	
	const passwordModalVisible = ref<boolean>(false);
	const passwordModalChannelName = ref<string>("");
	function openPasswordModal(channelName: string) {
		passwordModalVisible.value = true;
		passwordModalChannelName.value = channelName;
	}

	function closePasswordModal() {
		passwordModalVisible.value = false;
		insertedPassword.value = "";
		errorMessage.value = "";
		passwordModalChannelName.value = "";
	}

	function handleJoinClick(channel: Channel) {
		if (channel.isPrivate) {
			openPasswordModal(channel.name);
		} else {
			channelController.joinChannel(channel.name);
		}
	}

	function joinWithPassword() {
		if (insertedPassword.value.length == 0) {
			errorMessage.value = `insert password to join private channel ${passwordModalChannelName.value}`;
			return;
		}
		channelController.joinChannel(passwordModalChannelName.value, insertedPassword.value);
		closePasswordModal();
	}

</script>

<template>
	<Table class="channels-table">
		<template #head>
			<tr>
				<th>is_private</th>
				<th class="channel-name-col">channel_name</th>
				<th class="mobile-hidden">#participants</th>
				<th class="mobile-hidden">owner</th>
				<th class="join-column"></th>
			</tr>
		</template>
		<template #body>
			<tr v-for="channel in channelController.channels" :key="channel.name">
				<td class="table-square">
					<LockIcon v-if="channel.isPrivate" fill-colour="#B3F9D7"/>
				</td>
				<td>
					<span class="channel-name">
						<div class="truncate">
							{{ channel.name }}
						</div>
					</span>
				</td>
				<td class="mobile-hidden">
					<span>{{ channel.users.length }}</span>
				</td>
				<td class="mobile-hidden">
					<span>{{ channel.owner.username }}</span>
				</td>
				<td style="padding: 0px">
					<Button class="join-button" @click="() => handleJoinClick(channel)" v-if="!channelController.userIsMemberOfChannel(channel.name)" :selected="true">
						JOIN
					</Button>
					<Modal :visible="passwordModalVisible" @close="closePasswordModal" :title="`JOIN ${passwordModalChannelName}`">
						<p class="errorMessage">{{ errorMessage }}</p>

						<TextInputField type="password" v-model="insertedPassword" placeholder-text="ENTER CHANNEL PASSWORD" />

						<div class="modal-buttons">
							<Button @click="() => joinWithPassword()" :selected="true">JOIN</Button>
							<Button @click="closePasswordModal">CANCEL</Button>
						</div>
					</Modal>
				</td>
			</tr>
			<td colspan="3" v-if="Object.keys(channelController.channels).length === 0">
				There are no channels yet... Would you like to create one? :)
			</td>
		</template>
	</Table>

	<div class="channel-creation">
		<Button class="create-button" @click="openCreateChannelModal" :selected="true">
			CREATE NEW CHANNEL
		</Button>
		<Modal :visible="createChannelModalVisible" @close="closeCreateChannelModal" title="CREATE NEW CHANNEL">
			<p class="errorMessage">{{ errorMessage }}</p>

			<form @submit.prevent="createChat">
				<p>Enter channel name:</p>
				<TextInputField v-model="newChannelNameInput" placeholder-text="CHANNEL NAME" />
				<p>Enter channel password (optional):</p>
				<TextInputField type="password" v-model="newChannelPasswordInput" placeholder-text="CHANNEL PASSWORD (OPTIONAL)" />

				<div class="modal-buttons">
					<Button type="submit" :selected="true">CREATE</Button>
					<Button type="button" @click="closeCreateChannelModal">CANCEL</Button>
				</div>
			</form>
			
		</Modal>
	</div>
</template>

<style scoped>

	.channels-table {
		width: 100%;
		table-layout: fixed;
	}

	th {
		width: 2%;
	}

	.channel-name-col {
		width: 10%;
	}

	.table-square {
		width: 50px;
		height: 50px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-left: 12px;
	}

	.mobile-hidden {
		display: none;
	}

	tbody tr {
		cursor: default;
	}

	tbody tr:hover {
		background-color: #08150C;
		color: #B3F9D7;
	}

	.join-button {
		width: 100%;
		height: 50px;
		padding: 10px 10px;
		cursor: pointer;
	}

	.join-button:hover, .create-button:hover {
		background-color: #08150C;
		color: #B3F9D7;
	}

	.channel-creation {
		box-sizing: border-box;
		margin-top: 24px;
		padding: 0px 8px;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.modal-buttons {
		box-sizing: border-box;
		margin-top: 24px;
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		gap: 10px;
		padding: 0px 36px;
	}

	.errorMessage {
		color: #EC3F74;
	}

	.channel-name {
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

	/* Everything bigger than 850px */
	@media only screen and (min-width: 850px) {
		.mobile-hidden {
			display: table-cell;
		}

		.create-button {
			max-width: 300px;
		}

		.modal-buttons {
			flex-direction: row;
			justify-content: center;
		}
	}

</style>
