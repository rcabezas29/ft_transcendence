<script setup lang="ts">
	import { onMounted, ref } from 'vue';
	import { useRoute } from 'vue-router';
	import MultiView from '@/components/ui/MultiView.vue';
	import MultiViewTab from '@/components/ui/MultiViewTab.vue';
	import Settings from "@/components/profile/Settings.vue";

	const route = useRoute();
	
	const multiViewElement = ref(1);
	function multiviewShowElement(index: number) {
		multiViewElement.value = index;
	}

	function isSelected(index: number) {
		return multiViewElement.value == index;
	}

	onMounted(() => {
		const username: string = route.params.username as string;
		console.log("username", username);
	})

</script>

<template>
	<MultiView class="multi-view">
		<template #tabs>
			<MultiViewTab @click="() => { multiviewShowElement(1)}" :selected="isSelected(1)">
				STATS
			</MultiViewTab>
			<MultiViewTab @click="() => { multiviewShowElement(2)}" :selected="isSelected(2)">
				MATCH HISTORY
			</MultiViewTab>
			<MultiViewTab @click="() => { multiviewShowElement(3)}" :selected="isSelected(3)">
				FRIENDS
			</MultiViewTab>
			<MultiViewTab @click="() => { multiviewShowElement(4)}" :selected="isSelected(4)">
				SETTINGS
			</MultiViewTab>
		</template>

		<template #body>
			<div v-if="multiViewElement == 1">
				Stats
			</div>
			<div v-else-if="multiViewElement == 2">
				MatchHistory
			</div>
			<div v-else-if="multiViewElement == 3">
				Friends
			</div>
			<div v-else-if="multiViewElement == 4">
				<Settings/>
			</div>
		</template>
	</MultiView>
</template>

<style scoped>

</style>
