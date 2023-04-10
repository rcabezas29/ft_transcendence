<script setup lang="ts">

    import { ref } from "vue";
    import { Cropper } from 'vue-advanced-cropper';
    import 'vue-advanced-cropper/dist/style.css';
    import Button from "../components/ui/Button.vue";
    import Modal from "../components/ui/Modal.vue";

    const cropperRef = ref<any>(null);

    interface Props {
        avatarUrl: string,
        title?: string,
		visible?: boolean
	}

	const props = withDefaults(defineProps<Props>(), {
		visible: false,
        title: "CROP IMAGE"
	});

    const emit = defineEmits<{
        (e: 'crop', imageBlob: Blob): void,
        (e: 'cancel'): void
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

	function cancelCrop() {
		emit("cancel");
	}

</script>

<template>
    <Modal :visible="props.visible" @close="cancelCrop" :title="title">
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
            <Button type="button" @click="cropImage" class="crop-button">CROP</Button>
        </div>
    </Modal>
</template>

<style scoped>
    .cropper-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin: 20px;
    }

    .crop-button {
        margin-top: 20px;
        border: 2px solid #4BFE65;
    }

    .cropper {
        height: 300px;
        width: 300px;
        background: #DDD;
        border: 2px solid #4BFE65;
    }

    .cropper-container > button {
        height: fit-content;
        margin-left: 10px;
    }
</style>
