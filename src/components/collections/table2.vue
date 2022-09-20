<template>
    <v-container style="max-width:100vw;">
        <!-- Filtros -->
        <v-navigation-drawer style="top: 0px; max-height:100vh!important;" right v-model="filters" :clipped="$vuetify.breakpoint.lgAndUp" app>
            <filterCollections v-bind:company="company" @filtersCollection="filtersCollection"/>
        </v-navigation-drawer>
        <!-- Totalizadores -->
        <totals v-if="company==undefined"/>

        <!-- Header -->
        <v-toolbar flat >
            <v-toolbar-title>Cobranza
                <br/>    
                <span style="font-size:12px; color:grey; position: absolute;" v-if="filterStorage()">Mes Actual</span>
            </v-toolbar-title>
            <v-btn icon @click="openFilter()" class="ml-6 pt-2" v-if="filterStorageLength== undefined">
                <v-icon>mdi-filter</v-icon>
            </v-btn>
             <v-btn icon class="ml-6" v-else @click="openFilter()">
                <v-badge overlap color="primary">
                    <template v-slot:badge>
                        {{filterStorageLength}}
                    </template>
                    <v-icon>mdi-filter</v-icon>
                </v-badge>
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn icon @click="exportExcel">
                <v-icon>mdi-download</v-icon>
            </v-btn>
        </v-toolbar>
        <!-- Tabla -->
        <v-data-table  
        height="600"
        fixed-header
        :footer-props="{'items-per-page-options':[15, 30, 50, 100]}"
        v-if="showTable && tableGraph"
        :options.sync="options"
        :server-items-length="totalCollections"
        :loading="loading"
        :item-class="itemRowBackground" 
        :headers="headers" 
        :items="collections" 
        class="elevation-0 px-6 py-4"
        show-expand
        >
        <!-- Detalle PC -->
            <template v-slot:expanded-item="{ headers, item }">
                <td :colspan="headers.length" class="pa-4">
                    <v-data-table :headers="headers2" :items="item.details" v-if="item.details!=undefined" class="elevation-0" style="background: #f7f7f7;!important" dense>
                        <template v-slot:[`item.sale.invoice`]="{ item }">
                            <span v-if="item.sale.type=='Serie A'">F-{{item.sale.invoice}}</span>
                            <span v-else-if="item.sale.type=='Serie B'">R-{{item.sale.invoice}}</span>
                        </template>
                        <template v-slot:[`item.id`]="{ item }">
                            {{ (item.sale.id) }}
                        </template>
                        <template v-slot:[`item.due`]="{ item }">
                            {{ (item.due*1).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',}) }}
                        </template>
                        <template v-slot:[`item.amount`]="{ item }">
                            {{ (item.amount*1).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',}) }}
                        </template>
                        <template v-slot:[`item.new_due`]="{ item }">
                            {{ ((item.due*1)-(item.amount*1)*1).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',}) }}
                        </template>
                    </v-data-table>
                </td>
            </template>
            
            <!-- Acciones por fila -->
            <template v-slot:[`item.actions`]="{ item }">
                <v-menu bottom left v-if="permissions('editCollections')==true || permissions('deleteCollections')==true">
                    <template v-slot:activator="{ on, attrs }">
                    <v-btn icon v-bind="attrs" v-on="on">
                        <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                    </template>
                    <v-list style="font-size:13px;">
                        <v-list-item @click="editItem(item.editedItem)"  v-show="permissions('editCollections')">
                            <v-icon small class="mr-2">
                                mdi-pencil
                            </v-icon>
                            Editar
                        </v-list-item>
                        <v-list-item @click="deleteItem(item)"  v-show="permissions('deleteCollections')">
                            <v-icon small class="mr-2">
                                mdi-delete
                            </v-icon>
                            Eliminar
                        </v-list-item>
                    </v-list>
                </v-menu>
            </template>
            <!-- Macro -->
            <template v-slot:[`item.macro`]="{ item }">

                <v-icon @click="macroCapture(item.id,0)" v-if="item.macro==true">mdi-check</v-icon>
                <v-icon @click="macroCapture(item.id,1)" v-else>mdi-close</v-icon>
                
            </template>
            <!-- Metodos de Pago-->
            <template v-slot:[`item.methods`]="{ item }">
                <div v-for="(method, index) in item.methods" v-bind:key="index"> 
                    <span>{{method.method.name}} {{(method.amount*1).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}</span><br/> - 
                </div>
            </template>
            <!-- PDF -->
            <template v-slot:[`item.pdf`]="{ item }">
                <v-btn v-if="item.pdf!=undefined" v-bind:href="liga + 'files/' + item.pdf" target="_blank" icon style="margin:auto; display:block;">
                    <v-icon >mdi-download-circle</v-icon>
                </v-btn>
            </template>
            <!-- Tabla sin información -->
            <template v-slot:no-data>
                No existen registros de cobranza aún
            </template>
            <!-- Empresa -->
            <template v-slot:[`item.company`]="{ item }">
                <v-list-item class="px-0" style="min-height:0px!important; font-size:14px;" :to="{ path: '/clients/client/'+ item.companyID}">{{item.company}}</v-list-item>
            </template>
        </v-data-table>
        <!-- Crear actividad -->
        <v-dialog v-model="createDialog" max-width="900px" persistent>
          <template v-slot:activator="{ on, attrs }">
            <v-btn bottom color="#e25200" dark fab fixed right v-bind="attrs" v-on="on">
                <v-icon color="white">  mdi-plus </v-icon>
            </v-btn> 
          </template>
          <create v-bind:company="company" @closeCreateDialogCollection="closeCreateDialogCollection"/>
        </v-dialog>
        <!-- Editar actividad -->
        <v-dialog v-model="editDialog" max-width="900px" persistent>
          <edit v-bind:collection="collection" @closeEditDialogCollection="closeEditDialogCollection"/>
        </v-dialog>
        <!-- Dialogo confirmación de eliminación -->
        <div class="text-center" >
            <v-bottom-sheet  v-model="sheet" inset>
                <v-sheet class="text-center" height="150px">
                    <div class="pt-6">
                    ¿Seguro que deseas borrar esta cobranza?
                    </div>
                    <v-btn class="mt-4" text color="error" @click="deleteCollection()">
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
import Totals from "../collections/totals"
import Filter from "../collections/filter2"
import Create from "../collections/create"
import Edit from "../collections/edit"
export default {
    props:{
        company:String
    },
    components: {
        'filterCollections':Filter,
        'create':Create,
        'edit':Edit,
        'totals':Totals
    }, 
    data: () => ({
        filterStorageLength:0,
        showTable:true,
        tableGraph:true,
        totalCollections: 0,
        options: {},
        loading: true,

        snackbar: {
            show: false,
            message: null,
            color: null
        },
        methodId:'',
        collection:'',
        sheet2: false,
        sheet: false,
        filters: false,
        editDialog: false,
        createDialog: false,
        deleteId:'',
        collections: [],
        headers2:[
            { text: 'Id', value: 'id' },
            { text: 'Factura/Remissión', value: 'sale.invoice' },
            { text: 'Deuda', value: 'due' },
            { text: 'Pago', value: 'amount' },
            { text: 'Nueva Deuda', value: 'new_due' },
            { text: 'Serie', value: 'sale.type' },
        ],
    }),
    watch: {
        options: {
            handler () {
                this.getDataFromApi()
            },
            deep: true,
        },
    },
    computed: {
        liga(){
            return process.env.VUE_APP_BACKEND_ROUTE
        },
        showCompany(){
            if(this.company == null){
                return { text: 'Empresa', value: 'company',}
            }else{
                return false
            }
        },
        currentUser:{
            get(){
                return this.$store.state.currentUser.user;
            }
        },
        headers(){ 
            return [
            { text: '', value: 'data-table-expand' },
            { text: 'Id', value: 'id'},
            { text: 'Venta', value: 'quotation_id'},
            this.showCompany,
            { text: 'SAE', value: 'macro'},
            { text: 'Fecha', value: 'date'},
            { text: 'Metodo de Pago', value: 'methods'},
            { text: 'Monto', value: 'amount'},
            { text: 'Factura', value: 'invoice'},
            { text: 'Remisión', value: 'remission'},
            { text: 'Referencia', value: 'note'},
            { text: 'PDF', value: 'pdf'},
            { text: 'Responsable', value: 'user_id'},
            { text: 'Creación', value: 'created_at' },
            { text: 'Creador', value: 'created_by_user_id'},
            { text: 'Edición', value: 'updated_at' },
            { text: 'Editor', value: 'last_updated_by_user_id'},
            { value: 'actions', sortable: false, align: 'end', },
        ]},
       
    },
    methods: {
        getDataFromApi () {
            this.loading = true
            this.apiCall().then(data => {
                this.collections = data.items
                this.totalCollections = data.total
                this.loading = false
            })
        },
        apiCall () {
            return new Promise((resolve, reject) => {
                this.filterStorageLength = localStorage.getItem('filtersCollectionsLength')
                const { sortBy, sortDesc, page, itemsPerPage } = this.options
                var items = []
                var total = 0
                var link = ''
                if(this.company!=undefined){
                    link = link + 'filter[company_id]='+this.company+'&'
                }
                if(localStorage.getItem('filtersCollections')!=null){
                    link = link + JSON.parse(localStorage.getItem('filtersCollections'))+'&'
                }else{
                    var currentWeek = [];
                    var date = new Date; // get current date
                    var startDate = date.getDate() - date.getDay() + 1; // First day is the day of the month - the day of the week
                    var endDate = startDate + 7; // last day is the first day + 6

                    currentWeek[0] = new Date(date.setDate(startDate)).toLocaleString("sv-SE", {timeZone: "America/Monterrey"}).toString().slice(0, 10);
                    currentWeek[1] = new Date(date.setDate(endDate)).toLocaleString("sv-SE", {timeZone: "America/Monterrey"}).toString().slice(0, 10);


                    //var startDate = []
                    //var date = new Date()
                    //startDate[0] = new Date(date.getFullYear(), date.getMonth(), 1).toLocaleString("sv-SE", {timeZone: "America/Monterrey"}).toString().slice(0, 10)
                    //startDate[1] = new Date(date.getFullYear(), date.getMonth() + 1, 0).toLocaleString("sv-SE", {timeZone: "America/Monterrey"}).toString().slice(0, 10)
                    link = link + 'filter[date_between]='+currentWeek+'&'
                }
                axios.get(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/collections?" + link + "page=" + page + "&itemsPerPage=" + itemsPerPage).then(response => {
                    
                    items = this.mapCollections(response.data.data)
                    total = response.data.meta.total
                    if (sortBy.length === 1 && sortDesc.length === 1) {
                        if(sortDesc[0]){
                            axios
                            .get(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/collections?" + link + "page=" + page + "&sort=-" + sortBy[0] + "&itemsPerPage=" + itemsPerPage)
                            .then(response=>{
                                
                                items = this.mapCollections(response.data.data)
                                total = response.data.meta.total
                                resolve({
                                    items,
                                    total,
                                })
                            })
                        }else{
                            axios
                            .get(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/collections?" + link + "page=" + page + "&sort=" + sortBy[0] + "&itemsPerPage=" + itemsPerPage)
                            .then(response=>{
                                
                                items = this.mapCollections(response.data.data)
                                total = response.data.meta.total
                                resolve({
                                    items,
                                    total,
                                })
                            })
                        }
                    }else{
                        resolve({
                            items,
                            total,
                        })
                    }
                })
            })
        },
        mapCollections(collections){    
            collections = collections.map(id=>{
                return{
                    id:id.id,
                    company:this.idMacro(id.company),
                    companyID:this.extiste(id.company),
                    quotation_id:this.saleName(id.details, id.remission, id.invoice),
                    macro:id.macro,
                    date:id.date,
                    methods:id.payments,
                    amount:(id.amount*1).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',}),
                    invoice:this.invoice(id.details, id.invoice),
                    remission:this.remission(id.details, id.remission),
                    note:id.note,
                    pdf:id.pdf,
                    created_by_user_id:id.created_by_user_id.name + ' ' + id.created_by_user_id.last,
                    last_updated_by_user_id:id.last_updated_by_user_id.name + ' ' + id.last_updated_by_user_id.last,
                    user_id:id.user.name + ' ' + id.user.last,
                    created_at:id.created_at.slice(0, 18),
                    updated_at:id.updated_at.slice(0, 18),
                    details: id.details,
                    editedItem:id
                }
            });
            return collections
        },
        extiste(item){
            if(item!=undefined){
                return item.id
            }
        },
        saleName(details, remission, invoice){
            if(details.length>0){
                var names = ''
                for(var i=0; i<details.length; i++){
                    if(i>0){
                        names = names + ', '
                    }
                    if(details[0].sale.type == 'Serie A'){
                        names = names + 'F-' + details[0].sale.invoice
                    }else if(details[0].sale.type == 'Serie B'){
                        names = names + 'R-' + details[0].sale.invoice
                    }
                }
                return names
            }else{
                if(invoice!=undefined){
                    return 'F-'+invoice
                }else if(remission!=undefined){
                    return 'R-'+remission
                }
            }
        },
        filterStorage(){
            if(localStorage.getItem('filtersCollections')!=null){
                false
            }else{
                return true
            }
        },
        invoice(details, invoice){
            if(details.length>0){
                var names = ''
                for(var i=0; i<details.length; i++){
                    if(i>0){
                        names = names + ', '
                    }
                    if(details[0].sale.type == 'Serie A'){
                        names = names + details[0].sale.invoice
                    }
                }
                return names
            }else{
                return invoice
            }
        },
        remission(details, remission){
            if(details.length>0){
                var names = ''
                for(var i=0; i<details.length; i++){
                    if(i>0){
                        names = names + ', '
                    }
                    if(details[0].sale.type == 'Serie B'){
                        names = names + details[0].sale.invoice
                    }
                }
                return names
            }else{
                return remission
            }
        },
        idMacro(company){
            if(company!=null){
                var attributes = company.attributes
                if(attributes.macro!=null && attributes.macro!=undefined && attributes.macro!=''){
                    return attributes.macro + ' | ' + attributes.name
                }else{
                    return '' + attributes.name
                }
            }
        },
        itemRowBackground: function (item) {
            if(item.amount < 0){
                return 'style-3'
            }else{
                var cuantos = 0
                if(item.remission!=undefined){
                    cuantos = this.$store.state.collection.collections.filter(collection=>collection.remission == item.remission)
                }else if(item.invoice!=undefined){
                    cuantos = this.$store.state.collection.collections.filter(collection=>collection.invoice == item.invoice)
                }
                if(cuantos!=undefined && cuantos.length>1){
                    return 'style-1'
                }else{
                    return 'style-2'
                }
            }
        },
        macroCapture(id, value){
            var collection = this.$store.state.collection.collections.filter(collection=>collection.id == id)[0]
            collection.macro = value
            this.$nextTick(() => {
                axios.put(process.env.VUE_APP_BACKEND_ROUTE + "api/v1/collection/update",Object.assign(collection)).then(response=>{
                    this.getDataFromApi()
                }).catch(error => {
                    this.snackbar = {
                        message: error.response.data.message,
                        color: 'error',
                        show: true
                    }
                })
            })
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
        filtersCollection: function(params) {
            this.$store.dispatch('collection/getNewCollections', {'pageNumber':1, 'sort':'id'})
            this.showTable = false
            this.$nextTick(() => {
                this.showTable = true
            })
        },
        closeEditDialogCollection: function(params) {
            this.editDialog = false;
            this.getDataFromApi()
        },
        closeCreateDialogCollection: function(params) {
            this.createDialog = false;
            this.getDataFromApi()
        },
        exportExcel: function () {
            let data = XLSX.utils.json_to_sheet(this.collections)
            const workbook = XLSX.utils.book_new()
            const filename = 'Lista de Cobranzas'
            XLSX.utils.book_append_sheet(workbook, data, filename)
            XLSX.writeFile(workbook, `${filename}.xlsx`)
        },
        deleteCollection(){
            axios.delete(process.env.VUE_APP_BACKEND_ROUTE + "api/v1/collection/delete/"+this.deleteId).then(response => {
                this.deleteId = ''
                this.sheet = false
                this.getDataFromApi()
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
        editItem(editedItem){
            this.collection = [editedItem].map(id=>{
                return{
                    id:id.id,
                    company_id:this.extiste(id.company),
                    salesID:id.details,
                    macro:id.macro,
                    date:id.date,
                    invoice:this.invoice(id.details, id.invoice),
                    remission:this.remission(id.details, id.remission),
                    methods:[{
                        method:this.extiste(id.payment_method),
                        amount:id.payments.amount
                    }],
                    amount:id.amount,
                    note:id.note,
                    pdf:id.pdf,
                    user_id:this.extiste(id.user),
                    serie:id.serie,
                    payment_method_id:this.extiste(id.payment_method)
                }
            })[0]
            this.editDialog = true
        },
    }
}
</script>
<style>
    .v-data-table > .v-data-table__wrapper tbody tr.v-data-table__expanded__content {
        box-shadow: none!important;
        background: #f7f7f7;
    }
    .style-1 {
        background-color: #fff5d7
    }
    .style-2 {
        background-color: white
    }
    .style-3 {
        background-color: #ffc4c4
    }
    .v-text-field.v-text-field--solo:not(.v-text-field--solo-flat) > .v-input__control > .v-input__slot {
        box-shadow: 0px 3px 1px -2px rgb(0 0 0 / 0%), 0px 2px 2px 0px rgb(0 0 0 / 0%), 0px 1px 5px 0px rgb(0 0 0 / 0%)!important;
    }
</style>
