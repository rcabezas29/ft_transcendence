<script setup lang="ts">
	import CrossIcon from "../icons/CrossIcon.vue"

	interface Props {
		visible?: boolean,
		title: string
	}

	const props = withDefaults(defineProps<Props>(), {
		visible: false
	})

	const emit = defineEmits(["close"]);

	function closeModal() {
		emit("close");
	}

</script>

<template>
	<div v-if="props.visible" class="background">
		<div class="modal">
			<div class="modal-header">
				<span class="modal-title">{{ title }}</span>
				<span @click="closeModal" class="modal-exit-btn">
					<CrossIcon cross-colour="#1E9052"/>
				</span>
			</div>
			<div class="modal-body">
				<slot/>

			</div>
		</div>
	</div>
</template>

<style scoped>
	.background {
		background-color: black;
		height: 100vh;
		position: absolute;
		left: 0;
		top: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100vw;
		z-index: 1;
	}

	.modal {
		background-color: #08150C;
		border: 1px solid #4BFE65;
		position: absolute;
		width: 90%;
		max-width: 800px;
		z-index: 2;
	}

	.modal-header {
		font-family: vp-pixel;
		font-size: 24px;
		color: #B3F9D7;
		background-color: #1E9052;
		box-sizing: border-box;
		padding: 6px;
		height: 40px;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.modal-body {
		padding: 12px;
	}

	.modal-exit-btn {
		background-color: #B3F9D7;
		padding: 4px;
		display: inline-flex;
		position: absolute;
		right: 6px;
	}

	.modal-exit-btn:hover {
		cursor: pointer;
	}
</style>