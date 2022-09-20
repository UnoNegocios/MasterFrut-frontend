<template>
    <v-card>
        <v-card-title class="py-4" >
            <v-icon style="background: #e7e8e9; padding: 10px!important; border-radius: 50%;" class="mr-4">mdi-file-document-outline</v-icon>
            <span>Editar Orden de Envío</span>
            <v-spacer></v-spacer>
            <v-checkbox class="mr-12" v-model="shippingOrder.completed" label="Entregado"></v-checkbox>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pb-0">
            <v-container>
                <v-row>
                    <v-col cols="12" sm="6" md="4">
                        <v-autocomplete disabled clearable v-model="shippingOrder.sale_id" :items="saleLists" label="Venta" item-text="name" item-value="id">
                            <template slot="no-data"><div class="px-4 py-1">No existen ventas relacionadas.</div></template>                      
                        </v-autocomplete>
                    </v-col>
                    <v-col cols="12" sm="6" md="4">
                        <v-autocomplete clearable v-model="shippingOrder.shipping_id" :items="shippingLists" label="Envío" item-text="name" item-value="id">
                            <template slot="no-data"><div class="px-4 py-1">No existen envios relacionadas.</div></template>                      
                        </v-autocomplete>
                    </v-col>
                    <v-col cols="12" sm="6" md="4">
                        <v-text-field v-model="shippingOrder.invoice" label="Numero de Factura"></v-text-field>
                    </v-col>
                </v-row>
            </v-container>
        </v-card-text>
        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="close">
                Cancelar
            </v-btn>
            <v-btn color="blue darken-1" text @click="save">
                Guardar
            </v-btn>
        </v-card-actions>

    </v-card>
</template>

<script>
import axios from "axios";
    export default {
        props:{
            shippingOrder:Object
        },  
        data: () => ({
            datePicker:'',
            rules: {
                required: value => !!value || 'Campo requerido',
            },
            valid: true,
        }),
    computed: {
        saleLists(){
            return this.$store.state.quotation.quotations.filter(quotation=>quotation.status == 'vendido').map(id=>{
                return{
                    id:id.id,
                    name: 'id:' + id.id + this.companyName(id.company_id) + ' | ' + id.date
                }
            })
        },
        shippingLists(){
            return this.$store.state.shipping.shippings.map(id=>{
                return{
                    id:id.id,
                    name: 'E-' + id.id
                }
            })
        },
        currentUser:{
            get(){
                return this.$store.state.currentUser.user
            }
        }    
    },
    created(){
        this.$store.dispatch('shipping/getShippings')
    },
    methods: {
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
        close () {
            this.$nextTick(() => {
                this.$emit("closeDialogEditShipping", false);
            })
        },
        save(){
            this.shippingOrder.last_updated_by_user_id=this.currentUser.id;
            axios.put(process.env.VUE_APP_BACKEND_ROUTE + "api/v1/shipping_detail/update",Object.assign(this.shippingOrder)).then(response=>{
                this.close()
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