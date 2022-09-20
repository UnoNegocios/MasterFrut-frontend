<template>
    <v-card>
        <v-card-title class="pb-0 pt-1" >
            <v-icon style="background: #e7e8e9; padding: 10px!important; border-radius: 50%;" class="mr-4"> mdi-calendar</v-icon>
            <span >Nueva Actividad</span> 
            <v-spacer></v-spacer>
            <v-col cols="12" sm="6" md="4">
                <v-autocomplete v-if="permissions('assignActivities')" :rules="[v => !!v || 'Campo requerido']" clearable v-model="calendar.user_id" :items="usersLists" label="Vendedor" item-text="name" item-value="id">
                    <template slot="no-data" class="pa-2">No existen usuarios relacionados.</template>                      
                </v-autocomplete>
                <v-autocomplete v-else-if="calendar.user_id=currentUser.id" disabled v-model="calendar.user_id" :items="usersLists" label="Vendedor" item-text="name" item-value="id">                
                </v-autocomplete>
            </v-col>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pb-0">
            <v-container>
                <v-row>
                    <v-col class="py-0" cols="12" sm="6" md="6">
                        <v-autocomplete :rules="[v => !!v || 'Campo requerido']" clearable v-model="calendar.activity_id" :items="activityLists" label="Actividad" item-text="type" item-value="id">
                            <template slot="no-data" class="pa-2">No existen actividades relacionadas.</template>                      
                        </v-autocomplete>
                        <v-btn x-small v-if="clientType=='empresa'" @click="clientType='empresa', calendar.lead_id=null" color="primary" class="elevation-0" style="border-radius: 5px 0px 0px 5px;">Cliente</v-btn>
                        <v-btn x-small v-if="clientType!='empresa'" @click="clientType='empresa', calendar.lead_id=null" class="elevation-0" style="border-radius: 5px 0px 0px 5px;">Cliente</v-btn>
                        <v-btn x-small v-if="clientType=='prospecto'" @click="clientType='prospecto', calendar.company_id=null" color="primary" class="elevation-0" style="border-radius: 0px 5px 5px 0px;">Prospecto</v-btn>
                        <v-btn x-small v-if="clientType!='prospecto'" @click="clientType='prospecto', calendar.company_id=null" class="elevation-0" style="border-radius: 0px 5px 5px 0px;">Prospecto</v-btn>

                        <v-autocomplete v-if="clientType=='prospecto'" class="pt-0 mt-2 mb-2" :rules="[v => !!v || 'Campo requerido']" clearable v-model="calendar.lead_id" :items="leadsLists" label="Prospecto" item-text="name" item-value="id">
                            <template slot="no-data"><div class="px-4 py-1">No existen prospectos relacionados. </div></template>                     
                        </v-autocomplete>

                        <v-row v-if="clientType=='empresa'" class="mb-2 mt-0">
                            <v-col class="py-0" cols="12" sm="6" md="6">
                                <v-autocomplete @keydown.enter="filter()" v-model="calendar.company_id" :items="companyLists" :loading="isLoadingCompany" :search-input.sync="searchCompanies" hide-no-data item-value="id" item-text="name" label="Empresa(s)" placeholder="Escribe para buscar" attach>
                                    <template v-slot:item="{item, attrs, on}">
                                        <v-list-item v-on="on" v-bind="attrs">
                                            <v-list-item-content>
                                                <v-list-item-title v-if="item.name!=null">
                                                    <span v-if="item.macro!=null">{{item.macro}}</span>{{item.name}}
                                                    <div v-if="item.razon_social!=null">
                                                        <span style="font-size:12px;">{{item.razon_social}}</span>
                                                    </div>
                                                </v-list-item-title>
                                                <v-list-item-title v-else-if="item.razon_social!=null">
                                                    {{item.razon_social}}
                                                </v-list-item-title>
                                            </v-list-item-content>
                                        </v-list-item>
                                    </template> 
                                </v-autocomplete>
                            </v-col>
                            <v-col class="py-0" cols="12" sm="6" md="6">
                                <v-autocomplete :disabled="calendar.company_id==null||calendar.company_id==undefined||calendar.company_id==''" @keydown.enter="filter()" v-model="calendar.contact_id" :items="contactList" :loading="isLoadingContact" :search-input.sync="searchContacts" hide-no-data item-value="id" item-text="name" label="Contacto(s)" placeholder="Escribe para buscar" attach>
                                    <template v-slot:item="{item, attrs, on}">
                                        <v-list-item v-on="on" v-bind="attrs">
                                            <v-list-item-content>
                                                <v-list-item-title>
                                                    {{item.name}} <span v-if="item.last!=undefined">{{item.last}}</span>
                                                    <div>
                                                        <span style="font-size:12px;">{{item.company}}</span>
                                                    </div>
                                                </v-list-item-title>
                                            </v-list-item-content>
                                        </v-list-item>
                                    </template> 
                                </v-autocomplete>
                            </v-col>  
                        </v-row>  
                        <v-row>
                            <v-col class="py-0" cols="12" sm="6" md="6">
                                <v-menu v-model="datePicker" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px" >
                                    <template v-slot:activator="{ on }">
                                        <v-text-field :rules="[v => !!v || 'Campo requerido']" clearable required v-model="calendar.only_date" label="Fecha" prepend-icon="mdi-calendar" readonly v-on="on"></v-text-field>
                                    </template>
                                    <v-date-picker color="primary" v-model="calendar.only_date" @input="datePicker = false"></v-date-picker>
                                </v-menu>
                            </v-col>
                            <v-col class="py-0" cols="12" sm="6" md="6">
                                <v-autocomplete clearable v-model="calendar.only_time" prepend-icon="mdi-clock-outline" :items="hours" label="Hora">               
                                </v-autocomplete>
                            </v-col>  
                        </v-row>  
                    </v-col>
                    <v-col class="pb-0 pt-2" cols="12" sm="6" md="6">
                        <v-container fluid>
                            <v-textarea v-model="calendar.description" label="Descripcion"></v-textarea>
                        </v-container>
                    </v-col>
                </v-row>
            </v-container>
        </v-card-text>
        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="close">
                Cancelar
            </v-btn>
            <v-btn color="blue darken-1" v-if="valid==false" :loading="gris" :disabled="gris" text @click="save">
                Guardar
            </v-btn>
            <v-btn color="blue darken-1" v-if="valid==true" disabled text @click="save">
                Guardar
            </v-btn>
        </v-card-actions>
        <!-- Crear Contacto -->
        <v-dialog v-model="createContactDialog" max-width="600px">
            <createContact v-bind:company="calendar.company_id" @closeCreateDialogContact="closeCreateDialogContact"/>
        </v-dialog>
        <!-- Crear empresa -->
        <v-dialog v-model="createCompanyDialog" max-width="700px">
          <template v-slot:activator="{ on, attrs }">
            <v-btn bottom color="#e25200" dark fab fixed right v-bind="attrs" v-on="on">
                <v-icon color="white">  mdi-plus </v-icon>
            </v-btn> 
          </template>
          <createCompany @closeCreateDialogCompany="closeCreateDialogCompany"/>
        </v-dialog>
        <v-snackbar :color="snackbar.color" v-model="snackbar.show">
            {{ snackbar.message }}
        </v-snackbar>
    </v-card>
