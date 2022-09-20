<template>
    <v-card>
        <v-card-title class="py-4" >
            <v-icon style="background: #e7e8e9; padding: 10px!important; border-radius: 50%;" class="mr-4">mdi-file-document-outline</v-icon>
            <span>Agregar Orden de Envío</span>
            <!--v-spacer></v-spacer>
            <v-checkbox class="mr-12" v-model="shipping.completed" label="Entregado"></v-checkbox-->
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pb-0">
            <v-container>
                <v-row>
                    <v-col cols="12" sm="6" md="6">
                        <v-autocomplete clearable v-model="shipping.sale_id" :items="saleLists" label="Venta" item-text="name" item-value="id">
                            <template slot="no-data"><div class="px-4 py-1">No existen ventas relacionadas.</div></template>                      
                        </v-autocomplete>
                    </v-col>
                    <!--v-col cols="12" sm="6" md="4">
                        <v-autocomplete clearable v-model="shipping.shipping_id" :items="shippingLists" label="Envío" item-text="name" item-value="id">
                            <template slot="no-data"><div class="px-4 py-1">No existen envios relacionadas.</div></template>                      
                        </v-autocomplete>
                    </v-col-->
                    <v-col cols="12" sm="6" md="6">
                        <v-text-field type=number v-model="shipping.invoice" label="Numero de Factura"></v-text-field>
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
            shippingId:Number
        },  
        data: () => ({
            datePicker:'',
            shipping:{
                sale_id:'',
                shipping_id:'',
                completed:false,
                invoice:'',
                created_by_user_id:'',
                last_updated_by_user_id:'',
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
        saleLists(){
            return this.$store.state.quotation.quotations.filter(quotation=>quotation.status == 'vendido').filter(quotation=>quotation.bar != true).filter(quotation=>this.esta(quotation.id) == false).map(id=>{
                return{
                    id:id.id,
                    name: 'id:' + id.id + this.companyName(id.company_id) + ' | ' + id.date
                }
            })
        },
        /*shippingLists(){
            return this.$store.state.shipping.shippings.map(id=>{
                return{
                    id:id.id,
                    name: 'E-' + id.id
                }
            })
        },*/
        currentUser:{
            get(){
                return this.$store.state.currentUser.user
            }
        }    
    },
    created(){
        
    },
    methods: {
        esta(quotationId){
            var envios = this.$store.state.shipping_detail.shipping_details.filter(shipping_detail=>shipping_detail.sale_id == quotationId)
            if(envios.length == 0){
                return false
            }else{
                return true
            }
        },
        companyName(id){
            if(id!=null && id!=undefined && id!=''){
                return ' | ' + this.$store.state.company.companies.filter(company=>company.id == id).map(company=>company.name)[0]
            }
        },
        contact(id){
            if(id!=null && id!=undefined && id!=''){
                return ' | ' + this.$store.state.contact.contacts.filter(contact=>contact.id == id).map(contact=>contact.name)[0]
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
        close () {
            this.shipping = Object.assign({}, this.defaultItem)
            this.shipping.completed = false
            this.$nextTick(() => {
                this.$emit("closeDialogAddShipping", false);
            })
        },
        save(){
            this.gris = false
            this.shipping.shipping_id=this.shippingId
            this.shipping.created_by_user_id=this.currentUser.id;
            this.shipping.last_updated_by_user_id=this.currentUser.id;
            this.$nextTick(() => {
                axios.post(process.env.VUE_APP_BACKEND_ROUTE + "api/v1/shipping_detail/create",Object.assign(this.shipping)).then(response=>{
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