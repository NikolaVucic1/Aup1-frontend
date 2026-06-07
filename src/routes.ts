import { createRouter, createWebHistory } from 'vue-router'

import Pocetna from '@/views/Pocetna.vue'
import Katalog from '@/views/Katalog.vue'
import Prijava from '@/views/Prijava.vue'

const routes = [
    {
        path: '/',
        name: 'Pocetna',
        component: Pocetna
    },
    {
        path: '/katalog',
        name: 'Katalog',
        component: Katalog
    },
    {
        path: '/prijava',
        name: 'Prijava',
        component: Prijava
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/'
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router