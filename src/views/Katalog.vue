<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';


import audiLogo from '@/assets/logos/audi.jpg';
import bmwLogo from '@/assets/logos/bmw.jpg';
import renaultLogo from '@/assets/logos/renault.jpg';
import skodaLogo from '@/assets/logos/skoda.jpg';
import toyotaLogo from '@/assets/logos/toyota.png';
import volkswagenLogo from '@/assets/logos/volkswagen.jpg';

const mapaLogoa: Record<string, string> = {
  audi: audiLogo, bmw: bmwLogo, renault: renaultLogo,
  skoda: skodaLogo, toyota: toyotaLogo, volkswagen: volkswagenLogo,
  vw: volkswagenLogo, passat: volkswagenLogo, golf: volkswagenLogo
};

const dobaviLogo = (marka: string, model?: string): string => {
  const m = marka?.toLowerCase().trim() || '';
  const mo = model?.toLowerCase().trim() || '';
  return mapaLogoa[mo] || mapaLogoa[m] || volkswagenLogo;
};

const API_VOZILA = 'http://127.0.0.1:5000/vozila';

interface Vozilo {
  id?: number; marka: string; model: string; godina_proizvodnje: number;
  snaga_kw: number; registracija: string; cijena_po_danu: number; dostupno: boolean;
}

const cars = ref<Vozilo[]>([]);
const searchQuery = ref('');
const loading = ref(true);
const detailsDialog = ref(false);
const isEditing = ref(false);
const isCreating = ref(false);
const selectedCar = ref<Vozilo>({} as Vozilo);

const stranica = ref(1);
const poStranici = 10;

const ucitajVozila = async () => {
  loading.value = true;
  try {
    const res = await axios.get(API_VOZILA);
    cars.value = res.data;
  } catch (e) {
    console.error("Greška pri učitavanju vozila:", e);
  } finally {
    loading.value = false;
  }
};


const svaFiltriranaVozila = computed(() => {
  const q = searchQuery.value.toLowerCase().trim();
  return cars.value.filter(c =>
      c.marka.toLowerCase().includes(q) || c.model.toLowerCase().includes(q)
  );
});

const filtriranaVozila = computed(() => {
  const start = (stranica.value - 1) * poStranici;
  return svaFiltriranaVozila.value.slice(start, start + poStranici);
});

const brojStranica = computed(() => Math.ceil(svaFiltriranaVozila.value.length / poStranici));

const openDetails = (car: Vozilo) => {
  selectedCar.value = { ...car };
  isEditing.value = isCreating.value = false;
  detailsDialog.value = true;
};

const openCreateDialog = () => {
  selectedCar.value = {
    marka: '', model: '', godina_proizvodnje: 2026,
    snaga_kw: 0, registracija: '', cijena_po_danu: 0, dostupno: true
  };
  isEditing.value = isCreating.value = detailsDialog.value = true;
};

const saveCar = async () => {
  try {
    if (isCreating.value) {
      await axios.post(API_VOZILA, selectedCar.value);
    } else {
      await axios.put(`${API_VOZILA}/${selectedCar.value.id}`, selectedCar.value);
    }
    ucitajVozila();
    detailsDialog.value = false;
  } catch (e) {
    console.error("Greška pri spremanju:", e);
  }
};

const deleteCar = async (id: number) => {
  if (confirm('Jeste li sigurni da želite obrisati ovo vozilo?')) {
    try {
      await axios.delete(`${API_VOZILA}/${id}`);
      ucitajVozila();
      detailsDialog.value = false;
    } catch (e) {
      console.error("Greška pri brisanju:", e);
    }
  }
};

onMounted(ucitajVozila);
</script>

