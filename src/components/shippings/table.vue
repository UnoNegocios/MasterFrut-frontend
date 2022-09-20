<template>
    <v-container style="max-width:100vw;" class="pb-12">
        <!-- Filtros -->
        <v-navigation-drawer style="top: 0px; max-height:100vh!important;" right v-model="filters" :clipped="$vuetify.breakpoint.lgAndUp" app>
            <filterShippings v-bind:company="company" @filtersShipping="filtersShipping"/>
        </v-navigation-drawer>

        
        <!-- Contenedor PC -->
        <v-data-table show-expand :headers="headers" :items="shippings" class="elevation-0 px-6 py-4 hidden-sm-and-down">
            <!-- Header -->
            <template v-slot:top>
                <v-toolbar flat >
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


            <!-- Footer -->
            <template v-slot:footer>
                <v-container style="margin-bottom:-80px!important;">
                    <v-select :items="sumavg" v-model="totalType" style="width: 100px; display: inline-block; margin-right:30px; font-size: 14px;"></v-select>
                    <v-select :items="campos" v-model="campo" item-text="text" item-value="value" style="width: 100px; display: inline-block; margin-right:30px; font-size: 14px;"></v-select>
                    <strong v-if="totalType=='sum'">Total = {{ sumField(campo) }}</strong>
                    <strong v-if="totalType=='avg'">Promedio = {{ avgField(campo) }}</strong>
                </v-container>
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
            <template v-slot:[`item.weight`]="{ item }">
                {{item.weight}} kg
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
                        <v-list-item @click="editItem(item.id)"  v-show="permissions('editShippings')">
                            <v-icon small class="mr-2">
                                mdi-pencil
                            </v-icon>
                            Editar
                        </v-list-item>
                        <v-list-item @click="deleteItem(item)"  v-show="permissions('deleteShippings')">
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
                    <detail v-bind:shipping="item.id" />
                </td>
            </template>
        </v-data-table>

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
                    <v-icon v-show="permissions('editShippings')" dark class="px-5" style="background:#1c256a; border-radius: 0px 10px 10px 0px;" @click="editItem(shipping.id)">
                        mdi-pencil
                    </v-icon>
                    <v-icon v-show="permissions('deleteShippings')" dark class="px-5" style="background:#e25200; border-radius: 0px 10px 10px 0px;" @click="deleteItem(shipping)">
                        mdi-delete
                    </v-icon>
                </v-row>

                <v-card :style="swipePrint(shipping.id)" @click="viewDetail(shipping)" class="mb-3 elevation-0 py-3 px-4"
                v-touch="{ left: () => swipe('Left', shipping.id), right: () => swipe('Right', shipping.id)}">
                    
                    <v-row class="mx-0 mt-0">
                        <v-col cols="6">
                            <v-card-subtitle class="pt-2 pl-0" style="font-size:14px; font-weight:700; color: rgba(0, 0, 0, 0.4);"> Folio: {{shipping.folio}}</v-card-subtitle>
                        </v-col>
                        <v-col cols="6" style="text-align:right;">
                            <v-chip style="border-radius:5px!important; font-size:12px;" color="#e7e8e9">{{shipping.vehicle_id}}</v-chip>
                        </v-col>
                    </v-row>

                    <v-card-title style="font-size:16px;" class="pt-0 pb-0 px-2">{{shipping.driver_id}}</v-card-title>
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
            



            <v-dialog v-model="dialog"  fullscreen hide-overlay transition="dialog-bottom-transition">
            
                <v-card style="background:#f4f5fa;">
                    <v-toolbar dark color="primary" class="elevation-0">
                        <v-toolbar-title>Entregas</v-toolbar-title>
                        <v-spacer></v-spacer>
                        <v-btn small @click="printItem(shippingPrint)" v-show="permissions('printShippings')" class="elevation-0" color="#ffffff36">
                            Imprimir
                            <v-icon small class="ml-2">
                                mdi-printer
                            </v-icon>
                        </v-btn>
                        <v-btn icon dark @click="dialog = false">
                            <v-icon>mdi-close</v-icon>
                        </v-btn>
                    </v-toolbar>
                    <detail v-bind:shipping="shippingId"/>
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
        dialog:false,
        shippingId:'',
        snackbar: {
            show: false,
            message: null,
            color: null
        },
        campo:'weight',
        campos:[
            { text: 'Peso', value: 'weight' },
            { text: 'Recorrido', value: 'route' },
        ],
        totalType:'sum',
        sumavg:['sum', 'avg'],
        shipping:'',
        sheet: false,
        filters: false,
        editDialog: false,
        createDialog: false,
        detailDialog:false,
        rejectionDialog:false,
        deleteId:'',
        rejectionData:'',
        rejectionId:'',
        shippings: '',
        swipeLeft:'',
        swipeRight:''
    }),
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
            this.shippings = this.shippingsLists
            return [
            { text: '', value: 'data-table-expand' },
            { text: 'Folio', value: 'folio' },
            { text: 'Chofer', value: 'driver_id' },
            { text: 'Fecha de Entrega', value: 'date' },
            { text: 'Unidad', value: 'vehicle_id' },
            { text: 'Peso', value: 'weight' },
            { text: 'Kilometraje Inicial', value: 'initial_km' },
            { text: 'Kilometraje Fianl', value: 'final_km' },
            { text: 'Nota', value: 'note' },
            { text: 'Recorrido', value: 'route' },
            { text: 'Creación', value: 'created_at' },
            { text: 'Edición', value: 'updated_at' },
            { value: 'actions', sortable: false, align: 'end', },
        ]},
        shippingsList(){
            return this.$store.state.shipping.shippings
        },
        shippingsLists(){
            var shippings = this.$store.state.shipping.shippings
            if(this.company!='' && this.company!=undefined && this.company!=null){
                shippings = shippings.filter(shipping=>shipping.company_id == this.company)
            }
            shippings = shippings.map(id=>{
                return{
                    folio:id.id,
                    id:id.id,
                    driver_id:this.salesman(id.driver_id),
                    date:id.date,
                    vehicle_id:this.vehicle(id.vehicle_id),
                    initial_km:id.initial_km,// + ' km',
                    final_km:id.final_km,// + ' km',
                    route:(id.final_km - id.initial_km),// + ' kms',
                    note:id.note,
                    weight:this.weight(id.id),
                    created_at:id.created_at,
                    updated_at:this.childUdated(id.id, id.updated_at),
                }
            });
            return shippings
        },
    },
    methods: {
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
            this.shippingId = item.id
            this.shippingPrint = item
            this.dialog = true
        },
        printItem(item){
            var quotationsIds = this.$store.state.shipping_detail.shipping_details.filter(shipping=>shipping.shipping_id == item.id).map(shipping=>shipping.sale_id)
            var quotations = []
            quotations[0] = item
            var quotationsList = this.$store.state.quotation.quotations
            for(var i=0; i<quotationsIds.length; i++){
                quotations = quotations.concat(quotationsList.filter(quotation=>quotation.id == quotationsIds[i])[0])
            }
            localStorage.setItem('printShipping', JSON.stringify(quotations));
            window.open("/");
        },
        sumField(key) {//suma
            // sum data in give key (property)
            var suma=this.shippings.reduce((a, b) => a + (b[key] || 0), 0)
            if(this.campo == 'weight'){
                return suma + ' kg'
            }else if(this.campo == 'route'){
                return suma + ' km'
            }
        },
        avgField(key){//primedio
            var suma=this.shippings.reduce((a, b) => a + (b[key] || 0), 0)
            if(this.campo == 'weight'){
                return (suma/this.shippings.length) + ' kg'
            }else if(this.campo == 'route'){
                return (suma/this.shippings.length) + ' km'
            }
        },
        childUdated(shippingId, updated_at){
            var shipping_details = this.$store.state.shipping_detail.shipping_details.filter(shipping_detail=>shipping_detail.shipping_id == shippingId)
            if(shipping_details.length>0){
                return shipping_details[(shipping_details.length-1)].updated_at.slice(0, 10)
            }else{
                return updated_at.slice(0, 10)
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
        lowerCase(text){
            if(text!=null&&text!=undefined&&text!=''){
                return text.toLowerCase()
            }else{
                return ' '
            }
        },
        filtersShipping: function(params) {
            this.shippings = ''
            var filterShipping = this.$store.state.shipping.shippings//.filter(shipping=>shipping.status == 'shipping')
            /* Chofer */
            if(params.driver_id!=''&&params.driver_id!=undefined&&params.driver_id!=null){
                var uno = filterShipping.filter(company=>company.driver_id == params.driver_id[0])
                for(var i=1; i<params.driver_id.length; i++){
                    uno=uno.concat(filterShipping.filter(company=>company.driver_id == params.driver_id[i]))   
                }
                filterShipping = this.removeDuplicates(uno, "id");
            }
            /* Unidad */
            if(params.vehicle_id!=''&&params.vehicle_id!=undefined&&params.vehicle_id!=null){
                var dos = filterShipping.filter(company=>company.vehicle_id == params.vehicle_id[0])
                for(var i=1; i<params.vehicle_id.length; i++){
                    dos=dos.concat(filterShipping.filter(company=>company.vehicle_id == params.vehicle_id[i]))   
                }
                filterShipping = this.removeDuplicates(dos, "id");
            }
            /* Venta */
            if(params.sale_id!=''&&params.sale_id!=undefined&&params.sale_id!=null){
                var tres = filterShipping.filter(company=>company.id == params.sale_id[0])
                for(var i=1; i<params.sale_id.length; i++){
                    tres=tres.concat(filterShipping.filter(company=>company.id == params.sale_id[i]))   
                }
                filterShipping = this.removeDuplicates(tres, "id");
            }
            /* Notas */
            if(params.note!=''&&params.note!=undefined&&params.note!=null){
                filterShipping=filterShipping.filter(shipping=>this.lowerCase(shipping.note).includes(params.note.toLowerCase()))
            }

            console.log(params)
            /* Fecha */
            if(params.dateFrom!='' && params.dateFrom!=null && params.dateFrom!=undefined){
                filterShipping=filterShipping.filter(shipping=>new Date(shipping.date) > new Date(params.dateFrom))
            }
            if(params.dateTo!='' && params.dateTo!=null && params.dateTo!=undefined){
                filterShipping=filterShipping.filter(shipping=>new Date(shipping.date) <= new Date(params.dateTo))
            }
            



            this.shippings = filterShipping.map(id=>{
                return{
                    folio:id.id,
                    id:id.id,
                    driver_id:this.salesman(id.driver_id),
                    date:id.date,
                    vehicle_id:this.vehicle(id.vehicle_id),
                    initial_km:id.initial_km,// + ' km',
                    final_km:id.final_km,// + ' km',
                    route:(id.final_km - id.initial_km),// + ' kms',
                    note:id.note,
                    weight:this.weight(id.id),
                    created_at:id.created_at,
                    updated_at:this.childUdated(id.id, id.updated_at),
                }
            });
        },
        check(items, param){
            if(items!=undefined&&items!=''&&items!=null){
                for(var i=0; i<items.length; i++){
                    if(items[i].item == param){
                        return 'contain'
                    }
                }
            }
        },
        closeDialogEditShipping: function(params) {
            this.editDialog = false;
            this.$store.dispatch('shipping/getShippings')
        },
        closeCreateDialogShipping: function(params) {
            this.createDialog = false;
            this.$store.dispatch('shipping/getShippings')
        },
        exportExcel: function () {
            let data = XLSX.utils.json_to_sheet(this.shippings)
            const workbook = XLSX.utils.book_new()
            const filename = 'Lista de Cobranzas'
            XLSX.utils.book_append_sheet(workbook, data, filename)
            XLSX.writeFile(workbook, `${filename}.xlsx`)
        },
        deleteShipping(){
            axios.delete(process.env.VUE_APP_BACKEND_ROUTE + "api/v1/shipping/delete/"+this.deleteId).then(response => {
                this.deleteId = ''
                this.sheet = false
                this.$store.dispatch('shipping/getShippings')
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
        editItem(id){
            this.shipping = this.shippingsList.filter(shipping=>shipping.id == id)[0]
            this.editDialog = true
        },
        salesman(id){
            if(id!=null && id!=undefined && id!=''){
                return this.$store.state.user.users.filter(user=>user.id == id).map(user => user.name + ' ' + user.last)[0]
            }
        },
        vehicle(id){
            if(id!=null && id!=undefined && id!=''){
                return this.$store.state.vehicle.vehicles.filter(vehicle=>vehicle.id == id).map(vehicle => vehicle.name)[0]
            }
        },
        weight(id){
            if(id!=null && id!=undefined && id!=''){
                var details = this.$store.state.shipping_detail.shipping_details.filter(shipping=>shipping.shipping_id==id)
                var weight = 0
                if(details!=null && details!=undefined && details!=''){
                    for(var j=0; j<details.length; j++){
                        var quotationid = details[j].sale_id

                        var items = this.$store.state.quotation.quotations.filter(quotation=>quotation.id==quotationid).map(quotation=>quotation.items)[0]
                        
                        if(items!=null && items!=undefined && items!=''){
                            for(var i=0; i<items.length; i++){
                                let product = this.$store.state.item.items.filter(item=>item.id == items[i].item)[0]
                                weight = (weight*1) + ((product.weight*1)*(items[i].quantity))
                            }
                        }
                    }
                }
                return weight
            }
        }
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