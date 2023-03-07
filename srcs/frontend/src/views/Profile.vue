<script setup lang="ts">
import { computed, onBeforeMount, ref } from "vue";
import { user } from '../user';
import TwoFactorAuthenticationSetup from '../components/TwoFactorAuthenticationSetup.vue';

interface UserData {
    id: number;
    username: string;
    email: string;
    avatar: string;
    elo: number;
    isTwoFactorAuthenticationEnabled: boolean;
    stats: Object;
}

const username = ref<string>("");
const password = ref<string>("");
const userData = ref<UserData | null>(null);

const userImg = computed(() => {
    if (user.username)
        return `http://localhost:3000/users/avatar/${user.username}`;
    else
        return "";
});


async function fetchAllUserData() {
    const httpResponse = await fetch(`http://localhost:3000/users/${user.id}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${user.token}`
        }
    });

    if (httpResponse.status != 200) {
        return null;
    }

    const response = await httpResponse.json();
    return response;
}

function changeUsername() {
    console.log("change username")
}

function changePassword() {
    console.log("change passwd")
}

function uploadAvatar(e: any) {
    console.log("change vatar")
  /*  const image: Blob = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(image);
    reader.onload = e =>{
        this.previewImage = e.target.result;
        console.log(this.previewImage);
    };*/
}

onBeforeMount(async () => {
    userData.value = await fetchAllUserData();
})

</script>

<template>
	
	<h1>hola, this is {{ user.username }}'s profile</h1>

    <div class="user-info">
        <div class="section">
            <h2>Avatar</h2>
            <img id="user-image" :src="userImg" />
            <input type="file" accept="image/jpeg" @change=uploadAvatar>
        </div>
        <div class="section">
            <h2>Username</h2>
            <p>Username: {{ user.username }}</p>
            <form @submit.prevent="changeUsername">
                <label>new username: </label>
                <input type="text" v-model="username"/>
                <button>submit</button>
            </form>
        </div>
        <div class="section">
            <h2>Email</h2>
            <p>Email: {{ userData?.email }}</p>
        </div>
        <div class="section">
            <h2>Password</h2>
            <p>Password: *****</p>
            <form @submit.prevent="changePassword">
                <label>new password: </label>
                <input type="text" v-model="password"/>
                <button>submit</button>
            </form>
        </div>
        <div class="section">
            <h2>Two Factor Authentication</h2>
            <TwoFactorAuthenticationSetup/>
        </div>
        <div class="section">
            <h2>All other user data</h2>
            In case we want to use any of it for this section
            <ul>
                <li>Id: {{ userData?.id }}</li>
                <li>Username: {{ userData?.username }}</li>
                <li>Email: {{ userData?.email }}</li>
                <li>Avatar: {{ userData?.avatar }}</li>
                <li>Elo: {{ userData?.elo }}</li>
                <li>Stats: {{ userData?.stats }}</li>
                <li>Is 2fa enabled: {{ userData?.isTwoFactorAuthenticationEnabled }}</li>
            </ul>

        </div>
    </div>

	
</template>

<style scoped>
    .section {
        margin-bottom: 20px;
    }

    #user-image {
        display: block;
        width: 100px;
        height: 100px;
    }

</style>
