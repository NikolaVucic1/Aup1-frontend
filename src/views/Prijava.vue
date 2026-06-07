<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';

const API_BASE = 'http://127.0.0.1:5000';

interface Korisnik {
  id?: number;
  ime: string;
  prezime: string;
  email: string;
  broj_mobitela: string;
  broj_vozacke: string;
  prikaz?: string;
}

interface Lokacija {
  id?: number;
  naziv_lokacije: string;
  adresa: string;
  grad: string;
}

interface Vozilo {
  id?: number;
  marka: string;
  model: string;
  godina_proizvodnje: number;
  snaga_kw: number;
  registracija: string;
  cijena_po_danu: number;
  dostupno: boolean;
}

interface Najam {
  id: number | null;
  korisnik_id: number | null;
  vozilo_id: number | null;
  lokacija_id: number | null;
  datum_preuzimanja: string;
  datum_povrata: string;
  ukupna_cijena: number;
  korisnik_ime_prezime?: string;
  vozilo_info?: string;
}


const korisnici = ref<Korisnik[]>([]);
const lokacije = ref<Lokacija[]>([]);
const vozila = ref<Vozilo[]>([]);
const najmovi = ref<Najam[]>([]);
const loading = ref(false);

const selektiraniKorisnik = ref<number | null>(null);
const selektiranaLokacija = ref<number | null>(null);
const selektiranoVozilo = ref<number | null>(null);
const datumPreuzimanja = ref(new Date().toISOString().split('T')[0]);
const datumPovrata = ref(new Date(Date.now() + 86400000).toISOString().split('T')[0]);

const noviKorisnikDialog = ref(false);
const novaLokacijaDialog = ref(false);
const editNajamDialog = ref(false);


const isEditingKorisnik = ref(false);
const isEditingLokacija = ref(false);

const noviKorisnik = ref<Korisnik>({ ime: '', prezime: '', email: '', broj_mobitela: '', broj_vozacke: '' });
const novaLokacija = ref<Lokacija>({ naziv_lokacije: '', adresa: '', grad: '' });
const najamZaEdit = ref<Najam>({ id: null, korisnik_id: null, vozilo_id: null, lokacija_id: null, datum_preuzimanja: '', datum_povrata: '', ukupna_cijena: 0 });

const ucitajSve = async () => {
  loading.value = true;
  try {
    const [resK, resL, resV, resN] = await Promise.all([
      axios.get(`${API_BASE}/korisnici`),
      axios.get(`${API_BASE}/lokacije`),
      axios.get(`${API_BASE}/vozila`),
      axios.get(`${API_BASE}/najmovi`)
    ]);
    korisnici.value = resK.data.map((k: Korisnik) => ({ ...k, prikaz: `${k.ime} ${k.prezime} (${k.email})` }));
    lokacije.value = resL.data;
    vozila.value = resV.data;
    najmovi.value = resN.data;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const spremiNajamUBazu = async () => {
  if (!selektiraniKorisnik.value || !selektiranaLokacija.value || !selektiranoVozilo.value) {
    alert("Popunite sva polja!");
    return;
  }
  try {
    const auto = vozila.value.find(v => v.id === selektiranoVozilo.value);
    const d1 = new Date(datumPreuzimanja.value);
    const d2 = new Date(datumPovrata.value);
    const brojDana = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24)) || 1;
    const ukupnaCijena = auto ? auto.cijena_po_danu * brojDana : 0;

    const podaci = {
      datum_preuzimanja: datumPreuzimanja.value,
      datum_povrata: datumPovrata.value,
      ukupna_cijena: ukupnaCijena,
      korisnik_id: selektiraniKorisnik.value,
      vozilo_id: selektiranoVozilo.value,
      lokacija_id: selektiranaLokacija.value
    };
    await axios.post(`${API_BASE}/najmovi`, podaci);
    alert("Najam uspješno spremljen!");
    selektiraniKorisnik.value = null;
    selektiranoVozilo.value = null;
    selektiranaLokacija.value = null;
    await ucitajSve();
  } catch (e) {
    alert("Greška pri spremanju!");
  }
};