</template>

<script>
import axios from "axios";
import CreateContact from "../clients/contacts/create"
import CreateCompany from "../clients/companies/create"
    export default {
        components: {
            'createContact':CreateContact,
            'createCompany':CreateCompany,
        }, 
        props:{
            lead:String,
            company:String
        },
        data: () => ({
            clientType:'empresa',
            snackbar: {
                show: false,
                message: null,
                color: null
            },
            gris:false,
            createContactDialog: false,
            createCompanyDialog: false,
            fiscales:false,
            timePicker:'',
            datePicker:'',
            calendar:{
                company_id:null,
                contact_id:'',
                activity_id:'',
                only_date:'',
                only_time:'',
                description:'',
                completed:'',
                user_id:'',
                lead_id:null
            },
            rules: {
                required: value => !!value || 'Campo requerido',
            },
            entries:{
            companies: [],
                contacts:[]
            },
            isLoadingCompany: false,
            isLoadingContact: false,
            searchCompanies: null,
            searchContacts: null,
        }),
        watch: {
            searchCompanies(val){
                //if (this.companyLists.length > 0) return
                if (this.isLoadingCompany) return
                this.isLoadingCompany = true

                axios.get(process.env.VUE_APP_BACKEND_ROUTE + 'api/v2/company_p?filter[name]='+val)
                .then(res => {
                    this.entries.companies = res.data.data
                }).finally(() => (this.isLoadingCompany = false))
            },
            searchContacts(val){
                //if (this.contactList.length > 0) return
                if (this.isLoadingContact) return
                this.isLoadingContact = true
                if(this.calendar.company_id!=undefined||this.calendar.company_id!=null||this.calendar.company_id!=''){
                    var filter = 'filter[company_id]=' + this.calendar.company_id
                }else{
                    var filter = ''
                }
                axios.get(process.env.VUE_APP_BACKEND_ROUTE + 'api/v2/contact_p?' + filter + "filter[name]=" + val)
                .then(res => {
                    this.entries.contacts = res.data.data
                }).finally(() => (this.isLoadingContact = false))
            },
        },
        computed: {
            valid(){
                if(
                    ((this.calendar.company_id!=''&&this.calendar.company_id!=undefined&&this.calendar.company_id!=null)||
                    (this.calendar.lead_id!=''&&this.calendar.lead_id!=undefined&&this.calendar.lead_id!=null))&&
                    (this.calendar.activity_id!=''&&this.calendar.activity_id!=undefined&&this.calendar.activity_id!=null)&&
                    (this.calendar.only_date!=''&&this.calendar.only_date!=undefined&&this.calendar.only_date!=null)&&
                    (this.calendar.only_time!=''&&this.calendar.only_time!=undefined&&this.calendar.only_time!=null)&&
                    (this.calendar.user_id!=''&&this.calendar.user_id!=undefined&&this.calendar.user_id!=null)
                ){
                    return false
                }else{
                    return true
                }
            },
            hours(){
                var arr = [], i, j;
                for(i=0; i<24; i++) {
                    for(j=0; j<4; j++) {
                        arr.push(this.cero(i) + ":" + (j===0 ? "00" : 15*j) + ":00");
                    }
                }
                return arr
            },
            companyLists(){
                return this.entries.companies.map(id => {
                    return{
                        id:id.id,
                        macro:id.macro,
                        name:id.name,
                        razon_social:id.razon_social
                    }
                })
            },
            contactList(){
                return this.entries.contacts.map(id => {
                    return{
                        id:id.id,
                        name:id.name,
                        last:id.last,
                        company:id.company.name,
                        job_position:id.job_position
                    }
                })
            },
            leadsLists(){
                return this.$store.state.lead.leads;
            },
            activityLists(){
                return this.$store.state.activity.activities;
            },  
            usersLists(){
                return this.$store.state.user.users;
            },    
            currentUser:{
                get(){
                    return this.$store.state.currentUser.user
                }
            }   
        },
        created(){
            console.log(this.company)
            if(this.company!=undefined){
                this.calendar.company_id=this.company
            }
            if(this.lead!=undefined){
                this.calendar.lead_id=this.lead
                this.clientType = 'prospecto'
            }
        },
        methods: {
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
            cero(i){
                if(i<10){
                    return '0' + i
                }else{
                    return i
                }
            },
            close () {
                this.calendar = Object.assign({}, this.defaultItem)
                if(this.company!=undefined){
                    this.calendar.company_id=Number(this.company)
                }
                this.gris = false
                this.$nextTick(() => {
                    this.$emit("closeCreateDialogCalendar", false);
                })
            },
            save(){
                this.gris = true
                this.calendar.created_by_user_id = this.currentUser.id
                this.calendar.last_updated_by_user_id = this.currentUser.id
                this.calendar.date = this.calendar.only_date + ' ' + this.calendar.only_time
                this.$nextTick(() => {
                    axios.post(process.env.VUE_APP_BACKEND_ROUTE + "api/v1/calendar/create",Object.assign(this.calendar)).then(response=>{
                        this.close()
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
            closeCreateDialogContact: function(params) {
                this.createContactDialog = params;
                this.$store.dispatch('contact/getContacts')
            },
            closeCreateDialogCompany: function(params) {
                this.createCompanyDialog = params;
                this.$store.dispatch('company/getCompanies')
            },
        },
}
</script>
<style lang="css" scoped>
.v-text-field >>> label{
    font-size: 14px!important;
}
</style>
<style>
.v-input__icon--prepend-inner i::before {
    font-size: 18px!important;
    color:#1976D2;
}
.v-text-field input, .v-label {
    font-size: 14px;
}
.v-picker__title.primary{
    display:none;
}
</style>