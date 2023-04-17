<script setup lang="ts">
import { computed, onBeforeMount, ref } from "vue";
// import { user } from '../user';
import ProfileStats from "@/components/profile/ProfileStats.vue";
// import TwoFactorAuthenticationSetup from '../components/TwoFactorAuthenticationSetup.vue';
// import AvatarCropper from '../components/AvatarCropper.vue';
// import type { UserData } from "@/interfaces";
// import Button from "../components/ui/Button.vue";
import FriendsList from "@/components/friends/FriendsList.vue";
import MultiView from "../components/ui/MultiView.vue"
import MultiViewTab from "../components/ui/MultiViewTab.vue"
import Settings from "@/components/profile/Settings.vue";

import router from "@/router";
import type SettingsVue from "@/components/profile/Settings.vue";

// const username = ref<string>('');
// const password = ref<string>('');
// const userData = ref<UserData | null>(null);
// const avatarImage = ref<Blob | null>(null);
// const cropperImg = ref<string | null>(null);
// const imagePreview = computed(() => {
//     if (avatarImage.value)
//         return URL.createObjectURL(avatarImage.value);
//     return "";
// })

// const message = ref<string[]>([]);
// const editMode = ref<boolean>(false);

// function loadAvatarPreview(e: any) {
//     const image = e.target.files[0];
//     if (!image)
//         return;

//     const reader = new FileReader();
//     reader.onload = function(event) {
//         if (!event.target)
//             return;
//             cropperImg.value = event.target.result as string | null;
//     };
//     reader.readAsDataURL(image);
// }

// function cancelAvatarPreview() {
//     cropperImg.value = null;
// }

// function updateAvatar(imageBlob: Blob) {
//     avatarImage.value = imageBlob;
//     cropperImg.value = null;
// }

// function editModeOn() {
//     editMode.value = true;
// }

// function editModeOff() {
//     username.value = "";
//     password.value = "";
//     avatarImage.value = null;
//     cancelAvatarPreview();
//     message.value = [];
//     editMode.value = false;
// }

// async function saveChanges() {
//     message.value = [];
//     let usernameUpdateOk: boolean = true;
//     let avatarUpdateOk: boolean = true;
//     let passwordUpdateOk: boolean = true;

//     if (username.value.length > 0)
//         usernameUpdateOk = await user.updateUsername(username.value);
//     if (avatarImage.value)
//         avatarUpdateOk = await user.updateAvatar(avatarImage.value);
//     if (password.value.length > 0)
//         passwordUpdateOk = await user.updatePassword(password.value);

//     if (usernameUpdateOk)
//         user.notifyOfUserChange();

//     if (!usernameUpdateOk || !avatarUpdateOk || !passwordUpdateOk) {
//         if (!usernameUpdateOk)
//             message.value.push("error while updating username");
//         if (!avatarUpdateOk)
//             message.value.push("error while updating avatar");
//         if (!passwordUpdateOk)
//             message.value.push("error while updating password");
//         return;
//     }
//     editModeOff();
// }

// async function deleteUserAccount() {
//     const httpResponse = await fetch(`http://localhost:3000/users/${user.id}`, {
//         method: "DELETE",
//         headers: {
//             "Authorization": `Bearer ${user.token}`,
//         },
//     });

//     if (httpResponse.status != 200) {
//         console.log("error while deleting user");
//         return;
//     }
//     user.logout();
// 	router.replace({ "name": "login" });
// }

// onBeforeMount(async () => {
//     userData.value = await user.fetchUserData();
// })


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
				<ProfileStats />
			</div>
			<div v-else-if="multiViewElement == 2">
				<ProfileStats />
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
