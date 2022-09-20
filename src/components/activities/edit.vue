<template>
    <v-card>
        <v-card-title class="pb-0 pt-1" >
            <v-icon style="background: #e7e8e9; padding: 10px!important; border-radius: 50%;" class="mr-4"> mdi-calendar</v-icon>
            <span >Editar Actividad</span>
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
                        <v-row>
                            <v-col class="py-0" cols="12" sm="6" md="6">
                                <v-autocomplete :rules="[v => !!v || 'Campo requerido']" clearable v-model="calendar.company_id" :items="companyLists" label="Empresa" item-text="name" item-value="id">
                                    <template slot="no-data"><div class="px-4 py-1">No existen empresas relacionadas. <v-btn rounded class="mx-3" color="primary" @click="createCompanyDialog=true" x-small>Crear</v-btn></div></template>                     
                                </v-autocomplete>
                                <v-menu v-model="datePicker" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px" >
                                    <template v-slot:activator="{ on }">
                                        <v-text-field :rules="[v => !!v || 'Campo requerido']" clearable required v-model="calendar.only_date" label="Fecha" prepend-icon="mdi-calendar" readonly v-on="on"></v-text-field>
                                    </template>
                                    <v-date-picker color="primary" v-model="calendar.only_date" @input="datePicker = false"></v-date-picker>
                                </v-menu>
                            </v-col>
                            <v-col class="py-0" cols="12" sm="6" md="6">
                                <v-autocomplete :disabled="calendar.company_id==null" clearable v-model="calendar.contact_id" :items="contactLists" label="Contacto" item-text="name" item-value="id">
                                    <template slot="no-data"><div class="px-4 py-1">No existen contactos relacionados. <v-btn rounded class="mx-3" color="primary" @click="createContactDialog=true" x-small>Crear</v-btn></div></template>                      
                                </v-autocomplete>
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
            <v-btn color="blue darken-1" :disabled="!valid || gris" :loading="gris" text @click="save">
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
            calendar:Object
        },
        data: () => ({
            snackbar: {
                show: false,
                message: null,
                color: null
            },
            gris: false,
            createContactDialog: false,
            createCompanyDialog: false,
            fiscales:false,
            timePicker:'',
            datePicker:'',
            rules: {
                required: value => !!value || 'Campo requerido',
            },
        }),
    computed: {
        valid(){
            if(
                (this.calendar.company_id!=''&&this.calendar.company_id!=undefined&&this.calendar.company_id!=null)&&
                (this.calendar.activity_id!=''&&this.calendar.activity_id!=undefined&&this.calendar.activity_id!=null)&&
                (this.calendar.only_date!=''&&this.calendar.only_date!=undefined&&this.calendar.only_date!=null)&&
                (this.calendar.only_time!=''&&this.calendar.only_time!=undefined&&this.calendar.only_time!=null)&&
                (this.calendar.user_id!=''&&this.calendar.user_id!=undefined&&this.calendar.user_id!=null)
            ){
                return true
            }else{
                return false
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
            return this.$store.state.company.companies;
        },
        contactLists(){
            return this.$store.state.contact.contacts.filter(contact=>contact.company_id == this.calendar.company_id);
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
    },
    watch: {
    
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
            this.gris = false
            this.$nextTick(() => {
                this.$emit("closeDialogEditCalendar", false);
            })
        },
        save () {
            this.calendar.last_updated_by_user_id = this.currentUser.id
            this.calendar.date = this.calendar.only_date + ' ' + this.calendar.only_time
            this.gris = true
            this.$nextTick(() => {
                axios.put(process.env.VUE_APP_BACKEND_ROUTE + "api/v1/calendar/update",Object.assign(this.calendar)).then(response=>{
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