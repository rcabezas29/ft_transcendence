<script setup lang="ts">

</script>

<template>
	<div class="outer-circle">
		<div class="green-scanner"></div>
	</div>
</template>

<style scoped>
	.outer-circle {
        /*  design the circle */
        width: 240px;
        height: 240px;
        border-radius: 50%;
        box-shadow: 0 0 8px 0 #4BFE65;
        /*  set its position as relative so that the inner green scanner can be positioned absolute */
        position: relative;
        margin: auto;
    }

    .green-scanner {
        /*  design the green scanner 40px smaller than the outer-circle */
        width: 200px;
        height: 200px;
        border-radius: 50%;

        /*  center this green-scanner inside the parent */
        position: absolute;
        top: 20px;
        left: 20px;

        /*  set the background resembling a scanner */
        background: conic-gradient(#1E9052, #4BFE65);

        /*  define animation properties and set its easing to linear (default 'ease' doesn't look natural) */
        animation: scan 5s infinite linear;
    }

    /* make waves using the pseudo-elements for semantic purposes */
    .outer-circle:before,
    .outer-circle:after {
        content: "";
        width: 240px;
        height: 240px;
        border-radius: 50%;
        position: absolute;
        border: 1px solid #4BFE65;
    }

    @keyframes scan {
        to {
            transform: rotate(1turn);
        }
    }
</style>