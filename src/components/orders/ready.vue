<template>
    <v-container style="max-width:100vw;">
        <!-- Filtros -->
        <v-navigation-drawer style="top: 0px; max-height:100vh!important;" right v-model="filters" :clipped="$vuetify.breakpoint.lgAndUp" app>
            <filterSales @filtersSale="filtersSale"/>
        </v-navigation-drawer>
        <!--header-->
        <v-toolbar flat class="px-4 pt-3">
            <v-toolbar-title>
                Pedidos Surtidos
                <br/>
                <span style="font-size:12px; color:grey; position: absolute;" v-if="filterStorage()">Mes Actual</span>
            </v-toolbar-title>
            <v-spacer></v-spacer>
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
        </v-toolbar>
        <!-- Tabla -->
        <v-data-table 
            height="600"
            fixed-header
            :footer-props="{'items-per-page-options':[15, 30, 50, 100]}"
            v-if="showTable"
            :headers="headers" 
            :items="sales"
            class="elevation-0 px-6 py-4"
            :options.sync="options"
            :server-items-length="totalSales"
            :loading="loading"
            show-expand>
            <!-- Tabla sin información -->
            <template v-slot:no-data>
                No existen registros de pedidos surtidos aún
            </template>
            <!-- Empresa -->
            <template v-slot:[`item.company_id`]="{ item }">
                <v-list-item class="px-0" style="min-height:0px!important; font-size:14px;" :to="{ path: '/clients/client/'+ item.companyID}">{{item.company_id}}</v-list-item>
            </template>
            <!-- Detalle PC -->
            <template v-slot:expanded-item="{ headers, item }">
                <td :colspan="headers.length" class="pb-4">
                    <v-row class="pa-6 pb-0">
                        <v-col cols="12" sm="6" md="6">
                            <v-data-table hide-default-footer :items-per-page="item.items.length" :headers="headers2" :items="item.items" v-if="item.items!=undefined" class="elevation-0" style="background: #f7f7f7;!important" dense>
                                <template v-slot:footer>
                                    <v-container style="max-width: 100%!important;">
                                        <a style="text-decoration:none" :href="'https://www.google.com.mx/maps/place/' + item.delivery_address + '/@'" target="_blank" class="mx-3">
                                            <v-icon class="mr-4">mdi-map-marker-outline</v-icon>
                                            <span>{{item.delivery_address}}</span>
                                        </a>
                                    </v-container>
                                </template> 
                                <template v-slot:[`item.item`]="{ item }">
                                    {{ item.item.name }}
                                </template>
                                <template v-slot:[`item.macro`]="{ item }">
                                    {{ item.item.macro }}
                                </template>
                                <template v-slot:[`item.price`]="{ item }">
                                    {{ (item.price*1).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',}) }} 
                                </template>
                                <template v-slot:[`item.total`]="{ item }">
                                    {{ (item.price*item.quantity).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',}) }}
                                </template>
                                <template v-slot:[`item.totalWeight`]="{ item }">
                                    {{ item.item.weight*item.quantity }} kg
                                </template>
                            </v-data-table>
                        </v-col>
                        <v-col cols="12" sm="6" md="3" class="px-6">
                            <div class="px-4 py-3" style="background-color:#ffedb3; border-radius: 0px 10px 10px 10px; min-height:120px;" >
                                <strong>Notas:</strong><br>
                                <span>{{item.note}}</span>
                            </div>
                        </v-col>
                        <v-col cols="12" sm="6" md="1">
                            <v-btn v-if="item.pdf!=undefined" v-bind:href="liga + 'files/' + item.pdf" target="_blank" text style="margin:auto; display:block;">
                                PDF:
                                <br>
                                <v-icon >mdi-file-pdf-outline</v-icon>
                            </v-btn>
                        </v-col>
                        <v-col cols="12" sm="6" md="2">
                            <v-btn outlined rounded color="red" class="mt-4" @click="rejection(item.id)" style="font-size:12px; height:30px!important; margin-left: auto; margin-right: auto; display: block;">Cancelar</v-btn>
                        </v-col>
                    </v-row>
                </td>
            </template>
            <!-- Acciones por fila -->
            <template v-slot:[`item.actions`]="{ item }">
                <v-menu bottom left>
                    <template v-slot:activator="{ on, attrs }">
                    <v-btn icon v-bind="attrs" v-on="on">
                        <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                    </template>
                    <v-list style="font-size:13px;">
                        <v-list-item @click="printTicket(item)" v-show="permissions('printTicket')==true">
                            <v-icon small class="mr-2">
                                mdi-printer
                            </v-icon>
                            Imprimir ticket
                        </v-list-item>
                        <v-list-item @click="addInvoice(item.id)">
                            <v-icon small class="mr-2">
                                mdi-file-document-outline
                            </v-icon>
                            Facturar
                        </v-list-item>
                    </v-list>
                </v-menu>
            </template>
        </v-data-table>

        <!-- Facturar -->
        <div class="text-center">
            <v-bottom-sheet  v-model="sheetInvoice" inset>
                <v-sheet class="text-center" height="150px">
                    <v-row class="pt-6 px-12 mx-12">
                        <v-col class="pt-0" cols="12" sm="6" md="6">
                            <v-text-field clearable v-model="add_invoice.invoice" label="Factura"></v-text-field>
                        </v-col>
                        <v-col class="pt-0" cols="12" sm="6" md="6">
                            <v-menu v-model="datePicker" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px" >
                                <template v-slot:activator="{ on }">
                                    <v-text-field clearable v-model="add_invoice.invoice_date" label="Fecha Factura" prepend-icon="mdi-calendar" readonly v-on="on"></v-text-field>
                                </template>
                                <v-date-picker color="primary" v-model="add_invoice.invoice_date" @input="datePicker = false"></v-date-picker>
                            </v-menu>
                        </v-col>
                    </v-row>
                    <v-btn :disabled="add_invoice.invoice==''" text color="primary" @click="saveInvoice()">
                    Guardar
                    </v-btn>
                    <v-btn text color="red" @click="sheetInvoice=false,add_invoice.invoice=''">
                    Cancelar
                    </v-btn>
                </v-sheet>
            </v-bottom-sheet>
        </div>
    </v-container>
</template>

<script>
import axios from "axios";
import Filter from "../orders/filter"
export default {
    components: {
        'filterSales':Filter,
    }, 
    data: () => ({
        datePicker: false,
        sheetInvoice:false,
        showTable:true,
        totalSales: 0,
        sales: [],
        loading: true,
        options: {},
        sale:'',
        filters: false,
        filterStorageLength:0,
        headers2:[
            { text: 'Codigo SAE', value: 'macro',},
            { text: 'Producto | Servicio', value: 'item',},
            { text: 'Cantidad', value: 'totalWeight',},
            { text: 'Precio', value: 'price',},
            { text: 'Total', value: 'total',},
            
        ],
        add_invoice:{
            id:'',
            invoice_date:'',
            invoice:''
        }
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
        currentUser:{
            get(){
                return this.$store.state.currentUser.user;
            }
        },
        headers(){ 
            return [
            { text: '', value: 'data-table-expand' },
            { text: 'Folio', value: 'id' },
            { text: 'Fecha Programada', value: 'date' },
            { text: 'Empresa', value: 'company_id',},
            { text: 'Vendedor', value: 'user_id' },
            { text: 'Subtotal', value: 'subtotal' },
            { text: 'IVA', value: 'iva' },
            { text: 'Total', value: 'total' },
            { text: 'Peso', value: 'sale_total_weight' },
            { text: 'Creación', value: 'created_at' },
            { text: 'Usuario Creador', value: 'created_by_user_id' },
            { text: 'Edición', value: 'updated_at' },
            { text: 'Usuario Editor', value: 'last_updated_by_user_id' },
            { value: 'actions', sortable: false, align: 'end', },
        ]},
    },
    methods: {
        addInvoice(id){
            this.add_invoice.id = id
            this.add_invoice.invoice_date = new Date().toLocaleString("sv-SE", {timeZone: "America/Monterrey"}).toString().slice(0, 10)
            this.sheetInvoice = true
        },
        saveInvoice(){
            axios.patch(process.env.VUE_APP_BACKEND_ROUTE + 'api/v2/orders/dispatched_orders/'+this.add_invoice.id, this.add_invoice).then(response=>{
                if (this.options.sortBy.length === 1 && this.options.sortDesc.length === 1) {
                    if(this.options.sortDesc){
                        var sort = '-' + this.options.sortBy[0]
                        this.$store.dispatch('quotation/getOrders', {'pageNumber':this.options.page, 'sort':sort})
                    }else{
                        var sort = this.options.sortBy[0]
                        this.$store.dispatch('quotation/getOrders', {'pageNumber':this.options.page, 'sort':sort})
                    }
                    
                }else{
                    this.$store.dispatch('quotation/getOrders', {'pageNumber':this.options.page, 'sort':'id'})
                }
            })
        },
        printTicket(item){
            axios.put(process.env.VUE_APP_BACKEND_ROUTE + "api/v1/quotation/print-sale",Object.assign(item)).then(response=>{
                localStorage.setItem('printTicket', item.id);
                window.open("/");
                this.$nextTick(() => {
                    if (this.options.sortBy.length === 1 && this.options.sortDesc.length === 1) {
                        if(this.options.sortDesc){
                            var sort = '-' + this.options.sortBy[0]
                            this.$store.dispatch('quotation/getOrders', {'pageNumber':this.options.page, 'sort':sort})
                        }else{
                            var sort = this.options.sortBy[0]
                            this.$store.dispatch('quotation/getOrders', {'pageNumber':this.options.page, 'sort':sort})
                        }
                        
                    }else{
                        this.$store.dispatch('quotation/getOrders', {'pageNumber':this.options.page, 'sort':'id'})
                    }
                })
            })
        },
        getDataFromApi () {
            this.loading = true
            this.apiCall().then(data => {
                this.sales = data.items
                this.totalSales = data.total
                this.loading = false
            })
        },
        filterStorage(){
            if(localStorage.getItem('filtersOrders')!=null){
                false
            }else{
                return true
            }
        },
        apiCall () {
            return new Promise((resolve, reject) => {
                this.filterStorageLength = localStorage.getItem('filtersOrdersLength')
                const { sortBy, sortDesc, page, itemsPerPage } = this.options
                var items = []
                var total = 0
                if(localStorage.getItem('filtersOrders')!=null){
                    var link = JSON.parse(localStorage.getItem('filtersOrders'))+'&'
                }else{
                    var startDate = []
                    var date = new Date()
                    startDate[0] = new Date(date.getFullYear(), date.getMonth(), 1).toLocaleString("sv-SE", {timeZone: "America/Monterrey"}).toString().slice(0, 10)
                    startDate[1] = new Date(date.getFullYear(), date.getMonth() + 1, 0).toLocaleString("sv-SE", {timeZone: "America/Monterrey"}).toString().slice(0, 10)
                    var link = 'filter[date_between]='+startDate+'&'
                }
                axios.get(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/orders/dispatched_orders?" + link + "page=" + page + "&itemsPerPage=" + itemsPerPage).then(response => {
                    items = this.mapSales(response.data.data)
                    total = response.data.meta.total
                    if (sortBy.length === 1 && sortDesc.length === 1) {
                        if(sortDesc[0]){
                            axios
                            .get(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/orders/dispatched_orders?" + link + "page=" + page + "&sort=-" + sortBy[0] + "&itemsPerPage=" + itemsPerPage)
                            .then(response=>{
                                items = this.mapSales(response.data.data)
                                total = response.data.meta.total
                                resolve({
                                    items,
                                    total,
                                })
                            })
                        }else{
                            axios
                            .get(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/orders/dispatched_orders?" + link + "page=" + page + "&sort=" + sortBy[0] + "&itemsPerPage=" + itemsPerPage)
                            .then(response=>{
                                items = this.mapSales(response.data.data)
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
        salesman(user){
            if(user!=undefined){
                if(user.last!=null){
                    return user.name + ' ' + user.last
                }else{
                    return user.name
                }
            }
        },
        macro(macro){
            if(macro!=null){
                return macro + ' | '
            }else{
                return ''
            }
        },
        mapSales(sales){  
            sales = sales.map(id=>{
                return{
                    datePicker: false,
                    id:id.id,
                    company_id: this.macro(id.company.attributes.macro) + this.nombre(id.company.attributes),
                    companyID: id.company.id,
                    delivery_address:id.company.attributes.delivery_address,
                    macro:id.company.attributes.macro,
                    user_id:this.salesman(id.company.attributes.user),
                    created_by_user_id:this.salesman(id.created_by_user_id),
                    last_updated_by_user_id:this.salesman(id.last_updated_by_user_id),
                    total:(id.total*1).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',}),
                    pdf:id.pdf,
                    note:id.note,
                    date:id.date,
                    items:id.items,
                    //created_at:id.created_at.slice(0, 18),
                    //updated_at:id.updated_at.slice(0, 18),
                    subtotal:(id.subtotal*1).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',}),
                    iva:(id.iva*1).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',}),                 
                    printed:id.printed,
                    sale_total_weight: id.sale_total_weight + 'kg',
                }
            });
            return sales
        },
        nombre(empresa){
            if(empresa!=undefined){
                if(empresa.name == undefined || empresa.name == '' || empresa.name == null){
                    return empresa.razon_social
                }else{
                    return empresa.name
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
        filtersSale: function(params) {
            this.$store.dispatch('quotation/getOrders', {'pageNumber':1, 'sort':'id'})
            this.showTable = false
            this.$nextTick(() => {
                this.showTable = true
            })
        }
    },
    mounted(){
        Echo.channel('order_dispatched').listen('OrderDispatched', (e) => {
            var updatedSale = this.sales.filter(sale=>sale.id == e[0])[0]
            if(updatedSale!=undefined){
                this.sales.filter(sale=>sale.id == e)[0].is_in_production = true
            }
        })
    },
}
</script>
<style>
    .v-data-table > .v-data-table__wrapper tbody tr.v-data-table__expanded__content {
        box-shadow: none!important;
        background: #f7f7f7;
    }
    .v-text-field.v-text-field--solo:not(.v-text-field--solo-flat) > .v-input__control > .v-input__slot {
        box-shadow: 0px 3px 1px -2px rgb(0 0 0 / 0%), 0px 2px 2px 0px rgb(0 0 0 / 0%), 0px 1px 5px 0px rgb(0 0 0 / 0%)!important;
    }
</style>