<template>
    <v-container style="max-width:100vw;">
        <!-- Filtros -->
        <v-navigation-drawer style="top: 0px; max-height:100vh!important;" right v-model="filters" :clipped="$vuetify.breakpoint.lgAndUp" app>
            <filterProduction @filtersProduction="filtersProduction"/>
        </v-navigation-drawer>
        <!-- Contenedor -->
        <v-data-table show-expand :headers="headers" :items="productions" class="elevation-0 px-6 py-4">
            <!-- Header -->
            <template v-slot:top>
                <v-toolbar flat >
                    <v-toolbar-title>Producción</v-toolbar-title>
                    <v-btn icon>
                        <v-icon @click="openFilter">mdi-filter</v-icon>
                    </v-btn>
                    <v-spacer></v-spacer>
                    <v-btn icon v-show="permissions('download')">
                        <v-icon @click="exportExcel">mdi-download</v-icon>
                    </v-btn>
                </v-toolbar>
            </template>
            <!-- Detalle de compra -->
            <template v-slot:expanded-item="{ headers, item }">
                <td :colspan="headers.length">
                    <detail v-bind:production="item.id" />
                </td>
            </template>
            <!-- Acciones por fila -->
            <template v-slot:[`item.actions`]="{ item }">
                <v-menu bottom left v-if="permissions('editProductions')==true || permissions('deleteProductions')==true">
                    <template v-slot:activator="{ on, attrs }">
                    <v-btn icon v-bind="attrs" v-on="on">
                        <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                    </template>
                    <v-list style="font-size:13px;">
                        <v-list-item @click="editItem(item)" v-show="permissions('editProductions')">
                            <v-icon small class="mr-2">
                                mdi-pencil
                            </v-icon>
                            Editar
                        </v-list-item>
                        <v-list-item @click="deleteItem(item)" v-show="permissions('deleteProductions')">
                            <v-icon small class="mr-2">
                                mdi-delete
                            </v-icon>
                            Eliminar
                        </v-list-item>
                    </v-list>
                </v-menu>
            </template>
            <!-- Status -->
            <template v-slot:[`item.status`]="{ item }">
                <v-chip outlined class="pa-2" v-if="item.status=='Terminada'" small color="green">{{item.status}}</v-chip>
                <!--v-chip outlined class="pa-2" v-else-if="new Date() > new Date(item.date)" small color="red">Vencida</v-chip-->
                <v-chip class="pa-2" v-else small color="primary">{{item.status}}</v-chip>
            </template>
            <!-- Tabla sin información -->
            <template v-slot:no-data>
                No existen registros de producción aún
            </template>
        </v-data-table>
        <!-- Crear gasto -->
        <v-dialog v-model="createDialog" max-width="700px">
          <template v-slot:activator="{ on, attrs }">
            <v-btn bottom color="#e25200" dark fab fixed right v-bind="attrs" v-on="on">
                <v-icon color="white">  mdi-plus </v-icon>
            </v-btn> 
          </template>
          <create @closeDialogCreateProduction="closeDialogCreateProduction"/>
        </v-dialog>
        <!-- Editar gasto -->
        <v-dialog v-model="editDialog" max-width="700px">
          <edit v-bind:editedItem="production" @closeDialogEditProduction="closeDialogEditProduction"/>
        </v-dialog>
        <!-- Dialogo confirmación -->
        <div class="text-center">
            <v-bottom-sheet  v-model="sheet" inset>
                <v-sheet class="text-center" height="150px">
                    <div class="pt-6">
                    ¿Seguro que deseas borrar esta compra?
                    </div>
                    <v-btn class="mt-4" text color="error" @click="deleteProduction()">
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
import FilterProduction from "../productions/filter"
import Create from "../productions/create"
import Edit from "../productions/edit"
import Detail from "../productions/detail/container"
export default {
    components: {
        'detail':Detail,
        'filterProduction':FilterProduction,
        'create':Create,
        'edit':Edit,
    }, 
    data: () => ({
        production:'',
        sheet: false,
        filters: false,
        editDialog: false,
        createDialog: false,
        deleteId:'',
        productions: '',
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
            this.productions = this.productionsLists
            return [
            { text: '', value: 'data-table-expand' },

            { text: 'Id', value: 'id' },

            { text: 'Fecha', value: 'date' },

            { text: 'Estatus', value: 'status' },
            { text: 'Inicio', value: 'start_time' },
            { text: 'Fin', value: 'end_time' },

            { text: 'Usuario Preparador ', value: 'user_id' },
            
            { text: 'Creado', value: 'created_by_user_id' },
            { text: 'Creación', value: 'created_at' },
            { text: 'Editado', value: 'last_updated_by_user_id' },
            { text: 'Edición', value: 'updated_at' },
            { value: 'actions', sortable: false, align: 'end', },
        ]},
        productionsLists(){
            var resp = this.$store.state.production.productions
            if(this.$route.params.id!=undefined){
                resp = resp.filter(production=>production.id == this.$route.params.id)
            }
            return resp.map(id=>{
                return{
                    id:id.id,
                    date:id.date,//.slice(0, 10),
                    status:id.status,
                    start_time:id.start_time,
                    end_time:id.end_time,
                    created_by_user_id: this.userName(id.created_by_user_id),
                    last_updated_by_user_id: this.userName(id.last_updated_by_user_id),
                    created_at: id.created_at.slice(0,19),
                    updated_at: id.updated_at.slice(0,19),
                    user_id: this.userName(id.user_id)
                }
            })
        },
    },
    created () {
        this.productions = this.productionsLists   
    },
    methods: {
        detail(id){
            var sum = 0
            var products = this.$store.state.production_detail.production_details.filter(production=>production.production_id == id)
            for(var i=0; i<products.length; i++){
                sum = sum + (products[i].unit_cost*products[i].quantity)
            }
            return sum
        },
        userName(id){
            return this.$store.state.user.users.filter(user=>user.id == id).map(user=>user.name + ' ' + user.last)
        },
        lowerCase(text){
            if(text!=null&&text!=undefined&&text!=''){
                return text.toLowerCase()
            }else{
                return ' '
            }
        },
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
        filtersProduction: function(params) {
            this.productions = ''
            var filterProduction = this.$store.state.production.productions
    
            this.productions = filterProduction/*.map(id=>{
                return{
                    id:id.id,
                    companyID:id.company_id,
                    company:this.companyName(id.company_id),
                    contact:this.contact(id.contact_id),
                    production:this.production(id.production_id),
                    salesman:this.salesman(id.company_id),
                    date:id.date,
                    description:id.description,
                    completed:id.completed,
                    created_at:id.created_at,
                    updated_at:id.updated_at,
                }
            });*/
        },
        closeDialogEditProduction: function(params) {
            this.editDialog = false;
            this.$store.dispatch('production/getProductions')
        },
        closeDialogCreateProduction: function(params) {
            this.createDialog = false;
            this.$store.dispatch('production/getProductions')
            this.$store.dispatch('production_detail/getProductionDetails')
        },
        exportExcel: function () {
            let data = XLSX.utils.json_to_sheet(this.productions)
            const workbook = XLSX.utils.book_new()
            const filename = 'Lista de Actividades'
            XLSX.utils.book_append_sheet(workbook, data, filename)
            XLSX.writeFile(workbook, `${filename}.xlsx`)
        },
        deleteProduction(){
            axios.delete(process.env.VUE_APP_BACKEND_ROUTE + "api/v1/production/delete/"+this.deleteId).then(response => {
                this.deleteId = ''
                this.sheet = false
                this.$store.dispatch('production/getProductions')
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
        },
        deleteItem (item) {
            this.deleteId = item.id
            this.sheet = true
        },
        editItem(item){
            this.production = this.$store.state.production.productions.filter(production=>production.id == item.id)[0]
            this.editDialog = true
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