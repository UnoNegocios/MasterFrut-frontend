<template>
    <v-card>
        <v-card-title class="pb-0 pt-3 pb-2" >
            <v-icon style="background: #e7e8e9; padding: 10px!important; border-radius: 50%;" class="mr-4">mdi-domain</v-icon>
            <span >Editar Empresa</span>
            <v-spacer></v-spacer>
            <v-col cols="12" sm="6" md="4">
                <v-autocomplete v-if="permissions('assignCompanies')" outlined  dense clearable v-model="client.user_id" :items="usersLists" label="Vendedor*" item-text="name" item-value="id">
                    <template slot="no-data" class="pa-2">No existen usuarios relacionados.</template>                      
                </v-autocomplete>
            </v-col>
        </v-card-title>
        <v-divider></v-divider>
        <v-stepper v-model="e1" class="elevation-0">
            <v-stepper-header class="elevation-0">
                <v-stepper-step style="font-weight:bolder!important;" :complete="e1 > 1" step="1"></v-stepper-step>
                <v-divider></v-divider>
                <v-stepper-step style="font-weight:bolder!important;" :complete="e1 > 2" step="2"></v-stepper-step>
                <v-divider></v-divider>
                <v-stepper-step style="font-weight:bolder!important;" step="3"></v-stepper-step>
            </v-stepper-header>
            <v-stepper-items>
                <v-stepper-content step="1" class="pt-0">
                    <v-card-text class="pb-0 pt-0">
                        <v-container>
                            <v-row>
                                <v-col cols="12" class="py-0" sm="4" md="4">
                                    <v-text-field prepend-inner-icon="mdi-domain" :rules="[v => !!v || 'Campo requerido']" v-model="client.name" label="Nombre de Empresa*"></v-text-field>
                                </v-col>
                                <v-col cols="12" class="py-0" sm="4" md="4">
                                    <vue-tel-input-vuetify type="number" v-model="client.phone" label="Teléfono"></vue-tel-input-vuetify>
                                </v-col>
                                <v-col class="pt-0" cols="12" sm="4" md="4">
                                    <v-text-field prepend-inner-icon="mdi-email" v-model="client.email" label="Correo Electrónico"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row class="py-4">
                                <v-col class="py-0" cols="12" sm="4" md="4">
                                    <v-autocomplete outlined class="mt-3" dense rounded filled :rules="[v => !!v || 'Campo requerido']" clearable v-model="client.origin_id" :items="originLists" label="Procedencia*" item-text="name" item-value="id">
                                        <template slot="no-data" class="pa-2">No existen procedencias relacionadas.</template>                      
                                    </v-autocomplete>
                                </v-col>
                                <v-col class="py-0" cols="12" sm="4" md="4">
                                    <v-autocomplete outlined class="mt-3" dense rounded filled :rules="[v => !!v || 'Campo requerido']" clearable v-model="client.status_id" :items="statusLists" label="Estatus*" item-text="name" item-value="id">
                                        <template slot="no-data" class="pa-2">No existen estatus relacionados.</template>                      
                                    </v-autocomplete>
                                </v-col>
                                <v-col class="py-0" cols="12" sm="4" md="4">
                                    <v-autocomplete outlined class="mt-3" dense rounded filled clearable v-model="client.phase_id" :items="phaseLists" label="Rango de Consumo" item-text="name" item-value="id">
                                        <template slot="no-data" class="pa-2">No existen rangos relacionadas.</template>                      
                                    </v-autocomplete>
                                </v-col>
                            </v-row>
                        </v-container>
                    </v-card-text>
                </v-stepper-content>
                <v-stepper-content step="2" class="pt-0">
                    <v-card-text class="pb-0 pt-0">
                        <strong>Condiciones Comerciales</strong>
                        <v-container>
                            <v-row class="mt-0">
                                <v-row>
                                    <v-col class="pt-0" cols="12" sm="6" md="4">
                                        <v-autocomplete outlined class="mt-3" dense clearable v-model="client.type_id" :items="typeLists" label="Tipo de Cliente" item-text="type" item-value="id">
                                            <template slot="no-data" class="pa-2">No existen tipos relacionados.</template>                      
                                        </v-autocomplete>
                                        <v-autocomplete  outlined class="mt-3" dense clearable v-model="client.frequency_id" :items="frequencyLists" label="Frecuencia de Consumo" item-text="frequency" item-value="id">
                                            <template slot="no-data" class="pa-2">No existen frecuencias relacionadas.</template>                      
                                        </v-autocomplete>
                                        <v-textarea filled class="mt-4" v-model="client.special_note" label="Nota Especial"></v-textarea>
                                    </v-col>
                                    <v-col class="pt-0" cols="12" sm="6" md="4">
                                        <v-autocomplete outlined class="mt-3" dense clearable v-model="client.price_list_id" :items="priceLists" label="Lista de Precios" item-text="item" item-value="id">
                                            <template slot="no-data" class="pa-2">No existen listas de precio relacionadas.</template>                      
                                        </v-autocomplete>
                                        <v-autocomplete  outlined class="mt-3" dense clearable v-model="client.contact_mode_id" :items="mediumLists" label="Medio de Contacto Preferido" item-text="mode" item-value="id">
                                            <template slot="no-data" class="pa-2">No existen medios relacionados.</template>                      
                                        </v-autocomplete>
                                        <v-textarea filled class="mt-3" v-model="client.delivery_references" label="Referencias de Dirección"></v-textarea>
                                    </v-col>
                                    <v-col class="pt-0" cols="12" sm="6" md="4">
                                        <v-select outlined class="mt-3" dense clearable v-model="client.credit_days" :items="days" label="Días de Credito"></v-select>
                                        <v-select outlined class="mt-3" dense clearable v-model="client.special_conditions" :items="conditionLists" label="Condicion Especial" item-text="condition" item-value="id"  chips multiple>
                                            <template v-slot:selection="{ item, index }">
                                                <v-chip style="max-width:80px;" class="mt-1" small v-if="index <= 1">
                                                    <span class="text-truncate">{{ item.condition }}</span>
                                                </v-chip>
                                                <span v-if="index === 1" class="grey--text text-caption">
                                                (+{{ client.special_conditions.length - 2 }} más)
                                                </span>
                                            </template>
                                        </v-select>
                                        <v-textarea filled class="mt-3" v-model="client.delivery_time" label="Horario de Entrega"></v-textarea>
                                    </v-col>
                                </v-row>
                            </v-row>
                        </v-container>
                    </v-card-text>
                </v-stepper-content>
                <v-stepper-content step="3" class="pt-0">
                    <v-card-text class="pb-0 pt-0">
                        <strong>Datos Fiscales</strong>
                        <v-container>
                            <v-row>
                                <v-col class="pt-0" cols="12" sm="4" md="4">
                                    <v-text-field v-model="client.razon_social" label="Razon Social"></v-text-field>

                                    <v-autocomplete outlined class="mt-4" dense clearable v-model="client.cfdi_id" :items="cfdiLists" label="Uso de CFDI" item-text="cfdi" item-value="id">
                                        <template slot="no-data" class="pa-2">No existen usos relacionados.</template>                      
                                    </v-autocomplete>
                                </v-col>
                                <v-col class="pt-0" cols="12" sm="4" md="4">
                                    <v-text-field v-model="client.rfc" label="RFC"></v-text-field>

                                    <v-text-field class="mt-0" v-model="client.number" label="Numero SAE"></v-text-field>
                                </v-col>
                                <v-col class="pt-0" cols="12" sm="4" md="4">
                                    <v-text-field prepend-inner-icon="mdi-map-marker" v-model="client.address" label="Dirección Fiscal"></v-text-field>

                                    <v-autocomplete outlined class="mt-2" dense clearable v-model="client.payment_method_id" :items="methodLists" label="Método de Pago" item-text="method" item-value="id">
                                        <template slot="no-data" class="pa-2">No existen metodos relacionados.</template>                      
                                    </v-autocomplete>
                                </v-col>
                            </v-row>

                            <v-row>
                                <v-col class="pt-0" cols="12" sm="4" md="4">
                                    <v-text-field class="mt-0" v-model="client.bank_account_number" label="Numero de Cuenta"></v-text-field>
                                </v-col>
                                <v-col v-if="currentUser.job_position != 'vendedor'"  class="pt-0" cols="12" sm="4" md="8">
                                    <v-textarea filled class="mt-7"  v-model="client.payment_conditions" label="Condiciones de Pago"></v-textarea>
                                </v-col>
                            </v-row>
                        </v-container>
                    </v-card-text>
                </v-stepper-content>
            </v-stepper-items>
        </v-stepper>
        <v-card-actions class="pr-6 pb-6">
            <v-spacer></v-spacer>
            <v-btn color="grey darken-2" text @click="close">
                Cancelar
            </v-btn>
            <v-btn color="blue darken-1" text  v-if="e1>1" @click="e1 = e1-1">
                <v-icon>mdi-chevron-left</v-icon>
                Regresar
            </v-btn>
            <v-btn color="blue darken-1" text  v-if="e1!=3" @click="e1 = e1+1" :disabled="grey">
                Siguiente
                <v-icon>mdi-chevron-right</v-icon>
            </v-btn>
            <v-btn color="primary" class="px-3" @click="save" :loading="gris" :disabled="gris || grey">
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
            client:Object
        },
        data: () => ({
            days:['3', '15', '30', '45', '60', '90'],
            snackbar: {
                show: false,
                message: null,
                color: null
            },
            e1: 1,
            fiscales:false,
            rules: {
                required: value => !!value || 'Campo requerido',
            },
            valid: true,
            gris:false,
        }),
    computed: {
        grey(){
            if( this.client.phase_id==''||this.client.phase_id==null||this.client.phase_id==undefined||
                this.client.origin_id==''||this.client.origin_id==null||this.client.origin_id==undefined||
                this.client.status_id==''||this.client.status_id==null||this.client.status_id==undefined||
                this.client.name==''||this.client.name==null||this.client.name==undefined){
                    return true
            }else{
                return false
            }
        },
        cfdiLists(){
            return this.$store.state.cfdi.cfdis;
        },
        methodLists(){
            return this.$store.state.payment_method.payment_methods;
        },
        frequencyLists(){
            return this.$store.state.frequency.frequencies;
        },
        typeLists(){
            return this.$store.state.type.types;
        },
        priceLists(){
            return this.$store.state.price_list.price_lists;
        },
        zoneLists(){
            return this.$store.state.zone.zones;
        },
        mediumLists(){
            return this.$store.state.contact_mode.contact_modes;
        },
        conditionLists(){
            return this.$store.state.special_condition.special_conditions;
        },
        usersLists(){
            return this.$store.state.user.users;
        },
        originLists(){
            return this.$store.state.origin.origins;
        },
        phaseLists(){
            return this.$store.state.phase.phases;
        },
        statusLists(){
            return this.$store.state.status.statuses;
        },
        currentUser:{
            get(){
                return this.$store.state.currentUser.user
            }
        },
        categoryLists(){
            return this.$store.state.category.categories;
        },
    },
    created(){
        console.log(this.client)
        this.$store.dispatch('currentUser/getUser')
        this.$store.dispatch('user/getUsers')
        this.$store.dispatch('origin/getOrigins')
        this.$store.dispatch('phase/getPhases')
        this.$store.dispatch('status/getStatuses')
        this.$store.dispatch('payment_method/getPaymentMethods')
        this.$store.dispatch('type/getTypes')
        this.$store.dispatch('zone/getZones')
        this.$store.dispatch('contact_mode/getContactModes')
        this.$store.dispatch('special_condition/getSpecialConditions')
        this.$store.dispatch('cfdi/getCfdi')
        this.$store.dispatch('price_list/getPriceLists')
        this.$store.dispatch('frequency/getFrequencies')
        this.$store.dispatch('cfdi/getCfdi')
        this.oldPhone = this.client.phone
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
        close () {
            this.gris = false
            this.$nextTick(() => {
                this.$emit("closeEditDialogClient", false);
            })
        },
        save () {
            if(this.oldPhone!=this.client.phone){
                this.client.phone = Number(this.client.phone.replace(/\s/g, ''))
            }
            this.gris = true
            this.$nextTick(() => {
                axios.patch(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/companies/" + this.client.id, this.client).then(response=>{
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
    },
}
</script>

<style>
.v-input__icon--prepend-inner i::before {
    font-size: 18px!important;
    color:#1976D2;
}
</style>
