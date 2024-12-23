<template>
  <div>
    <h1>welcome, {{ userSetter.name }}</h1>
  </div>
</template>

<script>
export default {
  name: "ClientContent",
  data() {
    return {
      user: this.$store.state.auth.user,
    };
  },
};
</script>

<style></style>
