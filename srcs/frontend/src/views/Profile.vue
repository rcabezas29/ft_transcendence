<script setup lang="ts">
import {ref } from "vue";
import ProfileStats from "@/components/profile/ProfileStats.vue";
import FriendsList from "@/components/friends/FriendsList.vue";
import MultiView from "../components/ui/MultiView.vue"
import MultiViewTab from "../components/ui/MultiViewTab.vue"
import Settings from "@/components/profile/Settings.vue";
import MatchHistory from "@/components/profile/MatchHistory.vue";
import { useRoute } from "vue-router";

const route = useRoute();
const userId = +route.params.userId;

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
				<ProfileStats :userId="userId" />
			</div>
			<div v-else-if="multiViewElement == 2">
				<MatchHistory :userId="userId"/>
			</div>
			<div v-else-if="multiViewElement == 3">
				<FriendsList />
			</div>
            <div v-else-if="multiViewElement == 4">
                <Settings />
            </div>
		</template>
	</MultiView>
</template>


<style scoped>

</style>
