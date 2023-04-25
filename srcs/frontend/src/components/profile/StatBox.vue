<script setup lang="ts">
  import { withDefaults } from "vue";

  interface Props {
    title?: string;
    stat?: string | number;
  }

  const props = withDefaults(defineProps<Props>(), {
    title: "N/A",
    stat: "N/A",
  });
</script>

<template>
  <div class="stat-square">
    <div class="box-content">
      <div>
        {{ props.title }}
      </div>
      <div>
        {{ props.stat }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.stat-square {
	width: 70%;
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 4px solid #4BFE65;
  box-sizing: border-box;
  padding: 12px;
}

.box-content {
  height: 70%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  text-align: center;
  font-size: 2em;
}

/* Everything bigger than 850px */
@media only screen and (min-width: 850px) {
  .stat-square {
    width: 200px;
    padding: 24px;
  }
}
</style>
