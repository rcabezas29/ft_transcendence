<script setup lang="ts">

import ChatSection from './ChatSection.vue';

const props = defineProps({
	title: String
});

</script>

<template>
	<div>
		<div class="chat-divider">
			Friends
		</div>
		<ChatSection />
	</div>
</template>

<style scoped>

</style>