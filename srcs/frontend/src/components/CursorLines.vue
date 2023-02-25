<script setup lang="ts">
	import { onMounted, onUnmounted, ref, type CSSProperties, type Ref } from "vue";
	
	const lineWidth = 5;
	const centerOffset = 5;
	const color = "#33FF33"

	const safeMarginForNoOverflow = 5;
	const cursorLinesActive = ref(true);
	const x = ref(0);
	const y = ref(0);
	
	const lineStyle: Ref<CSSProperties> = ref<CSSProperties>({
		backgroundColor: color,
		position: "absolute",
	});
	
	const lineStyleLeft: Ref<CSSProperties> = ref<CSSProperties>({
		height: lineWidth + "px",
	});

	const lineStyleTop: Ref<CSSProperties> = ref<CSSProperties>({
		width: lineWidth + "px"
	});

	const lineStyleRight: Ref<CSSProperties> = ref<CSSProperties>({
		height: lineWidth + "px",
	});

	const lineStyleBottom: Ref<CSSProperties> = ref<CSSProperties>({
		width: lineWidth + "px",
		height: "100%"
	});

	function updateLeft() {
		lineStyleLeft.value.paddingRight = (x.value - centerOffset) + "px";
		lineStyleLeft.value.marginTop = (y.value - lineWidth / 2) + "px";
	}

	function updateTop() {
		lineStyleTop.value.height = (y.value - centerOffset) + "px";
		lineStyleTop.value.marginLeft = (x.value - lineWidth / 2) + "px";
	}

	function updateRight() {
		lineStyleRight.value.marginLeft = (x.value + centerOffset) + "px";
		lineStyleRight.value.marginTop = (y.value - lineWidth / 2) + "px";
		lineStyleRight.value.width = (window.innerWidth - x.value - safeMarginForNoOverflow) + "px";
	}

	function updateBottom() {
		lineStyleBottom.value.marginTop = (y.value + centerOffset) + "px";
		lineStyleBottom.value.marginLeft = (x.value - lineWidth / 2) + "px";
		lineStyleBottom.value.height = (window.innerHeight - y.value - safeMarginForNoOverflow) + "px";
	}

	function update(event: MouseEvent) {
		x.value = event.clientX;
		y.value = event.clientY;
		
		updateLeft()
		updateTop()
		updateRight()
		updateBottom()
	}
	
	onMounted(() => window.addEventListener('mousemove', update))
	onUnmounted(() => window.removeEventListener('mousemove', update))

</script>

<template>
	<div v-if="cursorLinesActive" :style="[lineStyle, lineStyleLeft]" ></div>
	<div v-if="cursorLinesActive" :style="[lineStyle, lineStyleTop]" ></div>
	<div v-if="cursorLinesActive" :style="[lineStyle, lineStyleRight]" ></div>
	<div v-if="cursorLinesActive" :style="[lineStyle, lineStyleBottom]"></div>
	Cursor lines: <input type="checkbox" id="checkbox" v-model="cursorLinesActive" />
</template>

<style scoped>

</style>