

<template>       
    <v-container>
        <v-data-table expand-icon :headers="headers" :items="rawMaterial" class="elevation-0 mx-6 py-6 px-10">
            <template v-slot:top>
                <v-toolbar flat class="">
                    <v-toolbar-title>Materia Prima </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-text-field
                        v-model="search"
                        append-icon="mdi-magnify"
                        label="Buscar"
                        single-line
                        hide-details
                    ></v-text-field>
                </v-toolbar>
            </template>
            <template slot="no-data">
                No existen materias primas registradas.
            </template>
            <template v-slot:[`item.cost`]="{ item }">
                {{(item.cost*1).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
            </template>
            <template v-slot:[`item.actions`]="{ item }">
                <v-icon small class="mr-2" @click="edit(item)">mdi-pencil</v-icon>
                <v-icon small @click="deleteItem(item)">mdi-delete</v-icon>
            </template>
            <v-snackbar :color="snackbar.color" v-model="snackbar.show">
                {{ snackbar.message }}
            </v-snackbar>
        </v-data-table>
        <!-- Crear Materia Prima -->
        <v-dialog v-model="createDialog" max-width="700px">
            <template v-slot:activator="{ on, attrs }">
                <v-btn bottom color="#e25200" dark fab fixed right v-bind="attrs" v-on="on">
                    <v-icon color="white">  mdi-plus </v-icon>
                </v-btn> 
            </template>
            <createItem @closeDialogItem="closeDialogItem"/>
        </v-dialog>
        <!-- Editar Materia Prima -->
        <v-dialog v-model="dialog" max-width="600px">
            <editItem @closeDialogItem="closeDialogItem" v-bind:editedItem="editedItem"/>
        </v-dialog> 
    </v-container>
</template>
<script>
import editItem from "../raw_material/edit"
import createItem from "../raw_material/create"
import axios from "axios";
export default {
    components: {
        'editItem':editItem,
        'createItem':createItem,
    },
    data:()=>({  
        search:'',
        editedItem:'',
        headers:[
            {text: 'Materia Prima', value: 'name'},
            {text: 'Costo', value: 'cost'},
            {text: 'Acciones', value: 'actions', sortable: false },
        ],
        dialog:false,
        createDialog:false,
        snackbar: {
            show: false,
            message: null,
            color: null
        },
    }),
    computed:{
        rawMaterial:{
            get(){
                return this.$store.state.raw_material.raw_materials;
            }
        },
    },
    methods:{
        deleteItem (item) {
            let id = item.id
            if (confirm('¿Seguro que deseas borrar esta materia prima? Esto afectara los costos de los productos a los que esta asignada')) {
                axios.delete(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/raw_materials/"+id).then(response => {
                    this.$store.dispatch('raw_material/getRawMaterial')
                }).catch(error => {
                    this.snackbar = {
                        message: error.response.data.message,
                        color: 'error',
                        show: true
                    }
                });
            }
        },
        edit(item){
            this.editedItem = item
            this.dialog = true
        },
        closeDialogItem: function(params) {
            this.dialog = params;
            this.createDialog = params
            this.$store.dispatch('raw_material/getRawMaterial')
        },
    },
}
</script>