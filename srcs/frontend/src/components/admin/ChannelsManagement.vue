<script setup lang="ts">
	import { computed, ref, watch } from "vue";
	import { channelController } from '@/channelController';
	import Table from "../ui/Table.vue";
	import LockIcon from "../icons/LockIcon.vue";
	import type { Channel } from "@/interfaces";
	import Button from "../ui/Button.vue";
	import CrossIcon from "../icons/CrossIcon.vue";
	import ChannelMessages from "./channels/ChannelMessages.vue";
	import Modal from "../ui/Modal.vue";
	import ChannelUsersManagement from "./channels/ChannelUsersManagement.vue";

	const selectedChannel = ref<Channel | null>(null);
	function selectChannel(channel: Channel): void {
		selectedChannel.value = channel;
	}

	function unselectChannel():void {
		if (!channelChatOpened.value && !manageUsersModalOpened.value) {
			selectedChannel.value = null;
		}
	}

	function isChannelSelected(channel: Channel): boolean {
		return channel === selectedChannel.value;
	}

	const channelChatOpened = ref<boolean>(false);
	function channelChatOn() {
		channelChatOpened.value = true;
	}

	function channelChatOff() {
		channelChatOpened.value = false;
		unselectChannel();
	}

	const manageUsersModalOpened = ref<boolean>(false);
	function manageUsersOn() {
		manageUsersModalOpened.value = true;
	}

	function manageUsersOff() {
		manageUsersModalOpened.value = false;
		unselectChannel();
	}

	const currentChannelName = computed<string>(() => {
		if (selectedChannel.value)
			return selectedChannel.value.name;
		return "";
	});

	watch(channelController.channels, () => {
		if (!(currentChannelName.value in channelController.channels)) {
			channelChatOff();
			manageUsersOff();
		}
	});

</script>

<template>

	<Table class="channels-table">
		<template #head>
			<tr>
				<th class="mobile-hidden">is_private</th>
				<th class="channel-name-col">channel_name</th>
				<th>#participants</th>
				<th class="mobile-hidden">owner</th>
			</tr>
		</template>
		<template #body>
			<tr class="table-row" v-for="channel in channelController.channels" :key="channel.name" @click="selectChannel(channel)" @mouseenter="selectChannel(channel)" @mouseleave="unselectChannel">
				<td v-show="!isChannelSelected(channel)" class="table-square mobile-hidden">
					<LockIcon v-if="channel.isPrivate" fill-colour="#B3F9D7"/>
				</td>
				<td v-show="!isChannelSelected(channel)">
					<span class="channel-name">
						<div class="truncate">
							{{ channel.name }}
						</div>
					</span>
				</td>
				<td v-show="!isChannelSelected(channel)">
					<span>{{ channel.users.length }}</span>
				</td>
				<td v-show="!isChannelSelected(channel)" class="mobile-hidden">
					<span>{{ channel.owner.username }}</span>
				</td>
				<td class="hovering-row" v-show="isChannelSelected(channel)" colspan="4">
					<div class="option-buttons">
						<Button class="row-button" :selected="true" @click.stop="channelChatOn">
							VIEW CHAT
						</Button>
						<Button class="row-button" :selected="true" @click.stop="manageUsersOn">
							MANAGE USERS
						</Button>
						<Button class="row-button" :selected="true" @click.stop="() => channelController.deleteChannel(channel.name)">
							DELETE CHANNEL
						</Button>
						<Button class="row-button cross-button desktop-hidden" :selected="true" @click.stop="unselectChannel">
							<CrossIcon/>
						</Button>
					</div>
				</td>
			</tr>
			<td colspan="2" v-if="Object.keys(channelController.channels).length === 0">
				There are no channels yet...
			</td>
		</template>
	</Table>

	<Modal :visible="channelChatOpened" @close="channelChatOff" title="CHANNEL CHAT">
		<ChannelMessages :channel-name="currentChannelName"/>
	</Modal>

	<Modal :visible="manageUsersModalOpened" @close="manageUsersOff" title="USERS MANAGEMENT">
		<ChannelUsersManagement :channel-name="currentChannelName" @close="manageUsersOff"/>
	</Modal>

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

	.table-row {
		height: 50px;
		cursor: default;
		box-sizing: border-box;
	}

	.table-row:hover {
		background-color: #08150C;
	}

	.hovering-row {
		height: 100%;
		box-sizing: border-box;
		padding: 2px;
	}

	.option-buttons {
		height: 100%;
		display: flex;
		flex-direction: row;
		gap: 2px;
		box-sizing: border-box;
	}

	.row-button {
		box-sizing: border-box;
		padding: 9px 12px;
		border-width: 1px;
		flex: 1;
	}

	.cross-button {
		flex: 0.25;
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

		.desktop-hidden {
			display: none;
		}
	}

</style>