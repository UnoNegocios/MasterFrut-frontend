<template>
    <v-card>
        <v-card-title class="py-4" >
            <v-icon style="background: #e7e8e9; padding: 10px!important; border-radius: 50%;" class="mr-4">mdi-file-document-outline</v-icon>
            <span >Nuevo Envío</span>
            <v-spacer></v-spacer>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pb-0">
            <v-container>
                <v-row>
                    <v-col cols="12" sm="6" md="6">
                        <v-autocomplete clearable v-model="shipping.driver_id" :items="usersLists" label="Chofer" item-text="name" item-value="id">
                            <template slot="no-data"><div class="px-4 py-1">No existen choferes relacionadas.</div></template>                      
                        </v-autocomplete>
                        <v-autocomplete clearable v-model="shipping.vehicle_id" :items="vehicleLists" label="Vehiculo" item-text="name" item-value="id">
                            <template slot="no-data"><div class="px-4 py-1">No existen vehiculos relacionadas.</div></template>                      
                        </v-autocomplete>
                        <v-text-field type=number v-model="shipping.initial_km" suffix="kms"  label="Kilometraje Inicial"></v-text-field>
                        <v-text-field type=number v-model="shipping.final_km" suffix="kms" label="Kilometraje Final"></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="6">
                        <v-menu v-model="datePicker" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px" >
                            <template v-slot:activator="{ on }">
                                <v-text-field :rules="[v => !!v || 'Campo requerido']" clearable required v-model="shipping.date" label="Fecha de Entrega" prepend-icon="mdi-calendar" readonly v-on="on"></v-text-field>
                            </template>
                            <v-date-picker color="primary" v-model="shipping.date" @input="datePicker = false"></v-date-picker>
                        </v-menu>
                        <v-container fluid>
                            <v-textarea v-model="shipping.note" label="Nota"></v-textarea>
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
            <v-btn color="blue darken-1" text @click="save" :loading="gris" :disabled="gris">
                Guardar
            </v-btn>
        </v-card-actions>
        <v-snackbar :color="snackbar.color" v-model="snackbar.show">
            {{ snackbar.message }}
        </v-snackbar>
    </v-card>
</template>

<script>
import axios from "axios";
    export default {
        props:{
            company:String
        },  
        data: () => ({
            datePicker:'',
            shipping:{
                driver_id:'',
                date:'',
                vehicle_id:'',
                initial_km:'',
                final_km:'',
                route:'',
                note:'',
                user_id:'',
                last_updated_by_user_id:'',
                created_by_user_id:''
            },
            rules: {
                required: value => !!value || 'Campo requerido',
            },
            valid: true,
            snackbar: {
                show: false,
                message: null,
                color: null
            },
            gris:false,
        }),
    computed: {
        vehicleLists(){
            return this.$store.state.vehicle.vehicles;
        },
        usersLists(){
            return this.$store.state.user.users.filter(user=>user.job_position == 'Chofer Repartidor' || user.job_position == 'Chofer Ejecutivo').map(id=>{
                return{
                    id:id.id,
                    name: id.name + ' ' + id.last
                }
            });
        },
        currentUser:{
            get(){
                return this.$store.state.currentUser.user
            }
        }    
    },
    created(){
        if(this.company!=undefined){
            this.shipping.company_id=Number(this.company)
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
        close () {
            this.gris = false
            this.shipping = Object.assign({}, this.defaultItem)
            this.shipping.macro = false
            if(this.company!=undefined){
                this.shipping.company_id=Number(this.company)
            }
            this.$nextTick(() => {
                this.$emit("closeCreateDialogShipping", false);
            })
        },
        save(){
            this.shipping.created_by_user_id = this.currentUser.id
            this.shipping.last_updated_by_user_id = this.currentUser.id
            if(this.shipping.user_id==''){
                this.shipping.user_id = this.currentUser.id
            }
            axios.post(process.env.VUE_APP_BACKEND_ROUTE + "api/v1/shipping/create",Object.assign(this.shipping)).then(response=>{
                this.close()
            }).catch(error => {
                this.snackbar = {
                    message: error.response.data.message,
                    color: 'error',
                    show: true
                }
                this.gris = false
            })
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