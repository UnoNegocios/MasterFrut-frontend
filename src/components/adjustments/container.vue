<template>
    <v-container style="max-width:100vw;">
        <!-- Filtros -->
        <v-navigation-drawer style="top: 0px; max-height:100vh!important;" right v-model="filters" :clipped="$vuetify.breakpoint.lgAndUp" app>
            <filterAdjustments @filtersAdjustment="filtersAdjustment"/>
        </v-navigation-drawer>
        <!-- Contenedor -->
        <v-data-table :headers="headers" :items="adjustments" class="elevation-0 px-6 py-4">
            <!-- Header -->
            <template v-slot:top>
                <v-toolbar flat >
                    <v-toolbar-title>Ajustes de Inventario</v-toolbar-title>
                    <v-btn icon>
                        <v-icon @click="openFilter()">mdi-filter</v-icon>
                    </v-btn>
                    <v-spacer></v-spacer>
                    <v-btn icon v-show="permissions('download')">
                        <v-icon @click="exportExcel">mdi-download</v-icon>
                    </v-btn>
                </v-toolbar>
            </template>
            <!-- Acciones por fila -->
            <template v-slot:[`item.actions`]="{ item }">
                <v-menu bottom left v-if="permissions('deleteAdjustments')==true"><!-- permissions('editAdjustments')==true ||  -->
                    <template v-slot:activator="{ on, attrs }">
                    <v-btn icon v-bind="attrs" v-on="on">
                        <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                    </template>
                    <v-list style="font-size:13px;">
                        <!--v-list-item @click="editItem(item.id)"  v-show="permissions('editAdjustments')">
                            <v-icon small class="mr-2">
                                mdi-pencil
                            </v-icon>
                            Editar
                        </v-list-item-->
                        <v-list-item @click="deleteItem(item)"  v-show="permissions('deleteAdjustments')">
                            <v-icon small class="mr-2">
                                mdi-delete
                            </v-icon>
                            Eliminar
                        </v-list-item>
                    </v-list>
                </v-menu>
            </template>
            <!-- Tabla sin información -->
            <template v-slot:no-data>
                No existen registros de nomina aún
            </template>
        </v-data-table>
        <!-- Crear actividad -->
        <v-dialog v-model="createDialog" max-width="700px">
          <template v-slot:activator="{ on, attrs }">
            <v-btn bottom color="#e25200" dark fab fixed right v-bind="attrs" v-on="on">
                <v-icon color="white">  mdi-plus </v-icon>
            </v-btn> 
          </template>
          <create @closeCreateDialogAdjustment="closeCreateDialogAdjustment"/>
        </v-dialog>
        <!-- Editar actividad
        <v-dialog v-model="editDialog" max-width="700px">
          <edit v-bind:adjustment="adjustment" @closeEditDialogAdjustment="closeEditDialogAdjustment"/>
        </v-dialog-->
        <!-- Dialogo confirmación de eliminación -->
        <div class="text-center">
            <v-bottom-sheet  v-model="sheet" inset>
                <v-sheet class="text-center" height="150px">
                    <div class="pt-6">
                    ¿Seguro que deseas borrar esta nomina?
                    </div>
                    <v-btn class="mt-4" text color="error" @click="deleteAdjustment()">
                    Eliminar
                    </v-btn>
                    <v-btn class="mt-4" text color="grey" @click="cancel()">
                    Cancelar
                    </v-btn>
                </v-sheet>
            </v-bottom-sheet>
        </div>
        <v-snackbar :color="snackbar.color" v-model="snackbar.show">
            {{ snackbar.message }}
        </v-snackbar>
    </v-container>
</template>

