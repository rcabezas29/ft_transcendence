<script setup lang="ts">

import { computed, ref } from "vue";
import { Cropper } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';
import { user } from '@/user';

const cropperRef = ref<any>(null);

const userImg = computed(() => {
    if (user.username)
        return `http://localhost:3000/users/avatar/${user.username}`;
    else
        return "";
});

function cropImage(): void {
    if (!cropperRef.value)
        return;
    const { coordinates, image, visibleArea, canvas } = cropperRef.value.getResult();
    try {
        canvas.toBlob(
            (blob: Blob) => {
                if (!blob)
                    return;
                user.updateAvatar(blob);
            },
            'image/jpeg'
        );
    } catch(e) {
        console.log("Error:", e);
    }
}

</script>

<template>
    <div class="cropper-container">
        <cropper ref="cropperRef" class="cropper"
        :src="userImg"
        :stencil-props="{
            handlers: {},
            movable: false,
            resizable: false,
            aspectRatio: 1,
        }"
        :stencil-size="{
            width: 200,
            height: 200
        }"
        image-restriction="stencil"
        />
        <button @click="cropImage">CROP</button>
    </div>
</template>

<style scoped>
    .cropper-container {
        margin: 20px;
    }

    .cropper {
        height: 300px;
        width: 300px;
        background: #DDD;
    }
</style>
