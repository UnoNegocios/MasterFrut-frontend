<template>
    <v-container style="max-width:100vw;">
        <!-- Filtros -->
        <v-navigation-drawer style="top: 0px; max-height:100vh!important;" right v-model="filters" :clipped="$vuetify.breakpoint.lgAndUp" app>
            <filterCollections v-bind:company="company" @filtersCollection="filtersCollection"/>
        </v-navigation-drawer>
        <!-- Header -->
        <v-toolbar flat class="px-4 pt-2">
            <v-toolbar-title>Modificar Cobranza
                <br/>    
                <span style="font-size:12px; color:grey; position: absolute;" v-if="filterStorage()">Mes Actual</span>
            </v-toolbar-title>
            <v-btn icon class="ml-6 pt-2" v-if="filterStorageLength== undefined">
                <v-icon @click="openFilter()">mdi-filter</v-icon>
            </v-btn>
             <v-btn icon class="ml-6" v-else>
                <v-badge overlap color="primary">
                    <template v-slot:badge>
                        {{filterStorageLength}}
                    </template>
                    <v-icon @click="openFilter()">mdi-filter</v-icon>
                </v-badge>
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn color="primary" class="elevation-0" rounded @click="sheet=true">GUARDAR</v-btn>
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
        class="elevation-0 pt-6 px-6 pb-4">   
            <!-- Macro -->
            <template v-slot:[`item.macro`]="{ item }">
                <v-icon @click="macroCapture(item.id,0)" v-if="item.macro==true">mdi-check</v-icon>
                <v-icon @click="macroCapture(item.id,1)" v-else>mdi-close</v-icon>
            </template>
            <!-- Metodos de Pago -->
            <template v-slot:[`item.methods`]="{ item }">
                <div v-for="(method, index) in item.methods" v-bind:key="index" class="pt-6"> 
                    <v-autocomplete clearable v-model="method.method.id" :items="paymentMethodLists" label="Metodo de Pago" item-text="method" item-value="id">
                        <template slot="no-data"><div class="px-4 py-1">No existen metodos relacionadas.</div></template>                      
                    </v-autocomplete>
                    <v-text-field v-model="method.amount" label="Monto"></v-text-field>
                </div>
            </template>
            <!-- checkbox -->
            <template v-slot:[`item.checkbox`]="{ item }">
                <v-checkbox v-model="item.checkbox"></v-checkbox>
            </template>
            <!-- Monto -->
            <template v-slot:[`item.amount`]="{ item }">
                <v-text-field v-model="item.amount" label="Total"></v-text-field>
            </template>
            <!-- Fecha -->
            <template v-slot:[`item.date`]="{ item }">
                <v-text-field v-model="item.date" label="Factura"></v-text-field>
            </template>
            <!-- Factura -->
            <template v-slot:[`item.invoice`]="{ item }">
                <v-text-field v-model="item.invoice" label="Factura"></v-text-field>
            </template>
            <!-- Remison -->
            <template v-slot:[`item.remission`]="{ item }">
                <v-text-field v-model="item.remission" label="Remisión"></v-text-field>
            </template>
            <!-- Tabla sin información -->
            <template v-slot:no-data>
                No existen registros de cobranza aún
            </template>
        </v-data-table>
        <!-- Dialogo confirmación de eliminación -->
        <div class="text-center" >
            <v-bottom-sheet  v-model="sheet" inset>
                <v-sheet class="text-center" height="150px">
                    <div class="pt-6">
                    ¿Segura que deseas modificar estas cobranzas?
                    </div>
                    <v-btn class="mt-4" text color="error" @click="save()" :disabled="gris">
                    Si
                    </v-btn>
                    <v-btn class="mt-4" text color="grey" @click="cancel()">
                    No
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
import Filter from "../components/collections/filter2"
export default {
    props:{
        company:String
    },
    components: {
        'filterCollections':Filter,
    }, 
    data: () => ({
        gris:false,
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
        paymentMethodLists(){
            return this.$store.state.payment_method.payment_methods;
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
            { text: 'Modificar?', value: 'checkbox' },
            { text: 'Id', value: 'id'},
            { text: 'Fecha', value: 'date'},
            { text: 'SAE', value: 'macro'},
            { text: 'Factura', value: 'invoice'},
            { text: 'Remisión', value: 'remission'},
            { text: 'Metodo de Pago', value: 'methods'},
            { text: 'Monto', value: 'amount'},
            { text: 'Responsable', value: 'user_id'},
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
                if(localStorage.getItem('filtersCollections')!=null){
                    var link = JSON.parse(localStorage.getItem('filtersCollections'))+'&'
                }else{
                    var startDate = []
                    var date = new Date()
                    startDate[0] = new Date(date.getFullYear(), date.getMonth(), 1).toLocaleString("sv-SE", {timeZone: "America/Monterrey"}).toString().slice(0, 10)
                    startDate[1] = new Date(date.getFullYear(), date.getMonth() + 1, 0).toLocaleString("sv-SE", {timeZone: "America/Monterrey"}).toString().slice(0, 10)
                    var link = 'filter[date_between]='+startDate+'&'
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
            if(this.company!='' && this.company!=undefined && this.company!=null){
                collections = collections.filter(sale=>sale.company_id == this.company)
            }
            collections = collections.map(id=>{
                return{
                    checkbox:id.checkbox,
                    id:id.id,
                    macro:id.macro,
                    date:id.date,
                    invoice:id.invoice,
                    remission:id.remission,
                    methods:id.payments,
                    amount:id.amount*1,
                    user_id:id.user.name + ' ' + id.user.last
                }
            });
            return collections
        },
        filterStorage(){
            if(localStorage.getItem('filtersCollections')!=null){
                false
            }else{
                return true
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
        save(){
            this.gris = true
            var records = this.collections.filter(collection=>collection.checkbox).map(id=>{
                return{
                    id:id.id,
                    new_invoice: id.invoice,
                    new_amount: id.amount,
                    new_methods: id.methods.map(item=>{
                        return{
                            amount:item.amount,
                            method:item.method.id
                        }
                    }),
                    new_remission: id.remission,
                    new_last_updated_by_user_id: this.currentUser.id
                }
            })
            axios.post(process.env.VUE_APP_BACKEND_ROUTE + 'api/v1/andrea', records).then(resp=>{
                this.sheet = false
                this.snackbar = {
                    message: 'Cambio realizado con exito!',
                    color: 'successful',
                    show: true
                }
                this.gris = false
                this.getDataFromApi()
            }).catch(error => {
                this.sheet = false
                this.snackbar = {
                    message: error.response.data.message,
                    color: 'error',
                    show: true
                }
                this.gris = false
            })
            
        },
        cancel(){
            this.sheet = false
            this.getDataFromApi()
        }
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
