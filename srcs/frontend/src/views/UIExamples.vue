<script setup lang="ts">
	import { ref } from "vue";
	import Button from "../components/ui/Button.vue";
	import Modal from "../components/ui/Modal.vue";
	import MultiView from "../components/ui/MultiView.vue";
	import MultiViewTab from "../components/ui/MultiViewTab.vue";
	import TextInputField from "../components/ui/TextInputField.vue";
	import FileUploadButton from "@/components/ui/FileUploadButton.vue";
import { computed } from "@vue/reactivity";

	//----------------------------- MODAL -----------------------------

	let modalVisible = ref<boolean>(false);
	function openModal() {
		console.log("open modal")
		modalVisible.value = true;
	}

	function closeModal() {
		console.log("close modal")
		modalVisible.value = false;
	}

	//------------------------------------------------------------------


	//----------------------------- MULTIVIEW -----------------------------
	const multiViewElement = ref(1);
	function multiviewShowElement(index: number) {
		multiViewElement.value = index;
	}
	//------------------------------------------------------------------

	//----------------------------- TEXT INPUT FIELD -----------------------------
	const aString = ref("");
	//------------------------------------------------------------------

	//----------------------------- FILE UPLOAD BUTTON -----------------------------

    const imageURL = ref<string>("");

	function loadImage(imageBlob: Blob) {
        const reader = new FileReader();
        reader.onload = function(event) {
            if (!event.target || !event.target.result)
                return;
			imageURL.value = event.target.result.toString();
        };
        reader.readAsDataURL(imageBlob);
    }
	//------------------------------------------------------------------

</script>

<template>

	<!---------------------------------------------------------------------------------------->
	<h3>FONT</h3>
	<div class="font-test">
		<h1>THIS IS A H1</h1>
		<h2>THIS IS A H2</h2>
		<h3>THIS IS A H3</h3>
		<h4>THIS IS A H4</h4>

		<p class="font-test-p">
			Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
			Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
			dolor in reprehenderit in voluptate velitesse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
			proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
		</p>
	</div>

	<hr>
	<!---------------------------------------------------------------------------------------->

	<!---------------------------------------------------------------------------------------->

	<h3>BUTTON</h3>

	<Button>BUTTON TEXT</Button>

	<br>
	<br>

	<Button>BUTTON WITH A LOT MORE TEXT</Button>

	<br>
	<br>

	<!--
		The button prop could be used for the menu to show the current tab
	-->
	<Button :selected="true">BUTTON SELECTED WITH PROP</Button>

	<br>
	<br>

	<hr>
	<!---------------------------------------------------------------------------------------->
	
	<!---------------------------------------------------------------------------------------->

	<h3>FILE UPLOAD BUTTON</h3>
	<!--
		The new-file event is fired when a new image is selected, and the handler function
		will receive the uploaded image blob as an argument.
	-->
	<FileUploadButton @new-file="loadImage"/>
	<img :src="imageURL" style="width: 200px; display: block">

	<br>
	<br>

	<hr>
	<!---------------------------------------------------------------------------------------->

	<!---------------------------------------------------------------------------------------->

	<h3>TEXT INPUT FIELD</h3>

	<!--
		The component will add a "$>" at the beginning of the placeholder-text prop
		You can even add v-models!
	-->
	<TextInputField v-model="aString" placeholder-text="ENTER SOME TEXT..."/>
	Inputted string model: {{ aString }}

	<br>
	<br>


	<!--
		It admits some other personalisations using props
	-->
	<TextInputField bg-color="#ff77b8" border-color="#0099b8" placeholder-text="THIS IS A PINK/BLUE TEXT FIELD!"/>

	<hr>
	<!---------------------------------------------------------------------------------------->
	
	<!---------------------------------------------------------------------------------------->

	<h3>MODAL</h3>
	<Button @click="openModal">OPEN MODAL</Button>
	
	<!-- Catch the close event emmited from the Modal to handle click on modal close button-->
	<Modal :visible="modalVisible" @close="closeModal" title="MODAL TITLE">

		<p class="modal-p">
			Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
			Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
			dolor in reprehenderit in voluptate velitesse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
			proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
		</p>

		<Button style="width: 100%" @click="closeModal">BUTTON INSIDE MODAL</Button>

	</Modal>

	<hr>
	<!---------------------------------------------------------------------------------------->

	<!---------------------------------------------------------------------------------------->
	<h3>MULTI VIEW</h3>
	
	<MultiView class="multi-view">

		<template #tabs>
			<MultiViewTab @click="() => { multiviewShowElement(1)}">
				Tab 1
			</MultiViewTab>
			<MultiViewTab @click="() => { multiviewShowElement(2)}">
				Tab 2
			</MultiViewTab>
		</template>

		<template #body>
			<div v-if="multiViewElement == 1">
				THIS IS THE VIEW OF THE TAB 1
			</div>
			<div v-else-if="multiViewElement == 2">
				TAB 2 view
			</div>
		</template>
	</MultiView>

	<hr>
	<!---------------------------------------------------------------------------------------->


</template>

<style scoped>

	.font-test-p {
		width: 400px;
	}

	.multi-view {
		width: 1100px;
	}

</style>