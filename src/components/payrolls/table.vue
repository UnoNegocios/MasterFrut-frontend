<template>
    <v-container style="max-width:100vw;">
        <!-- Filtros -->
        <v-navigation-drawer style="top: 0px; max-height:100vh!important;" right v-model="filters" :clipped="$vuetify.breakpoint.lgAndUp" app>
            <filterPayrolls @filtersPayroll="filtersPayroll"/>
        </v-navigation-drawer>
        <!-- Contenedor -->
        <v-data-table :headers="headers" :items="payrolls" class="elevation-0 px-6 py-4">
            <!-- Header -->
            <template v-slot:top>
                <v-toolbar flat >
                    <v-toolbar-title>Nominas</v-toolbar-title>
                    <v-btn icon>
                        <v-icon @click="openFilter()">mdi-filter</v-icon>
                    </v-btn>
                    <v-spacer></v-spacer>
                    <v-btn icon v-show="permissions('download')">
                        <v-icon @click="exportExcel">mdi-download</v-icon>
                    </v-btn>
                    <v-btn icon v-show="permissions('printPayrolls')">
                        <v-icon @click="printPayrolls">mdi-printer</v-icon>
                    </v-btn>
                </v-toolbar>
            </template>
            <!-- Footer -->
            <template v-slot:footer>
                <v-container style="margin-bottom:-80px!important;">
                    <v-select :items="sumavg" v-model="totalType" style="width: 100px; display: inline-block; margin-right:30px; font-size: 14px;"></v-select>
                    <v-select :items="campos" v-model="campo" item-text="text" item-value="value" style="width: 100px; display: inline-block; margin-right:30px; font-size: 14px;"></v-select>
                    <strong v-if="totalType=='sum'">Total = {{ sumField() }}</strong>
                    <strong v-if="totalType=='avg'">Promedio = {{ avgField() }}</strong>
                </v-container>
            </template> 
            <!-- Acciones por fila -->
            <template v-slot:[`item.actions`]="{ item }">
                <v-menu bottom left >
                    <template v-slot:activator="{ on, attrs }">
                    <v-btn icon v-bind="attrs" v-on="on">
                        <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                    </template>
                    <v-list style="font-size:13px;">
                        <v-list-item @click="editItem(item.id)"  v-show="permissions('editPayrolls')">
                            <v-icon small class="mr-2">
                                mdi-pencil
                            </v-icon>
                            Editar
                        </v-list-item>
                        <v-list-item @click="deleteItem(item)"  v-show="permissions('deletePayrolls')">
                            <v-icon small class="mr-2">
                                mdi-delete
                            </v-icon>
                            Eliminar
                        </v-list-item>
                    </v-list>
                </v-menu>
            </template>

            <!-- dineros -->
            <template v-slot:[`item.total`]="{ item }">
                {{item.total.toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
            </template>
            <template v-slot:[`item.amount`]="{ item }">
                {{item.amount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
            </template>
            <template v-slot:[`item.imss`]="{ item }">
                {{item.imss.toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
            </template>

            
            <template v-slot:[`item.prima_vacacional`]="{ item }">
                {{item.prima_vacacional.toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
            </template>
            <template v-slot:[`item.holidays`]="{ item }">
                {{item.holidays.toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
            </template>
            <template v-slot:[`item.extra_time`]="{ item }">
                {{item.extra_time.toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
            </template>
            <template v-slot:[`item.infonavit`]="{ item }">
                {{item.infonavit.toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
            </template>
            <template v-slot:[`item.absence`]="{ item }">
                {{item.absence.toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
            </template>
            <template v-slot:[`item.loan`]="{ item }">
                {{item.loan.toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
            </template>
            <template v-slot:[`item.production_award`]="{ item }">
                {{item.production_award.toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
            </template>
            <template v-slot:[`item.punctuality_award`]="{ item }">
                {{item.punctuality_award.toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
            </template>
            <template v-slot:[`item.performance_award`]="{ item }">
                {{item.performance_award.toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
            </template>
            <template v-slot:[`item.daily_salary`]="{ item }">
                {{item.daily_salary.toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
            </template>


            <!-- Tabla sin información -->
            <template v-slot:no-data>
                No existen registros de nomina aún
            </template>
        </v-data-table>
        <!-- Crear actividad -->
        <v-dialog v-model="createDialog" max-width="700px">
          <template v-slot:activator="{ on, attrs }">
            <v-btn bottom color="#e25200" dark fab fixed right v-bind="attrs" v-on="on">
                <v-icon color="white">  mdi-plus </v-icon>
            </v-btn> 
          </template>
          <create @closeCreateDialogPayroll="closeCreateDialogPayroll"/>
        </v-dialog>
        <!-- Editar actividad -->
        <v-dialog v-model="editDialog" max-width="700px">
          <edit v-bind:payroll="payroll" @closeEditDialogPayroll="closeEditDialogPayroll"/>
        </v-dialog>
        <!-- Dialogo confirmación de eliminación -->
        <div class="text-center">
            <v-bottom-sheet  v-model="sheet" inset>
                <v-sheet class="text-center" height="150px">
                    <div class="pt-6">
                    ¿Seguro que deseas borrar esta nomina?
                    </div>
                    <v-btn class="mt-4" text color="error" @click="deletePayroll()">
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
import Filter from "../payrolls/filter"
import Create from "../payrolls/create"
import Edit from "../payrolls/edit"
export default {
    components: {
        'filterPayrolls':Filter,
        'create':Create,
        'edit':Edit,
    }, 
    data: () => ({
        payroll:'',
        sheet2: false,
        sheet: false,
        filters: false,
        editDialog: false,
        createDialog: false,
        deleteId:'',
        payrolls: '',
        snackbar: {
            show: false,
            message: null,
            color: null
        },
        totalType:'sum',
        sumavg:['sum', 'avg'],
        campo:'total',
        campos:[
            { text: 'Neto a Pagar', value: 'total'},
            { text: 'Monto', value: 'amount'},
            { text: 'IMSS', value: 'imss' },
            { text: 'Infonavit', value: 'infonavit' },
            { text: 'Faltas', value: 'absence' },
            { text: 'Tiempo Extra', value: 'extra_time' },
            { text: 'Premio Producción', value: 'production_award' },
            { text: 'Premio Puntualidad', value: 'punctuality_award' },
            { text: 'Premio Rendimiento', value: 'performance_award' },
        ],
    }),
    computed: {
        headers(){ 
            this.payrolls = this.payrollsLists
            return [
            { text: 'Fecha', value: 'date' },
            { text: 'Personal', value: 'user_id' },
            { text: 'Área', value: 'job_position' },
            { text: 'Puesto', value: 'sub_job_position'},
            { text: 'Sueldo Diario', value: 'daily_salary' },
            { text: 'Monto', value: 'amount' },
            { text: 'IMSS', value: 'imss' },
            { text: 'Infonavit', value: 'infonavit' },
            { text: 'Faltas', value: 'absence' },
            { text: 'Prestamo', value: 'loan' },
            { text: 'Prima Vacacional', value: 'prima_vacacional' },
            { text: 'Vacaciones', value: 'holidays' },
            { text: 'Tiempo Extra', value: 'extra_time' },
            { text: 'Premio Producción', value: 'production_award' },
            { text: 'Premio Puntualidad', value: 'punctuality_award' },
            { text: 'Premio Rendimiento', value: 'performance_award' },
            { text: 'Neto a Pagar', value: 'total' },
            { text: 'Notas', value: 'notes' },
            { text: 'Creación', value: 'created_at' },
            { text: 'Creador', value: 'created_by_user_id' },
            { text: 'Edición', value: 'updated_at' },
            { text: 'Editor', value: 'last_updated_by_user_id' },
            { value: 'actions', sortable: false, align: 'end', },
        ]},
        currentUser:{
            get(){
                return this.$store.state.currentUser.user;
            }
        },
        payrollsList(){
            return this.$store.state.payroll.payrolls
        },
        payrollsLists(){
            var payrolls = this.$store.state.payroll.payrolls
            payrolls = payrolls.map(id=>{
                return{
                    id:id.id,
                    imss:(id.imss*1),
                    infonavit:(id.infonavit*1),
                    extra_time:(id.extra_time*1),
                    production_award:(id.production_award*1),
                    punctuality_award:(id.punctuality_award*1),
                    performance_award:(id.performance_award*1),
                    loan:(id.loan*1),
                    prima_vacacional:(id.prima_vacacional*1),
                    holidays:(id.holidays*1),
                    absence:(id.absence*1),   
                    sum : ((id.extra_time*1)+(id.production_award*1)+(id.punctuality_award*1)+(id.performance_award*1)+(id.prima_vacacional*1)+(id.holidays*1)), 
                    rest: ((id.absence*1)+(id.infonavit*1)+(id.imss*1)+(id.loan*1)),            
                    daily_salary:(id.amount/30),
                    amount:(id.amount*1),
                    total: (id.amount+((id.extra_time*1)+(id.production_award*1)+(id.punctuality_award*1)+(id.performance_award*1)+(id.prima_vacacional*1)+(id.holidays*1))-((id.absence*1)+(id.infonavit*1)+(id.imss*1)+(id.loan*1))),
                    job_position:this.userRol(id.user_id),
                    sub_job_position:this.userSubRol(id.user_id),
                    date:id.date,
                    notes:id.notes,
                    created_by_user_id:this.userName(id.created_by_user_id),
                    last_updated_by_user_id:this.userName(id.last_updated_by_user_id),
                    user_id:this.userName(id.user_id),
                    created_at:new Date(id.created_at).toLocaleString("sv-SE", {timeZone: "America/Monterrey"}).split('T'),
                    updated_at:new Date(id.updated_at).toLocaleString("sv-SE", {timeZone: "America/Monterrey"}).split('T'),
                }
            });
            return payrolls
        },
    },
    methods: {
        sumField() {
            return this.payrolls.reduce((a, b) => a + ((b[this.campo]*1) || 0), 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})
        },
        avgField(){
            return (this.payrolls.reduce((a, b) => a + ((b[this.campo]*1) || 0), 0)/this.payrolls.length).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})
        },
        printPayrolls(){
            localStorage.setItem('nominas', JSON.stringify(this.payrolls));
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
        filtersPayroll: function(params) {
            var filterPayroll = this.payrollsList
            if(params.user_id!=''&&params.user_id!=undefined&&params.user_id!=null){
                var uno = filterPayroll.filter(payroll=>payroll.user_id == params.user_id[0])
                for(var i=1; i<params.user_id.length; i++){
                    uno=uno.concat(filterPayroll.filter(payroll=>payroll.user_id == params.user_id[i]))   
                }
                filterPayroll = this.removeDuplicates(uno, "id");
            }
            if(params.job_position!=''&&params.job_position!=undefined&&params.job_position!=null){
                var dos = filterPayroll.filter(payroll=>payroll.job_position == params.job_position[0])
                for(var i=1; i<params.job_position.length; i++){
                    dos=dos.concat(filterPayroll.filter(payroll=>payroll.job_position == params.job_position[i]))   
                }
                filterPayroll = this.removeDuplicates(dos, "id");
            }
            if(params.sub_job_position!=''&&params.sub_job_position!=undefined&&params.sub_job_position!=null){
                var tres = filterPayroll.filter(payroll=>payroll.sub_job_position == params.sub_job_position[0])
                for(var i=1; i<params.sub_job_position.length; i++){
                    tres=tres.concat(filterPayroll.filter(payroll=>payroll.sub_job_position == params.sub_job_position[i]))   
                }
                filterPayroll = this.removeDuplicates(tres, "id");
            }
            if(params.notes!='' && params.notes!=null && params.notes!=undefined){
                filterPayroll=filterPayroll.filter(payroll=>this.lowerCase(payroll.notes).includes(params.notes.toLowerCase()))
            }
            if(params.dateFrom!='' && params.dateFrom!=null && params.dateFrom!=undefined){
                filterPayroll=filterPayroll.filter(payroll=>new Date(payroll.date) >= new Date(params.dateFrom))
            }
            if(params.dateTo!='' && params.dateTo!=null && params.dateTo!=undefined){
                var dateTwo = new Date(new Date(params.dateTo).setDate(new Date(params.dateTo).getDate() + 1))
                filterPayroll=filterPayroll.filter(payroll=>new Date(payroll.date) <= dateTwo)
            }
            this.payrolls = filterPayroll.map(id=>{
                return{
                    id:id.id,
                    imss:(id.imss*1),
                    infonavit:(id.infonavit*1),
                    extra_time:(id.extra_time*1),
                    production_award:(id.production_award*1),
                    punctuality_award:(id.punctuality_award*1),
                    performance_award:(id.performance_award*1),
                    loan:(id.loan*1),
                    prima_vacacional:(id.prima_vacacional*1),
                    holidays:(id.holidays*1),
                    absence:(id.absence*1),   
                    sum : ((id.extra_time*1)+(id.production_award*1)+(id.punctuality_award*1)+(id.performance_award*1)+(id.prima_vacacional*1)+(id.holidays*1)), 
                    rest: ((id.absence*1)+(id.infonavit*1)+(id.imss*1)+(id.loan*1)),            
                    daily_salary:(id.amount/30),
                    amount:(id.amount*1),
                    total: (id.amount+((id.extra_time*1)+(id.production_award*1)+(id.punctuality_award*1)+(id.performance_award*1)+(id.prima_vacacional*1)+(id.holidays*1))-((id.absence*1)+(id.infonavit*1)+(id.imss*1)+(id.loan*1))),
                    job_position:this.userRol(id.user_id),
                    sub_job_position:this.userSubRol(id.user_id),
                    date:id.date,
                    notes:id.notes,
                    created_by_user_id:this.userName(id.created_by_user_id),
                    last_updated_by_user_id:this.userName(id.last_updated_by_user_id),
                    user_id:this.userName(id.user_id),
                    created_at:new Date(id.created_at).toLocaleString("sv-SE", {timeZone: "America/Monterrey"}).split('T'),
                    updated_at:new Date(id.updated_at).toLocaleString("sv-SE", {timeZone: "America/Monterrey"}).split('T'),
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
        closeEditDialogPayroll: function(params) {
            this.editDialog = false;
            this.$store.dispatch('payroll/getPayrolls')
        },
        closeCreateDialogPayroll: function(params) {
            this.createDialog = false;
            this.$store.dispatch('payroll/getPayrolls')
        },
        exportExcel: function () {
            let data = XLSX.utils.json_to_sheet(this.payrolls)
            const workbook = XLSX.utils.book_new()
            const filename = 'Lista de Cobranzas'
            XLSX.utils.book_append_sheet(workbook, data, filename)
            XLSX.writeFile(workbook, `${filename}.xlsx`)
        },
        deletePayroll(){
            axios.delete(process.env.VUE_APP_BACKEND_ROUTE + "api/v1/payroll/delete/"+this.deleteId).then(response => {
                this.deleteId = ''
                this.sheet = false
                this.$store.dispatch('payroll/getPayrolls')
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
            this.payroll = this.payrollsList.filter(payroll=>payroll.id == id)[0]
            this.editDialog = true
        },
        userName(id){
            return this.$store.state.user.users.filter(user=>user.id == id).map(user => user.name + ' ' + user.last)[0]
        },
        userRol(id){
            return this.$store.state.user.users.filter(user=>user.id == id).map(user => user.job_position)[0]
        },
        userSubRol(id){
            return this.$store.state.user.users.filter(user=>user.id == id).map(user => user.sub_job_position)[0]
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