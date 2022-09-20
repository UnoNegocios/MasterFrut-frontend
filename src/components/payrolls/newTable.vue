<template>
    <v-container class="pa-4">
        <!-- Filtros -->
        <v-navigation-drawer style="top: 0px; max-height:100vh!important;" right v-model="filters" :clipped="$vuetify.breakpoint.lgAndUp" app>
            <filterPayrolls @filtersPayroll="filtersPayroll"/>
        </v-navigation-drawer>
        <!-- Totalizadores -->
        <totals/>
        <!-- Tabla -->
        <v-data-table
         class="pa-4"
        :items="payrolls" 
        :headers="header"
        :footer-props="{'items-per-page-options':[15, 30, 50, totalPayrolls]}"
        :options.sync="options"
        :server-items-length="totalPayrolls"
        :loading="loading">
            <!-- Header -->
            <template v-slot:top>
                <v-toolbar flat >
                    <v-toolbar-title>Nominas</v-toolbar-title>
                    <v-btn icon class="ml-6 pt-2" v-if="filterStorageLength== undefined" @click="openFilter()">
                        <v-icon>mdi-filter</v-icon>
                    </v-btn>
                    <v-btn icon class="ml-6" v-else @click="openFilter()">
                        <v-badge overlap color="primary">
                            <template v-slot:badge>
                                {{filterStorageLength}}
                            </template>
                            <v-icon>mdi-filter</v-icon>
                        </v-badge>
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
            <!-- Tabla sin información -->
            <template v-slot:no-data>
                No existen registros de nomina aún
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
            <!-- Acciones por fila -->
            <template v-slot:[`item.actions`]="{ item }">
                <v-menu bottom left >
                    <template v-slot:activator="{ on, attrs }">
                    <v-btn icon v-bind="attrs" v-on="on">
                        <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                    </template>
                    <v-list style="font-size:13px;">
                        <v-list-item @click="editItem(item.editedItem)"  v-show="permissions('editPayrolls')">
                            <v-icon small class="mr-2">
                                mdi-pencil
                            </v-icon>
                            Editar
                        </v-list-item>
                        <v-list-item @click="deleteItem(item.id)"  v-show="permissions('deletePayrolls')">
                            <v-icon small class="mr-2">
                                mdi-delete
                            </v-icon>
                            Eliminar
                        </v-list-item>
                    </v-list>
                </v-menu>
            </template>
        </v-data-table>
        <!-- Crear -->
        <v-dialog v-model="createDialog" max-width="700px">
          <template v-slot:activator="{ on, attrs }">
            <v-btn bottom color="#e25200" dark fab fixed right v-bind="attrs" v-on="on">
                <v-icon color="white">  mdi-plus </v-icon>
            </v-btn> 
          </template>
          <create @closeCreateDialogPayroll="closeCreateDialogPayroll"/>
        </v-dialog>
        <!-- Editar -->
        <v-dialog v-model="editDialog" max-width="700px">
          <edit v-bind:payroll="payroll" @closeEditDialogPayroll="closeEditDialogPayroll"/>
        </v-dialog>
        <!-- Eliminar -->
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
        <!-- errores -->
        <v-snackbar :color="snackbar.color" v-model="snackbar.show">
            {{ snackbar.message }}
        </v-snackbar>
    </v-container>
</template>

