<script setup lang="ts">
import { user } from "../../user"

</script>

<template>
    <div class="chat-container-header">
        <div class="back-arrow" >
            <BackArrow/>
        </div>
        <div class="chat-title" >
           Chat Name
        </div>
        <div class="chat-avatar">
            <img :src="user.avatarImageURL"/>
        </div>
    </div>
</template>

<style scoped>
	.chat-container-header {
		box-sizing: border-box;
		background-color: #1E9052;
		border-bottom: 4px solid #4BFE65;
		font-size: 18px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 4px 8px;
		width: 100%;
	}

	.back-arrow {
		height: 30px;
		width: 30px;
		display: flex;
		align-items: center;
	}

	.back-arrow:hover {
		cursor: pointer;
		color: #08150C;
	}

	.chat-title:hover {
		cursor: pointer;
		color: #08150C;
	}

	.chat-avatar {
		display: flex;
	}

	.chat-avatar img {
		box-sizing: border-box;
		border: 1px solid #4BFE65;
		padding: 2px;
		width: 30px;
		background-color: #08150C;
	}
</style>
