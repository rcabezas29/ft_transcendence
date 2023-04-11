<script setup lang="ts">

	import { currentChat, chatIsChannel } from '@/currentChat'
	import ChatChannelUserList from '@/components/chat/ChatChannelUserList.vue';
	import CrossIcon from "../icons/CrossIcon.vue";

    const emit = defineEmits(["close"]);

    function closeInfo() {
        emit("close");
    }

</script>

<template>
	<div class="info-container" v-if="currentChat && chatIsChannel(currentChat)">
        <div class="info-window">
            <div class="info-header">
                <span class="title">channel info</span>
                <span class="exit-button" @click="closeInfo">
                    <CrossIcon cross-colour="#1E9052"/>
                </span>
            </div>
            <div class="info-body">
                <ChatChannelUserList />
            </div>
        </div>
	</div>

</template>

<style scoped>
    .info-container {
		box-sizing: border-box;
		width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .info-window {
        box-sizing: border-box;
        background-color: #08150C;
		border: 1px solid #1E9052;
		width: 80%;
        height: 80%;
        display: flex;
        flex-direction: column;
    }

    .info-header {
		box-sizing: border-box;
		font-family: vp-pixel;
		color: #B3F9D7;
		background-color: #1E9052;
		padding: 6px;
		height: 36px;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

    .info-body {
        height: 100%;
    }

	.exit-button {
		background-color: #B3F9D7;
		padding: 4px;
		display: inline-flex;
		position: absolute;
		right: 6px;
	}

	.exit-button:hover {
		cursor: pointer;
	}

</style>
