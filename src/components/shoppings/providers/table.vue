<template>    
<!-- Proveedores -->
        <v-card style="background:transparent;" class="elevation-0 py-4 mx-6 padding2">
            <v-card-title style="background:white;" class="pa-6">Proveedores
                <v-tooltip right>
                    <template v-slot:activator="{ on, attrs }">
                        <v-icon v-bind="attrs" v-on="on" small class="ml-4">mdi-information-outline</v-icon>
                    </template>
                    <span>Ten a la mano el nombre de tus proveedores al momento de capturar una compra o un producto nuevo.</span>
                </v-tooltip>
                <v-spacer></v-spacer>
                <v-text-field
                    class="pt-0 mt-0"
                    v-model="search"
                    append-icon="mdi-magnify"
                    label="Buscador"
                    single-line
                    hide-details
                ></v-text-field>
                <v-spacer></v-spacer>
                <v-btn  @click="dialogProvider=true" class="elevation-0" style="height:30px; font-size:13px; font-weight: 400; text-transform:capitalize; color: #1976d1; background-color: rgb(25 118 209 / 10%)!important;" color="primary" dark>Agregar Nuevo</v-btn>
            </v-card-title>
            <v-data-table :search="search" expand-icon :headers="headers" :items="providers" class="elevation-0 px-6">
                <template slot="no-data">
                    No existen proveedores registrados.
                </template>
                <!-- Compras -->
                <template v-slot:[`item.name`]="{ item }">
                    <v-list-item class="px-0" style="min-height:0px!important; font-size:14px;" :to="{ path: '/shopping/'+ item.id}">{{item.name}}</v-list-item>
                </template>
                <!-- Acciones -->
                <template v-slot:[`item.actions`]="{ item }">
                    <v-icon small class="mr-2" @click="edit(item)">mdi-pencil</v-icon>
                    <v-icon small @click="deleteItem(item)">mdi-delete</v-icon>
                </template>
                <template v-slot:top>    
                    <v-dialog v-model="dialog" max-width="800px">
                        <editProvider @closeDialogProvider="closeDialogProvider" v-bind:editedItem="editedItem"/>
                    </v-dialog> 
                </template>
                <v-snackbar :color="snackbar.color" v-model="snackbar.show">
                    {{ snackbar.message }}
                </v-snackbar>
            </v-data-table>
            <v-dialog v-model="dialogProvider" max-width="800px">
                <createProvider @closeDialogProvider="closeDialogProvider"/>
            </v-dialog> 
        </v-card>   
</template>
<script>
import editProvider from "../providers/edit"
import createProvider from "../providers/create"
import axios from "axios";
export default {
    components: {
        'editProvider':editProvider,
        'createProvider':createProvider
    },
    data:()=>({  
        search:'',
        dialogProvider:false,
        editedItem:'',
        headers:[
            {text: 'Nombre', value: 'name'},
            {text: 'Teléfono', value: 'phone'},
            {text: 'Correo', value: 'email'},
            {text: 'Dirección', value: 'address'},
            {text: 'Condiciones Comerciales', value: 'commercial_conditions'},
            {text: 'Acciones', value: 'actions', sortable: false },
        ],
        dialog:false,
        snackbar: {
            show: false,
            message: null,
            color: null
        },
    }),
    computed:{
        providers:{
            get(){
                if(this.$route.params.id!=undefined){
                    return this.$store.state.provider.providers.filter(provider=>provider.id == this.$route.params.id)
                }else{
                    return this.$store.state.provider.providers;
                }
            }
        },
    },
    methods:{
        deleteItem (item) {
            let id = item.id
            if (confirm('¿Seguro que deseas borrar este proveedor?')) {
                axios.delete(process.env.VUE_APP_BACKEND_ROUTE + "api/v1/provider/delete/"+id).then(response => {
                    this.$store.dispatch('provider/getProviders')
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
        closeDialogProvider: function(params) {
            this.dialog = false
            this.dialogProvider = false
            this.$store.dispatch('provider/getProviders')
        },
    },
    created(){
        this.$store.dispatch('provider/getProviders')
    },
}
</script>