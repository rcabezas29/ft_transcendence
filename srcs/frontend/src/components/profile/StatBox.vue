<script setup lang="ts">

import { onBeforeMount, ref } from "vue";
import { user } from "../../user"
import Table from "../ui/Table.vue"
import type { UserData } from "@/interfaces";
import { computed } from "@vue/reactivity";
import TextInputField from "../ui/TextInputField.vue";

interface Props {
	title?: string,
	stat?: string | number
}

const props = withDefaults(defineProps<Props>(), {
	title: "N/A",
	stat: "N/A",
})

</script>

<template>
	<div class="StatSquare">
		<div class="BoxTitle">
			{{ title }}<br>
		</div>
		<div class="BoxStat">
			{{ stat }}
		</div>
	</div>
</template>

<style scoped>
.StatSquare {
	display: flex;
	width: justify-content;
	align-items: center;
	justify-content: center;
	border: 4px solid #4BFE65;
	padding: 4px;
}

.BoxTitle {
	font-size: 1.5em;
	padding: 1em;
	align-content: center;
}

.BoxStat {
	font-size: 1em;
	padding-top: 3em;
	padding-bottom: 1em;
	position: absolute;
}
</style>
