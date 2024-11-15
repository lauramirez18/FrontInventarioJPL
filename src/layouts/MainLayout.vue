<template>
    <q-layout view="hhh LpR fFf">

        <q-header id="header-main" v-show="$route.name !== 'Login' && $route.name !== '/'">
            <q-toolbar>

                <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />
                <q-toolbar-title class="text-left"></q-toolbar-title>
                <q-space />

                <q-btn dense flat round icon="logout" @click="logout" />
            </q-toolbar>
        </q-header>


        <q-drawer v-model="leftDrawerOpen" side="left" behavior="mobile" bordered>

            <q-img class="absolute-top" src="https://cdn.quasar.dev/img/material.png"
                style="height: 150px; background-color: #1d1d1d">
                <div class="absolute-bottom bg-transparent">
                    <q-avatar size="56px" class="q-mb-sm">
                        <img src="https://cdn.quasar.dev/img/boy-avatar.png">
                    </q-avatar>
                    <div class="text-weight-bold">Razvan Stoenescu</div>
                    <div>@rstoenescu</div>
                </div>
            </q-img>

            <q-scroll-area style="height: calc(100% - 150px); margin-top: 150px; border-right: 1px solid #ddd">
                <q-list padding>
                    <q-item clickable v-ripple to="/inicio" active-class="my-menu-link" exact>
                        <q-item-section avatar>
                            <q-icon name="home" />
                        </q-item-section>
                        <q-item-section>Inicio</q-item-section>
                    </q-item>

                    <q-item clickable v-ripple to="/articulos" active-class="my-menu-link">
                        <q-item-section avatar>
                            <q-icon name="article" />
                        </q-item-section>
                        <q-item-section>Articulos</q-item-section>
                    </q-item>

                    <q-item clickable v-ripple to="/categorias" active-class="my-menu-link">
                        <q-item-section avatar>
                            <q-icon name="category" />
                        </q-item-section>
                        <q-item-section>Categorias</q-item-section>
                    </q-item>

                    <q-item clickable v-ripple to="/usuarios" active-class="my-menu-link">
                        <q-item-section avatar>
                            <q-icon name="people" />
                        </q-item-section>
                        <q-item-section>Usuarios</q-item-section>
                    </q-item>

                    <q-item clickable v-ripple to="/terceros/clientes" active-class="my-menu-link">
                        <q-item-section avatar>
                            <q-icon name="group" />
                        </q-item-section>
                        <q-item-section>Clientes</q-item-section>
                    </q-item>

                    <q-item clickable v-ripple to="/terceros/proveedores" active-class="my-menu-link">
                        <q-item-section avatar>
                            <q-icon name="groups" />
                        </q-item-section>
                        <q-item-section>Proveedores</q-item-section>
                    </q-item>

                    <q-item clickable v-ripple to="/movimientos" active-class="my-menu-link">
                        <q-item-section avatar>
                            <q-icon name="receipt" />
                        </q-item-section>
                        <q-item-section>Movimientos</q-item-section>
                    </q-item>

                    <q-item clickable v-ripple to="/entradas" active-class="my-menu-link">
                        <q-item-section avatar>
                            <q-icon name="input" />
                        </q-item-section>
                        <q-item-section>Entradas</q-item-section>
                    </q-item>

                    <q-item clickable v-ripple to="/salidas" active-class="my-menu-link">
                        <q-item-section avatar>
                            <q-icon name="output" />
                        </q-item-section>
                        <q-item-section>Salidas</q-item-section>
                    </q-item>
                </q-list>
            </q-scroll-area>
        </q-drawer>


        <q-page-container>
            <router-view />
        </q-page-container>

        <q-footer elevated class="bg-grey-8 text-white">
            <q-toolbar>
                <q-toolbar-title>
                    <div class="text-footer">INVENTARIO JPL - 2024 © Todos los derechos reservados</div>
                </q-toolbar-title>
            </q-toolbar>
        </q-footer>
    </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'


const router = useRouter()


const leftDrawerOpen = ref(false)


function toggleLeftDrawer() {
    leftDrawerOpen.value = !leftDrawerOpen.value
}


function logout() {
    router.replace('/')
}
</script>

<style scoped>
#header-main {
    background-color: rgb(2, 21, 38);
    color: white;
}

.logo {
    width: 50px;
}

.text-footer {
    font-size: 12px;
    color: rgb(255, 255, 255);
    text-align: center;
    font-size: 14px;
    font-weight: bold;
}

.material-symbols-outlined {
    font-size: 18px;
    vertical-align: middle;
}

.my-menu-link {
    color: white;
    background-color: rgba(2, 21, 38, 0.37);
}
</style>