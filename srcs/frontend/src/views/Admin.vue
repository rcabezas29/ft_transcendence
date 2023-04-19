<script setup lang="ts">
	import { ref } from 'vue'
	import { user } from "../user";
	import AllUsersTable from '../components/admin/AllUsersTable.vue'
	import Chat from '../components/admin/Chat.vue'
	import MultiView from '../components/ui/MultiView.vue';
	import MultiViewTab from '../components/ui/MultiViewTab.vue';

	const multiViewElement = ref(1);
	function multiviewShowElement(index: number) {
		multiViewElement.value = index;
	}

	function isSelected(index: number) {
		return multiViewElement.value == index;
	}

</script>

<template>
	<MultiView class="multi-view">
		<template #tabs>
			<MultiViewTab @click="() => { multiviewShowElement(1)}" :selected="isSelected(1)">
				Users
			</MultiViewTab>
			<MultiViewTab @click="() => { multiviewShowElement(2)}" :selected="isSelected(2)">
				Chat
			</MultiViewTab>
		</template>

		<template #body>
			<div v-if="multiViewElement == 1">
				<AllUsersTable/>
			</div>
			<div v-else-if="multiViewElement == 2">
				<Chat/>
			</div>
		</template>
	</MultiView>
</template>

<style scoped>

</style>