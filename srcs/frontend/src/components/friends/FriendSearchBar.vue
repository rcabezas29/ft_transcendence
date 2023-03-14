<script setup lang="ts">
import { ref, watch } from "vue";
import { friendsController } from '@/friendsController';
import { user } from "@/user";
import type { UserData } from "@/interfaces";

interface UserInfo {
    id: number,
    username: string
}

const input = ref<string>("");
const users = ref<UserInfo[]>([]);

async function filteredList() {
    if (input.value.length > 0) {
        const httpResponse = await fetch(`http://localhost:3000/users/search/${input.value}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${user.token}`
            }
        });

        if (httpResponse.status != 200) {
            console.log("error fetching user matches");
            return [];
        }

        const response: UserData[] = await httpResponse.json();

        return response.map((u: UserData) => {
            const user: UserInfo = {id: u.id, username: u.username};
            return user;
        });
    }
    return [];
}

function userIsFriendable(userId: number): boolean {
    return (userId != user.id
        && !friendsController.userIsActiveFriend(userId)
        && !friendsController.userIsPending(userId)
        && !friendsController.userIsBlocked(userId)
    );
}

watch(input, async () => {
    users.value = await filteredList();
})

</script>

<template>
	<div class="search-section">
		<h2>Find your people</h2>
		<input type="text" v-model="input" placeholder="Search users..." />
		<div class="user-item" v-for="u in users" :key="u.id">
			<span>{{ u.username }}</span>
			<button @click="() => friendsController.sendFriendRequest(u.id)" v-if="userIsFriendable(u.id)">Send friend request</button>
		</div>
		<div class="item-error" v-if="input && users.length === 0">
			<p>No users found!</p>
		</div>
	</div>
</template>

<style scoped>
.user-item {
	display: flex;
	justify-content: space-between;
}
</style>
