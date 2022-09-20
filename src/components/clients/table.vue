<template>
    <v-container style="max-width:100vw;">
        <!-- Filtros -->
        <v-navigation-drawer style="top: 0px; max-height:100vh!important;" right v-model="filters" :clipped="$vuetify.breakpoint.lgAndUp" app>
                <filterClients @filtersCompanies="filtersCompanies"/>
        </v-navigation-drawer>
        <!-- Contenedor -->
        <v-data-table v-if="renderComponent" :headers="headers" :items="companies" class="elevation-0 px-6 py-4">
            <!-- Header -->
            <template v-slot:top>
                <v-toolbar flat >
                    <v-toolbar-title>Clientes</v-toolbar-title>
                    <v-btn icon>
                        <v-icon @click="openFilter()">mdi-filter</v-icon>
                    </v-btn>
                    <v-spacer></v-spacer>
                    <v-btn icon v-show="permissions('download')">
                        <v-icon @click="exportExcel">mdi-download</v-icon>
                    </v-btn>
                </v-toolbar>
            </template>
            <!-- Acciones por fila -->
            <template v-slot:[`item.actions`]="{ item }">
                <v-menu bottom left v-if="permissions('editCompanies')==true || permissions('deleteCompanies')==true">
                    <template v-slot:activator="{ on, attrs }">
                    <v-btn icon v-bind="attrs" v-on="on">
                        <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                    </template>
                    <v-list style="font-size:13px;">
                        <v-list-item @click="editItem(item)" v-show="permissions('editCompanies')">
                            <v-icon small class="mr-2">
                                mdi-pencil
                            </v-icon>
                            Editar
                        </v-list-item>
                        <v-list-item @click="deleteItem(item)" v-show="permissions('editCompanies')">
                            <v-icon small class="mr-2">
                                mdi-delete
                            </v-icon>
                            Eliminar
                        </v-list-item>

                    </v-list>
                </v-menu>
            </template>
            <!-- Rango de Consumo -->
            <template v-slot:[`item.phase`]="{ item }">
                <v-menu offset-y>
                    <template v-slot:activator="{ on, attrs }" >
                        <v-chip v-bind="attrs" v-on="on" outlined class="pa-2" small :color="colorPhase(item.phase)">{{item.phase}}</v-chip>
                    </template>
                    <v-list>
                        <v-list-item v-for="(phase,index) in phasesLists" :key="index" > <!--  -->
                            <v-list-item-content class="pa-0">
                                <v-list-item-title><v-btn @click="changePhase(item.id, phase.id)" small text>{{phase.name}}</v-btn></v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>   
                    </v-list>
                </v-menu>
            </template >
            <!-- Estatus -->
            <template v-slot:[`item.status`]="{ item }">
                <v-menu offset-y>
                    <template v-slot:activator="{ on, attrs }" >
                        <v-chip  v-bind="attrs" v-on="on" class="pa-2" small :style="{'background':'linear-gradient(0deg, rgb(255 255 255 / 85%), rgb(255 255 255 / 85%)) rgb(0, 198, 255)', 'background-color':colorStatus(item.status), 'color':colorStatus(item.status)}">{{item.status}}</v-chip>
                    </template>
                    <v-list>
                        <v-list-item v-for="(status,index) in statusesLists" :key="index" > <!--  -->
                            <v-list-item-content class="pa-0">
                                <v-list-item-title><v-btn @click="changeStatus(item.id, status.id)" small text>{{status.name}}</v-btn></v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>   
                    </v-list>
                </v-menu>
            </template >

            <template v-slot:[`item.name`]="{ item }">
                <strong>{{item.name}}</strong>
                <br>
                <span v-show="item.razon_social!=null && item.name.toLowerCase()!=item.razon_social.toLowerCase()">{{item.razon_social}}</span>
            </template >

            <!-- Ver más -->
            <template v-slot:[`item.view`]="{ item }">
                <div class="perro" :style="{ backgroundColor: color(item) }"></div> <v-btn class="gato" icon :to="{ path: '/clients/client/'+ item.id}"><v-icon small> mdi-eye</v-icon></v-btn>
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
                No existen registros de clientes aún
            </template>
        </v-data-table>
        <!-- Crear empresa -->
        <v-dialog v-model="createDialog" max-width="800px">
          <template v-slot:activator="{ on, attrs }">
            <v-btn bottom color="#e25200" dark fab fixed right v-bind="attrs" v-on="on">
                <v-icon color="white">  mdi-plus </v-icon>
            </v-btn> 
          </template>
          <create @closeCreateDialogCompany="closeCreateDialogCompany"/>
        </v-dialog>
        <!-- Editar empresa -->
        <v-dialog v-model="editDialog" max-width="700px">
          <edit v-bind:company="company" @closeDialogEditCompany="closeDialogEditCompany"/>
        </v-dialog>
        <!-- Detalle empresa -->
        <v-dialog v-model="detailDialog" fullscreen hide-overlay transition="dialog-bottom-transition">            
            <detail v-bind:company="company" @closeDialogDetailCompany="closeDialogDetailCompany"/>
        </v-dialog>
        <div class="text-center">
            <v-bottom-sheet  v-model="sheet" inset>
                <v-sheet class="text-center" height="150px">
                    <div class="pt-6">
                    ¿Seguro que deseas borrar esta empresa?
                    </div>
                    <v-btn class="mt-4" text color="error" @click="deleteCompany()">
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
import Filter from "../clients/filter"
import Create from "../clients/companies/create"
import Edit from "../clients/companies/edit"
//import Detail from "../clients/companies/detail"
export default {
    components: {
        'filterClients':Filter,
        'create':Create,
        'edit':Edit,
        //'detail':Detail
    }, 
    data: () => ({
        renderComponent: true,
        sheet: false,
        company:'',
        filters: false,
        editDialog: false,
        createDialog: false,
        detailDialog:false,
        deleteId:'',
        companies: '',
        snackbar: {
            show: false,
            message: null,
            color: null
        },
    }),
    computed: {
        statusesLists(){
            return this.$store.state.status.statuses
        },
        currentUser:{
            get(){
                return this.$store.state.currentUser.user;
            }
        },
        headers(){ 
            this.companies = this.companiesLists
            return [
            { value: 'view', sortable: false, align: 'start', },
            { text: 'Dias de Credito', value: 'credit_days' },
            { text: 'Empresa', value: 'name', width: '100%'},
            { text: 'Código SAE', value: 'number',},
            { text: 'Rango de Consumo', value: 'phase' },
            { text: 'Categoría', value: 'type_id',},
            { text: 'Procedencia', value: 'origin' },
            { text: 'Estatus', value: 'status' },
            { text: 'Responsable', value: 'salesman' },
            { text: 'Creación', value: 'created_at' },
            { text: 'Actualización', value: 'updated_at' },
            { value: 'actions', sortable: false, align: 'end', },
        ]},
        companiesLists(){
            let params = JSON.parse(localStorage.getItem('filtersCompany'))
            var filterCompanies = this.$store.state.company.companies
            if(params!=undefined){
                if(params.origins!=''&&params.origins!=undefined&&params.origins!=null){
                    var uno = filterCompanies.filter(company=>company.origin_id == params.origins[0])
                    for(var i=1; i<params.origins.length; i++){
                        uno=uno.concat(filterCompanies.filter(company=>company.origin_id == params.origins[i]))
                    }
                    filterCompanies = this.removeDuplicates(uno, "id");
                }
                if(params.phases!=''&&params.phases!=undefined&&params.phases!=null){
                    var tres = filterCompanies.filter(company=>company.phase_id == params.phases[0])
                    for(var i=1; i<params.phases.length; i++){
                        tres=tres.concat(filterCompanies.filter(company=>company.phase_id == params.phases[i]))
                    }
                    filterCompanies = this.removeDuplicates(tres, "id");
                }
                if(params.statuses!=''&&params.statuses!=undefined&&params.statuses!=null){
                    var dos = filterCompanies.filter(company=>company.status_id == params.statuses[0])
                    for(var i=1; i<params.statuses.length; i++){
                        dos=dos.concat(filterCompanies.filter(company=>company.status_id == params.statuses[i]))
                    }
                    filterCompanies = this.removeDuplicates(dos, "id");
                }
                if(params.users!=''&&params.users!=undefined&&params.users!=null){
                    var cuatro = filterCompanies.filter(company=>company.user_id == params.users[0])
                    for(var i=1; i<params.users.length; i++){
                        cuatro=cuatro.concat(filterCompanies.filter(company=>company.user_id == params.users[i]))   
                    }
                    filterCompanies = this.removeDuplicates(cuatro, "id");
                }
                if(params.semaforo!='' && params.semaforo!=null && params.semaforo!=undefined){
                    
                    var cinco = filterCompanies.filter(company=>this.color(company) == params.semaforo[0])
                    for(var i=1; i<params.users.length; i++){
                        cinco=cinco.concat(filterCompanies.filter(company=>this.color(company) == params.semaforo[0]))   
                    }
                    filterCompanies = this.removeDuplicates(cinco, "id");
                }
                /* text fields */
                if(params.name!=''){
                    var value = params.name.toLowerCase()
                    var seis=filterCompanies.filter(company=>(this.lowerCase(company.name).includes(value)))
                    seis = seis.concat(filterCompanies.filter(company=>(this.lowerCase(company.razon_social).includes(value))))
                    filterCompanies = this.removeDuplicates(seis, "id");
                }
                if(params.phone!=''){
                    filterCompanies=filterCompanies.filter(company=>this.lowerCase(company.phone).includes(params.phone))
                }
                if(params.email!=''){
                    filterCompanies=filterCompanies.filter(company=>this.lowerCase(company.email).includes(params.email))
                }
                if(params.rfc!=''){
                    filterCompanies=filterCompanies.filter(company=>this.lowerCase(company.rfc).includes(params.rfc.toLowerCase()))
                }
                if(params.razon_social!=''){
                    filterCompanies=filterCompanies.filter(company=>this.lowerCase(company.razon_social).includes(params.razon_social.toLowerCase()))
                }
                if(params.address!=''){
                    filterCompanies=filterCompanies.filter(company=>this.lowerCase(company.address).includes(params.address.toLowerCase()))
                }
                if(params.bank_account_number!=''){
                    filterCompanies=filterCompanies.filter(company=>this.lowerCase(company.bank_account_number).includes(params.bank_account_number.toLowerCase()))
                }
                /* Fecha creación */
                if(params.dateCreateFrom!='' && params.dateCreateFrom!=null && params.dateCreateFrom!=undefined){
                    filterCompanies=filterCompanies.filter(company=>new Date(company.created_at) > new Date(params.dateCreateFrom))
                }
                if(params.dateCreateTo!='' && params.dateCreateTo!=null && params.dateCreateTo!=undefined){
                    var dateTwo = new Date(new Date(params.dateCreateTo).setDate(new Date(params.dateCreateTo).getDate() + 1))
                    filterCompanies=filterCompanies.filter(company=>new Date(company.created_at) <= dateTwo)
                }
                /* Fecha actualización */
                if(params.dateUpdateFrom!='' && params.dateUpdateFrom!=null && params.dateUpdateFrom!=undefined){
                    filterCompanies = filterCompanies.filter(company=>new Date(company.updated_at) > new Date(params.dateUpdateFrom))
                }
                if(params.dateUpdateTo!='' && params.dateUpdateTo!=null && params.dateUpdateTo!=undefined){
                    var dateFour = new Date(new Date(params.dateUpdateTo).setDate(new Date(params.dateUpdateTo).getDate() + 1))
                    filterCompanies=filterCompanies.filter(company=>new Date(company.updated_at) <= dateFour)
                }
            }
            return filterCompanies.map(id=>{
                return{
                    id:id.id,
                    name:id.name,
                    razon_social: id.razon_social,
                    number:id.number,
                    address:id.address,
                    phone:id.phone,
                    email:id.email,
                    rfc:id.rfc,
                    razon_social:id.razon_social,
                    phase:this.phase(id.phase_id),
                    origin:this.origin(id.origin_id),
                    status:this.status(id.status_id),
                    salesman:this.salesman(id.user_id),
                    created_at:id.created_at,
                    updated_at:id.updated_at,
                    type_id:this.type(id.type_id),
                    credit_days:id.credit_days*1
                }
            });
        },
        phasesLists(){
            return this.$store.state.phase.phases
        }
    },
    created () { 
        this.companies = this.companiesLists     
    },
    methods: {
        type(id){
            return this.$store.state.type.types.filter(type=>type.id == id).map(type=>type.type)[0]
        },
        cual(name, razon){
            if(name==null || name==undefined || name==''){
                return razon
            }else{
                return name
            }
        },
        changePhase(id, phase){
            var editedItem = this.$store.state.company.companies.filter(company=>company.id == id)[0]
            editedItem.phase_id = phase
            axios.put(process.env.VUE_APP_BACKEND_ROUTE + "api/v1/company/update",Object.assign(editedItem)).then(response=>{
                this.$store.dispatch('company/getCompanies')
            }).catch(error => {
                this.snackbar = {
                    message: error.response.data.message,
                    color: 'error',
                    show: true
                }
            })
        },
        changeStatus(id, status){
            var editedItem = this.$store.state.company.companies.filter(company=>company.id == id)[0]
            editedItem.status_id = status
            axios.put(process.env.VUE_APP_BACKEND_ROUTE + "api/v1/company/update",Object.assign(editedItem)).then(response=>{
                this.$store.dispatch('company/getCompanies')
            }).catch(error => {
                this.snackbar = {
                    message: error.response.data.message,
                    color: 'error',
                    show: true
                }
            })
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
        filtersCompanies: function(params) {
            this.companiesLists2()
            this.renderComponent = false;
            this.$nextTick(() => {
                this.renderComponent = true;
            });
        },
        companiesLists2(){
            let params = JSON.parse(localStorage.getItem('filtersCompany'))
            var filterCompanies = this.$store.state.company.companies
            if(params!=undefined){
                if(params.origins!=''&&params.origins!=undefined&&params.origins!=null){
                    var uno = filterCompanies.filter(company=>company.origin_id == params.origins[0])
                    for(var i=1; i<params.origins.length; i++){
                        uno=uno.concat(filterCompanies.filter(company=>company.origin_id == params.origins[i]))
                    }
                    filterCompanies = this.removeDuplicates(uno, "id");
                }
                if(params.phases!=''&&params.phases!=undefined&&params.phases!=null){
                    var tres = filterCompanies.filter(company=>company.phase_id == params.phases[0])
                    for(var i=1; i<params.phases.length; i++){
                        tres=tres.concat(filterCompanies.filter(company=>company.phase_id == params.phases[i]))
                    }
                    filterCompanies = this.removeDuplicates(tres, "id");
                }
                if(params.statuses!=''&&params.statuses!=undefined&&params.statuses!=null){
                    var dos = filterCompanies.filter(company=>company.status_id == params.statuses[0])
                    for(var i=1; i<params.statuses.length; i++){
                        dos=dos.concat(filterCompanies.filter(company=>company.status_id == params.statuses[i]))
                    }
                    filterCompanies = this.removeDuplicates(dos, "id");
                }
                if(params.users!=''&&params.users!=undefined&&params.users!=null){
                    var cuatro = filterCompanies.filter(company=>company.user_id == params.users[0])
                    for(var i=1; i<params.users.length; i++){
                        cuatro=cuatro.concat(filterCompanies.filter(company=>company.user_id == params.users[i]))   
                    }
                    filterCompanies = this.removeDuplicates(cuatro, "id");
                }
                if(params.semaforo!='' && params.semaforo!=null && params.semaforo!=undefined){
                    
                    var cinco = filterCompanies.filter(company=>this.color(company) == params.semaforo[0])
                    for(var i=1; i<params.users.length; i++){
                        cinco=cinco.concat(filterCompanies.filter(company=>this.color(company) == params.semaforo[0]))   
                    }
                    filterCompanies = this.removeDuplicates(cinco, "id");
                }
                /* text fields */
                if(params.name!=''){
                    var value = params.name.toLowerCase()
                    var seis=filterCompanies.filter(company=>(this.lowerCase(company.name).includes(value)))
                    seis = seis.concat(filterCompanies.filter(company=>(this.lowerCase(company.razon_social).includes(value))))
                    filterCompanies = this.removeDuplicates(seis, "id");
                }
                if(params.phone!=''){
                    filterCompanies=filterCompanies.filter(company=>this.lowerCase(company.phone).includes(params.phone))
                }
                if(params.email!=''){
                    filterCompanies=filterCompanies.filter(company=>this.lowerCase(company.email).includes(params.email))
                }
                if(params.rfc!=''){
                    filterCompanies=filterCompanies.filter(company=>this.lowerCase(company.rfc).includes(params.rfc.toLowerCase()))
                }
                if(params.razon_social!=''){
                    filterCompanies=filterCompanies.filter(company=>this.lowerCase(company.razon_social).includes(params.razon_social.toLowerCase()))
                }
                if(params.address!=''){
                    filterCompanies=filterCompanies.filter(company=>this.lowerCase(company.address).includes(params.address.toLowerCase()))
                }
                if(params.bank_account_number!=''){
                    filterCompanies=filterCompanies.filter(company=>this.lowerCase(company.bank_account_number).includes(params.bank_account_number.toLowerCase()))
                }
                /* Fecha creación */
                if(params.dateCreateFrom!='' && params.dateCreateFrom!=null && params.dateCreateFrom!=undefined){
                    filterCompanies=filterCompanies.filter(company=>new Date(company.created_at) > new Date(params.dateCreateFrom))
                }
                if(params.dateCreateTo!='' && params.dateCreateTo!=null && params.dateCreateTo!=undefined){
                    var dateTwo = new Date(new Date(params.dateCreateTo).setDate(new Date(params.dateCreateTo).getDate() + 1))
                    filterCompanies=filterCompanies.filter(company=>new Date(company.created_at) <= dateTwo)
                }
                /* Fecha actualización */
                if(params.dateUpdateFrom!='' && params.dateUpdateFrom!=null && params.dateUpdateFrom!=undefined){
                    filterCompanies = filterCompanies.filter(company=>new Date(company.updated_at) > new Date(params.dateUpdateFrom))
                }
                if(params.dateUpdateTo!='' && params.dateUpdateTo!=null && params.dateUpdateTo!=undefined){
                    var dateFour = new Date(new Date(params.dateUpdateTo).setDate(new Date(params.dateUpdateTo).getDate() + 1))
                    filterCompanies=filterCompanies.filter(company=>new Date(company.updated_at) <= dateFour)
                }
            }
            this.companies = filterCompanies.map(id=>{
                return{
                    id:id.id,
                    name:id.name,
                    razon_social: id.razon_social,
                    number:id.number,
                    address:id.address,
                    phone:id.phone,
                    email:id.email,
                    rfc:id.rfc,
                    razon_social:id.razon_social,
                    phase:this.phase(id.phase_id),
                    origin:this.origin(id.origin_id),
                    status:this.status(id.status_id),
                    salesman:this.salesman(id.user_id),
                    created_at:id.created_at,
                    updated_at:id.updated_at,
                    type_id:this.type(id.type_id)
                }
            });
        },
        detail(item){
            this.company = item
            this.detailDialog = true;
        },
        closeDialogDetailCompany: function(params) {
            this.detailDialog = params;
            this.$store.dispatch('company/getCompanies')
        },
        closeDialogEditCompany: function(params) {
            this.editDialog = params;
            this.$store.dispatch('company/getCompanies')
        },
        closeCreateDialogCompany: function(params) {
            this.createDialog = params;
            this.$store.dispatch('company/getCompanies')
        },
        exportExcel: function () {
            let data = XLSX.utils.json_to_sheet(this.companies)
            const workbook = XLSX.utils.book_new()
            const filename = 'Lista de Empresas'
            XLSX.utils.book_append_sheet(workbook, data, filename)
            XLSX.writeFile(workbook, `${filename}.xlsx`)
        },
        phase(id){
            return this.phasesLists.filter(phase=>phase.id == id).map(phase => phase.name)[0]
        },
        status(id){
            return this.statusesLists.filter(status=>status.id == id).map(status => status.name)[0]
        },
        origin(id){
            return this.$store.state.origin.origins.filter(origin=>origin.id == id).map(origin => origin.name)[0]
        },
        colorStatus(name){
            return this.statusesLists.filter(status=>status.name == name).map(status => status.color)[0]
        },
        colorPhase(name){
            return this.phasesLists.filter(phase=>phase.name == name).map(phase => phase.color)[0]
        },
        salesman(id){
            return this.$store.state.user.users.filter(user=>user.id == id).map(user => user.name)[0]
        },
        color(item){
            var green = this.$store.state.calendar.calendars.filter(calendar=>calendar.company_id == item.id).filter(calendar=>new Date(calendar.date) > new Date()).length
            var yellow = this.$store.state.calendar.calendars.filter(calendar=>calendar.company_id == item.id).filter(calendar=>new Date(calendar.date) == new Date()).length
            if(green>=1){
                return '#4CAF50'
            }
            else if(item.status=='Cancelado' || (green==0 && yellow==0)){
                return '#FF5252'
            }
            else if((yellow>=1)){
                return '#FFC107'
            }
        },
        deleteCompany(){
            axios.delete(process.env.VUE_APP_BACKEND_ROUTE + "api/v1/company/delete/"+this.deleteId).then(response => {
                this.deleteId = ''
                this.sheet = false
                this.$store.dispatch('company/getCompanies')
            }).catch(error => {
                this.snackbar = {
                    message: error.response.data.message,
                    color: 'error',
                    show: true
                }
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
            this.company = this.$store.state.company.companies.filter(company=>company.id == item.id)[0]
            this.editDialog = true
        },
    }
}
</script>


<style>
    .perro{
        content: ' ';
        position: absolute;
        border-radius:50%;
    }
    
    @media(min-width: 980px){
        .perro{
            width: 8px;
            height: 8px;
            margin-top: 13px;
            margin-left: -10px;
        }
        .gato{
            transform: translateX(14px);
        }
    }
    @media(max-width: 980px){
        .perro {
            width: 12px;
            height: 12px;
            left: 9px;
            margin-left: 40px!important;
            margin-top: 20px!important;
        }
    }
    
</style>