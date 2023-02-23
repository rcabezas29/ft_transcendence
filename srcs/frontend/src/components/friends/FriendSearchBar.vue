<script setup lang="ts">
import { onMounted, ref } from "vue";
import { friendsController } from '@/friendsController';
import { user } from "@/user";

interface UserInfo {
    id: number,
    username: string
}

const input = ref<string>("");
const users = ref<UserInfo[]>([]);

async function fetchUsers(): Promise<UserInfo[]> {
    const httpResponse = await fetch(`http://localhost:3000/users`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${user.token}`
        }
    });
    if (httpResponse.status != 200)
    {
        console.log("error fetching friends");
        return [];
    }

    const response = await httpResponse.json();

    return response.map((u: any) => {
        return {id: u.id, username: u.username};
    });
}

function filteredList() {
    if (input.value.length > 0) {
        return users.value.filter((u) =>
            u.username.toLowerCase().includes(input.value.toLowerCase())
        );
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

onMounted(async () => {
    users.value = await fetchUsers();
})

</script>

<template>
	<div class="search-section">
		<h2>Find your people</h2>
		<input type="text" v-model="input" placeholder="Search users..." />
		<div class="user-item" v-for="u in filteredList()" :key="u.id">
			<span>{{ u.username }}</span>
			<button @click="() => friendsController.sendFriendRequest(u.id, u.username)" v-if="userIsFriendable(u.id)">Send friend request</button>
		</div>
		<div class="item-error" v-if="input && filteredList().length === 0">
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
