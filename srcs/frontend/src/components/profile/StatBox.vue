<script setup lang="ts">
  import { defineProps, withDefaults } from "vue";

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
  <div class="StatSquare">
    <div class="BoxContent">
      <div class="BoxTitle">
        {{ props.title }}
      </div>
      <div class="BoxStat">
        {{ props.stat }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.StatSquare {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4px solid #4BFE65;
  padding: 4px;
  width: 100%;
  height: 0;
  padding-bottom: 100%;
  position: relative;
}

.BoxContent {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.BoxTitle {
  font-size: 1.5vw;
  padding: 0.5em 0;
}

.BoxStat {
  font-size: 2.5vw;
  padding: 0.5em 0;
}
</style>
