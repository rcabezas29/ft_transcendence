<script setup lang="ts">
	import { ref } from 'vue'
	import UsersRanking from '@/components/social/UsersRanking.vue';
	import ChannelsDisplay from '@/components/social/ChannelsDisplay.vue';
	import  OngoingMatchesVue from '@/components/social/OngoingMatches.vue';
	import MultiView from "../components/ui/MultiView.vue"
	import MultiViewTab from "../components/ui/MultiViewTab.vue"
	import UsersIcon from "@/components/icons/UsersIcon.vue";
	import EyeIcon from "@/components/icons/EyeIcon.vue";
	import MessageIcon from "@/components/icons/MessageIcon.vue";

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
				<span class="display-desktop">PEOPLE</span>
				<span class="display-mobile"><UsersIcon width="36" height="36"/></span>
			</MultiViewTab>
			<MultiViewTab @click="() => { multiviewShowElement(2)}" :selected="isSelected(2)">
				<span class="display-desktop">ONGOING MATCHES</span>
				<span class="display-mobile"><EyeIcon width="36" height="36"/></span>
			</MultiViewTab>
			<MultiViewTab @click="() => { multiviewShowElement(3)}" :selected="isSelected(3)">
				<span class="display-desktop">CHANNELS</span>
				<span class="display-mobile"><MessageIcon width="36" height="36"/></span>
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

.display-desktop {
	display: none;
}

.display-mobile {
	display: flex;
	align-items: center;
	justify-content: center;
}

/* Everything bigger than 850px */
@media only screen and (min-width: 850px) {
	.display-desktop {
		display: block;
	}

	.display-mobile {
		display: none;
	}
}


</style>
