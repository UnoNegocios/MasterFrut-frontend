<template>
    <v-container style="max-width:100vw;">

        <v-card class="elevation-0 px-12 py-6">
            
            <v-autocomplete class="mb-6" @keydown.enter="filter()" v-model="editedItem.company_id" :items="companyLists" :loading="isLoadingCompany" :search-input.sync="searchCompanies" hide-no-data item-value="id" item-text="name" label="Cliente" placeholder="Escribe para buscar" attach>
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

            <v-row>
                <v-radio-group v-model="factura" class="mb-4">
                    <v-radio label="Remisión" color="primary" value="remission"></v-radio>
                    <v-radio label="Factura" color="primary" value="invoice"></v-radio>
                </v-radio-group>
                <v-spacer></v-spacer>

                <v-menu v-model="datePicker" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px">
                    <template v-slot:activator="{ on }">
                        <v-text-field class="mt-4" :rules="[v => !!v || 'Campo requerido']" clearable required v-model="editedItem.date" label="Fecha" prepend-icon="mdi-calendar" readonly v-on="on"></v-text-field>
                    </template>
                    <v-date-picker color="primary" v-model="editedItem.date" @input="datePicker = false"></v-date-picker>
                </v-menu>

                 <v-spacer></v-spacer>

                <v-btn @click="type='Venta'" x-large class="elevation-0" color="success" inset v-show="type=='Cancelación'">Regresar a Venta</v-btn>
                <v-btn @click="type='Cancelación'" x-large class="elevation-0" color="error" inset v-show="type=='Venta'">Cancelación</v-btn>
            </v-row>
            
            <div v-if="type=='Venta'">
                <!-- # factura o remisión-->
                <v-text-field v-model="editedItem.invoice" v-show="factura=='invoice'" label="Factura SAE" rounded outlined prefix="#"></v-text-field>
                <v-text-field v-model="editedItem.remission" v-show="factura=='remission'" label="Remisión SAE" rounded outlined prefix="#"></v-text-field>

                <!-- Moneto de Ticket -->
                <v-text-field v-model="editedItem.amount" label="Monto Ticket" rounded type="number" outlined prefix="$"></v-text-field>

                <!-- Metodos de Pago e Importes -->
                <v-card class="elevation-0">
                <!-- Titulo -->
                <v-card-title class="mb-2">
                    <span class="headline">Metodo de Pago</span>
                </v-card-title>
                    <v-card-text class="pb-0">
                        <v-container>
                        <!-- Formulario -->
                            <v-row class="form-group py-2" v-for="(method,k) in editedItem.methods" :key="k">
                                <v-col cols="5" class="py-0 my-0">
                                    <v-select :items="methodList" v-model="method.method" rounded outlined label="Metodo de Pago" item-text="method" item-value="id"></v-select>
                                </v-col>
                                <v-col cols="4" class="py-0 my-0">
                                    <v-text-field v-model="method.recibido" prefix="$" type="number" label="Importe de Pago"></v-text-field>
                                </v-col>
                                <v-col cols="2">
                                    <v-icon @click="remove(k)" v-show="k || ( !k && editedItem.methods.length > 1)" color="red">mdi-close</v-icon>
                                    <v-icon @click="add(k)" v-show="k == editedItem.methods.length-1" color="primary">mdi-plus</v-icon>
                                </v-col>
                            </v-row>
                        </v-container>
                    </v-card-text>
                </v-card>

            </div>
            <div v-else>
                <v-autocomplete v-model="editedItem.invoice" v-show="factura=='invoice'" label="Factura SAE" rounded outlined :items="invoices" item-text="invoice" item-value="invoice"></v-autocomplete>
                <v-autocomplete v-model="editedItem.remission" v-show="factura=='remission'" label="Remisión SAE" rounded outlined :items="remissions" item-text="remission" item-value="remission"></v-autocomplete>
            </div>

            <!-- Guardar -->
            <v-card-actions>
                <v-card-subtitle v-if="type=='Venta'" class="pb-0" style="font-size:30px!important; line-height:55px;">
                    <strong>Por Pagar = {{(editedItem.amount*1).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}</strong><br>
                    <strong>Pagado = {{(pagado*1).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}</strong><br>
                    <strong v-if="cambio>0">Cambio = {{(cambio*1).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}</strong>
                    <strong v-else>Faltan = {{(cambio*-1).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}</strong>
                </v-card-subtitle>
                <v-spacer></v-spacer>
                <v-btn color="primary" class="pa-12 elevation-0" :loading="gris" :disabled="gris" style="font-size:25px!important;" @click="save">Guardar</v-btn>
            </v-card-actions>
        </v-card>

        <v-snackbar :color="snackbar.color" v-model="snackbar.show">
            {{ snackbar.message }}
        </v-snackbar>
    </v-container>
</template>

<script>
import axios from "axios";
export default {
    data () {
        return {
            datePicker:'',
            type:'Venta',
            factura:'',
            editedItem: {
                serie:'',
                macro:true,
                date:new Date(),
                payment_method_id:'',
                amount:'',
                invoice:'',
                note:'',
                pdf:'',
                created_by_user_id:'',
                last_updated_by_user_id:'',
                user_id:'',
                company_id:'',
                remission:'',
                salesID:[],
                methods:[{
                    method:'',
                    amount:'',
                    recibido:''
                }]
            },
            gris:false,
            snackbar: {
                show: false,
                message: null,
                color: null
            },
            entries:{
                companies: []
            },
            isLoadingCompany: false,
            searchCompanies: null
        }
    },
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
    },
    created(){
        this.editedItem.date = new Date().toLocaleString("sv-SE", {timeZone: "America/Monterrey"}).toString().slice(0, 10)
    },
    computed:{
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
        remissions(){
            return this.$store.state.collection.collections.filter(collection=>collection.remission!=undefined)
        },
        invoices(){
            return this.$store.state.collection.collections.filter(collection=>collection.invoice!=undefined)
        },
        methodList:{
            get(){
                return this.$store.state.payment_method.payment_methods
            }
        },
        cambio(){
            return  this.pagado - (this.editedItem.amount*1)
        },
        pagado(){
            var sum = 0
            this.editedItem.methods.forEach(e => {
                sum += (Number(e.recibido));
            });
            return  sum
        },
        currentUser:{
            get(){
                return this.$store.state.currentUser.user
            }
        }
    },
    methods: {
        lowerCase(text){
            if(text!=null&&text!=undefined&&text!=''){
                return text.toLowerCase()
            }else{
                return ' '
            }
        },
        paymentMethod(id){
            return this.$store.state.payment_method.payment_methods.filter(method=>method.id == id).map(method=>method.method)[0]
        },
        add(index) {
            var sum = 0
            var resultado = 0
            resultado = this.cambio*-1
            this.editedItem.methods.push({ method: '', recibido: resultado.toFixed(2) });
        },
        remove(index) {
            this.editedItem.methods.splice(index, 1);
        },
        save(){
            this.editedItem.payment_method_id = this.editedItem.methods[0].method
            this.gris = true
            this.editedItem.created_by_user_id = this.currentUser.id
            this.editedItem.last_updated_by_user_id = this.currentUser.id
            this.editedItem.user_id = this.currentUser.id

            if(this.factura == 'invoice'){
                this.editedItem.remission = ''
                this.editedItem.serie = 'Serie A'
            }else if(this.factura == 'remission'){
                this.editedItem.invoice = ''
                this.editedItem.serie = 'Serie B'
            }



            if(this.type == 'Venta'){
                for(var i=0; i<this.editedItem.methods.length; i++){
                    if(this.lowerCase(this.paymentMethod(this.editedItem.methods[i].method)) == 'efectivo'){
                        this.editedItem.methods[i].amount = (this.editedItem.methods[i].recibido*1) - (this.cambio*1)
                    }else{
                        this.editedItem.methods[i].amount = this.editedItem.methods[i].recibido
                    }
                }
            }else if(this.type == 'Cancelación'){
                if(this.factura == 'remission'){
                    var oldCollection = this.$store.state.collection.collections.filter(collection=>collection.remission==this.editedItem.remission)[0]
                }
                else if(this.factura == 'invoice'){
                    var oldCollection = this.$store.state.collection.collections.filter(collection=>collection.invoice==this.editedItem.invoice)[0]   
                }
                this.editedItem.amount = oldCollection.amount*(-1)
                this.editedItem.methods = oldCollection.methods

                for(var j=0; j<this.editedItem.methods.length; j++){
                    this.editedItem.methods[j].amount = this.editedItem.methods[j].amount*(-1)
                }
            }
            
            
            this.$nextTick(() => {
                axios.post(process.env.VUE_APP_BACKEND_ROUTE + "api/v1/collection/create",Object.assign(this.editedItem)).then(response=>{
                    location.reload();
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
    }
}
</script>

<style>
.v-label, .v-input {
    font-size: 23px!important;
}
</style>