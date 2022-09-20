<template>
    <v-container style="max-width:100vw;">
        <!-- Header -->
        <v-toolbar flat class="px-6 py-3">
            <v-toolbar-title>Ajuste de Costos</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn rounded color="primary" @click="save()" class="elevation-0">Guardar</v-btn>
        </v-toolbar>
        <v-card class="elevation-0 pa-6 pr-10">
            <v-row class="ma-0">
                <v-col cols="8">
                    <v-text-field 
                        append-icon="mdi-magnify" 
                        class="ml-6" 
                        flat 
                        hide-details 
                        label="Buscar" 
                        solo 
                        background-color=#f5f6fa 
                        v-model="searchInput">
                    </v-text-field>
                </v-col>
                <v-col cols="4">
                    <v-autocomplete class="mr-6 pt-2" outlined solo @keydown.enter="filter()" clearable v-model="categoryFilterValue" :items="categories" item-text="name" item-value="name" attach label="Categoría"></v-autocomplete>
                </v-col>
            </v-row>
            <v-data-table
            :headers="headers"
            :items="itemsList"
            :search="searchInput"
            :items-per-page="itemsList.length"
            hide-default-footer>

            <template v-slot:[`item.cost`]="{ item }">
                <v-text-field 
                    label="Costo" 
                    background-color=#f5f6fa 
                    class="pa-1"
                    hide-details
                    solo
                    filled
                    rounded
                    dense
                    v-model="item.cost"
                    style="width:200px!important;"
                    >
                </v-text-field>
            </template>
            </v-data-table>
        </v-card>
        <v-snackbar text :color="snackbar.color" v-model="snackbar.show">
            <strong>{{ snackbar.message }}</strong>
        </v-snackbar>


        


        <v-dialog v-model="dialog" max-width="900px">
            <v-toolbar flat class="px-6 py-3">
                <v-toolbar-title>Resumen de ajustes de costos</v-toolbar-title>
            </v-toolbar>
            <v-card class="elevation-0 pa-6 pr-10 pb-2">
                <v-data-table
                    :headers="headers2"
                    :items="updateCosts"
                    :search="searchInput"
                    :items-per-page="updateCosts.length"
                    hide-default-footer
                    >
                    <template v-slot:[`item.cost`]="{ item }">
                        {{(item.cost*1).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
                    </template>
                    <template v-slot:[`item.old_cost`]="{ item }">
                        {{(item.old_cost*1).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
                    </template>
                </v-data-table>

                <v-card-actions>
                    <v-spacer class="hidden-md-and-down"></v-spacer>

                    <v-btn color="blue darken-1" text @click="dialog=false">
                        Cancelar
                    </v-btn>
                    <v-btn @click="save2" rounded color="primary" class="px-3 ml-4 elevation-0" :loading="gris" :disabled="gris">
                        Guardar
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script>
import axios from "axios";
export default {
    data: () => ({
        categoryFilterValue:null,
        filters:false,
        gris:false,
        updateCosts:'',
        editedItem:'',
        searchInput:'',
        snackbar: {
            show: false,
            message: null,
            color: null
        },
        dialog: false,
    }),
    computed: {
        headers(){return[
            { text: 'Codigo SAE', value: 'macro',},
            { text: 'Producto', value: 'name',},
            { text: 'Categoría(s)', value: 'categories', filter: this.categoryFilter},
            { text: 'Costo', value: 'cost',},
        ]},
        headers2(){return[
            { text: 'Codigo SAE', value: 'macro',},
            { text: 'Producto', value: 'name',},
            { text: 'Categoría(s)', value: 'categories', filter: this.categoryFilter},
            { text: 'Costo Anterior', value: 'old_cost',},
            { text: 'Nuevo Costo', value: 'cost',},
        ]},
        itemsList(){
            return this.$store.state.item.items.filter(item=>item.product_type != 'Variable').map(id=>{
                return{
                    categories:this.categoriesName(id.superiorID, id.categories),
                    cost:id.cost,
                    macro:id.macro,
                    name:id.name,
                    id:id.id
                }
            })
        },
        itemsList2(){
            return this.$store.state.item.items.filter(item=>item.product_type != 'Variable')
        },
        currentUser:{
            get(){
                return this.$store.state.currentUser.user
            }
        },
        categories(){
            return this.$store.state.category.categories
        },
    },
    methods: {
        categoryFilter(value) {
            if (!this.categoryFilterValue) {
                return true;
            }
            return value==this.categoryFilterValue
            
        },
        categoriesName(superiorID, catego){
            if(superiorID!=undefined){
                var categories = this.$store.state.item.items.filter(item=>item.id==superiorID).map(item=>item.categories)[0]
                var respuesta = this.categories.filter(category=>category.id == categories[0]).map(category=>category.name)[0]
                for(var i=1; i<categories.length; i++){
                    respuesta = respuesta + ', ' + this.categories.filter(category=>category.id == categories[i]).map(category=>category.name)[0]
                }
            }else if(catego!=undefined){
                var categories = catego
                var respuesta = this.categories.filter(category=>category.id == categories[0]).map(category=>category.name)[0]
                for(var i=1; i<categories.length; i++){
                    respuesta = respuesta + ', ' + this.categories.filter(category=>category.id == categories[i]).map(category=>category.name)[0]
                }
            }
            return respuesta
        },
        itemName(id){
            return this.$store.state.item.items.filter(item=>item.id == id).map(item=>item.name)[0]
        },
        save(){
            var updateCosts = []
            this.editedItem = this.itemsList
            for(var i=0; i<this.itemsList2.length; i++){
                if(this.itemsList2[i].cost!=this.itemsList[i].cost){
                    updateCosts = updateCosts.concat({
                        categories:this.itemsList[i].categories,
                        cost:this.itemsList[i].cost,
                        old_cost:this.itemsList2[i].cost,
                        macro:this.itemsList[i].macro,
                        name:this.itemsList[i].name,
                        id:this.itemsList[i].id,
                    })
                }
            }
            if(updateCosts.length>0){
                this.updateCosts = updateCosts
                this.dialog = true
            }
        },
        save2(){
            this.gris = true
            this.$nextTick(() => {
                if(this.updateCosts.length>0){
                    axios.put(process.env.VUE_APP_BACKEND_ROUTE + "api/v1/item/bulkupdate",Object.assign(this.updateCosts)).then(response => {
                        this.gris = false
                        this.dialog = false
                        this.searchInput = ''
                        this.snackbar = {
                            message: 'Ajuste realizado con exito.',
                            color: 'success',
                            show: true
                        }
                        this.$store.dispatch('item/getItems')
                    }).catch(error => {
                        this.snackbar = {
                            message: error.response.data.message,
                            color: 'error',
                            show: true
                        }
                    })
                }
            })
        }
    }
}
</script>

<style>
.v-text-field.v-text-field--solo:not(.v-text-field--solo-flat) > .v-input__control > .v-input__slot {
    box-shadow: 0px 3px 1px -2px rgb(0 0 0 / 0%), 0px 2px 2px 0px rgb(0 0 0 / 0%), 0px 1px 5px 0px rgb(0 0 0 / 0%)!important;
}
</style>
