<script setup lang="ts">

import { ref } from "vue";
import { Cropper } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';

const cropperRef = ref<any>(null);

const props = defineProps<{
    avatarUrl: string
}>();

const emit = defineEmits<{
  (e: 'crop', imageBlob: Blob): void
}>()

function cropImage(): void {
    if (!cropperRef.value)
        return;
    const { coordinates, image, visibleArea, canvas } = cropperRef.value.getResult();
    try {
        canvas.toBlob(
            (blob: Blob) => {
                if (!blob)
                    return;
                emit('crop', blob);
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
        :src="avatarUrl"
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
        <button type="button" @click="cropImage">crop</button>
    </div>
</template>

<style scoped>
    .cropper-container {
        display: flex;
        align-items: center;
        margin: 20px;
    }

    .cropper {
        height: 300px;
        width: 300px;
        background: #DDD;
    }

    .cropper-container > button {
        height: fit-content;
        margin-left: 10px;
    }
</style>