<template>
  <v-container class="py-10">

    <v-row justify="center" class="mb-8" align="center">
      <v-col cols="10" md="7">
        <v-text-field
            v-model="searchQuery"
            label="Pretraži vozila (Marka ili Model)"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            color="amber-darken-3"
            rounded="lg"
            hide-details
            @update:model-value="stranica = 1"
        ></v-text-field>
      </v-col>
      <v-col cols="2" md="1" class="text-right">
        <v-btn icon="mdi-plus" color="amber-darken-3" size="large" @click="openCreateDialog"></v-btn>
      </v-col>
    </v-row>


    <v-row v-if="!loading">
      <v-col v-for="car in filtriranaVozila" :key="car.id" cols="12" sm="6" md="4" lg="3">
        <v-card class="rounded-xl elevation-3 h-100 d-flex flex-column" @click="openDetails(car)">
          <v-img :src="dobaviLogo(car.marka, car.model)" height="180" contain class="ma-2"></v-img>

          <v-card-item class="pb-0">
            <v-card-title class="font-weight-bold pa-0">{{ car.marka }} {{ car.model }}</v-card-title>
            <v-card-subtitle class="text-amber-darken-4 font-weight-bold pa-0 mt-1">{{ car.cijena_po_danu }} KM / dan</v-card-subtitle>
          </v-card-item>

          <v-card-text class="flex-grow-1">
            <div class="text-body-2 text-grey-darken-2">
              <div><v-icon size="small" class="me-1">mdi-calendar</v-icon> {{ car.godina_proizvodnje }}.</div>
              <div><v-icon size="small" class="me-1">mdi-engine</v-icon> {{ car.snaga_kw }} kW</div>
              <v-chip :color="car.dostupno ? 'success' : 'error'" size="x-small" label class="mt-2">
                {{ car.dostupno ? 'Dostupno' : 'Zauzeto' }}
              </v-chip>
            </div>
          </v-card-text>

          <v-card-actions class="pa-4 pt-0">
            <v-btn block color="amber-darken-3" variant="tonal" class="rounded-lg">Detalji / Upravljanje</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>


    <v-row v-if="brojStranica > 1" justify="center" class="mt-10">
      <v-pagination v-model="stranica" :length="brojStranica" color="amber-darken-3" rounded="circle"></v-pagination>
    </v-row>


    <v-dialog v-model="detailsDialog" max-width="600px">
      <v-card class="rounded-xl pa-4">
        <v-card-title class="d-flex justify-space-between align-center">
          <span class="text-h5 font-weight-bold">
            {{ isCreating ? 'Novo Vozilo' : (isEditing ? 'Uredi Podatke' : 'Detalji Vozila') }}
          </span>
          <v-btn icon="mdi-close" variant="text" @click="detailsDialog = false"></v-btn>
        </v-card-title>

        <v-card-text>

          <v-form :readonly="!isEditing">
            <v-row>
              <v-col cols="6"><v-text-field v-model="selectedCar.marka" label="Marka" variant="outlined"></v-text-field></v-col>
              <v-col cols="6"><v-text-field v-model="selectedCar.model" label="Model" variant="outlined"></v-text-field></v-col>
              <v-col cols="6"><v-text-field v-model="selectedCar.godina_proizvodnje" label="Godište" variant="outlined"></v-text-field></v-col>
              <v-col cols="6"><v-text-field v-model="selectedCar.snaga_kw" label="Snaga (kW)" variant="outlined"></v-text-field></v-col>
              <v-col cols="12"><v-text-field v-model="selectedCar.registracija" label="Registracija" variant="outlined"></v-text-field></v-col>
              <v-col cols="12"><v-text-field v-model="selectedCar.cijena_po_danu" label="Cijena (KM)" variant="outlined"></v-text-field></v-col>
              <v-col cols="12">
                <v-switch v-model="selectedCar.dostupno" label="Dostupno za najam" color="success"></v-switch>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-btn v-if="!isCreating && selectedCar.id" color="error" variant="text" @click="deleteCar(selectedCar.id!)">Obriši</v-btn>
          <v-spacer></v-spacer>
          <v-btn v-if="!isEditing" color="amber-darken-3" variant="elevated" @click="isEditing = true">Uredi</v-btn>
          <v-btn v-if="isEditing" color="success" variant="flat" @click="saveCar">Spremi</v-btn>
          <v-btn variant="text" @click="detailsDialog = false">Zatvori</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
</style>