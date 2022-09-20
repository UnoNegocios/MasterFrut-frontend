<template>    
    <v-card>
        <!-- Titulo del dialogo -->
        <v-card-title>
            Agregar Gasto
        </v-card-title>
        <v-divider></v-divider>
            <!-- Formulario -->
        <v-form ref="form">
            <v-row class="py-3 px-6">


                <v-col cols="12" sm="6" md="4">
                    <v-text-field :rules="[v => !!v || 'Campo requerido']" v-model="editedItem.concept" label="Concepto"></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                    <v-autocomplete clearable v-model="editedItem.type" :items="expensesTypeList" label="Tipo de Gasto" item-text="name" item-value="id">
                        <template slot="no-data">
                            <div class="px-6 pt-3">
                                No existen tipos de gasto relacionados.
                                <v-text-field v-model="expenseType.name" label="Tipo de Gasto" append-icon="mdi-plus" @click:append="saveExpenseType()"></v-text-field>
                            </div>
                        </template>                   
                    </v-autocomplete>
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
                </v-col>


                <v-col cols="12" sm="6" md="4">
                    <v-select :items="series" v-model="editedItem.serie" label="Serie"></v-select>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                    <v-autocomplete clearable v-model="editedItem.payment_method_id" :items="methodList" label="Metodo de Pago" item-text="method" item-value="id">
                        <template slot="no-data"><div class="px-4 py-1">No existen metodos relacionados.</div></template>                      
                    </v-autocomplete>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                    <v-text-field :rules="[v => !!v || 'Campo requerido']" v-model="editedItem.amount" type="number" prefix="$" label="Monto"></v-text-field>
                </v-col>


                <v-col cols="12" sm="6" md="4">
                    <v-menu v-model="datePicker1" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px" >
                        <template v-slot:activator="{ on }">
                            <v-text-field :rules="[v => !!v || 'Campo requerido']" clearable required v-model="editedItem.date" label="Fecha" prepend-icon="mdi-calendar" readonly v-on="on"></v-text-field>
                        </template>
                        <v-date-picker color="primary" v-model="editedItem.date" @input="datePicker1 = false"></v-date-picker>
                    </v-menu>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                    <v-menu v-model="datePicker2" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px" >
                        <template v-slot:activator="{ on }">
                            <v-text-field :rules="[v => !!v || 'Campo requerido']" clearable required v-model="editedItem.due_date" label="Fecha de vencimiento" prepend-icon="mdi-calendar" readonly v-on="on"></v-text-field>
                        </template>
                        <v-date-picker color="primary" v-model="editedItem.due_date" @input="datePicker2 = false"></v-date-picker>
                    </v-menu>
                </v-col>
                <v-col cols="12" sm="6" md="4">                   
                    <v-menu v-model="datePicker3" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px" >
                        <template v-slot:activator="{ on }">
                            <v-text-field :rules="[v => !!v || 'Campo requerido']" clearable required v-model="editedItem.payment_date" label="Fecha de Pago" prepend-icon="mdi-calendar" readonly v-on="on"></v-text-field>
                        </template>
                        <v-date-picker color="primary" v-model="editedItem.payment_date" @input="datePicker3 = false"></v-date-picker>
                    </v-menu>
                </v-col>


                <v-col cols="12" sm="6" md="4">
                    <v-text-field :rules="[v => !!v || 'Campo requerido']" v-model="editedItem.invoice" label="Factura"></v-text-field>
                    <v-checkbox v-model="editedItem.paid" label="Pagada"></v-checkbox>
                </v-col>
                <v-col cols="12" sm="6" md="8">
                    <v-textarea v-model="editedItem.notes" label="Descripcion"></v-textarea>
                </v-col>


            </v-row>
            <v-row class="ma-0 pa-0">
                <v-col cols="12" sm="12" md="6">
                    <v-menu top offset-x>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn style="font-size:12px;" text v-bind="attrs" v-on="on">
                                <v-icon class="mr-2">mdi-attachment</v-icon> Adjuntar archivo
                            </v-btn>
                        </template>
                        <vue-dropzone ref="myVueDropzone" id="dropzone" :options="dropzoneOptions" :useCustomSlot="true" v-on:vdropzone-success="uploadSuccess" v-on:vdropzone-error="uploadError" v-on:vdropzone-removed-file="fileRemoved"/>
                    </v-menu>
                </v-col>
                <v-col cols="12" sm="12" md="6">
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="blue darken-1" text @click="close">Cancelar</v-btn>
                        <v-btn color="blue darken-1" text @click="save" :loading="gris" :disabled="gris || !valid">Guardar</v-btn>
                    </v-card-actions>
                </v-col>
            </v-row>
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
        createProvider:{
            name:'',
        }, 
        expenseType:{
            name:'',
        },
        dropzoneOptions: {
            url: process.env.VUE_APP_BACKEND_ROUTE + "api/v1/quotation/files",
            addRemoveLinks: true,
            maxFiles: 1
        },
        snackbar: {
            show: false,
            message: null,
            color: null
        },
        gris:false,
        series:['Serie A',  'Serie B', 'Inversiones'],
        valid: true,
        datePicker1:false,
        datePicker2:false,
        datePicker3:false,
        editedItem: {
            concept:'',
            type:'',
            provider_id:'',
            serie:'',
            payment_method_id:'',
            amount:'',
            date:'',
            invoice:'',
            due_date:'',
            payment_date:'',
            paid:false,
            notes:'',
            pdf:'',
            created_by_user_id:'',
            last_updated_by_user_id:'',
            remission:''
        },
        rules: {
            required: value => !!value || 'Campo requerido',
        },
    }),
    computed:{
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
        methodList:{
            get(){
                return this.$store.state.payment_method.payment_methods
            }
        },
        expensesTypeList:{
            get(){
                return this.$store.state.expense_type.expense_types
            }
        }
    },
    methods:{
        saveProvider(){
            axios.post(process.env.VUE_APP_BACKEND_ROUTE + "api/v1/provider/create",Object.assign(this.createProvider)).then(response=>{
                this.$store.dispatch('provider/getProviders')
                this.disable = true
                this.createProvider.name=''
            }) 
        },
         uploadSuccess(file, response) {
            console.log('File Successfully Uploaded with file name: ' + response.file);
            this.fileName = response.file;
            this.editedItem.pdf = this.fileName;
        },
        uploadError(file, message) {
            console.log('An Error Occurred');
        },
        fileRemoved() {
            
        },
        close () {
            this.gris = false
            this.editedItem = Object.assign({}, this.defaultItem)
            this.editedItem.paid = false
            this.$nextTick(() => {
                this.$emit("closeDialogCreateExpense", false);
            })
        },
        save () {
            this.gris = true
            this.editedItem.created_by_user_id = this.currentUser.id
            this.editedItem.last_updated_by_user_id = this.currentUser.id
            axios.post(process.env.VUE_APP_BACKEND_ROUTE + "api/v1/expense/create",Object.assign(this.editedItem)).then(response=>{
                this.close()
            })
            
        },
        saveExpenseType () {
            axios.post(process.env.VUE_APP_BACKEND_ROUTE + "api/v1/expense_type/create",Object.assign(this.expenseType)).then(response=>{
                this.$store.dispatch('expense_type/getExpenseTypes')
            }).catch(error => {
                this.snackbar = {
                    message: error.response.data.message,
                    color: 'error',
                    show: true
                }
            })
        },
    }
}
</script>