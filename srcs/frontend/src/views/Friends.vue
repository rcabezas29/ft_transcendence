<script setup lang="ts">
import FriendSearchBar from "@/components/friends/FriendSearchBar.vue";
import FriendsList from "@/components/friends/FriendsList.vue";

</script>

<template>
	<h1>Friends Component</h1>
    <div class="friends-component">
        <FriendsList/>
        <FriendSearchBar/>
    </div>
    
</template>

<style scoped>
    .friends-component {
        display: flex;
        justify-content: space-around;
        margin-bottom: 20px;
    }
</style>
