<script setup lang="ts">
	interface Props {
		bgColor?: string,
		borderColor?: string,
        placeholderText?: string,
        modelValue?: string
	}

	const props = withDefaults(defineProps<Props>(), {
		bgColor: "#222035",
        borderColor: "#1E9052",
        placeholderText: "",
        modelValue: ""
	})

    const emit = defineEmits<{
        (e: 'update:modelValue', newValue: string): void
    }>()

    function emitUpdate(e: Event) {
        emit('update:modelValue', (<HTMLInputElement>e.target).value)
    }

</script>

<template>

    <input
        type="text"
        :value="modelValue"
        @input="emitUpdate"
        :placeholder="'$> ' + placeholderText"
    />

</template>

<style scoped>
    input {
        font-family: vp-pixel;
        color: #B3F9D7;
        border: 1px solid v-bind(borderColor);
        background-color: v-bind(bgColor);
        height: 38px;
        width: 100%;
        padding: 0 24px;
        box-sizing: border-box;
        margin-bottom: 14px;
    }

    input:focus {
        border-color: #4BFE65;
    }
</style>
