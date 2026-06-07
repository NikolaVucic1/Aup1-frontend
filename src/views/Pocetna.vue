<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

const API_BASE = 'http://127.0.0.1:5000'

const brojVozila = ref(0)
const brojKlijenata = ref(0)
const brojNajmova = ref(0)
const loadingStats = ref(true)

const ucitajStatistiku = async () => {
  try {
    const [resV, resK, resN] = await Promise.all([
      axios.get(`${API_BASE}/vozila`),
      axios.get(`${API_BASE}/korisnici`),
      axios.get(`${API_BASE}/najmovi`)
    ])
    brojVozila.value = resV.data.length
    brojKlijenata.value = resK.data.length
    brojNajmova.value = resN.data.length
  } catch (e) {
    console.error("Greška pri dohvatu statistike:", e)
  } finally {
    loadingStats.value = false
  }
}

onMounted(() => {
  ucitajStatistiku()
})
</script>

<template>
  <v-card class="pa-4 pa-md-16" flat color="#F5F5F5">
    <v-container>
      <v-row align="center" justify="space-between">
        <v-col cols="12" md="5">
          <v-chip color="amber-darken-3" variant="flat" size="small" class="mb-4 font-weight-bold">NAJBOLJI NAJAM U MOSTARU</v-chip>
          <h1 class="text-h2 font-weight-black mb-4" style="color: #2C3E50; line-height: 1.1;">
            Rent <span class="text-amber-darken-3">N-Car</span>
          </h1>
          <div class="text-body-1 mb-8" style="color: #546E7A; line-height: 1.8; font-size: 1.1rem !important;">
            Doživite potpunu slobodu kretanja uz **N-Car**. Naša flota raste svakim danom kako bismo vam pružili najbolju uslugu.
          </div>
        </v-col>
        <v-col cols="12" md="6">
          <v-img class="elevation-20 rounded-xl mt-8 mt-md-0" height="400" cover src="https://img.freepik.com/premium-vector/letter-i-rent-car-logo-design-template-automotive-car-logo-symbol_754537-6338.jpg" />
        </v-col>
      </v-row>
    </v-container>
  </v-card>

  <v-container class="mt-n12">
    <v-row>
      <v-col cols="12" md="4">
        <v-card class="pa-6 rounded-xl text-center elevation-8" height="100%">
          <v-avatar color="amber-darken-3" variant="tonal" size="64" class="mb-4">
            <v-icon icon="mdi-car-multiple" size="32"></v-icon>
          </v-avatar>
          <div v-if="loadingStats">
            <v-progress-circular indeterminate size="24" color="amber-darken-3"></v-progress-circular>
          </div>
          <div v-else class="text-h4 font-weight-black">{{ brojVozila }}</div>
          <div class="text-subtitle-1 text-grey-darken-1">Vozila u floti</div>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="pa-6 rounded-xl text-center elevation-8" height="100%">
          <v-avatar color="blue-darken-2" variant="tonal" size="64" class="mb-4">
            <v-icon icon="mdi-account-group" size="32"></v-icon>
          </v-avatar>
          <div v-if="loadingStats">
            <v-progress-circular indeterminate size="24" color="blue-darken-2"></v-progress-circular>
          </div>
          <div v-else class="text-h4 font-weight-black">{{ brojKlijenata }}</div>
          <div class="text-subtitle-1 text-grey-darken-1">Registriranih klijenata</div>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="pa-6 rounded-xl text-center elevation-8" height="100%">
          <v-avatar color="green-darken-2" variant="tonal" size="64" class="mb-4">
            <v-icon icon="mdi-file-key" size="32"></v-icon>
          </v-avatar>
          <div v-if="loadingStats">
            <v-progress-circular indeterminate size="24" color="green-darken-2"></v-progress-circular>
          </div>
          <div v-else class="text-h4 font-weight-black">{{ brojNajmova }}</div>
          <div class="text-subtitle-1 text-grey-darken-1">Ukupno najmova</div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>


  <v-card id="steps-section" class="pa-12 rounded-0 mt-16" color="#1E293B" theme="dark" flat>
    <v-container>
      <div class="text-center mb-12">
        <h2 class="text-h4 font-weight-bold text-white">Jednostavan proces u 3 koraka</h2>
      </div>
      <v-row>
        <v-col cols="12" md="4" class="text-center">

          <div class="text-h1 font-weight-black text-amber-lighten-2 mb-4 opacity-20">01</div>
          <v-icon size="48" color="amber-darken-3" class="mb-4">mdi-cursor-default-click</v-icon>
          <div class="text-h6 font-weight-bold mb-2">Odaberi online</div>
          <div class="text-blue-grey-lighten-3">Pregledaj našu flotu u katalogu i rezerviši auto u par klikova.</div>
        </v-col>
        <v-col cols="12" md="4" class="text-center">
          <div class="text-h1 font-weight-black text-amber-lighten-2 mb-4 opacity-20">02</div>
          <v-icon size="48" color="amber-darken-3" class="mb-4">mdi-calendar-check</v-icon>
          <div class="text-h6 font-weight-bold mb-2">Potvrdi termin</div>
          <div class="text-blue-grey-lighten-3">Naš tim će vas kontaktirati za finalnu potvrdu i detalje najma.</div>
        </v-col>
        <v-col cols="12" md="4" class="text-center">
          <div class="text-h1 font-weight-black text-amber-lighten-2 mb-4 opacity-20">03</div>
          <v-icon size="48" color="amber-darken-3" class="mb-4">mdi-key-chain</v-icon>
          <div class="text-h6 font-weight-bold mb-2">Preuzmi ključeve</div>
          <div class="text-blue-grey-lighten-3">Vozilo te čeka spremno, čisto i sa punim rezervoarom goriva.</div>
        </v-col>
      </v-row>
    </v-container>
  </v-card>


  <<v-footer class="py-10 text-white mt-12" color="#0F172A">
  <v-container>
    <v-row>
      <v-col cols="12" md="6" class="text-center text-md-left">
        <div class="text-h5 font-weight-bold mb-2">
          Rent <span class="text-amber-darken-3">N-Car</span>
        </div>
        <div class="text-body-2 text-blue-grey-lighten-3">Vaš partner na cesti. Pouzdanost, brzina i najbolja cijena u regiji.</div>
      </v-col>
      <v-col cols="12" md="6" class="text-center text-md-right mt-6 mt-md-0">
        <v-btn icon="mdi-facebook" variant="text" color="amber-darken-3"></v-btn>
        <v-btn icon="mdi-instagram" variant="text" color="amber-darken-3"></v-btn>
        <v-btn icon="mdi-whatsapp" variant="text" color="amber-darken-3"></v-btn>
        <div class="text-caption text-blue-grey-lighten-4 mt-4">© {{ new Date().getFullYear() }} Rent a car Nikola.</div>
      </v-col>
    </v-row>
  </v-container>
</v-footer>
</template>

<style scoped>
</style>