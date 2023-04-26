<script setup lang="ts">
import {ref } from "vue";
import ProfileStats from "@/components/profile/ProfileStats.vue";
import FriendsList from "@/components/profile/friends/FriendsList.vue";
import MultiView from "../components/ui/MultiView.vue"
import MultiViewTab from "../components/ui/MultiViewTab.vue"
import Settings from "@/components/profile/Settings.vue";
import MatchHistory from "@/components/profile/MatchHistory.vue";
import TrophyIcon from "@/components/icons/TrophyIcon.vue";
import FaceIcon from "@/components/icons/FaceIcon.vue";
import SlidersIcon from "@/components/icons/SlidersIcon.vue";
import BookIcon from "@/components/icons/BookIcon.vue";

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
				<span class="display-desktop">STATS</span>
				<span class="display-mobile"><TrophyIcon width="36" height="36"/></span>
			</MultiViewTab>
			<MultiViewTab @click="() => { multiviewShowElement(2)}" :selected="isSelected(2)">
				<span class="display-desktop">MATCH HISTORY</span>
				<span class="display-mobile"><BookIcon width="36" height="36"/></span>
			</MultiViewTab>
			<MultiViewTab @click="() => { multiviewShowElement(3)}" :selected="isSelected(3)">
				<span class="display-desktop">FRIENDS</span>
				<span class="display-mobile"><FaceIcon width="36" height="36"/></span>
			</MultiViewTab>
			<MultiViewTab @click="() => { multiviewShowElement(4)}" :selected="isSelected(4)">
				<span class="display-desktop">SETTINGS</span>
				<span class="display-mobile"><SlidersIcon width="36" height="36"/></span>
			</MultiViewTab>
		</template>

		<template #body>
			<div v-if="multiViewElement == 1" class="multi-view-element">
				<ProfileStats />
			</div>
			<div v-else-if="multiViewElement == 2" class="multi-view-element">
				<MatchHistory />
			</div>
			<div v-else-if="multiViewElement == 3" class="multi-view-element">
				<FriendsList />
			</div>
            <div v-else-if="multiViewElement == 4" class="multi-view-element">
                <Settings />
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
