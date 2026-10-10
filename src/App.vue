<script setup lang="ts">
import { RouterView } from 'vue-router';
import ConsentsGate from './ConsentsGate.vue';
</script>

<template>
  <!-- Above the router on purpose: a blocked user cannot pass authGuard, because
       the session check is one of the requests the rule refuses. -->
  <ConsentsGate>
    <RouterView />
  </ConsentsGate>
</template>
