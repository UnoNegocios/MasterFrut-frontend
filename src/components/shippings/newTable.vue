<template>
    <v-container style="max-width:100vw;" class="pb-12">
        <!-- Filtros -->
        <v-navigation-drawer style="top: 0px; max-height:100vh!important;" right v-model="filters" :clipped="$vuetify.breakpoint.lgAndUp" app>
            <filterShippings v-bind:company="company" @filtersShipping="filtersShipping"/>
        </v-navigation-drawer>
        <v-row class="ma-0" v-show="showTotals && !calc_loader">
            <v-col md="6" sm="6" class="px-2">
                <v-card class="py-2 px-4 elevation-0">
                    <v-icon x-small color="#47bdc6" class="mr-1">mdi-record</v-icon> 
                    <span style="font-size:12px;"><strong>Peso</strong></span>
                    <br/>{{ total.weight.toFixed(2) }} kgs
                    <br/><span style="font-size:12px; color:grey;">Promedio:<strong>{{ avg.weight.toFixed(2) }} kgs</strong></span>
                </v-card>
            </v-col>
            <v-col md="6" sm="6" class="px-2">
                <v-card class="py-2 px-4 elevation-0">
                    <v-icon x-small color="#47bdc6" class="mr-1">mdi-record</v-icon> 
                    <span style="font-size:12px;"><strong>Recorrido</strong></span>
                    <br/>{{ total.route.toFixed(2) }} kms
                    <br/><span style="font-size:12px; color:grey;">Promedio:<strong>{{avg.route.toFixed(2) }} kms</strong></span>
                </v-card>
            </v-col>

        </v-row>
        <v-progress-linear
            class="my-2"
            v-show="calc_loader"
            color="primary"
            indeterminate
            rounded
            height="6"
            ></v-progress-linear>
        <v-row class="ma-0 mb-2" v-show="!showTotals">
            <v-spacer></v-spacer>
            <v-btn class="botonPerron" @click="calculate(), showTotals=true" icon><v-icon>mdi-chevron-down</v-icon></v-btn>
            <v-spacer></v-spacer>
        </v-row>
        <v-row class="ma-0 mb-2" v-show="showTotals">
            <v-spacer></v-spacer>
            <v-btn class="botonPerron" @click="showTotals=false" icon><v-icon>mdi-chevron-up</v-icon></v-btn>
            <v-spacer></v-spacer>
        </v-row>

        <!-- Contenedor PC -->
        <v-data-table show-expand :headers="headers" :items="shippings" class="elevation-0 px-6 py-4 hidden-sm-and-down"
        :footer-props="{'items-per-page-options':[15, 30, 50, totalShippings]}"
        :options.sync="options"
        :server-items-length="totalShippings"
        :loading="loading">
            <!-- Header -->
            <template v-slot:top>
                <v-toolbar flat class="mb-3">
                    <v-toolbar-title>Envíos</v-toolbar-title>
                    <v-btn icon>
                        <v-icon @click="openFilter()">mdi-filter</v-icon>
                    </v-btn>
                    <v-spacer></v-spacer>
                    <v-btn icon v-show="permissions('download')">
                        <v-icon @click="exportExcel">mdi-download</v-icon>
                    </v-btn>
                </v-toolbar>
            </template>

            <template v-slot:[`item.initial_km`]="{ item }">
                {{item.initial_km}} km
            </template>
            <template v-slot:[`item.final_km`]="{ item }">
                {{item.final_km}} km
            </template>
            <template v-slot:[`item.route`]="{ item }">
                {{item.route}} km
            </template>

            <!-- Acciones por fila -->
            <template v-slot:[`item.actions`]="{ item }">
                <v-menu bottom left v-if="permissions('editShippings')==true || permissions('deleteShippings')==true || permissions('printShippings')">
                    <template v-slot:activator="{ on, attrs }">
                    <v-btn icon v-bind="attrs" v-on="on">
                        <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                    </template>
                    <v-list style="font-size:13px;">
                        <v-list-item @click="editItem(item.editedItem)"  v-show="permissions('editShippings')">
                            <v-icon small class="mr-2">
                                mdi-pencil
                            </v-icon>
                            Editar
                        </v-list-item>
                        <v-list-item @click="deleteItem(item.id)"  v-show="permissions('deleteShippings')">
                            <v-icon small class="mr-2">
                                mdi-delete
                            </v-icon>
                            Eliminar
                        </v-list-item>
                        <v-list-item @click="printItem(item)" v-show="permissions('printShippings')">
                            <v-icon small class="mr-2">
                                mdi-printer
                            </v-icon>
                            Imprimir
                        </v-list-item>
                    </v-list>
                </v-menu>
            </template>
            <!-- Creación -->
            <template v-slot:[`item.created_at`]="{ item }">
                {{item.created_at.slice(0, 10)}}
            </template>
            <!-- Actualización -->
            <template v-slot:[`item.updated_at`]="{ item }">
                {{item.updated_at}}
            </template>
            <!-- Actualización -->
            <template v-slot:[`item.date`]="{ item }">
                {{item.date.slice(0, 10)}}
            </template>
            <!-- Tabla sin información -->
            <template v-slot:no-data>
                No existen registros de envíos aún
            </template>
            <!-- Detalle PC -->
            <template v-slot:expanded-item="{ headers, item }" v-show="permissions('shipping_details')">
                <td :colspan="headers.length">
                    <detail v-bind:shipping="item" />
                </td>
            </template>
        </v-data-table>

        <!-- PWA -->
        <div class="hidden-md-and-up">
            <v-toolbar flat class="mb-3" style="background:transparent;">
                <v-toolbar-title>Envíos</v-toolbar-title>
                <v-btn icon>
                    <v-icon @click="openFilter()">mdi-filter</v-icon>
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn icon v-show="permissions('download')">
                    <v-icon @click="exportExcel">mdi-download</v-icon>
                </v-btn>
            </v-toolbar>
            <div v-for="(shipping, index) in shippings" v-bind:key="index" style="overflow: hidden;">
                <v-row style="position: absolute; width: calc(100vw - 24px); height: 135px; background:linear-gradient(90deg, rgba(31,136,254,1) 50%, rgba(28,37,106,1) 50%); border-radius: 10px;" class="ma-0">
                    <v-icon v-show="permissions('printShippings')" dark class="px-5" style="background:#1f88fe; border-radius: 10px 0px 0px 10px;" @click="printItem(shipping)">
                        mdi-printer
                    </v-icon>
                    <v-spacer></v-spacer>
                    <v-icon v-show="permissions('editShippings')" dark class="px-5" style="background:#1c256a; border-radius: 0px 10px 10px 0px;" @click="editItem(shipping.editedItem)">
                        mdi-pencil
                    </v-icon>
                    <v-icon v-show="permissions('deleteShippings')" dark class="px-5" style="background:#e25200; border-radius: 0px 10px 10px 0px;" @click="deleteItem(shipping.id)">
                        mdi-delete
                    </v-icon>
                </v-row>
                <v-card :style="swipePrint(shipping.id)" @click="viewDetail(shipping)" class="mb-3 elevation-0 py-3 px-4" v-touch="{ left: () => swipe('Left', shipping.id), right: () => swipe('Right', shipping.id)}">
                    <v-row class="mx-0 mt-0">
                        <v-col cols="6">
                            <v-card-subtitle class="pt-2 pl-0" style="font-size:14px; font-weight:700; color: rgba(0, 0, 0, 0.4);"> Folio: {{shipping.id}}</v-card-subtitle>
                        </v-col>
                        <v-col cols="6" style="text-align:right;">
                            <v-chip style="border-radius:5px!important; font-size:12px;" color="#e7e8e9">{{shipping.vehicle}}</v-chip>
                        </v-col>
                    </v-row>

                    <v-card-title style="font-size:16px;" class="pt-0 pb-0 px-2">{{shipping.driver}}</v-card-title>
                    <v-card-text class="px-2" style="font-size:14px;"><v-icon small class="mr-2">mdi-calendar</v-icon>{{shipping.date}}</v-card-text>

                    <v-row class="mx-0 mb-0">
                        <v-col cols="4" style="font-size:13px;">
                            KM: {{shipping.initial_km*1}}
                        </v-col>
                        <v-col cols="4" style="font-size:13px;">
                            KM: {{shipping.final_km*1}}
                        </v-col>
                        <v-col cols="4" style="font-size:13px; text-align:right;">
                            <strong>{{shipping.weight}}kg</strong>
                        </v-col>
                    </v-row>
                </v-card>

            </div>
            



            <v-dialog v-model="dialog" fullscreen hide-overlay transition="dialog-bottom-transition">
                <v-card style="background:#f4f5fa;">
                    <v-toolbar dark color="primary" class="elevation-0">
                        <v-toolbar-title>Entregas</v-toolbar-title>
                        <v-spacer></v-spacer>
                        <v-btn small @click="printItem(shipping)" v-show="permissions('printShippings')" class="elevation-0" color="#ffffff36">
                            Imprimir
                            <v-icon small class="ml-2">
                                mdi-printer
                            </v-icon>
                        </v-btn>
                        <v-btn icon dark @click="dialog = false">
                            <v-icon>mdi-close</v-icon>
                        </v-btn>
                    </v-toolbar>
                    <detail v-bind:shipping="shippingDetail"/>
                </v-card>
            </v-dialog>
        </div>


        <!-- Crear actividad >
        <v-dialog v-model="createDialog" max-width="700px">
          <template v-slot:activator="{ on, attrs }"-->
            <v-btn bottom color="#e25200" dark fab fixed right to="/solitario" link ><!-- v-bind="attrs" v-on="on" -->
                <v-icon color="white">  mdi-plus </v-icon>
            </v-btn> 
          <!--/template>
          <create v-bind:company="company" @closeCreateDialogShipping="closeCreateDialogShipping"/>
        </v-dialog-->
        <!-- Editar actividad -->
        <v-dialog v-model="editDialog" max-width="700px">
          <edit v-bind:shipping="shipping" @closeDialogEditShipping="closeDialogEditShipping"/>
        </v-dialog>
        <!-- Dialogo confirmación de eliminación -->
        <div class="text-center">
            <v-bottom-sheet  v-model="sheet" inset>
                <v-sheet class="text-center" height="150px">
                    <div class="pt-6">
                    ¿Seguro que deseas borrar este envío?
                    </div>
                    <v-btn class="mt-4" text color="error" @click="deleteShipping()">
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
import Filter from "../shippings/filter"
import Create from "../shippings/create"
import Edit from "../shippings/edit"
import Detail from "../shippings/detail/container"
export default {
    props:{
        company:String
    },
    components: {
        'detail':Detail,
        'filterShippings':Filter,
        'create':Create,
        'edit':Edit,
    }, 
    data: () => ({
        showTotals:false,
        calc_loader:false,
        avg:{weight:0, route:0},
        total:{weight:0, route:0},
        shippingDetail:'',
        dialog:false,
        shippingId:'',
        snackbar: {
            show: false,
            message: null,
            color: null
        },
        totalShippings: 0,
        shippings: [],
        shipping:{},
        loading: true,
        options: {},
        sheet: false,
        filters: false,
        editDialog: false,
        createDialog: false,
        detailDialog:false,
        deleteId:'',
        swipeLeft:'',
        swipeRight:''
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
            { text: 'Folio', value: 'id' },
            { text: 'Chofer', value: 'driver' },
            { text: 'Fecha de Entrega', value: 'date' },
            { text: 'Unidad', value: 'vehicle' },
            { text: 'Peso', value: 'weight' },
            { text: 'Kilometraje Inicial', value: 'initial_km' },
            { text: 'Kilometraje Fianl', value: 'final_km' },
            { text: 'Nota', value: 'note' },
            { text: 'Recorrido', value: 'route' },
            { text: 'Creación', value: 'created_at' },
            { text: 'Edición', value: 'updated_at' },
            { value: 'actions', sortable: false, align: 'end', },
        ]},
        
    },
    methods: {
        calculate() {
            this.calc_loader = true
            var link = ''
            if(localStorage.getItem('filtersShippings')!=null){
                link = link + JSON.parse(localStorage.getItem('filtersShippings'))
            }
            axios.get(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/shippings?" + link + "&itemsPerPage=" + this.totalShippings).then(response => {
                
                var records = response.data.data.map(id=>{
                    return{
                        weight: this.calcWeight(id.shipping_details),
                        route:id.route
                    }
                })
                console.log(records)
                var sum = {
                    route:0,
                    weight:0
                }
                for(var i=0; i<records.length; i++){
                    sum.route = sum.route + (records[i].route*1)
                    sum.weight = sum.weight + (records[i].weight*1)
                }
                this.total.route = sum.route
                this.total.weight = sum.weight
                this.avg.route = sum.route/this.totalShippings
                this.avg.weight = sum.weight/this.totalShippings
                this.calc_loader = false
            })
        },
        calcWeight(details){
            var sum = 0
            for(var i=0; i<details.length; i++){
                if(details[i].sale!=undefined){
                    sum = sum + details[i].sale.sale_weight
                }
            }
            return sum
        },
        getDataFromApi () {
            this.loading = true
            this.apiCall().then(data => {
                this.shippings = data.shippings
                this.totalShippings = data.total
                this.loading = false
            })
        },
        apiCall () {
            return new Promise((resolve, reject) => {
                this.filterStorageLength = localStorage.getItem('filtersShippingsLength')
                const { sortBy, sortDesc, page, itemsPerPage } = this.options
                var shippings = []
                var total = 0
                var link = ''
                if(localStorage.getItem('filtersShippings')!=null){
                    link = link + JSON.parse(localStorage.getItem('filtersShippings'))+'&'
                }
                if(sortBy.length === 1){
                    if(sortDesc[0]){
                        link = link + "sort=-" + sortBy[0] + '&'
                    }else{
                        link = link + "sort=" + sortBy[0] + '&'
                    }
                }
                axios.get(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/shippings?" + link + "page=" + page + "&itemsPerPage=" + itemsPerPage).then(response => {
                    shippings = this.mapShippings(response.data.data)
                    total = response.data.meta.total
                    if(this.showTotals){
                        this.calculate()
                    }
                    resolve({
                        shippings,
                        total,
                    })
                })
            })
        },
        mapShippings(shippings){
            return shippings.map(id=>{
                return{
                    id:id.id,
                    created_at: id.created_at,
                    updated_at: id.updated_at,
                    date: id.date,
                    final_km:id.final_km,
                    initial_km:id.initial_km,
                    note:id.note,
                    //driver:id.driver.name + ' ' + id.driver.last,
                    //vehicle:id.vehicle.name,
                    weight: this.calcWeight(id.shipping_details) + ' kg',
                    route: id.route,
                    details:id.shipping_details,
                    /*editedItem:[id].map(id=>{
                        return{
                            id:id.id,
                            created_at: id.created_at,
                            updated_at: id.updated_at,
                            date: id.date,
                            final_km:id.final_km,
                            initial_km:id.initial_km,
                            note:id.note,
                            driver_id:id.driver.id*1,
                            vehicle_id:id.vehicle.id*1,
                        }
                    })[0]*/
                }
            })
        },
        swipe(direction, id){
            if(direction == 'Left'){
                if(this.swipeLeft == '' && this.swipeRight == ''){
                    this.swipeLeft = id
                }
                else if(this.swipeLeft != id && this.swipeLeft != ''){
                    this.swipeLeft = id
                }
                
                else{
                    this.swipeRight = ''
                }
            }
            else if(direction == 'Right'){
                if(this.swipeRight == '' && this.swipeLeft == ''){
                    this.swipeRight = id
                }
                else if(this.swipeRight != id && this.swipeRight != ''){
                    this.swipeRight = id
                }

                else{
                    this.swipeLeft = ''
                }
            }
        },
        swipePrint (id) {
            if(this.swipeLeft == id){
                if(this.permissions('editShippings') && this.permissions('deleteShippings')){
                    return 'transform: translateX(-130px); transition: all 0.5s ease 0s'
                }else if(this.permissions('editShippings') || this.permissions('deleteShippings')){
                    return 'transform: translateX(-65px); transition: all 0.5s ease 0s'
                }
                else{
                    return 'transition: all 0.5s ease 0s'
                }
            }else if(this.swipeRight == id && this.permissions('printShippings')){
                return 'transform: translateX(65px); transition: all 0.5s ease 0s'
            }
            else{
                return 'transition: all 0.5s ease 0s'
            }
        },
        viewDetail(item){
            this.shippingDetail = item
            this.shippingPrint = item
            this.dialog = true
        },
        printItem(item){
            localStorage.setItem('printShipping', JSON.stringify(item));
            window.open("/");
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
        filtersShipping: function(params) {
            this.getDataFromApi()
        },
        closeDialogEditShipping: function(params) {
            this.editDialog = false;
            this.getDataFromApi()
        },
        closeCreateDialogShipping: function(params) {
            this.createDialog = false;
            this.getDataFromApi()
        },
        exportExcel: function () {
            let data = XLSX.utils.json_to_sheet(this.shippings)
            const workbook = XLSX.utils.book_new()
            const filename = 'Lista de Envíos'
            XLSX.utils.book_append_sheet(workbook, data, filename)
            XLSX.writeFile(workbook, `${filename}.xlsx`)
        },
        deleteShipping(){
            axios.delete(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/shippins/"+this.deleteId).then(response => {
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
        },
        deleteItem (id) {
            this.deleteId = id
            this.sheet = true
        },
        editItem(item){
            this.shipping = item
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
    .botonPerron {
        background: white;
        border-radius: 5px;
        height: 25px!important;
        margin-bottom: -17px;
        width: 90px!important;
    }
</style>