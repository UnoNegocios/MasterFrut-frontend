<template>    
    <v-card>
        <!-- Titulo del dialogo -->
        <v-card-title>
            Editar Compra
        </v-card-title>
        <v-divider></v-divider>
            <!-- Formulario -->
        <v-form ref="form">
            <v-row class="py-3 px-6">
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
                        <template slot="no-data"><div class="px-4 py-1">No existen proveedores relacionadas.</div></template>                      
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
                    <v-text-field class="mx-4 pt-0 mt-8" label="Porcentaje de IVA" v-model="editedItem.iva_percentage"></v-text-field>
                    <v-text-field class="mx-4 pt-0" label="Porcentaje de ISR" v-model="editedItem.isr_percentage"></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="8">
                    <v-textarea v-model="editedItem.notes" label="Descripcion"></v-textarea>
                </v-col>
            </v-row>
            <v-card-actions class="pt-0">
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="close">Cancelar</v-btn>
                <v-btn color="blue darken-1" text :loading="gris" :disabled="gris || !valid" @click="save">Guardar</v-btn>
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
    props:{
        editedItem:Object
    },
    data:()=>({ 
        pdf:'',
        xml:'',
        snackbar: {
            show: false,
            message: null,
            color: null
        },
        gris:false,
        dropzoneOptions: {
            url: process.env.VUE_APP_BACKEND_ROUTE + "api/v1/quotation/files",
            addRemoveLinks: true,
            maxFiles: 1
        },
        series:['Serie A',  'Serie B', 'Inversiones'],
        valid: true,
        datePicker1:false,
        datePicker2:false,
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
    },
    methods:{
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
        uploadSuccess2(file, response) {
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
            if(this.pdf!=''){
                this.$refs.myVueDropzone.removeFile(this.pdf)
            }
            if(this.xml!=''){
                this.$refs.myVueDropzone2.removeFile(this.xml)
            }
            this.gris = false
            this.editedItem = Object.assign({}, this.defaultItem)
            this.$nextTick(() => {
                this.$emit("closeDialogEditShopping", false);
            })
        },
        save () {
            this.editedItem.last_updated_by_user_id = this.currentUser.id
            axios.put(process.env.VUE_APP_BACKEND_ROUTE + "api/v1/shopping/update",Object.assign(this.editedItem)).then(response=>{
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