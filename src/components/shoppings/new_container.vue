<template>
    <v-container style="max-width:100vw;">
        <!-- Filtros -->
        <v-navigation-drawer style="top: 0px; max-height:100vh!important;" right v-model="filters" :clipped="$vuetify.breakpoint.lgAndUp" app>
            <filterShopping @filtersShopping="filtersShopping"/>
        </v-navigation-drawer>
        <!-- Contenedor -->
        <v-data-table 
            height="600"
            fixed-header
            :footer-props="{'items-per-page-options':[15, 30, 50, totalShoppings]}"
            v-if="showTable"
            class="elevation-0 px-6 pb-4 pt-10"
            :options.sync="options"
            :server-items-length="totalShoppings"
            :loading="loading"
            show-expand
            :headers="headers" 
            :items="shoppings">
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
                    <detail v-bind:shopping="{'details':item.shopping_details, 'received':item.received}" />
                </td>
                
            </template>
            <!-- link proveedor -->
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
            <!-- recibir compra-->
            <template v-slot:[`item.received`]="{ item }">
                <v-icon v-if="item.received!=true" @click="confirmReceived(item)">mdi-check-circle-outline</v-icon>
                <v-icon v-else color="primary">mdi-check-circle</v-icon>
            </template>
            <!-- MXN -->
            <!--template v-slot:[`item.subtotal`]="{ item }">
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
            </template-->
            <!-- Footer -->
            <template v-slot:footer>
                <v-container style="margin-bottom:-80px!important;">
                    <v-select :items="sumavg" v-model="totalType" style="width: 100px; display: inline-block; margin-right:30px; font-size: 14px;"></v-select>
                    <v-select :items="campos" v-model="campo" item-text="text" item-value="value" style="width: 100px; display: inline-block; margin-right:30px; font-size: 14px;"></v-select>
                    <strong v-if="totalType=='sum'">Total = </strong>
                    <strong v-if="totalType=='avg'">Promedio = </strong>
                </v-container>
            </template> 
        </v-data-table>
        <!-- Crear compra -->
        <v-dialog v-model="createDialog" max-width="700px">
          <template v-slot:activator="{ on, attrs }">
            <v-btn bottom color="#e25200" dark fab fixed right v-bind="attrs" v-on="on">
                <v-icon color="white">  mdi-plus </v-icon>
            </v-btn> 
          </template>
          <create @closeDialogCreateShopping="closeDialogCreateShopping"/>
        </v-dialog>
        <!-- Editar compra -->
        <v-dialog v-model="editDialog" max-width="700px">
          <edit v-bind:editedItem="shopping" @closeDialogEditShopping="closeDialogEditShopping"/>
        </v-dialog>
        <!-- Dialogo confirmación eliminación -->
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
        <!-- Dialogo alta de pacas -->
        <div class="text-center">
            <v-dialog  v-model="dialogReceived" inset width="700">
                <v-card class="pa-3">
                    <v-card-title>
                    Captura las pacas recibidas de la compra {{received_shopping.id}}
                    </v-card-title>
                    <v-row class="ma-0">
                        
                    </v-row>
                    <v-card-actions>
                        <v-spacer/>
                        <v-btn class="mt-4" text color="primary" @click="receivedShopping()">
                        Guardar
                        </v-btn>
                        <v-btn class="mt-4" text color="grey" @click="sheet2=false, received_shopping=''">
                        Cancelar
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </div>
        <!-- alertas -->
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
        showTable:true,
        loading: true,
        options: {},
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
        totalShoppings:0,
        sheet: false,
        dialogReceived:false,
        filters: false,
        editDialog: false,
        createDialog: false,
        deleteId:'',
        shoppings: [],
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
    },
    watch: {
        options: {
            handler () {
                this.getDataFromApi()
            },
            deep: true,
        }
    },
    methods: {
        getDataFromApi () {
                this.loading = true
                this.apiCall().then(data => {
                    this.shoppings = data.items
                    this.totalShoppings = data.total
                    this.loading = false
                })
            },
            apiCall () {
                return new Promise((resolve, reject) => {
                    this.filterStorageLength = localStorage.getItem('filtersShoppingsLength')
                    const { sortBy, sortDesc, page, itemsPerPage } = this.options
                    var items = []
                    var total = 0
                    var link = ''
                    if(this.$route.params.id!=undefined){
                        link = 'filter[company_id]=' + this.$route.params.id + '&'
                    }
                    if(localStorage.getItem('filtersShoppings')!=null){
                        link = link + JSON.parse(localStorage.getItem('filtersShoppings')) + '&'
                    }
                    axios.get(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/shoppings?" + link + "page=" + page + "&itemsPerPage=" + itemsPerPage).then(response => {
                        items = this.mapShoppings(response.data.data)
                        total = response.data.meta.total
                        if (sortBy.length === 1 && sortDesc.length === 1) {
                            if(sortDesc[0]){
                                axios
                                .get(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/shoppings?" + link + "page=" + page + "&sort=-" + sortBy[0] + "&itemsPerPage=" + itemsPerPage)
                                .then(response=>{
                                    items = this.mapShoppings(response.data.data)
                                    total = response.data.meta.total
                                    resolve({
                                        items,
                                        total,
                                    })
                                })
                            }else{
                                axios
                                .get(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/shoppings?" + link + "page=" + page + "&sort=" + sortBy[0] + "&itemsPerPage=" + itemsPerPage)
                                .then(response=>{
                                    items = this.mapShoppings(response.data.data)
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
            mapShoppings(shoppings){
                console.log(shoppings)
                return shoppings.map(id=>{
                    return{
                        id:id.id,
                        date:id.date,
                        serie:id.serie,
                        provider_id: id.provider,
                        invoice:id.invoice,
                        due_date:id.due_date,
                        notes:id.notes,
                        pdf:id.pdf,
                        xml:id.xml,
                        //subtotal: this.detail(id.id),
                        //total_paid: this.paid(id.provider_id, id.id),
                        created_by_user_id: id.created_by_user_id.name + ' ' + id.created_by_user_id.last,
                        last_updated_by_user_id: id.last_updated_by_user_id.name + ' ' + id.last_updated_by_user_id.last,
                        created_at: id.created_at.slice(0, 10),
                        updated_at: id.updated_at.slice(0, 10),
                        received:id.received,
                        //iva_percentage:id.iva_percentage,
                        //isr_percentage:id.isr_percentage,
                        shopping_details: id.shopping_details,
                        editedItem: id
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
                        //subtotal: id.subtotal,
                        created_by_user_id: id.created_by_user_id,
                        last_updated_by_user_id: id.last_updated_by_user_id,
                        created_at: id.created_at,
                        updated_at: id.updated_at,
                        //iva: this.iva(id.subtotal, id.iva_percentage, id.serie),
                        //isr: this.isr(id.subtotal, id.isr_percentage),
                        //total_paid: id.total_paid,
                        received:id.received,
                        shopping_details: id.shopping_details,
                        editedItem: id
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
                        //subtotal: id.subtotal,
                        created_by_user_id: id.created_by_user_id,
                        last_updated_by_user_id: id.last_updated_by_user_id,
                        created_at: id.created_at,
                        updated_at: id.updated_at,
                        //iva: id.iva,
                        //isr: id.isr,
                        //total: this.total(id.subtotal, id.iva, id.isr),
                        //total_paid: id.total_paid,
                        received:id.received,
                        shopping_details: id.shopping_details,
                        editedItem: id
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
                        //subtotal: id.subtotal,
                        created_by_user_id: id.created_by_user_id,
                        last_updated_by_user_id: id.last_updated_by_user_id,
                        created_at: id.created_at,
                        updated_at: id.updated_at,
                        //iva: id.iva,
                        //isr: id.isr,
                        //total: id.total,
                        //total_paid: id.total_paid,
                        //outstatnding_balance: (id.total*1) - (id.total_paid*1),
                        received:id.received,
                        shopping_details: id.shopping_details,
                        editedItem: id
                    }
                })
            },


        confirmReceived(item){
            this.received_shopping = item
            this.dialogReceived = true
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
        filtersShopping: function(params) {
            this.getDataFromApi()
        },
        closeDialogEditShopping: function(params) {
            this.editDialog = false;
            this.getDataFromApi()
        },
        closeDialogCreateShopping: function(params) {
            this.createDialog = false;
            this.getDataFromApi()
        },
        exportExcel: function () {
            let data = XLSX.utils.json_to_sheet(this.shoppings)
            const workbook = XLSX.utils.book_new()
            const filename = 'Lista de Actividades'
            XLSX.utils.book_append_sheet(workbook, data, filename)
            XLSX.writeFile(workbook, `${filename}.xlsx`)
        },
        deleteShopping(){
            axios.delete(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/shoppings/"+this.deleteId).then(response => {
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
        deleteItem (item) {
            this.deleteId = item.id
            this.sheet = true
        },
        editItem(item){
            this.shopping = item
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