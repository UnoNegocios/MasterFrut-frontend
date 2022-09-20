<template>    
    <v-card>
        <!-- Titulo del dialogo -->
        <v-card-title>
            Agregar Compra
        </v-card-title>
        <v-divider></v-divider>
            <!-- Formulario -->
        <v-form ref="form">

            <v-stepper v-model="e1" class="elevation-0">
                <v-stepper-header class="elevation-0">
                    <v-stepper-step style="font-weight:bolder!important;" :complete="e1 > 1" step="1"></v-stepper-step>
                    <v-divider></v-divider>
                    <v-stepper-step style="font-weight:bolder!important;" step="2"></v-stepper-step>
                </v-stepper-header>
                <v-stepper-items>
                    <v-stepper-content step="1" class="py-0">
                        <v-row class="py-0 px-0 mx-0">
                            <v-col cols="12" sm="6" md="4">
                                <v-menu v-model="datePicker1" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px" >
                                    <template v-slot:activator="{ on }">
                                        <v-text-field :rules="[v => !!v || 'Campo requerido']" clearable required v-model="editedItem.date" label="Fecha" prepend-icon="mdi-calendar" readonly v-on="on"></v-text-field>
                                    </template>
                                    <v-date-picker color="primary" v-model="editedItem.date" @input="datePicker1 = false"></v-date-picker>
                                </v-menu>
                            </v-col>
                            <v-col cols="12" sm="6" md="4">
                                <v-select :items="series" v-model="editedItem.serie" label="Serie"></v-select>
                                <v-text-field :rules="[v => !!v || 'Campo requerido']" v-model="editedItem.invoice" label="Numero de Factura"></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="6" md="4">

                                <v-autocomplete clearable v-model="editedItem.provider_id" :items="providerList" label="Proveedor" item-text="name" item-value="id">
                                    <template slot="no-data">
                                        <div class="px-6 pt-3">
                                            No existen proveedores relacionados.
                                            <v-text-field v-model="createProvider.name" label="Proveedor" append-icon="mdi-plus" @click:append="saveProvider()"></v-text-field>
                                        </div>
                                    </template>
                                </v-autocomplete>



                                <v-menu v-model="datePicker2" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px" >
                                    <template v-slot:activator="{ on }">
                                        <v-text-field :rules="[v => !!v || 'Campo requerido']" clearable required v-model="editedItem.due_date" label="Fecha de vencimiento" prepend-icon="mdi-calendar" readonly v-on="on"></v-text-field>
                                    </template>
                                    <v-date-picker color="primary" v-model="editedItem.due_date" @input="datePicker2 = false"></v-date-picker>
                                </v-menu>
                            </v-col>
                            <v-col cols="12" sm="6" md="4">
                                <v-menu top offset-x>
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-btn style="font-size:12px;" text v-bind="attrs" v-on="on">
                                            <v-icon class="mr-2">mdi-attachment</v-icon> Adjuntar PDF
                                        </v-btn>
                                    </template>
                                    <vue-dropzone ref="myVueDropzone" id="dropzone" :options="dropzoneOptions" :useCustomSlot="true" v-on:vdropzone-success="uploadSuccess" v-on:vdropzone-error="uploadError" v-on:vdropzone-removed-file="fileRemoved"/>
                                </v-menu>
                                <v-menu top offset-x>
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-btn style="font-size:12px;" text v-bind="attrs" v-on="on">
                                            <v-icon class="mr-2">mdi-attachment</v-icon> Adjuntar Foto
                                        </v-btn>
                                    </template>
                                    <vue-dropzone ref="myVueDropzone2" id="dropzone2" :options="dropzoneOptions" :useCustomSlot="true" v-on:vdropzone-success="uploadSuccess2" v-on:vdropzone-error="uploadError" v-on:vdropzone-removed-file="fileRemoved"/>
                                </v-menu>
                            </v-col>
                            <v-col cols="12" sm="6" md="8">
                                <v-textarea v-model="editedItem.notes" label="Descripcion"></v-textarea>
                            </v-col>
                        </v-row>
                    </v-stepper-content>
                    <v-stepper-content  step="2" class="py-0">
                        <v-row style="background-color: #94949417;" class="px-2 ma-0 py-2" v-for="(item,k) in editedItem.products" :key="k">
                            <v-col cols="2" class="py-0 my-0">
                                <v-text-field type=number v-model="item.quantity" label="Cantidad"></v-text-field>
                            </v-col>
                            <v-col cols="6" class="py-0 my-0">
                                <v-autocomplete :items="itemLists" v-model="item.item_id" item-text="name" item-value="id" label="Producto"></v-autocomplete>
                            </v-col>
                            <v-col cols="3" class="py-0 my-0" v-if="item.item!=''">
                                <v-text-field v-model="item.unit_cost" prefix="$" suffix="c/u" label="Costo Unitario"></v-text-field>
                            </v-col>
                            <v-col cols="1">
                                <v-icon @click="remove(k)" v-show="k || ( !k && editedItem.products.length > 1)" color="red">mdi-close</v-icon>
                                <v-icon @click="add(k)" v-show="k == editedItem.products.length-1" color="primary">mdi-plus</v-icon>
                            </v-col>
                        </v-row>

                        <v-row class="px-2 ma-0 py-2 mt-2 calculos">
                            <v-col cols="4" class="py-0 my-0">
                                <v-text-field label="Porcentaje de IVA" v-model="editedItem.iva_percentage"></v-text-field>
                                <span style="font-size:14px; transform:translateY(-10px)!important:">Monto IVA: {{amount_iva.toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}</span>
                            </v-col>
                            <v-col cols="4" class="py-0 my-0">
                                <v-text-field label="Porcentaje de ISR" v-model="editedItem.isr_percentage"></v-text-field>
                                <span style="font-size:14px; transform:translateY(-10px)!important:">Monto ISR: {{amount_isr.toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}</span>
                            </v-col>
                            <v-col cols="4" class="py-0 my-0">
                                <strong>Subtotal: {{subtotal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}</strong>
                                <br/>
                                <strong>Total: {{amount_total.toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}</strong>
                            </v-col>
                        </v-row>
                    </v-stepper-content>
                </v-stepper-items>
            </v-stepper>




            <v-card-actions class="pt-4">
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="close">Cancelar</v-btn>

                <v-btn color="blue darken-1" text  v-if="e1>1" @click="e1 = e1-1">
                    <v-icon v-if="!isMobile()">mdi-chevron-left</v-icon>
                    Regresar
                </v-btn>
                <v-btn color="blue darken-1" text  v-if="e1!=2" @click="e1 = e1+1">
                    Siguiente
                    <v-icon v-if="!isMobile()">mdi-chevron-right</v-icon>
                </v-btn>

                <v-btn color="blue darken-1" text :loading="gris" :disabled="gris || valid" @click="save">Guardar</v-btn>
            </v-card-actions>
        </v-form>
        <v-snackbar :color="snackbar.color" v-model="snackbar.show">
            {{ snackbar.message }}
        </v-snackbar>
    </v-card>
</template>
<script>
import vue2Dropzone from "vue2-dropzone";
import "vue2-dropzone/dist/vue2Dropzone.min.css";
import axios from "axios";
export default {
    components: {
        vueDropzone: vue2Dropzone,
    },  
    data:()=>({ 
        pdf:'',
        xml:'',
        e1: 1,
        createProvider:{
            name:'',
        }, 
        dropzoneOptions: {
            url: process.env.VUE_APP_BACKEND_ROUTE + "api/v1/quotation/files",
            addRemoveLinks: true,
            maxFiles: 1,

        },
        series:['Serie A',  'Serie B', 'Inversiones'],
        datePicker1:false,
        datePicker2:false,
        editedItem: {
            date:'',
            serie:'',
            provider_id:'',
            invoice:'',
            due_date:'',
            notes:'',
            pdf:'',
            xml:'',
            created_by_user_id:'',
            last_updated_by_user_id:'',
            products:[{
                shopping_id:'',
                item_id:'',
                quantity:1,
                unit_cost:'',
                created_by_user_id:'',
                last_updated_by_user_id:'',
            }],
            iva_percentage:0,
            isr_percentage:0
        },
        snackbar: {
            show: false,
            message: null,
            color: null
        },
        gris:false,
        rules: {
            required: value => !!value || 'Campo requerido',
        },
    }),
    computed:{
        valid(){
            if(process.env.VUE_APP_BACKEND_ROUTE == "https://suministros.uno/"){
                if(this.editedItem.products[0].item_id!=''){
                    return false
                }else{
                    return true
                }
            }else{
                return false
            }
        },
        currentUser:{
            get(){
                return this.$store.state.currentUser.user
            }
        },
        providerList:{
            get(){
                return this.$store.state.provider.providers
            }
        },
        itemLists(){
            return this.$store.state.item.items//.filter(item=>item.type != 'Fabricado' && item.type != '')
        },
        subtotal(){
            var sum = 0
            for(var i=0; i<this.editedItem.products.length; i++){
                sum = sum + this.editedItem.products[i].unit_cost*this.editedItem.products[i].quantity
            }
            return sum
        },
        amount_iva(){
            return (this.subtotal/100)*this.editedItem.iva_percentage
        },
        amount_isr(){
            return (this.subtotal/100)*this.editedItem.isr_percentage
        },
        amount_total(){
            return this.subtotal + this.amount_iva - this.amount_isr
        },
    },
    methods:{
        add(index) {
            this.editedItem.products.push({
                shopping_id:'',
                item_id:'',
                quantity:1,
                unit_cost:'',
                created_by_user_id:'',
                last_updated_by_user_id:'',
            });
        },
        remove(index) {
            this.editedItem.products.splice(index, 1);
        },
        isMobile() {
            if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                return true
            } else {
                return false
            }
        },
        saveProvider(){
            axios.post(process.env.VUE_APP_BACKEND_ROUTE + "api/v1/provider/create",Object.assign(this.createProvider)).then(response=>{
                this.$store.dispatch('provider/getProviders')
                this.disable = true
                this.createProvider.name=''
            }) 
        },
         uploadSuccess(file, response) {
            this.pdf = file
            console.log('File Successfully Uploaded with file name: ' + response.file);
            this.fileName = response.file;
            this.editedItem.pdf = this.fileName;
        },
        uploadSuccess2(file, response) {
            this.xml = file
            console.log('File Successfully Uploaded with file name: ' + response.file);
            this.fileName = response.file;
            this.editedItem.xml = this.fileName;
        },
        uploadError(file, message) {
            console.log('An Error Occurred');
        },
        fileRemoved() {
            
        },
        close () {
            this.e1 = 1
            if(this.pdf!=''){
                this.$refs.myVueDropzone.removeFile(this.pdf)
            }
            if(this.xml!=''){
                this.$refs.myVueDropzone2.removeFile(this.xml)
            }
            this.gris = false
            this.editedItem = {
                date:'',
                serie:'',
                provider_id:'',
                invoice:'',
                due_date:'',
                notes:'',
                pdf:'',
                xml:'',
                created_by_user_id:'',
                last_updated_by_user_id:'',
                products:[{
                    shopping_id:'',
                    item_id:'',
                    quantity:1,
                    unit_cost:'',
                    created_by_user_id:'',
                    last_updated_by_user_id:'',
                }],
                iva_percentage:0,
                isr_percentage:0
            }
            this.$nextTick(() => {
                this.$emit("closeDialogCreateShopping", false);
                this.$store.dispatch('shopping/getShoppings')
            })
        },
        save () {
            this.editedItem.created_by_user_id = this.currentUser.id
            this.editedItem.last_updated_by_user_id = this.currentUser.id
            axios.post(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/shoppings",Object.assign(this.editedItem)).then(response=>{
                this.$store.dispatch('shopping/getShoppings')
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
    }
}
</script>
<style>
.calculos .v-text-field__details{
    display: none!important;
}
</style>
