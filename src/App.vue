<template>
  <v-app>
    <v-app-bar color="gray" white>
      <v-spacer></v-spacer>

      <div class="d-flex justify-center align-center">
        <v-btn to="/" variant="text">
          Početna
        </v-btn>

        <v-btn to="/katalog" variant="text">
          Katalog
        </v-btn>

        <v-btn to="/prijava" variant="text">
          Prijava
        </v-btn>
      </div>

      <v-spacer></v-spacer>

    </v-app-bar>

    <v-main >
      <router-view />
    </v-main>

  </v-app>
</template>

<script>
const links = [
  {
    link: '/',
    text: 'Početna',
  },
  {
    link: '/katalog',
    text: 'Katalog',
  },
  {
    link: '/prijava',
    text: 'Prijava',
  },
]
</script>
