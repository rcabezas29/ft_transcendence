<script setup lang="ts">



</script>

<template>
	<div >
		<h3>Channel Users list</h3>
		<div>
			User selected: <b><span>Ana</span></b>
			<br/>
			<input type="text" placeholder="Amount of time"/><button>Mute / Unmute</button>
			<br/>
			<input type="text" placeholder="Amount of time"/><button>Ban / Unban</button>
			<br/>
			<button>Make / Revert Admin</button>
			<br/>
		</div>
		<div class="users-list">
			<div class="user-selected">
				<span>Ana</span>
			</div>
			<div>
				<span>Adri</span>
			</div>
		</div>
	</div>
	
</template>

<style scoped>

.users-list {
	border: 1px solid black;
}

.user-selected {
	background-color: grey;
}

</style>