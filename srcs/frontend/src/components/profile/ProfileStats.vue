<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import { user } from "../../user";
import StatBox from "./StatBox.vue";
import type { UserData } from "@/interfaces";
import Button from "../ui/Button.vue";
import UserPlusIcon from "@/components/icons/UserPlusIcon.vue";
import UserMinusIcon from "@/components/icons/UserMinusIcon.vue";
import ClockIcon from "@/components/icons/ClockIcon.vue";
import { friendsController, FriendStatus } from "@/friendsController";
import GamePadIcon from '../icons/GamePadIcon.vue';
import { spectatorController } from "@/spectatorController";

interface Props {
    userId: number
}

const props = withDefaults(defineProps<Props>(), {
    userId: user.id
});

let currentUser: UserData | null = null;

const totalWins = ref<number>(0);
const totalLosses = ref<number>(0);
const winLossRatio = ref<number>(0);
const scoredGoals = ref<number>(0);
const receivedGoals = ref<number>(0);
const totalMatches = ref<number>(0);
const scoreRatio = ref<number>(0);
const username = ref<string>("");
const elo = ref<number>(0);
const avatarUrl = ref<string>("");

async function getCurrentUser() {
    const usersRequest = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/${props.userId}`, {
        headers: {
            "Authorization": `Bearer ${user.token}`
        }
    });
    
    if (usersRequest.status != 200) {
        return null;
    }
    
    const userData: UserData = await usersRequest.json();
    return userData;
}

onBeforeMount(async () => {
    currentUser = await getCurrentUser();
    if (!currentUser) {
        return;
    }
    
    username.value = currentUser?.username;
    elo.value = currentUser?.elo;
    avatarUrl.value = `${import.meta.env.VITE_BACKEND_URL}/users/avatar/${currentUser.id}`;
    totalWins.value = currentUser?.stats.wonGames ?? 0;
    totalLosses.value = currentUser?.stats.lostGames ?? 0;
    if (totalLosses.value === 0) {
        winLossRatio.value = 1;
    } else {
        winLossRatio.value = totalWins.value / totalLosses.value ?? 0;
    }
    scoredGoals.value = currentUser?.stats.scoredGoals ?? 0;
    receivedGoals.value = currentUser?.stats.receivedGoals ?? 0;
    totalMatches.value = totalWins.value + totalLosses.value ?? 0;
    if (receivedGoals.value === 0) {
        scoreRatio.value = 1;
    } else {
        scoreRatio.value = scoredGoals.value / receivedGoals.value ?? 0;
    }
});

function sendFriendRequest() {
    friendsController.sendFriendRequest(props.userId);
}

function unfriendUser() {
    friendsController.unfriendUser(props.userId);
}

function userIsFriendable(userId: number): boolean {
    return (userId != user.id
        && !friendsController.userIsActiveFriend(userId)
        && !friendsController.userIsPending(userId)
        && !friendsController.userIsBlocked(userId)
    );
}

function isFriendGaming() {
    if (friendsController.userIsActiveFriend(props.userId)
        && friendsController.friends[props.userId].status === FriendStatus.gaming) {
        return true;
    }
    return false;
}

</script>

<template>
    <div class="header">
        <div class="user-data-container">
            <div class="user-image">
                <img :src=avatarUrl />
            </div>
            <div class="user-data">
                <div class="username-status">
                    <span class="username truncate">{{ username }}</span>
                    <div class="friend-status" v-show="isFriendGaming()">
                        <GamePadIcon width="20" height="20"/>
                    </div>
                </div>
                <span class="elo">ELO: {{ elo }}</span>
                <div class="friend-management-button" v-if="userId != user.id">
                    <Button v-if="friendsController.userIsPending(userId)" :selected="true" title="friend request pending" disabled>
                        <ClockIcon width="24" height="24"/>
                    </Button>
                    <Button @click="sendFriendRequest" v-else-if="userIsFriendable(userId)" title="send friend request">
                        <UserPlusIcon width="24" height="24"/>
                    </Button>
                    <Button @click="unfriendUser" v-else :selected="true" title="unfriend">
                        <UserMinusIcon width="24" height="24"/>
                    </Button>
                </div>
            </div>
        </div>
        <Button class="watch-button"
            @click.stop="() => spectatorController.findGame(userId)"
            border-color="#bc89e6"
            v-if="isFriendGaming() && !user.isGaming()"
        >
            WATCH CURRENT GAME
        </Button>
    </div>
    
    <div class="square-stats-grid">
        <StatBox title="WINS" :stat="totalWins"/>
        <StatBox title="LOSSES" :stat="totalLosses"/>
        <StatBox title="W/L" :stat="winLossRatio.toFixed(2)"/>
        <StatBox title="SCORED GOALS" :stat="scoredGoals"/>
        <StatBox title="RECEIVED GOALS" :stat="receivedGoals"/>
        <StatBox title="TOTAL MATCHES" :stat="totalMatches"/>
        <StatBox title="S/R" :stat="scoreRatio.toFixed(2)"/>
    </div>
</template>

<style scoped>

.user-data-container {
    display: flex;
    align-items: center;
	justify-content: space-between;
	box-sizing: border-box;
    width: 100%;
}

.user-image {
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    width: fit-content;
}

.user-image img {
    box-sizing: border-box;
    padding: 8px;
    width: 100%;
    max-width: 200px;
    max-height: 200px;
}

.user-data {
    margin-left: 12px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 50%;
    flex: 1;
    gap: 10px;
}

.truncate {
    display: table-cell;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
}

.square-stats-grid {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    flex-flow: row wrap;
    gap: 24px;
    box-sizing: border-box;
    padding-bottom: 20px;
    margin-top: 24px;
}

.username {
    font-size: 1.5em;
}

.elo {
    font-size: 1em;
}

.friend-management-button {
    width: 50px;
    height: 50px;
    box-sizing: border-box;
}

.friend-management-button button {
    padding: 10px;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
}

.watch-button {
	padding: 20px 12px;
}

.header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
}

.username-status {
    display: flex;
    align-items: center;
    gap: 10px;
}

.friend-status {
    height: 20px;
    width: 20px;
    color: #bc89e6;
}

/* Everything bigger than 850px */
@media only screen and (min-width: 850px) {
    .square-stats-grid {
        justify-content: space-between;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        grid-gap: 1rem;
        gap: 42px;
    }

    .user-image {
        width: 150px;
        height: 150px;
    }

    .username {
        font-size: 1.8em;
    }

    .elo {
        font-size: 1.3em;
    }

    .header {
        display: flex;
        flex-direction: row;
    }

    .watch-button {
        width: 300px;
    }
}
</style>
