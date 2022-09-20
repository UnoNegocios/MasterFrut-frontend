<template>
    <v-container style="max-width:100vw;">
        <!-- Filtros -->
        <v-navigation-drawer style="top: 0px; max-height:100vh!important;" right v-model="filters" :clipped="$vuetify.breakpoint.lgAndUp" app>
            <filterShopping @filtersShopping="filtersShopping"/>
        </v-navigation-drawer>
        <!-- Contenedor -->
        <v-data-table show-expand :headers="headers" :items="shoppings" class="elevation-0 px-6 py-4">
            <!-- Header -->
            <template v-slot:top>
                <v-toolbar flat >
                    <v-toolbar-title>Compras</v-toolbar-title>
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
                    <detail v-bind:shopping="{'id':item.id, 'received':item.received}" />
                </td>
            </template>
            <template v-slot:[`item.provider_id`]="{ item }">
                <v-list-item v-if="item.provider_id!=undefined" class="px-0" style="min-height:0px!important; font-size:14px;" :to="{ path: '/providers/'+ item.provider_id.id}">{{item.provider_id.name}}</v-list-item>
            </template>
            <!-- Acciones por fila -->
            <template v-slot:[`item.actions`]="{ item }">
                <v-menu bottom left v-if="(permissions('editShoppings')==true || permissions('deleteShoppings')==true)">
                    <template v-slot:activator="{ on, attrs }">
                    <v-btn icon v-bind="attrs" v-on="on">
                        <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                    </template>
                    <v-list style="font-size:13px;">
                        <v-list-item @click="editItem(item)" v-show="permissions('editShoppings')">
                            <v-icon small class="mr-2">
                                mdi-pencil
                            </v-icon>
                            Editar
                        </v-list-item>
                        <v-list-item @click="deleteItem(item)" v-show="permissions('deleteShoppings')">
                            <v-icon small class="mr-2">
                                mdi-delete
                            </v-icon>
                            Eliminar
                        </v-list-item>
                    </v-list>
                </v-menu>
            </template>
            <!-- PDF -->
            <template v-slot:[`item.pdf`]="{ item }">
                <v-btn v-bind:href="liga + 'files/' + item.pdf" target="_blank" icon>
                    <v-icon v-if="item.pdf!=undefined">mdi-download-circle</v-icon>
                </v-btn>
            </template>
            <!-- XML -->
            <template v-slot:[`item.xml`]="{ item }">
                <v-btn v-bind:href="liga + 'files/' + item.xml" target="_blank" icon>
                    <v-icon v-if="item.xml!=undefined">mdi-download-circle</v-icon>
                </v-btn>
            </template>
            <!-- Tabla sin información -->
            <template v-slot:no-data>
                No existen registros de compras aún
            </template>

            <template v-slot:[`item.received`]="{ item }">
                <v-icon v-if="item.received!=true" @click="confirmReceived(item)">mdi-check-circle-outline</v-icon>
                <v-icon v-else color="primary">mdi-check-circle</v-icon>
            </template>

            <template v-slot:[`item.subtotal`]="{ item }">
                {{item.subtotal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
            </template>
             <template v-slot:[`item.iva`]="{ item }">
                {{item.iva.toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
            </template>
            <template v-slot:[`item.isr`]="{ item }">
                {{item.isr.toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
            </template>
             <template v-slot:[`item.total`]="{ item }">
                {{item.total.toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
            </template>
             <template v-slot:[`item.total_paid`]="{ item }">
                {{item.total_paid.toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
            </template>
             <template v-slot:[`item.outstatnding_balance`]="{ item }">
                {{item.outstatnding_balance.toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
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
            
        </v-data-table>
        <!-- Crear gasto -->
        <v-dialog v-model="createDialog" max-width="700px">
          <template v-slot:activator="{ on, attrs }">
            <v-btn bottom color="#e25200" dark fab fixed right v-bind="attrs" v-on="on">
                <v-icon color="white">  mdi-plus </v-icon>
            </v-btn> 
          </template>
          <create @closeDialogCreateShopping="closeDialogCreateShopping"/>
        </v-dialog>
        <!-- Editar gasto -->
        <v-dialog v-model="editDialog" max-width="700px">
          <edit v-bind:editedItem="shopping" @closeDialogEditShopping="closeDialogEditShopping"/>
        </v-dialog>
        <!-- Dialogo confirmación -->
        <div class="text-center">
            <v-bottom-sheet  v-model="sheet" inset>
                <v-sheet class="text-center" height="150px">
                    <div class="pt-6">
                    ¿Seguro que deseas borrar esta compra?
                    </div>
                    <v-btn class="mt-4" text color="error" @click="deleteShopping()">
                    Eliminar
                    </v-btn>
                    <v-btn class="mt-4" text color="grey" @click="cancel()">
                    Cancelar
                    </v-btn>
                </v-sheet>
            </v-bottom-sheet>
        </div>
        <!-- Dialogo confirmación -->
        <div class="text-center">
            <v-bottom-sheet  v-model="sheet2" inset>
                <v-sheet class="text-center" height="150px">
                    <div class="pt-6">
                    ¿Seguro que quieres marcar la compra {{received_shopping.id}} como recibida?
                    </div>
                    <v-btn class="mt-4" text color="error" @click="receivedShopping()">
                    Si
                    </v-btn>
                    <v-btn class="mt-4" text color="grey" @click="sheet2=false, received_shopping=''">
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
import XLSX from 'xlsx';
import FilterShopping from "../shoppings/filter"
import Create from "../shoppings/create"
import Edit from "../shoppings/edit"
import Detail from "../shoppings/detail/container"
export default {
    components: {
        'detail':Detail,
        'filterShopping':FilterShopping,
        'create':Create,
        'edit':Edit,
    }, 
    data: () => ({
        campo:'total',
        campos:[
            { text: 'Total', value: 'total' },
            { text: 'Pagado', value: 'total_paid' },
            { text: 'Pendiente', value: 'outstatnding_balance' },
            { text: 'IVA', value: 'iva' },
            { text: 'ISR', value: 'isr' },
        ],
        totalType:'sum',
        sumavg:['sum', 'avg'],

        shopping:'',
        sheet: false,
        sheet2:false,
        filters: false,
        editDialog: false,
        createDialog: false,
        deleteId:'',
        shoppings: '',
        snackbar: {
            show: false,
            message: null,
            color: null
        },
        received_shopping:''
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
            this.shoppings = this.shoppingsLists
            return [
            { text: '', value: 'data-table-expand' },
            { text: 'Id', value: 'id' },
            { text: 'Fecha', value: 'date' },
            { text: 'Serie', value: 'serie' },
            { text: 'Proveedor', value: 'provider_id' },
            { text: 'Factura', value: 'invoice' },
            { text: 'Recibido', value: 'received' },
            { text: 'Subtotal', value: 'subtotal' },
            { text: 'IVA', value: 'iva' },
            { text: 'ISR', value: 'isr' },
            { text: 'Total', value: 'total' },
            { text: 'Vencimiento', value: 'due_date' },
            { text: 'Pagado', value: 'total_paid' },
            { text: 'Pendiente', value: 'outstatnding_balance' },
            { text: 'Notas', value: 'notes' },
            { text: 'PDF', value: 'pdf' },
            { text: 'XML', value: 'xml' },
            { text: 'Creado', value: 'created_by_user_id' },
            { text: 'Creación', value: 'created_at' },
            { text: 'Editado', value: 'last_updated_by_user_id' },
            { text: 'Edición', value: 'updated_at' },
            { value: 'actions', sortable: false, align: 'end', },
        ]},
        shoppingsLists(){
            console.log(this.$route.params.id)
            var shoppingsList = this.$store.state.shopping.shoppings
            if(this.$route.params.id!=undefined){
                shoppingsList = shoppingsList.filter(shopping=>shopping.id == this.$route.params.id)
            }
            if(this.$route.params.provider_id!=undefined){
                shoppingsList = shoppingsList.filter(shopping=>shopping.provider_id == this.$route.params.provider_id)
            }
            return shoppingsList.map(id=>{
                return{
                    id:id.id,
                    date:id.date,
                    serie:id.serie,
                    provider_id: this.provider(id.provider_id),
                    invoice:id.invoice,
                    due_date:id.due_date,
                    notes:id.notes,
                    pdf:id.pdf,
                    xml:id.xml,
                    subtotal: this.detail(id.id),
                    total_paid: this.paid(id.provider_id, id.id),
                    created_by_user_id: this.salesman(id.created_by_user_id),
                    last_updated_by_user_id: this.salesman(id.last_updated_by_user_id),
                    created_at: id.created_at.slice(0, 10),
                    updated_at: id.updated_at.slice(0, 10),
                    received:id.received,
                    iva_percentage:id.iva_percentage,
                    isr_percentage:id.isr_percentage,
                }
            }).map(id=>{
                return{
                    id:id.id,
                    date:id.date,
                    serie:id.serie,
                    provider_id: id.provider_id,
                    invoice:id.invoice,
                    due_date:id.due_date,
                    notes:id.notes,
                    pdf:id.pdf,
                    xml:id.xml,
                    subtotal: id.subtotal,
                    created_by_user_id: id.created_by_user_id,
                    last_updated_by_user_id: id.last_updated_by_user_id,
                    created_at: id.created_at,
                    updated_at: id.updated_at,
                    iva: this.iva(id.subtotal, id.iva_percentage, id.serie),
                    isr: this.isr(id.subtotal, id.isr_percentage),
                    total_paid: id.total_paid,
                    received:id.received
                }
            }).map(id=>{
                return{
                    id:id.id,
                    date:id.date,
                    serie:id.serie,
                    provider_id: id.provider_id,
                    invoice:id.invoice,
                    due_date:id.due_date,
                    notes:id.notes,
                    pdf:id.pdf,
                    xml:id.xml,
                    subtotal: id.subtotal,
                    created_by_user_id: id.created_by_user_id,
                    last_updated_by_user_id: id.last_updated_by_user_id,
                    created_at: id.created_at,
                    updated_at: id.updated_at,
                    iva: id.iva,
                    isr: id.isr,
                    total: this.total(id.subtotal, id.iva, id.isr),
                    total_paid: id.total_paid,
                    received:id.received
                }
            }).map(id=>{
                return{
                    id:id.id,
                    date:id.date,
                    serie:id.serie,
                    provider_id: id.provider_id,
                    invoice:id.invoice,
                    due_date:id.due_date,
                    notes:id.notes,
                    pdf:id.pdf,
                    xml:id.xml,
                    subtotal: id.subtotal,
                    created_by_user_id: id.created_by_user_id,
                    last_updated_by_user_id: id.last_updated_by_user_id,
                    created_at: id.created_at,
                    updated_at: id.updated_at,
                    iva: id.iva,
                    isr: id.isr,
                    total: id.total,
                    total_paid: id.total_paid,
                    outstatnding_balance: (id.total*1) - (id.total_paid*1),
                    received:id.received
                }
            })
        },
    },
    created () {
        this.shoppings = this.shoppingsLists   
    },
    methods: {
        confirmReceived(item){
            this.received_shopping = item
            this.sheet2 = true
        },
        receivedShopping(){
            var id = this.received_shopping.id
            this.received_shopping.last_updated_by_user_id = this.currentUser.id
            axios.post(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/shopping/mark-as-read",Object.assign(this.received_shopping)).then(response=>{
                this.sheet2=false
                this.received_shopping=''
                this.shoppingsLists.filter(shopping=>shopping.id == id)[0].received = true
            }).catch(error => {
                this.snackbar = {
                    message: error.response.data.message,
                    color: 'error',
                    show: true
                }
                this.gris = false
            })
        },
        sumField(key) {//suma
            // sum data in give key (property)
            var suma=this.shoppings.reduce((a, b) => a + (b[key] || 0), 0)
            return suma.toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})
        },
        avgField(key){//primedio
            var suma=this.shoppings.reduce((a, b) => a + (b[key] || 0), 0)
            return (suma/this.shoppings.length).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})
        },
        paid(providerId, id){
            var shoppings = this.$store.state.provider_payment.provider_payments.filter(payments=>payments.provider_id == providerId).map(payments=>payments.shoppingsID)
            var sum = 0
            if(shoppings.length>0){
                var payments2 = []
                for(var i=0; i<shoppings.length; i++){
                    for(var j=0; j<shoppings[i].length; j++){
                        payments2 = payments2.concat(shoppings[i][j])
                    }
                }
                payments2 = payments2.filter(payment=>payment.id == id)
                for(var a=0; a<payments2.length; a++){
                    sum = sum + (payments2[a].amount*1)
                }
                return sum
            }else{
                return 0*1
            }
        },
        iva(amount, iva, serie){
            var response = 0
            if(iva==undefined || iva==0){
                if(serie=='Serie A'){
                response = amount*.16
                }else if(serie=='Serie B'){
                    response = 0
                }
            }else{
                response = (amount/100)*iva
            }
            return response
        },
        isr(amount, isr){
            if(isr!=undefined){
                return (amount/100)*isr
            }else{
                return 0
            }
            
        },
        total(amount, iva, isr){
            return amount + iva - isr
        },
        detail(id){
            var sum = 0
            var products = this.$store.state.shopping_detail.shopping_details.filter(shopping=>shopping.shopping_id == id)
            for(var i=0; i<products.length; i++){
                sum = sum + (products[i].unit_cost*products[i].quantity)
            }
            return sum
        },
        salesman(id){
            return this.$store.state.user.users.filter(user=>user.id == id).map(user=>user.name + ' ' + user.last)
        },
        provider(id){
            return this.$store.state.provider.providers.filter(provider=>provider.id == id)[0]
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
        filtersShopping: function(params) {
            this.shoppings = ''
            var filterShopping = this.$store.state.shopping.shoppings
            if(params.provider_id!=''&&params.provider_id!=undefined&&params.provider_id!=null){
                var uno = filterShopping.filter(shopping=>shopping.provider_id == params.provider_id[0])
                for(var i=1; i<params.provider_id.length; i++){
                    uno=uno.concat(filterShopping.filter(shopping=>shopping.provider_id == params.provider_id[i]))   
                }
                filterShopping = this.removeDuplicates(uno, "id");
            }


            if(params.paid!=''&&params.paid!=undefined&&params.paid!=null){
                if(params.paid == 'No'){
                    filterShopping=filterShopping.filter(shopping=>(
                        this.total(
                            this.detail(
                                shopping.id
                            ),
                            this.iva(
                                this.detail(
                                    shopping.id
                                ), 
                                shopping.iva_percentage, 
                                shopping.serie
                            ), 
                            this.isr(
                                this.detail(
                                    shopping.id
                                ), 
                                shopping.isr_percentage
                            )
                        ) - 
                        this.paid(
                            shopping.provider_id, shopping.id
                        )
                    ).toFixed(2) >0)
                }else if(params.paid == 'Si'){
                    filterShopping=filterShopping.filter(shopping=>(
                        this.total(
                            this.detail(
                                shopping.id
                            ),
                            this.iva(
                                this.detail(
                                    shopping.id
                                ), 
                                shopping.iva_percentage, 
                                shopping.serie
                            ), 
                            this.isr(
                                this.detail(
                                    shopping.id
                                ), 
                                shopping.isr_percentage
                            )
                        ) - 
                        this.paid(
                            shopping.provider_id, shopping.id
                        )
                    ).toFixed(2) <= 0)
                }
            }


            if(params.serie!=''&&params.serie!=undefined&&params.serie!=null){
                filterShopping=filterShopping.filter(shopping=>shopping.serie == params.serie) 
            }
            if(params.invoice!=''&&params.invoice!=undefined&&params.invoice!=null){
                filterShopping=filterShopping.filter(expense=>this.lowerCase(expense.invoice).includes(params.invoice.toLowerCase()))
            }

            if(params.dateFrom!='' && params.dateFrom!=null && params.dateFrom!=undefined){
                filterShopping=filterShopping.filter(shopping=>new Date(shopping.date) >= new Date(params.dateFrom))
            }
            if(params.dateTo!='' && params.dateTo!=null && params.dateTo!=undefined){
                filterShopping=filterShopping.filter(shopping=>new Date(shopping.date) <= new Date(params.dateTo))
            }
            if(params.expirationDateFrom!='' && params.expirationDateFrom!=null && params.expirationDateFrom!=undefined){
                filterShopping=filterShopping.filter(shopping=>new Date(shopping.due_date) >= new Date(params.expirationDateFrom))
            }
            if(params.expirationDateTo!='' && params.expirationDateTo!=null && params.expirationDateTo!=undefined){
                filterShopping=filterShopping.filter(shopping=>new Date(shopping.due_date) <= new Date(params.expirationDateTo))
            }
            
            if(params.notes!=''&&params.notes!=undefined&&params.notes!=null){
                filterShopping=filterShopping.filter(shopping=>this.lowerCase(shopping.notes).includes(params.notes.toLowerCase()))
            }
            this.shoppings = filterShopping.map(id=>{
                return{
                    id:id.id,
                    date:id.date,
                    serie:id.serie,
                    provider_id: this.provider(id.provider_id),
                    invoice:id.invoice,
                    due_date:id.due_date,
                    notes:id.notes,
                    pdf:id.pdf,
                    xml:id.xml,
                    subtotal: this.detail(id.id),
                    total_paid: this.paid(id.provider_id, id.id),
                    created_by_user_id: this.salesman(id.created_by_user_id),
                    last_updated_by_user_id: this.salesman(id.last_updated_by_user_id),
                    created_at: id.created_at.slice(0, 10),
                    updated_at: id.updated_at.slice(0, 10),
                    received:id.received,
                    iva_percentage:id.iva_percentage,
                    isr_percentage:id.isr_percentage,
                }
            }).map(id=>{
                return{
                    id:id.id,
                    date:id.date,
                    serie:id.serie,
                    provider_id: id.provider_id,
                    invoice:id.invoice,
                    due_date:id.due_date,
                    notes:id.notes,
                    pdf:id.pdf,
                    xml:id.xml,
                    subtotal: id.subtotal,
                    created_by_user_id: id.created_by_user_id,
                    last_updated_by_user_id: id.last_updated_by_user_id,
                    created_at: id.created_at,
                    updated_at: id.updated_at,
                    iva: this.iva(id.subtotal, (id.iva_percentage*1), id.serie),
                    isr: this.isr(id.subtotal, (id.isr_percentage*1)),
                    total_paid: id.total_paid,
                    received:id.received
                }
            }).map(id=>{
                return{
                    id:id.id,
                    date:id.date,
                    serie:id.serie,
                    provider_id: id.provider_id,
                    invoice:id.invoice,
                    due_date:id.due_date,
                    notes:id.notes,
                    pdf:id.pdf,
                    xml:id.xml,
                    subtotal: id.subtotal,
                    created_by_user_id: id.created_by_user_id,
                    last_updated_by_user_id: id.last_updated_by_user_id,
                    created_at: id.created_at,
                    updated_at: id.updated_at,
                    iva: id.iva,
                    isr: id.isr,
                    total: this.total(id.subtotal, id.iva, id.isr),
                    total_paid: id.total_paid,
                    received:id.received
                }
            }).map(id=>{
                return{
                    id:id.id,
                    date:id.date,
                    serie:id.serie,
                    provider_id: id.provider_id,
                    invoice:id.invoice,
                    due_date:id.due_date,
                    notes:id.notes,
                    pdf:id.pdf,
                    xml:id.xml,
                    subtotal: id.subtotal,
                    created_by_user_id: id.created_by_user_id,
                    last_updated_by_user_id: id.last_updated_by_user_id,
                    created_at: id.created_at,
                    updated_at: id.updated_at,
                    iva: id.iva,
                    isr: id.isr,
                    total: id.total,
                    total_paid: id.total_paid,
                    outstatnding_balance: (id.total*1) - (id.total_paid*1),
                    received:id.received
                }
            })
        },
        closeDialogEditShopping: function(params) {
            this.editDialog = false;
            this.$store.dispatch('shopping/getShoppings')
        },
        closeDialogCreateShopping: function(params) {
            this.createDialog = false;
            this.$store.dispatch('shopping/getShoppings')
        },
        exportExcel: function () {
            let data = XLSX.utils.json_to_sheet(this.shoppings)
            const workbook = XLSX.utils.book_new()
            const filename = 'Lista de Actividades'
            XLSX.utils.book_append_sheet(workbook, data, filename)
            XLSX.writeFile(workbook, `${filename}.xlsx`)
        },
        deleteShopping(){
            axios.delete(process.env.VUE_APP_BACKEND_ROUTE + "api/v1/shopping/delete/"+this.deleteId).then(response => {
                this.deleteId = ''
                this.sheet = false
                this.$store.dispatch('shopping/getShoppings')
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
            this.shopping = this.$store.state.shopping.shoppings.filter(shopping=>shopping.id == item.id)[0]
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