const otvoriEditDialog = (najam: Najam) => {
  najamZaEdit.value = {
    ...najam,
    datum_preuzimanja: najam.datum_preuzimanja ? new Date(najam.datum_preuzimanja).toISOString().split('T')[0] : '',
    datum_povrata: najam.datum_povrata ? new Date(najam.datum_povrata).toISOString().split('T')[0] : ''
  };
  editNajamDialog.value = true;
};

const azurirajNajam = async () => {
  try {
    await axios.put(`${API_BASE}/najmovi/${najamZaEdit.value.id}`, najamZaEdit.value);
    alert("Najam ažuriran!");
    editNajamDialog.value = false;
    await ucitajSve();
  } catch (e) {
    alert("Greška pri ažuriranju!");
  }
};

const obrisiNajam = async (id: number) => {
  if (!confirm("Sigurno želiš obrisati ovaj najam?")) return;
  try {
    await axios.delete(`${API_BASE}/najmovi/${id}`);
    await ucitajSve();
  } catch (e) {
    alert("Greška pri brisanju najma!");
  }
};

const obrisiKorisnika = async () => {
  if (!selektiraniKorisnik.value) return;
  if (!confirm("Sigurno želiš obrisati označenog korisnika?")) return;
  try {
    await axios.delete(`${API_BASE}/korisnici/${selektiraniKorisnik.value}`);
    alert("Korisnik uspješno obrisan!");
    selektiraniKorisnik.value = null;
    await ucitajSve();
  } catch (e) {
    alert("Greška! Vjerojatno ovaj korisnik ima povezane aktivne najmove.");
  }
};

const obrisiLokaciju = async () => {
  if (!selektiranaLokacija.value) return;
  if (!confirm("Sigurno želiš obrisati označenu lokaciju?")) return;
  try {
    await axios.delete(`${API_BASE}/lokacije/${selektiranaLokacija.value}`);
    alert("Lokacija uspješno obrisana!");
    selektiranaLokacija.value = null;
    await ucitajSve();
  } catch (e) {
    alert("Greška! Ova lokacija se koristi u nekom od najmova.");
  }
};


const otvoriNoviKorisnikDialog = () => {
  isEditingKorisnik.value = false;
  noviKorisnik.value = { ime: '', prezime: '', email: '', broj_mobitela: '', broj_vozacke: '' };
  noviKorisnikDialog.value = true;
};

const otvoriUrediKorisnikDialog = () => {
  const pronadjen = korisnici.value.find(k => k.id === selektiraniKorisnik.value);
  if (pronadjen) {
    isEditingKorisnik.value = true;
    noviKorisnik.value = { ...pronadjen };
    noviKorisnikDialog.value = true;
  }
};

const otvoriNovuLokacijuDialog = () => {
  isEditingLokacija.value = false;
  novaLokacija.value = { naziv_lokacije: '', adresa: '', grad: '' };
  novaLokacijaDialog.value = true;
};

const otvoriUrediLokacijuDialog = () => {
  const pronadjena = lokacije.value.find(l => l.id === selektiranaLokacija.value);
  if (pronadjena) {
    isEditingLokacija.value = true;
    novaLokacija.value = { ...pronadjena };
    novaLokacijaDialog.value = true;
  }
};


const spremiKorisnika = async () => {
  try {
    if (isEditingKorisnik.value) {
      await axios.put(`${API_BASE}/korisnici/${noviKorisnik.value.id}`, noviKorisnik.value);
      alert("Korisnik uspješno uređen!");
    } else {
      const res = await axios.post(`${API_BASE}/korisnici`, noviKorisnik.value);
      selektiraniKorisnik.value = res.data.id;
      alert("Korisnik uspješno dodan!");
    }
    await ucitajSve();
    noviKorisnikDialog.value = false;
  } catch (e) { alert("Greška pri spremanju korisnika!"); }
};

