<template>
    <v-container style="max-width:100vw;">
        <!-- Filtros -->
        <v-navigation-drawer style="top: 0px; max-height:100vh!important;" right v-model="filters" :clipped="$vuetify.breakpoint.lgAndUp" app>
            <filterProviderPayments v-bind:company="company" @filtersProviderPayment="filtersProviderPayment"/>
        </v-navigation-drawer>
        <!-- Contenedor -->
        <v-data-table :headers="headers" :items="provider_payments" class="elevation-0 px-6 py-4">
            <!-- Header -->
            <template v-slot:top>
                <v-toolbar flat >
                    <v-toolbar-title>Pagos Provedores</v-toolbar-title>
                    <v-btn icon>
                        <v-icon @click="openFilter()">mdi-filter</v-icon>
                    </v-btn>
                    <v-spacer></v-spacer>
                    <v-btn icon v-show="permissions('download')">
                        <v-icon @click="exportExcel">mdi-download</v-icon>
                    </v-btn>
                </v-toolbar>
            </template>

            <template v-slot:[`item.amount`]="{ item }">
                {{item.amount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
            </template>

            <template v-slot:[`item.provider_id`]="{ item }">
                <v-list-item class="px-0" style="min-height:0px!important; font-size:14px;" :to="{ path: '/providers/'+ item.provider_id.id}">{{item.provider_id.name}}</v-list-item>
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
            <!-- Acciones por fila -->
            <template v-slot:[`item.actions`]="{ item }">
                <v-menu bottom left v-if="permissions('editProviderPayments')==true || permissions('deleteProviderPayments')==true">
                    <template v-slot:activator="{ on, attrs }">
                    <v-btn icon v-bind="attrs" v-on="on">
                        <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                    </template>
                    <v-list style="font-size:13px;">
                        <v-list-item @click="editItem(item.id)"  v-show="permissions('editProviderPayments')">
                            <v-icon small class="mr-2">
                                mdi-pencil
                            </v-icon>
                            Editar
                        </v-list-item>
                        <v-list-item @click="deleteItem(item)"  v-show="permissions('deleteProviderPayments')">
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
                No existen registros de pagos aún
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
        </v-data-table>
        <!-- Crear pago -->
        <v-dialog v-model="createDialog" max-width="650px">
          <template v-slot:activator="{ on, attrs }">
            <v-btn bottom color="#e25200" dark fab fixed right v-bind="attrs" v-on="on">
                <v-icon color="white">  mdi-plus </v-icon>
            </v-btn> 
          </template>
          <create v-bind:company="company" @closeCreateDialogProviderPayment="closeCreateDialogProviderPayment"/>
        </v-dialog>
        <!-- Editar pago -->
        <v-dialog v-model="editDialog" max-width="650px">
          <edit v-bind:provider_payment="provider_payment" @closeEditDialogProviderPayment="closeEditDialogProviderPayment"/>
        </v-dialog>
        <!-- Dialogo confirmación de eliminación -->
        <div class="text-center">
            <v-bottom-sheet  v-model="sheet" inset>
                <v-sheet class="text-center" height="150px">
                    <div class="pt-6">
                    ¿Seguro que deseas borrar este pago?
                    </div>
                    <v-btn class="mt-4" text color="error" @click="deleteProviderPayment()">
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
import Filter from "../provider_payments/filter"
import Create from "../provider_payments/create"
import Edit from "../provider_payments/edit"
export default {
    props:{
        company:String
    },
    components: {
        'filterProviderPayments':Filter,
        'create':Create,
        'edit':Edit,
    }, 
    data: () => ({
        campo:'amount',
        campos:[
            { text: 'Monto', value: 'amount' },
        ],
        totalType:'sum',
        sumavg:['sum', 'avg'],

        provider_payment:'',
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
        provider_payments: '',
        headers2:[
            { text: 'Cantidad', value: 'quantity',},
            { text: 'Producto | Servicio', value: 'item',},
            { text: 'Valor', value: 'value',},
            { text: 'Total', value: 'total',},
        ],
        snackbar: {
            show: false,
            message: null,
            color: null
        },
    }),
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
            this.provider_payments = this.provider_paymentsLists
            return [
            { text: 'Fecha', value: 'date' },
            { text: 'Monto', value: 'amount' },
            { text: 'Metodo', value: 'payment_method' },
            { text: 'Nota', value: 'note' },
            { text: 'Proveedor', value: 'provider_id' },

            { text: 'Creación', value: 'created_at' },
            { text: 'Creador', value: 'created_by_user_id'},
            { text: 'Edición', value: 'updated_at' },
            { text: 'Editor', value: 'last_updated_by_user_id'},
            { value: 'actions', sortable: false, align: 'end' },
        ]},
        provider_paymentsList(){
            return this.$store.state.provider_payment.provider_payments
        },
        provider_paymentsLists(){
            var provider_payments = this.$store.state.provider_payment.provider_payments//.filter(p=>p.shoppingsID.length==0)
            if(this.company!='' && this.company!=undefined && this.company!=null){
                provider_payments = provider_payments.filter(provider_payment=>provider_payment.company_id == this.company)
            }
            provider_payments = provider_payments.map(id=>{
                return{
                    id:id.id,
                    note:id.note,
                    date:id.date,
                    provider_id:this.provider(id.provider_id),
                    payment_method:this.paymentMethod(id.payment_method),
                    amount:(id.amount*1),
                    created_by_user_id:this.salesman(id.created_by_user_id),
                    last_updated_by_user_id:this.salesman(id.last_updated_by_user_id),
                    created_at:id.created_at.slice(0, 10),
                    updated_at:id.updated_at.slice(0, 10),
                }
            });
            return provider_payments
        },
    },
    mounted() {
        Echo.channel('test').listen('Test', (e) => {
            //console.log('test')
        })
    },
    methods: {
        sumField(key) {//suma
            // sum data in give key (property)
            var suma=this.provider_payments.reduce((a, b) => a + (b[key] || 0), 0)
            return suma.toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})
        },
        avgField(key){//primedio
            var suma=this.provider_payments.reduce((a, b) => a + (b[key] || 0), 0)
            return (suma/this.provider_payments.length).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})
        },

        provider(id){
            return this.$store.state.provider.providers.filter(provider=>provider.id == id)[0]
        },
        paymentMethod(id){
            return this.$store.state.payment_method.payment_methods.filter(method=>method.id == id).map(method=>method.method)[0]
        },
        saleName(id){
            if(id!=undefined){
                var sale = this.$store.state.quotation.quotations.filter(quotation=>quotation.status == 'vendido').filter(quotation=>quotation.id == id)[0]
                return 'id:' + sale.id + ' | ' + this.companyName(sale.company_id) + ' | ' + this.contact(sale.contact_id)
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
        filtersProviderPayment: function(params) {
            console.log(params)
            this.provider_payments = ''
            var filterProviderPayment = this.$store.state.provider_payment.provider_payments
            
            if(params.provider_id!=''&&params.provider_id!=undefined&&params.provider_id!=null){
                var uno = filterProviderPayment.filter(payment=>payment.provider_id == params.provider_id[0])
                for(var i=1; i<params.provider_id.length; i++){
                    uno=uno.concat(filterProviderPayment.filter(payment=>payment.provider_id == params.provider_id[i]))   
                }
                filterProviderPayment = this.removeDuplicates(uno, "id");
            }

            if(params.method_id!=''&&params.method_id!=undefined&&params.method_id!=null){
                var uno = filterProviderPayment.filter(payment=>payment.payment_method == params.method_id[0])
                for(var i=1; i<params.method_id.length; i++){
                    uno=uno.concat(filterProviderPayment.filter(payment=>payment.payment_method == params.method_id[i]))   
                }
                filterProviderPayment = this.removeDuplicates(uno, "id");
            }

            if(params.note!=''&&params.note!=undefined&&params.note!=null){
                filterProviderPayment=filterProviderPayment.filter(payment=>this.lowerCase(payment.note).includes(params.note.toLowerCase()))
            }


            if(params.dateFrom!='' && params.dateFrom!=null && params.dateFrom!=undefined){
                filterProviderPayment=filterProviderPayment.filter(provider_payment=>new Date(provider_payment.date) > new Date(params.dateFrom))
            }
            if(params.dateTo!='' && params.dateTo!=null && params.dateTo!=undefined){
                var dateTwo = new Date(new Date(params.dateTo).setDate(new Date(params.dateTo).getDate() + 1))
                filterProviderPayment=filterProviderPayment.filter(provider_payment=>new Date(provider_payment.date) <= dateTwo)
            }


            this.provider_payments = filterProviderPayment.map(id=>{
                return{
                    id:id.id,
                    note:id.note,
                    date:id.date,
                    provider_id:this.provider(id.provider_id),
                    payment_method:this.paymentMethod(id.payment_method),
                    amount:(id.amount*1),//.toLocaleString('es-MX', { style: 'currency', currency: 'MXN',}),
                    created_by_user_id:this.salesman(id.created_by_user_id),
                    last_updated_by_user_id:this.salesman(id.last_updated_by_user_id),
                    created_at:id.created_at.slice(0, 10),
                    updated_at:id.updated_at.slice(0, 10),
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
        closeEditDialogProviderPayment: function(params) {
            this.editDialog = false;
            this.$store.dispatch('provider_payment/getProviderPayments')
        },
        closeCreateDialogProviderPayment: function(params) {
            this.createDialog = false;
            this.$store.dispatch('provider_payment/getProviderPayments')
        },
        exportExcel: function () {
            let data = XLSX.utils.json_to_sheet(this.provider_payments)
            const workbook = XLSX.utils.book_new()
            const filename = 'Lista de Cobranzas'
            XLSX.utils.book_append_sheet(workbook, data, filename)
            XLSX.writeFile(workbook, `${filename}.xlsx`)
        },
        deleteProviderPayment(){
            axios.delete(process.env.VUE_APP_BACKEND_ROUTE + "api/v1/provider_payment/delete/"+this.deleteId).then(response => {
                this.deleteId = ''
                this.sheet = false
                this.$store.dispatch('provider_payment/getProviderPayments')
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
            this.provider_payment = this.provider_paymentsList.filter(provider_payment=>provider_payment.id == id)[0]
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
</style>