<script setup lang="ts">
	import { ref } from 'vue'
	import UsersRanking from '@/components/social/UsersRanking.vue';
	import ChannelsDisplay from '@/components/social/ChannelsDisplay.vue';
	import  OngoingMatchesVue from '@/components/social/OngoingMatches.vue';
	import MultiView from "../components/ui/MultiView.vue"
	import MultiViewTab from "../components/ui/MultiViewTab.vue"

	const multiViewElement = ref(1);
	function multiviewShowElement(index: number) {
		multiViewElement.value = index;
	}

	function isSelected(index: number) {
		return multiViewElement.value == index;
	}

</script>

<template>
	<MultiView>
		<template #tabs>
			<MultiViewTab @click="() => { multiviewShowElement(1)}" :selected="isSelected(1)">
				PEOPLE
			</MultiViewTab>
			<MultiViewTab @click="() => { multiviewShowElement(2)}" :selected="isSelected(2)">
				ONGOING MATCHES
			</MultiViewTab>
			<MultiViewTab @click="() => { multiviewShowElement(3)}" :selected="isSelected(3)">
				CHANNELS
			</MultiViewTab>
		</template>

		<template #body>
			<div v-if="multiViewElement == 1" class="multi-view-element">
				<UsersRanking/>
			</div>
			<div v-else-if="multiViewElement == 2" class="multi-view-element">
				<OngoingMatchesVue/>	
			</div>
			<div v-else-if="multiViewElement == 3" class="multi-view-element">
				<ChannelsDisplay/>
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
