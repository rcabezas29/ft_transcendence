<script setup lang="ts">

</script>

<template>
	<div class="table-container">
		<table>
			<thead>
				<slot name="head"></slot>
			</thead>
			<tbody>
				<slot name="body"></slot>
			</tbody>
		</table>
	</div>
</template>

<style>

	.table-container {
		box-sizing: border-box;
		height: 100%;
		overflow-y: scroll;
		padding: 0px 8px;
	}

	table {
		width: 100%;
		text-align: left;
		border-spacing: 0 10px;
	}

	table thead tr {
		outline-color: #4BFE65;
		outline-style: solid;
		outline-width: 1px;
		background-color: #1E9052;
		position: sticky;
		top: 0;
	}

	table thead tr th {
		padding: 12px ;
	}

	table tbody tr {
		outline-color: #4BFE65;
		outline-style: solid;
		outline-width: 1px;
	}

	table tbody tr td {
		padding: 0 12px;
	}

	table tbody tr td:nth-child(1) {
		width: 70px;
		padding: 0;
	}

	tbody tr {
		cursor: pointer;
	}

	tbody tr:hover {
		background-color: #4BFE65;
		color: #08150C;
	}

</style>