const spremiLokaciju = async () => {
  try {
    if (isEditingLokacija.value) {
      await axios.put(`${API_BASE}/lokacije/${novaLokacija.value.id}`, novaLokacija.value);
      alert("Lokacija uspješno uređena!");
    } else {
      await axios.post(`${API_BASE}/lokacije`, novaLokacija.value);
      alert("Lokacija uspješno dodana!");
    }
    await ucitajSve();
    novaLokacijaDialog.value = false;
  } catch (e) { alert("Greška pri spremanju lokacije!"); }
};

onMounted(ucitajSve);
</script>

<template>
  <v-container class="py-10">
    <v-row justify="center">
      <v-col cols="12" md="11">
        <v-card class="pa-8 rounded-xl elevation-10 mb-10" border="t-lg info">
          <v-card-title class="text-h5 font-weight-bold mb-6">Administracija Najmova</v-card-title>

          <v-row>
            <v-col cols="12" md="4">
              <v-autocomplete v-model="selektiraniKorisnik" :items="korisnici" item-title="prikaz" item-value="id" label="Klijent" variant="outlined"></v-autocomplete>
            </v-col>
            <v-col cols="12" md="4">
              <v-select v-model="selektiranoVozilo" :items="vozila.filter(v => v.dostupno)" :item-title="(v: Vozilo) => `${v.marka} ${v.model} (${v.cijena_po_danu} KM/dan)`" item-value="id" label="Vozilo" variant="outlined"></v-select>
            </v-col>
            <v-col cols="12" md="4">
              <v-select v-model="selektiranaLokacija" :items="lokacije" item-title="naziv_lokacije" item-value="id" label="Lokacija" variant="outlined"></v-select>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model="datumPreuzimanja" type="date" label="Datum preuzimanja" variant="outlined"></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model="datumPovrata" type="date" label="Datum povrata" variant="outlined"></v-text-field>
            </v-col>
          </v-row>

          <v-row class="mt-n2">
            <v-col cols="12" sm="4" md="2">
              <v-btn block color="primary" variant="tonal" @click="otvoriNoviKorisnikDialog">+ Novi</v-btn>
            </v-col>
            <v-col cols="12" sm="4" md="2">
              <v-btn block color="warning" variant="flat" :disabled="!selektiraniKorisnik" @click="otvoriUrediKorisnikDialog">
                <v-icon class="me-1">mdi-pencil</v-icon> Uredi
              </v-btn>
            </v-col>
            <v-col cols="12" sm="4" md="2" class="border-e-md pr-4">
              <v-btn block color="error" variant="flat" :disabled="!selektiraniKorisnik" @click="obrisiKorisnika">
                <v-icon class="me-1">mdi-delete</v-icon> Obriši
              </v-btn>
            </v-col>

            <v-col cols="12" sm="4" md="2" class="pl-4">
              <v-btn block color="secondary" variant="tonal" @click="otvoriNovuLokacijuDialog">+ Lokacija</v-btn>
            </v-col>
            <v-col cols="12" sm="4" md="2">
              <v-btn block color="warning" variant="flat" :disabled="!selektiranaLokacija" @click="otvoriUrediLokacijuDialog">
                <v-icon class="me-1">mdi-pencil</v-icon> Uredi
              </v-btn>
            </v-col>
            <v-col cols="12" sm="4" md="2">
              <v-btn block color="error" variant="flat" :disabled="!selektiranaLokacija" @click="obrisiLokaciju">
                <v-icon class="me-1">mdi-delete</v-icon> Obriši
              </v-btn>
            </v-col>
          </v-row>

          <v-btn block color="success" size="x-large" class="mt-6" @click="spremiNajamUBazu" :loading="loading">SPREMI REZERVACIJU</v-btn>
        </v-card>

        <v-card class="rounded-xl elevation-10">
          <v-table>
            <thead class="bg-grey-lighten-4">
            <tr>
              <th>ID</th>
              <th>Klijent</th>
              <th>Vozilo</th>
              <th>Preuzimanje</th>
              <th>Povrat</th>

              <th class="text-center">Akcije</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="n in najmovi" :key="n.id ?? 0">
              <td>#{{ n.id }}</td>
              <td>{{ n.korisnik_ime_prezime }}</td>
              <td>{{ n.vozilo_info }}</td>
              <td>{{ n.datum_preuzimanja }}</td>
              <td>{{ n.datum_povrata }}</td>

              <td class="text-center">
                <v-btn icon="mdi-pencil" variant="text" color="blue" @click="otvoriEditDialog(n)"></v-btn>
                <v-btn icon="mdi-delete" variant="text" color="error" @click="n.id ? obrisiNajam(n.id) : null"></v-btn>
              </td>
            </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="editNajamDialog" max-width="500">
      <v-card class="pa-4 rounded-lg">
        <v-card-title>Uredi Najam </v-card-title>
        <v-card-text>
          <v-autocomplete v-model="najamZaEdit.korisnik_id" :items="korisnici" item-title="prikaz" item-value="id" label="Klijent" variant="outlined" class="mb-4"></v-autocomplete>
          <v-select v-model="najamZaEdit.vozilo_id" :items="vozila" :item-title="(v: Vozilo) => `${v.marka} ${v.model}`" item-value="id" label="Vozilo" variant="outlined" class="mb-4"></v-select>
          <v-select v-model="najamZaEdit.lokacija_id" :items="lokacije" item-title="naziv_lokacije" item-value="id" label="Lokacija" variant="outlined" class="mb-4"></v-select>
          <v-text-field v-model="najamZaEdit.datum_preuzimanja" type="date" label="Preuzimanje" variant="outlined" class="mb-4"></v-text-field>
          <v-text-field v-model="najamZaEdit.datum_povrata" type="date" label="Povrat" variant="outlined" class="mb-4"></v-text-field>

        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="editNajamDialog = false">Odustani</v-btn>
          <v-btn color="blue" variant="elevated" @click="azurirajNajam">Spremi Izmjene</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="noviKorisnikDialog" max-width="500">
      <v-card class="pa-4">
        <v-card-title>{{ isEditingKorisnik ? 'Uredi Korisnika' : 'Novi Korisnik' }}</v-card-title>
        <v-card-text>
          <v-text-field v-model="noviKorisnik.ime" label="Ime" variant="outlined"></v-text-field>
          <v-text-field v-model="noviKorisnik.prezime" label="Prezime" variant="outlined"></v-text-field>
          <v-text-field v-model="noviKorisnik.email" label="Email" variant="outlined"></v-text-field>
          <v-text-field v-model="noviKorisnik.broj_mobitela" label="Mobitel" variant="outlined"></v-text-field>
          <v-text-field v-model="noviKorisnik.broj_vozacke" label="Vozačka" variant="outlined"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="noviKorisnikDialog = false">Zatvori</v-btn>
          <v-btn color="primary" variant="flat" @click="spremiKorisnika">Spremi</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="novaLokacijaDialog" max-width="400">
      <v-card class="pa-4">
        <v-card-title>{{ isEditingLokacija ? 'Uredi Lokaciju' : 'Nova Lokacija' }}</v-card-title>
        <v-card-text>
          <v-text-field v-model="novaLokacija.naziv_lokacije" label="Naziv" variant="outlined"></v-text-field>
          <v-text-field v-model="novaLokacija.adresa" label="Adresa" variant="outlined"></v-text-field>
          <v-text-field v-model="novaLokacija.grad" label="Grad" variant="outlined"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="novaLokacijaDialog = false">Zatvori</v-btn>
          <v-btn color="secondary" variant="flat" @click="spremiLokaciju">Spremi</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.v-card { border-top: 6px solid #1976D2; }
</style>