<script>
import axios from "axios";
import XLSX from 'xlsx';
import Filter from "../adjustments/filter"
import Create from "../adjustments/create"
//import Edit from "../adjustments/edit"
export default {
    components: {
        'filterAdjustments':Filter,
        'create':Create,
        //'edit':Edit,
    }, 
    data: () => ({
        adjustment:'',
        sheet2: false,
        sheet: false,
        filters: false,
        //editDialog: false,
        createDialog: false,
        deleteId:'',
        adjustments: '',
        snackbar: {
            show: false,
            message: null,
            color: null
        },
    }),
    computed: {
        currentUser:{
            get(){
                return this.$store.state.currentUser.user;
            }
        },
        headers(){ 
            this.adjustments = this.adjustmentsLists
            return [
            { text: 'Fecha', value: 'date' },
            { text: 'Producto', value: 'item_id' },
            { text: 'Cantidad', value: 'amount' },
            { text: 'Nota', value: 'note' },
            { text: 'Vendedor', value: 'user_id' },
        ]},
        adjustmentsList(){
            return this.$store.state.adjustment.adjustments
        },
        adjustmentsLists(){
            var adjustments = this.$store.state.adjustment.adjustments
            adjustments = adjustments.map(id=>{
                return{
                    id:id.id,
                    item_id:id.item_id,
                    date:id.date,
                    amount:id.amount,
                    note:id.note,
                    user_id:this.userName(id.user_id),
                    created_at:id.created_at.slice(0, 10),
                }
            });
            return adjustments
        },
    },
    methods: {
        openFilter(){
            if(this.filters == false){
                this.$emit("closeDrawer", false);
                this.filters = true
            }else{
                this.$emit("closeDrawer", true);
                this.filters = false
            }
        },
        permissions(permission){
        if(this.currentUser.id==1){
          return true
        }else if(this.currentUser.permissions!=undefined){
          if(this.currentUser.permissions.includes(permission)){
            return true
          }else{
            return false
          }
        }else{
          return false
        }
      },
        removeDuplicates(originalArray, prop) {
            var newArray = [];
            var lookupObject  = {};
            for(var i in originalArray) {
                lookupObject[originalArray[i][prop]] = originalArray[i];
            }
            for(i in lookupObject) {
                newArray.push(lookupObject[i]);
            }
            return newArray;
        },
        lowerCase(text){
            if(text!=null&&text!=undefined&&text!=''){
                return text.toLowerCase()
            }else{
                return ' '
            }
        },
        filtersAdjustment: function(params) {
            
        },
        /*closeEditDialogAdjustment: function(params) {
            this.editDialog = false;
            this.$store.dispatch('adjustment/getAdjustments')
        },*/
        closeCreateDialogAdjustment: function(params) {
            this.createDialog = false;
            this.$store.dispatch('adjustment/getAdjustments')
        },
        exportExcel: function () {
            let data = XLSX.utils.json_to_sheet(this.adjustments)
            const workbook = XLSX.utils.book_new()
            const filename = 'Lista de Cobranzas'
            XLSX.utils.book_append_sheet(workbook, data, filename)
            XLSX.writeFile(workbook, `${filename}.xlsx`)
        },
        deleteAdjustment(){
            axios.delete(process.env.VUE_APP_BACKEND_ROUTE + "api/v1/adjustment/delete/"+this.deleteId).then(response => {
                this.deleteId = ''
                this.sheet = false
                this.$store.dispatch('adjustment/getAdjustments')
            }).catch(error => {
                this.snackbar = {
                    message: error.response.data.message,
                    color: 'error',
                    show: true
                }
            });
        },
        cancel(){
            this.deleteId = ''
            this.sheet = false
            this.sheet2 = false
        },
        deleteItem (item) {
            this.deleteId = item.id
            this.sheet = true
        },
        /*editItem(id){
            this.adjustment = this.adjustmentsList.filter(adjustment=>adjustment.id == id)[0]
            this.editDialog = true
        },*/
        userName(id){
            return this.$store.state.user.users.filter(user=>user.id == id).map(user => user.name + ' ' + user.last)[0]
        },
    }
}
</script>
<style>
    .bordercolor{
        width: 3px;
        content: ' ';
        height: 47px;
        position: absolute;
        border-radius:5px 0px 0px 5px;
    }
    @media(min-width: 980px){
        .bordercolor{
            margin-top: -13px;
            margin-left: -19px;
        }
    }
    @media(max-width: 980px){
        .bordercolor {
            height: 360px;
            left: 9px;
        }
    }
    .v-data-table > .v-data-table__wrapper tbody tr.v-data-table__expanded__content {
        box-shadow: none!important;
        background: #f7f7f7;
    }
</style>