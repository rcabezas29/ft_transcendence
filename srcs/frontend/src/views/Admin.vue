<script setup lang="ts">
	import { ref } from 'vue'
	import AllUsersTable from '../components/admin/AllUsersTable.vue'
	import ChannelsManagement from '../components/admin/ChannelsManagement.vue'
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
				MANAGE USERS
			</MultiViewTab>
			<MultiViewTab @click="() => { multiviewShowElement(2)}" :selected="isSelected(2)">
				MANAGE CHANNELS
			</MultiViewTab>
		</template>

		<template #body>
			<div v-if="multiViewElement == 1" class="multi-view-element">
				<AllUsersTable/>
			</div>
			<div v-else-if="multiViewElement == 2" class="multi-view-element">
				<ChannelsManagement/>
			</div>
		</template>
	</MultiView>
</template>

<style scoped>

.multi-view-element {
	height: 100%;
	display: flex;
	flex-direction: column;
}

</style>