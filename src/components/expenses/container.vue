<template>
    <v-container style="max-width:100vw;">
        <!-- Filtros -->
        <v-navigation-drawer style="top: 0px; max-height:100vh!important;" right v-model="filters" :clipped="$vuetify.breakpoint.lgAndUp" app>
            <filterExpense @filtersExpense="filtersExpense"/>
        </v-navigation-drawer>
        <!-- Contenedor -->
        <v-data-table :headers="headers" :items="expenses" class="elevation-0 px-6 py-4">
            <!-- Header -->
            <template v-slot:top>
                <v-toolbar flat >
                    <v-toolbar-title>Gastos</v-toolbar-title>
                    <v-btn icon>
                        <v-icon @click="openFilter">mdi-filter</v-icon>
                    </v-btn>
                    <v-spacer></v-spacer>
                    <v-btn icon v-show="permissions('download')">
                        <v-icon @click="exportExcel">mdi-download</v-icon>
                    </v-btn>
                </v-toolbar>
            </template>

            <template v-slot:[`item.amount`]="{ item }">
                {{ (item.amount*1).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',}) }} 
            </template>


            <template v-slot:[`item.paid`]="{ item }">
                 <v-icon @click="pagar(item.id,0)" v-if="(item.paid)" color="green"> mdi-check </v-icon>
                <v-icon @click="pagar(item.id,1)" v-else color="red"> mdi-close </v-icon>
            </template >


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
                <v-menu bottom left v-if="permissions('editExpenses')==true || permissions('deleteExpenses')==true">
                    <template v-slot:activator="{ on, attrs }">
                    <v-btn icon v-bind="attrs" v-on="on">
                        <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                    </template>
                    <v-list style="font-size:13px;">
                        <v-list-item @click="editItem(item)" v-show="permissions('editExpenses')">
                            <v-icon small class="mr-2">
                                mdi-pencil
                            </v-icon>
                            Editar
                        </v-list-item>
                        <v-list-item @click="deleteItem(item)" v-show="permissions('deleteExpenses')">
                            <v-icon small class="mr-2">
                                mdi-delete
                            </v-icon>
                            Eliminar
                        </v-list-item>
                    </v-list>
                </v-menu>
            </template>
            <!-- Creación -->
            <template v-slot:[`item.pdf`]="{ item }">
                <v-btn v-bind:href="liga + 'files/' + item.pdf" target="_blank" icon>
                    <v-icon v-if="item.pdf!=undefined">mdi-download-circle</v-icon>
                </v-btn>
            </template>
            <!-- Tabla sin información -->
            <template v-slot:no-data>
                No existen registros de gastos aún
            </template>
        </v-data-table>
        <!-- Crear gasto -->
        <v-dialog v-model="createDialog" max-width="900px">
          <template v-slot:activator="{ on, attrs }">
            <v-btn bottom color="#e25200" dark fab fixed right v-bind="attrs" v-on="on">
                <v-icon color="white">  mdi-plus </v-icon>
            </v-btn> 
          </template>
          <create @closeDialogCreateExpense="closeDialogCreateExpense"/>
        </v-dialog>
        <!-- Editar gasto -->
        <v-dialog v-model="editDialog" max-width="900px">
          <edit v-bind:editedItem="expense" @closeDialogEditExpense="closeDialogEditExpense"/>
        </v-dialog>
        <!-- Dialogo confirmación -->
        <div class="text-center">
            <v-bottom-sheet  v-model="sheet" inset>
                <v-sheet class="text-center" height="150px">
                    <div class="pt-6">
                    ¿Seguro que deseas borrar este gasto?
                    </div>
                    <v-btn class="mt-4" text color="error" @click="deleteExpense()">
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
                <v-sheet class="text-center" height="120px">
                    <v-row class="pt-6">
                        <v-col class="pt-0" cols="12" sm="6" md="1">
                        </v-col>
                        <v-col class="pt-0" cols="12" sm="6" md="4">
                            <v-autocomplete clearable v-model="editedItem.payment_method_id" :items="methodList" label="Metodo de Pago" item-text="method" item-value="id">
                                <template slot="no-data"><div class="px-4 py-1">No existen metodos relacionados.</div></template>                      
                            </v-autocomplete>
                        </v-col>
                        <v-col class="pt-0" cols="12" sm="6" md="4">
                            <v-menu v-model="datePicker" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px" >
                                <template v-slot:activator="{ on }">
                                    <v-text-field :rules="[v => !!v || 'Campo requerido']" clearable required v-model="editedItem.payment_date" label="Fecha de Pago" prepend-icon="mdi-calendar" readonly v-on="on"></v-text-field>
                                </template>
                                <v-date-picker color="primary" v-model="editedItem.payment_date" @input="datePicker = false"></v-date-picker>
                            </v-menu>
                        </v-col>
                        <v-col class="pt-0" cols="12" sm="6" md="2">
                            <v-btn color="blue darken-1" class="mt-4" text @click="payExpense()" :loading="gris" :disabled="gris || editedItem.payment_date==undefined||editedItem.payment_date==null||editedItem.payment_date==''||editedItem.payment_method_id==undefined||editedItem.payment_method_id==null||editedItem.payment_method_id==''">Guardar</v-btn>
                        </v-col>
                        <v-col class="pt-0" cols="12" sm="6" md="1">
                        </v-col>
                    </v-row>
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
import FilterExpense from "../expenses/filter"
import Create from "../expenses/create"
import Edit from "../expenses/edit"
export default {
    components: {
        'filterExpense':FilterExpense,
        'create':Create,
        'edit':Edit,
    }, 
    data: () => ({
        gris:false,
        campo:'amount',
        campos:[
            { text: 'Monto', value: 'amount' },
        ],
        totalType:'sum',
        sumavg:['sum', 'avg'],
        expense:'',
        sheet: false,
        sheet2: false,
        datePicker:false,
        filters: false,
        editDialog: false,
        createDialog: false,
        deleteId:'',
        expenses: '',
        snackbar: {
            show: false,
            message: null,
            color: null
        },
        editedItem:'',
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
            this.expenses = this.expensesLists
            return [
            { text: 'Concepto', value: 'concept' },
            { text: 'Tipo de Gasto', value: 'type' },
            { text: 'Proveedor', value: 'provider_id' },
            { text: 'Serie', value: 'serie' },
            { text: 'Metodo de Pago', value: 'payment_method_id' },
            { text: 'Monto', value: 'amount' },
            { text: 'Fecha', value: 'date' },
            { text: 'Factura', value: 'invoice' },
            { text: 'Vencimiento', value: 'due_date' },
            { text: 'Pago', value: 'payment_date' },
            { text: 'Pagada', value: 'paid' },
            { text: 'Notas', value: 'notes' },
            { text: 'PDF', value: 'pdf' },
            { text: 'Creación', value: 'created_at' },
            { text: 'Creador', value: 'created_by_user_id' },
            { text: 'Edición', value: 'updated_at' },
            { text: 'Editor', value: 'last_updated_by_user_id' },
            { value: 'actions', sortable: false, align: 'end', },
        ]},
        expensesLists(){
            return this.$store.state.expense.expenses.map(id=>{
                return{
                    id:id.id,
                    concept: id.concept,
                    type: this.expenseType(id.type),
                    provider_id: this.provider(id.provider_id),
                    serie: id.serie,
                    payment_method_id: this.method(id.payment_method_id),
                    amount: id.amount,//.toLocaleString('es-MX', { style: 'currency', currency: 'MXN',}),
                    date: id.date,
                    invoice: id.invoice,
                    due_date: id.due_date,
                    payment_date: id.payment_date,
                    paid: id.paid,
                    notes: id.notes,
                    pdf: id.pdf,
                    created_by_user_id: this.salesman(id.created_by_user_id),
                    last_updated_by_user_id: this.salesman(id.last_updated_by_user_id),
                    created_at: id.created_at.slice(0, 10),
                    updated_at: id.updated_at.slice(0, 10)
                }
            });
        },
        methodList:{
            get(){
                return this.$store.state.payment_method.payment_methods
            }
        },
    },
    created () {
        this.expenses = this.expensesLists   
    },
    methods: {
        pagar(id){
            this.editedItem = this.$store.state.expense.expenses.filter(expense=>expense.id == id)[0]
            this.sheet2 = true
        },
        sumField(key) {//suma
            // sum data in give key (property)
            var suma=this.expenses.reduce((a, b) => a + (b[key] || 0), 0)
            return suma.toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})
        },
        avgField(key){//primedio
            var suma=this.expenses.reduce((a, b) => a + (b[key] || 0), 0)
            return (suma/this.expenses.length).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})
        },
        salesman(id){
            return this.$store.state.user.users.filter(user=>user.id == id).map(user=>user.name + ' ' + user.last)
        },
        method(id){
            return this.$store.state.payment_method.payment_methods.filter(method=>method.id == id).map(method=>method.method)[0]
        },
        provider(id){
            return this.$store.state.provider.providers.filter(provider=>provider.id == id).map(provider=>provider.name)[0]
        },
        expenseType(id){
            return this.$store.state.expense_type.expense_types.filter(type=>type.id == id).map(type=>type.name)[0]
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
        filtersExpense: function(params) {
            this.expenses = ''
            var filterExpense = this.$store.state.expense.expenses

            if(params.user_id!=''&&params.user_id!=undefined&&params.user_id!=null){
                var uno = filterExpense.filter(expense=>expense.user_id == params.user_id[0])
                for(var i=1; i<params.user_id.length; i++){
                    uno=uno.concat(filterExpense.filter(expense=>expense.user_id == params.user_id[i]))   
                }
                filterExpense = this.removeDuplicates(uno, "id");
            }
            if(params.pay!=''&&params.pay!=undefined&&params.pay!=null){
                filterExpense = filterExpense.filter(expense=>this.sino(expense.paid, params.pay))
            }
            if(params.type_id!=''&&params.type_id!=undefined&&params.type_id!=null){
                var dos = filterExpense.filter(expense=>expense.type == params.type_id[0])
                for(var i=1; i<params.type_id.length; i++){
                    dos=dos.concat(filterExpense.filter(expense=>expense.type == params.type_id[i]))   
                }
                filterExpense = this.removeDuplicates(dos, "id");
            }
            if(params.provider_id!=''&&params.provider_id!=undefined&&params.provider_id!=null){
                var tres = filterExpense.filter(expense=>expense.provider_id == params.provider_id[0])
                for(var i=1; i<params.provider_id.length; i++){
                    tres=tres.concat(filterExpense.filter(expense=>expense.provider_id == params.provider_id[i]))   
                }
                filterExpense = this.removeDuplicates(tres, "id");
            }
            if(params.serie!=''&&params.serie!=undefined&&params.serie!=null){
                var cuatro = filterExpense.filter(expense=>expense.serie == params.serie[0])
                for(var i=1; i<params.serie.length; i++){
                    cuatro=cuatro.concat(filterExpense.filter(expense=>expense.serie == params.serie[i]))   
                }
                filterExpense = this.removeDuplicates(cuatro, "id");
            }
            if(params.payment_method_id!=''&&params.payment_method_id!=undefined&&params.payment_method_id!=null){
                var cinco = filterExpense.filter(expense=>expense.payment_method_id == params.payment_method_id[0])
                for(var i=1; i<params.payment_method_id.length; i++){
                    cinco=cinco.concat(filterExpense.filter(expense=>expense.payment_method_id == params.payment_method_id[i]))   
                }
                filterExpense = this.removeDuplicates(cinco, "id");
            }
            if(params.description!=''&&params.description!=undefined&&params.description!=null){
                filterExpense=filterExpense.filter(expense=>this.lowerCase(expense.notes).includes(params.description.toLowerCase()))
            }

            if(params.concept!=''&&params.concept!=undefined&&params.concept!=null){
                filterExpense=filterExpense.filter(expense=>this.lowerCase(expense.concept).includes(params.concept.toLowerCase()))
            }

            if(params.invoice!=''&&params.invoice!=undefined&&params.invoice!=null){
                filterExpense=filterExpense.filter(expense=>this.lowerCase(expense.invoice).includes(params.invoice.toLowerCase()))
            }

            if(params.dateFrom!='' && params.dateFrom!=null && params.dateFrom!=undefined){
                filterExpense=filterExpense.filter(expense=>new Date(expense.date) >= new Date(params.dateFrom))
            }
            if(params.dateTo!='' && params.dateTo!=null && params.dateTo!=undefined){
                filterExpense=filterExpense.filter(expense=>new Date(expense.date) <= new Date(params.dateTo))
            }

            if(params.expirationDateFrom!='' && params.expirationDateFrom!=null && params.expirationDateFrom!=undefined){
                filterExpense=filterExpense.filter(expense=>new Date(expense.due_date) >= new Date(params.expirationDateFrom))
            }
            if(params.expirationDateTo!='' && params.expirationDateTo!=null && params.expirationDateTo!=undefined){
                filterExpense=filterExpense.filter(expense=>new Date(expense.due_date) <= new Date(params.expirationDateTo))
            }

            if(params.payDateFrom!='' && params.payDateFrom!=null && params.payDateFrom!=undefined){
                filterExpense=filterExpense.filter(expense=>new Date(expense.payment_date) >= new Date(params.payDateFrom))
            }
            if(params.payDateTo!='' && params.payDateTo!=null && params.payDateTo!=undefined){
                filterExpense=filterExpense.filter(expense=>new Date(expense.payment_date) <= new Date(params.payDateTo))
            }


    
            this.expenses = filterExpense.map(id=>{
                return{
                    id:id.id,
                    concept: id.concept,
                    type: this.expenseType(id.type),
                    provider_id: this.provider(id.provider_id),
                    serie: id.serie,
                    payment_method_id: this.method(id.payment_method_id),
                    amount: id.amount,//.toLocaleString('es-MX', { style: 'currency', currency: 'MXN',}),
                    date: id.date,
                    invoice: id.invoice,
                    due_date: id.due_date,
                    payment_date: id.payment_date,
                    paid: id.paid,
                    notes: id.notes,
                    pdf: id.pdf,
                    created_by_user_id: this.salesman(id.created_by_user_id),
                    last_updated_by_user_id: this.salesman(id.last_updated_by_user_id),
                    created_at: id.created_at.slice(0, 10),
                    updated_at: id.updated_at.slice(0, 10)
                }
            });
        },
        closeDialogEditExpense: function(params) {
            this.editDialog = false;
            this.$store.dispatch('expense/getExpenses')
        },
        closeDialogCreateExpense: function(params) {
            this.createDialog = false;
            this.$store.dispatch('expense/getExpenses')
        },
        exportExcel: function () {
            let data = XLSX.utils.json_to_sheet(this.expenses)
            const workbook = XLSX.utils.book_new()
            const filename = 'Lista de Actividades'
            XLSX.utils.book_append_sheet(workbook, data, filename)
            XLSX.writeFile(workbook, `${filename}.xlsx`)
        },
        deleteExpense(){
            axios.delete(process.env.VUE_APP_BACKEND_ROUTE + "api/v1/expense/delete/"+this.deleteId).then(response => {
                this.deleteId = ''
                this.sheet = false
                this.$store.dispatch('expense/getExpenses')
            }).catch(error => {
                this.snackbar = {
                    message: error.response.data.message,
                    color: 'error',
                    show: true
                }
            });
        },
        payExpense(){
            this.editedItem.paid = true
            this.gris = true
            this.editedItem.last_updated_by_user_id = this.currentUser.id
            this.$nextTick(() => {
                axios.put(process.env.VUE_APP_BACKEND_ROUTE + "api/v1/expense/update",Object.assign(this.editedItem)).then(response=>{
                    this.gris = false
                    this.sheet2 = false
                    this.editedItem = ''
                }).catch(error => {
                    this.snackbar = {
                        message: error.response.data.message,
                        color: 'error',
                        show: true
                    }
                    this.gris = false
                })
            })
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
            this.expense = this.$store.state.expense.expenses.filter(expense=>expense.id == item.id)[0]
            this.editDialog = true
        },
        sino(item, param){
            if(param == 'perro'){
                if(item == true){
                    return false
                }else{
                    return true
                }
            }else{
                return (item == param)
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
</style>