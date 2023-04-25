<script setup lang="ts">
	import Modal from "../ui/Modal.vue";
	import Button from "../ui/Button.vue";
	import { alertOff } from "@/alertController";

    interface Props {
		visible?: boolean,
        message: string
	}

	const props = withDefaults(defineProps<Props>(), {
		visible: false
	})

	function closeAlert() {
		alertOff();
	}

</script>

<template>
    <Modal class="alert-modal" :visible="visible" @close="closeAlert" title="ALERT">
        <div class="content">
            <div class="alert-message">
                {{ message }}
            </div>
            <Button @click="closeAlert" class="alert-button" :selected="true">
                OK
            </Button>
        </div>
    </Modal>
</template>

<style scoped>

.content {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    padding: 20px;
    aspect-ratio: 4;
}

.alert-message {
    margin-bottom: 40px;
}

.alert-button {
    width: 40%;
    display: flex;
    justify-content: center;
}

.alert-button button {
    padding: 20px 10px;
}

</style>