<script>
import Totals from "../payrolls/totals"
import axios from "axios";
import XLSX from 'xlsx';
import Filter from "../payrolls/filter"
import Create from "../payrolls/create"
import Edit from "../payrolls/edit"
export default {
    components: {
        'totals':Totals,
        'filterPayrolls':Filter,
        'create':Create,
        'edit':Edit,
    }, 
    data: () => ({
        filters:false,
        totalPayrolls: 0,
        payrolls: [],
        payroll:{},
        loading: true,
        options: {},
        sheet: false,
        editDialog: false,
        createDialog: false,
        deleteId:'',
        snackbar: {
            show: false,
            message: null,
            color: null
        },
        filterStorageLength:0
    }),
    computed:{
        header(){ return [
            { text: 'Fecha', value: 'date' },
            { text: 'Personal', value: 'user_id', sortable: false},
            { text: 'Área', value: 'job_position', sortable: false},
            { text: 'Puesto', value: 'sub_job_position', sortable: false},
            { text: 'Sueldo Diario', value: 'daily_salary', sortable: false},
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
            { text: 'Neto a Pagar', value: 'total', sortable: false},
            { text: 'Notas', value: 'notes', sortable: false},
            { text: 'Creación', value: 'created_at' },
            { text: 'Creador', value: 'created_by_user_id', sortable: false},
            { text: 'Edición', value: 'updated_at' },
            { text: 'Editor', value: 'last_updated_by_user_id', sortable: false},
            { value: 'actions', sortable: false, align: 'end', }
        ]},
        currentUser:{
            get(){
                return this.$store.state.currentUser.user;
            }
        },
    },
    watch: {
        options: {
            handler () {
                this.getDataFromApi()
            },
            deep: true,
        },
    },
    methods:{
        getDataFromApi () {
            this.loading = true
            this.apiCall().then(data => {
                this.payrolls = data.payrolls
                this.totalPayrolls = data.total
                this.loading = false
            })
        },
        apiCall () {
            return new Promise((resolve, reject) => {
                this.filterStorageLength = localStorage.getItem('filtersPayrollsLength')
                const { sortBy, sortDesc, page, itemsPerPage } = this.options
                var payrolls = []
                var total = 0
                var link = ''
                if(localStorage.getItem('filtersPayroll')!=null){
                    link = link + JSON.parse(localStorage.getItem('filtersPayroll'))+'&'
                }
                if(sortBy.length === 1){
                    console.log(sortDesc)
                    if(sortDesc[0]){
                        link = link + "sort=-" + sortBy[0] + '&'
                    }else{
                        link = link + "sort=" + sortBy[0] + '&'
                    }
                }
                axios.get(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/payrolls?" + link + "page=" + page + "&itemsPerPage=" + itemsPerPage).then(response => {
                    payrolls = this.mapPayrolls(response.data.data)
                    total = total = response.data.meta.total
                    resolve({
                        payrolls,
                        total,
                    })
                })
            })
        },
        mapPayrolls(payrolls){
            return payrolls.map(id=>{
                return{
                    id:id.id,
                    imss:((id.imss*1)*1),
                    infonavit:((id.infonavit*1)*1),
                    extra_time:((id.extra_time*1)*1),
                    production_award:((id.production_award*1)*1),
                    punctuality_award:((id.punctuality_award*1)*1),
                    performance_award:((id.performance_award*1)*1),
                    loan:((id.loan*1)*1),
                    prima_vacacional:((id.prima_vacacional*1)*1),
                    holidays:((id.holidays*1)*1),
                    absence:((id.absence*1)*1),   
                    sum : (((id.extra_time*1)+(id.production_award*1)+(id.punctuality_award*1)+(id.performance_award*1)+(id.prima_vacacional*1)+(id.holidays*1))*1), 
                    rest: (((id.absence*1)+(id.infonavit*1)+(id.imss*1)+(id.loan*1))*1),            
                    daily_salary:((id.amount/30)*1),
                    amount:((id.amount*1)*1),
                    total: ((id.amount+((id.extra_time*1)+(id.production_award*1)+(id.punctuality_award*1)+(id.performance_award*1)+(id.prima_vacacional*1)+(id.holidays*1))-((id.absence*1)+(id.infonavit*1)+(id.imss*1)+(id.loan*1)))*1),
                    job_position:id.user.job_position,
                    sub_job_position:id.user.sub_job_position,
                    date:id.date,
                    notes:id.notes,
                    created_by_user_id:this.userName(id.created_by_user_id),
                    last_updated_by_user_id:this.userName(id.last_updated_by_user_id),
                    user_id:this.userName(id.user),
                    created_at:id.created_at,
                    updated_at:id.updated_at,
                    editedItem:[id].map(id=>{
                        return{
                            id:id.id,
                            date:id.date,
                            user_id:id.user.id*1,
                            imss:id.imss,
                            infonavit:id.infonavit,
                            amount:id.amount,
                            extra_time:id.extra_time,
                            production_award:id.production_award,
                            punctuality_award:id.punctuality_award,
                            performance_award:id.performance_award,
                            absence:id.absence,
                            loan:id.loan,
                            prima_vacacional:id.prima_vacacional,
                            holidays:id.holidays,
                            notes:id.notes
                        }
                    })[0]
                }
            })
        },
        userName(user){
            var name = user.name
            if(user.last!=null){
                return name + ' ' + user.last
            }else{
                return name
            }
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
        filtersPayroll: function(params) {
            this.getDataFromApi()
        },
        closeEditDialogPayroll: function(params) {
            this.editDialog = false;
            this.getDataFromApi()
        },
        closeCreateDialogPayroll: function(params) {
            this.createDialog = false;
            this.getDataFromApi()
        },
        exportExcel: function () {
            let data = XLSX.utils.json_to_sheet(this.payrolls)
            const workbook = XLSX.utils.book_new()
            const filename = 'Lista de Nominas'
            XLSX.utils.book_append_sheet(workbook, data, filename)
            XLSX.writeFile(workbook, `${filename}.xlsx`)
        },
        deletePayroll(){
            axios.delete(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/payrolls/"+this.deleteId).then(response => {
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
        editItem(editedItem){
            this.payroll = editedItem
            this.editDialog = true
        },
    },
}
</script>


