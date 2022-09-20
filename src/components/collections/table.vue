<template>
    <v-container style="max-width:100vw;">
        <!-- Filtros -->
        <v-navigation-drawer style="top: 0px; max-height:100vh!important;" right v-model="filters" :clipped="$vuetify.breakpoint.lgAndUp" app>
            <filterCollections v-bind:company="company" @filtersCollection="filtersCollection"/>
        </v-navigation-drawer>
        <!-- Reportes -->
        <v-row class="pb-8">
            <v-col md="3" sd="12" v-for="(method, index) in methodsList" v-bind:key="index">
                <v-card :style="color(index)" class="pb-3">
                    <v-card-subtitle class="white--text pb-2" style="font-size:16px; font-weight:700;">{{method.method}}</v-card-subtitle>
                    <v-card-title class="white--text py-0">
                        <v-card-subtitle class="white--text py-0">Serie A</v-card-subtitle>
                        {{sumReport(method.id, 'a').toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
                    </v-card-title>
                    <v-card-title class="white--text py-0">
                        <v-card-subtitle class="white--text py-0">Serie B</v-card-subtitle>
                        {{sumReport(method.id, 'b').toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
                    </v-card-title>
                    <v-card-subtitle class="white--text pb-2 mt-2" style="font-size:16px; font-weight:700;"> 
                        <v-spacer></v-spacer>
                        Total = {{(sumReport(method.id, 'a')+sumReport(method.id, 'b')).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
                    </v-card-subtitle>
                </v-card>
            </v-col>
            <v-card-title>Total = {{sumTotal()}}</v-card-title>
        </v-row>
        <!-- Tabla -->
        <v-data-table  :item-class="itemRowBackground" :headers="headers" :items="collections" class="elevation-0 px-6 py-4">
            <!-- Header -->
            <template v-slot:top>
                <v-toolbar flat >
                    <v-toolbar-title>Cobranza</v-toolbar-title>
                    <v-btn icon>
                        <v-icon @click="openFilter()">mdi-filter</v-icon>
                    </v-btn>
                    <v-spacer></v-spacer>
                    <v-btn icon>
                        <v-icon @click="exportExcel">mdi-download</v-icon>
                    </v-btn>
                </v-toolbar>
            </template>
            <!-- Footer -->
            <template v-slot:footer>
                <v-container style="margin-bottom:-80px!important;">
                    <v-select :items="sumavg" v-model="totalType" style="width: 100px; display: inline-block; margin-right:30px; font-size: 14px;"></v-select>
                    <v-select :items="campos" v-model="campo" item-text="text" item-value="value" style="width: 100px; display: inline-block; margin-right:30px; font-size: 14px;"></v-select>
                    <v-select v-if="campo=='method'" :items="methodsList" v-model="methodId" item-text="method" item-value="id" style="width: 100px; display: inline-block; margin-right:30px; font-size: 14px;"></v-select>
                    <strong v-if="totalType=='sum'">Total = {{ sumField(campo) }}</strong>
                    <strong v-if="totalType=='avg'">Promedio = {{ avgField(campo) }}</strong>
                </v-container>
            </template> 
            
            <template v-slot:[`item.total`]="{ item }">
                {{item.total.toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
            </template>
            <template v-slot:[`item.subtotal`]="{ item }">
                {{item.subtotal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
            </template>
            <template v-slot:[`item.iva`]="{ item }">
                {{item.iva.toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
            </template>
            <template v-slot:[`item.payments`]="{ item }">
                {{item.payments.toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
            </template>
            <template v-slot:[`item.debt`]="{ item }">
                {{item.debt.toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
            </template>
            <template v-slot:[`item.expired_debt`]="{ item }">
                {{item.expired_debt.toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
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
                        <v-list-item @click="editItem(item.id)"  v-show="permissions('editCollections')">
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
            <!-- Metodo -->
            <template v-slot:[`item.payment_method_id`]="{ item }">
                <div v-for="(method, index) in item.payment_method_id" v-bind:key="index"> 
                    <span>{{paymentMethod(method.method)}} {{(method.amount*1).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}</span><br/> - 
                </div>
            </template>

            <template v-slot:[`item.pdf`]="{ item }">
                <v-btn v-if="item.pdf!=undefined" v-bind:href="liga + 'files/' + item.pdf" target="_blank" icon style="margin:auto; display:block;">
                    <v-icon >mdi-download-circle</v-icon>
                </v-btn>
            </template>

            <!-- Creación -->
            <template v-slot:[`item.created_at`]="{ item }">
                {{item.created_at.slice(0, 10)}}
            </template>
            <!-- Actualización -->
            <template v-slot:[`item.updated_at`]="{ item }">
                {{item.updated_at.slice(0, 10)}}
            </template>
            <!-- Tabla sin información -->
            <template v-slot:no-data>
                No existen registros de cobranza aún
            </template>
            <!-- Empresa -->
            <template v-slot:[`item.company`]="{ item }">
                <v-list-item class="px-0" style="min-height:0px!important; font-size:14px;" :to="{ path: '/clients/client/'+ item.companyID}">{{item.company}}</v-list-item>
            </template>
            <!-- Detalle PC -->
            <template v-slot:expanded-item="{ headers, item }">
                <td :colspan="headers.length">
                    <v-row class="pa-6">
                        <v-col cols="12" sm="6" md="6">
                            <v-data-table :headers="headers2" :items="item.items" v-if="item.items!=undefined" class="elevation-0" style="background: #f7f7f7;!important" dense>
                                <template v-slot:[`item.item`]="{ item }">
                                    {{ items(item.item) }}
                                </template>
                                <template v-slot:[`item.value`]="{ item }">
                                    {{ prices(item.item).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',}) }}
                                </template>
                                <template v-slot:[`item.total`]="{ item }">
                                    {{ (prices(item.item)*item.quantity).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',}) }}
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
                    </v-row>
                </td>
            </template>
            <!-- Monto -->
            <template v-slot:[`item.amount`]="{ item }">
                {{item.amount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
            </template>
        </v-data-table>
        <!-- Crear actividad -->
        <v-dialog v-model="createDialog" max-width="700px" persistent>
          <template v-slot:activator="{ on, attrs }">
            <v-btn bottom color="#e25200" dark fab fixed right v-bind="attrs" v-on="on">
                <v-icon color="white">  mdi-plus </v-icon>
            </v-btn> 
          </template>
          <create v-bind:company="company" @closeCreateDialogCollection="closeCreateDialogCollection"/>
        </v-dialog>
        <!-- Editar actividad -->
        <v-dialog v-model="editDialog" max-width="700px" persistent>
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
import Filter from "../collections/filter"
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
    }, 
    data: () => ({
        snackbar: {
            show: false,
            message: null,
            color: null
        },
        methodId:'',
        campo:'amount',
        campos:[
            { text: 'Monto', value: 'amount'},
            { text: 'Metodo de Pago', value: 'method'},
        ],
        totalType:'sum',
        sumavg:['sum', 'avg'],
        statusData:'',
        statusId:'',
        collection:'',
        sheet2: false,
        sheet: false,
        filters: false,
        editDialog: false,
        createDialog: false,
        detailDialog:false,
        rejectionDialog:false,
        deleteId:'',
        rejectionData:'',
        rejectionId:'',
        collections: '',
        headers2:[
            { text: 'Cantidad', value: 'quantity',},
            { text: 'Producto | Servicio', value: 'item',},
            { text: 'Valor', value: 'value',},
            { text: 'Total', value: 'total',},
        ]
    }),
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
            this.collections = this.collectionsLists
            return [
                { text: 'Id', value: 'id'},
            //{ text: '', value: 'data-table-expand' },
            //{ text: 'Perro', value: 'perro' },
            { text: 'Venta', value: 'quotation_id'},
            this.showCompany,
            { text: 'SAE', value: 'macro'},
            { text: 'Fecha', value: 'date'},
            { text: 'Metodo de Pago', value: 'payment_method_id'},
            //{ text: 'Suma', value: 'sum'},
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
        collectionsList(){
            return this.$store.state.collection.collections
        },
        collectionsLists(){
            var collections = this.$store.state.collection.collections//.filter(collection=>this.lengthPerro(collection.salesID))
            if(this.company!='' && this.company!=undefined && this.company!=null){
                collections = collections.filter(collection=>collection.company_id == this.company)
            }
            collections = collections//.filter(collection=>collection.methods[0].method!=4).filter(collection=>collection.date>='2022-01-01')
            .map(id=>{
                return{
                    id:id.id,
                    company:this.idMacro(id.company_id) + this.companyName(id.company_id),
                    companyID:id.company_id,
                    quotation_id: this.saleName(id),
                    macro:id.macro,
                    date:id.date,
                    payment_method_id:id.methods,
                    methods:id.methods,
                    amount:id.amount,
                    invoice:id.invoice,
                    remission:id.remission,
                    note:id.note,
                    pdf:id.pdf,
                    created_by_user_id:this.salesman(id.created_by_user_id),
                    last_updated_by_user_id:this.salesman(id.last_updated_by_user_id),
                    user_id:this.salesman(id.user_id),
                    created_at:id.created_at,
                    updated_at:id.updated_at,
                    perro:this.perro(id.salesID),
                    //sum:this.sumMethods(id.methods)
                }
            })//.filter(collection=>collection.sum!=(collection.amount*1))
            return collections
        },
        methodsList(){
            return this.$store.state.payment_method.payment_methods
        }
    },
    mounted() {
        Echo.channel('test').listen('Test', (e) => {
            //console.log('test')
        })
    },
    created(){
        this.collections = this.collectionsLists
    },
    methods: {
        sumMethods(methods){
            var sum = 0
            for(var i=0; i<methods.length; i++){
                sum = sum + (((methods[i].amount*1).toFixed(2))*1)
            }
            return sum
        },
        lengthPerro(value){
            if(value!=undefined){
                if(value.length==0){
                    return true
                }else{
                    return false
                }
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
        macroCapture(id, value){
            var collection = this.$store.state.collection.collections.filter(collection=>collection.id == id)[0]
            collection.macro = value
            this.$nextTick(() => {
                axios.put(process.env.VUE_APP_BACKEND_ROUTE + "api/v1/collection/update",Object.assign(collection)).then(response=>{
                    this.$store.dispatch('collection/getCollections')
                }).catch(error => {
                    this.snackbar = {
                        message: error.response.data.message,
                        color: 'error',
                        show: true
                    }
                })
            })
        },
        perro(item){
            if(item.length>0){
                var ids = item[0].id
                for(var i=1; i<item.length; i++){
                    ids = ids + ', ' + item[i].id
                }
                return ids
            }
        },
        idMacro(id){
            var macro = this.$store.state.company.companies.filter(company=>company.id == id).map(company=>company.number)[0]
            if(macro!=null && macro!=undefined && macro!=''){
                return macro + ' | '
            }else{
                return ''
            }
        },
        color(index){
            if (index%2==0) {
                return 'background:#ff8400;'
            } else {
                return 'background:#1f88fe;'
            }
        },
        sumTotal(){
            var suma = this.collections.reduce((a, b) => a + ((b['amount']*1) || 0), 0)
            return suma.toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})
        },
        sumReport(method, serie) {//suma
            // sum data in give key (property)
            var perros = []
            if(serie=='a'){
                var collectionSeries = this.collections.filter(collection=>collection.invoice!=null && collection.invoice!=undefined && collection.invoice!='')
            }else if(serie=='b'){
                var collectionSeries = this.collections.filter(collection=>collection.remission!=null && collection.remission!=undefined && collection.remission!='')
            }
            for(var i=0; i<collectionSeries.length; i++){
                perros = perros.concat(collectionSeries[i].methods)
            }
            perros = perros.filter(perro=>perro.method == method)
            var suma = perros.reduce((a, b) => a + ((b['amount']*1) || 0), 0)
            return suma
        },
        sumField(key) {
            if(this.campo == 'method' && this.methodId!=''){
                var perros = []
                for(var i=0; i<this.collections.length; i++){
                    perros = perros.concat(this.collections[i].payment_method_id)
                }
                perros = perros.filter(perro=>perro.method == this.methodId)
                var suma = perros.reduce((a, b) => a + ((b['amount']*1) || 0), 0)
                return suma.toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})
            }else{
                var suma = this.collections.reduce((a, b) => a + (b[key] || 0), 0)
                return suma.toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})
            }
        },
        avgField(key){//primedio
            if(this.campo == 'method'){

            }else{
                var suma = this.collections.reduce((a, b) => a + (b[key] || 0), 0)
                return (suma/this.quotations.length).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})
            }
        },
        paymentMethod(id){
            return this.$store.state.payment_method.payment_methods.filter(method=>method.id == id).map(method=>method.method)[0]
        },
        saleName(id){
            if(id.invoice!=undefined){
                return 'F-'+id.invoice
            }else if(id.remission!=undefined){
                return 'R-'+id.remission
            }
        },
        companyName(id){
            if(id!=null && id!=undefined && id!=''){
                return this.$store.state.company.companies.filter(company=>company.id == id).map(company=>company.name)[0]
            }
        },
        contact(id){
            if(id!=null && id!=undefined && id!=''){
                return this.$store.state.contact.contacts.filter(contact=>contact.id == id).map(contact=>contact.name)[0]
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
        esta(methods, method){
            var respuesta = false
            for(var i=0; i<methods.length; i++){
                if(methods[i].method == method){
                    respuesta = true
                }
            }
            return respuesta 
        },
        filtersCollection: function(params) {
            this.collections = ''
            if(this.company!='' && this.company!=undefined && this.company!=null){
                var filterCollection = this.$store.state.collection.collections.filter(collection=>collection.company_id == this.company)
            }else{
                var filterCollection = this.$store.state.collection.collections
            }
            if(params.company_id!=''&&params.company_id!=undefined&&params.company_id!=null){
                var cuatro = filterCollection.filter(company=>company.company_id == params.company_id[0])
                for(var i=1; i<params.company_id.length; i++){
                    cuatro=cuatro.concat(filterCollection.filter(company=>company.company_id == params.company_id[i]))   
                }
                filterCollection = this.removeDuplicates(cuatro, "id");
            }
            if(params.user_id!=''&&params.user_id!=undefined&&params.user_id!=null){
                var cuatro = filterCollection.filter(company=>company.user_id == params.user_id[0])
                for(var i=1; i<params.user_id.length; i++){
                    cuatro=cuatro.concat(filterCollection.filter(company=>company.user_id == params.user_id[i]))   
                }
                filterCollection = this.removeDuplicates(cuatro, "id");
            }


            
            if(params.method_id!=''&&params.method_id!=undefined&&params.method_id!=null){
                var cinco = filterCollection.filter(company=>this.esta(company.methods, params.method_id[0]))
                for(var i=1; i<params.method_id.length; i++){
                    cinco=cinco.concat(filterCollection.filter(company=>this.esta(company.methods[0] == params.method_id[i])))  
                }
                filterCollection = this.removeDuplicates(cinco, "id");
            }




            if(params.macro!==''&&params.macro!==undefined&&params.macro!==null){
                filterCollection=filterCollection.filter(collection=>collection.macro === params.macro)
            }
            if(params.note!=''&&params.note!=undefined&&params.note!=null){
                filterCollection=filterCollection.filter(collection=>this.lowerCase(collection.note).includes(params.note.toLowerCase()))
            }
            if(params.invoice!=''&&params.invoice!=undefined&&params.invoice!=null){
                filterCollection=filterCollection.filter(collection=>this.lowerCase(collection.invoice).includes(params.invoice.toLowerCase()))
            }
            if(params.remission!=''&&params.remission!=undefined&&params.remission!=null){
                filterCollection=filterCollection.filter(collection=>this.lowerCase(collection.remission).includes(params.remission.toLowerCase()))
            }
            if(params.dateFrom!='' && params.dateFrom!=null && params.dateFrom!=undefined){
                filterCollection=filterCollection.filter(collection=>new Date(collection.date) >= new Date(params.dateFrom))
            }
            if(params.dateTo!='' && params.dateTo!=null && params.dateTo!=undefined){
                filterCollection=filterCollection.filter(collection=>new Date(collection.date) <= new Date(params.dateTo))
            }

            if(params.sale_id!==''&&params.sale_id!==undefined&&params.sale_id!==null){
                
                filterCollection=filterCollection.filter(collection=>this.filterSale(collection.salesID, params.sale_id))
            }
            


            this.collections = filterCollection.map(id=>{
                return{
                    id:id.id,
                    company:this.idMacro(id.company_id) + this.companyName(id.company_id),
                    companyID:id.company_id,
                    quotation_id: this.saleName(id),
                    macro:id.macro,
                    date:id.date,
                    payment_method_id:id.methods,
                    methods:id.methods,
                    amount:id.amount,
                    invoice:id.invoice,
                    remission:id.remission,
                    note:id.note,
                    pdf:id.pdf,
                    created_by_user_id:this.salesman(id.created_by_user_id),
                    last_updated_by_user_id:this.salesman(id.last_updated_by_user_id),
                    user_id:this.salesman(id.user_id),
                    created_at:id.created_at,
                    updated_at:id.updated_at,
                    perro:this.perro(id.salesID)
                }
            });
        },
        filterSale(sales, id){
            for(var i=0; i<sales.length; i++){
                if(sales[i].id == id){
                    return true
                }
            }
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
        closeEditDialogCollection: function(params) {
            this.editDialog = false;
            this.$store.dispatch('collection/getCollections')
        },
        closeCreateDialogCollection: function(params) {
            this.createDialog = false;
            this.$store.dispatch('collection/getCollections')
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
                this.$store.dispatch('collection/getCollections')
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
        editItem(id){
            this.collection = this.collectionsList.filter(collection=>collection.id == id)[0]
            this.editDialog = true
        },
        salesman(id){
            return this.$store.state.user.users.filter(user=>user.id == id).map(user => user.name)[0]
        },
        contact(id){
            return this.$store.state.contact.contacts.filter(contact=>contact.id == id).map(contact => contact.name + ' ' + contact.last)[0]
        },
        companyName(id){
            return this.$store.state.company.companies.filter(company=>company.id == id).map(company => company.name)[0]
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
    .style-1 {
        background-color: #fff5d7
    }
    .style-2 {
        background-color: white
    }
    .style-3 {
        background-color: #ffc4c4
    }
</style>
