<template>
    <v-row class="ma-0 pa-6">
        <!-- Detalle de Empresa -->
        <v-data-table v-if="company!=undefined" :headers="headers" :items="shippingDetail" class="elevation-0 px-6 py-4" dense style="width: 100%!important;">
            <!-- Header -->
            <template v-slot:top>
                <v-toolbar flat >
                    <v-toolbar-title>Envios</v-toolbar-title>
                    <!--v-btn icon>
                        <v-icon @click="openFilter">mdi-filter</v-icon>
                    </v-btn>
                    <v-spacer></v-spacer>
                    <v-btn icon>
                        <v-icon @click="exportExcel">mdi-download</v-icon>
                    </v-btn-->
                </v-toolbar>
            </template>
            <template v-slot:[`item.completed`]="{ item }">
                <v-icon v-if="item.completed==true">mdi-check</v-icon>
                <v-icon v-else>mdi-close</v-icon>
            </template>
            <!-- Tabla sin información -->
            <template v-slot:no-data>
                No existen registros de envíos aún
            </template>
            <!-- Creación -->
            <template v-slot:[`item.created_at`]="{ item }">
                {{item.created_at.slice(0, 10)}}
            </template>
            <!-- Actualización -->
            <template v-slot:[`item.updated_at`]="{ item }">
                {{item.updated_at.slice(0, 10)}}
            </template>
                <!-- Acciones por fila -->
            <template v-slot:[`item.actions`]="{ item }">
                <v-menu bottom left v-if="(permissions('editShippingDetails')==true || permissions('deleteShippingDetails')==true) && item.completed==false">
                    <template v-slot:activator="{ on, attrs }">
                    <v-btn icon v-bind="attrs" v-on="on">
                        <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                    </template>
                    <v-list style="font-size:13px;">
                        <v-list-item @click="editItem(item.id)"  v-show="permissions('editShippingDetails')">
                            <v-icon small class="mr-2">
                                mdi-pencil
                            </v-icon>
                            Editar
                        </v-list-item>
                        <v-list-item @click="deleteItem(item)"  v-show="permissions('deleteShippingDetails')">
                            <v-icon small class="mr-2">
                                mdi-delete
                            </v-icon>
                            Eliminar
                        </v-list-item>
                    </v-list>
                </v-menu>
            </template>
        </v-data-table>

        <!-- pwa -->
        <div class="hidden-md-and-up pb-12" style="width:100vw;">


            
            <v-card class="mb-3 py-3 px-4 elevation-0">
                <v-row class="mx-0 mt-0">
                    <v-col cols="6">
                        <v-card-subtitle class="pt-2 pl-0" style="font-size:14px; font-weight:700; color: rgba(0, 0, 0, 0.4);"> Folio: {{shipping.id}}</v-card-subtitle>
                    </v-col>
                    <v-col cols="6" style="text-align:right;">
                        <v-chip style="border-radius:5px!important; font-size:12px;" color="#e7e8e9">{{shipping.vehicle}}</v-chip>
                    </v-col>
                </v-row>

                <v-card-title style="font-size:16px;" class="pt-0 pb-0 px-2">{{shipping.driver}}</v-card-title>
                <v-card-text class="px-2" style="font-size:14px;"><v-icon small class="mr-2">mdi-calendar</v-icon>{{shipping.date}}</v-card-text>

                <v-row class="mx-0 mb-0">
                    <v-col cols="4" style="font-size:13px;">
                        KM: {{shipping.initial_km*1}}
                    </v-col>
                    <v-col cols="4" style="font-size:13px;">
                        KM: {{shipping.final_km*1}}
                    </v-col>
                    <v-col cols="4" style="font-size:13px; text-align:right;">
                        <strong>{{shipping.weight}}</strong>
                    </v-col>
                </v-row>
            </v-card>

            <div>
                <v-row class="ma-0 pt-6 pb-4" style="font-weight:600;">
                    <v-col cols="6">
                        Ventas 
                    </v-col>
                    <v-col cols="6" style="text-align:right;">
                        <span v-if="shippingDetail!=undefined">{{shippingDetail.length}}</span>
                    </v-col>
                </v-row>




                 <v-card-text class="py-0 pl-0">
                    <v-timeline align-top dense style="margin-left:-20px;">
                        <v-timeline-item class="mt-4" v-for="(shipping, index) in shippingDetail" v-bind:key="index" :color="color(shipping.completed)" small>
                            <v-row>

                                <v-col cols="10" class="pt-0">
                                    <v-card-subtitle class="pa-0" style="font-size:14px; font-weight:700; color: rgba(0, 0, 0, 0.69);"> Venta: {{shipping.sale_id}}</v-card-subtitle>
                                    
                                    <strong>{{shipping.company}}</strong><br>
                                    Contacto: {{shipping.contact}}<br>
                                    Peso: {{shipping.weight}}kg<br>
                                    <span v-if="shipping.due!='$0.00'">Cobrar: {{shipping.due}}<br></span>
                                    Factura: {{shipping.invoice}}<br>
                                </v-col>

                                <v-col cols="2" class="pt-0">
                                    <v-menu bottom left v-show="(permissions('editShippingDetails') || permissions('deleteShippingDetails')) && shipping.completed!=true">
                                        <template v-slot:activator="{ on, attrs }">
                                        <v-btn icon v-bind="attrs" v-on="on">
                                            <v-icon>mdi-dots-vertical</v-icon>
                                        </v-btn>
                                        </template>
                                        <v-list style="font-size:13px;">
                                            <v-list-item @click="editItem(shipping.id)"  v-show="permissions('editShippingDetails') && shipping.completed!=true">
                                                <v-icon small class="mr-2">
                                                    mdi-pencil
                                                </v-icon>
                                                Editar
                                            </v-list-item>
                                            <v-list-item @click="deleteItem(shipping)"  v-show="permissions('deleteShippingDetails') && shipping.completed!=true">
                                                <v-icon small class="mr-2">
                                                    mdi-delete
                                                </v-icon>
                                                Eliminar
                                            </v-list-item>
                                        </v-list>
                                    </v-menu>

                                    <v-spacer class="my-6"></v-spacer>

                                    <v-btn v-if="shipping.pdf!=null && shipping.pdf!=undefined && shipping.pdf!=''" v-bind:href="liga + 'files/' + shipping.pdf" target="_blank" icon>
                                        <v-icon>mdi-download</v-icon>
                                    </v-btn>

                                    <v-menu  v-if="shipping.completed!=true" offset-y :close-on-content-click="false">
                                        <template v-slot:activator="{ on, attrs }">
                                            <v-btn v-bind="attrs" v-on="on" icon>
                                                <v-icon>mdi-upload</v-icon>
                                            </v-btn>
                                        </template>
                                        <div class="pa-2" style="background:white;">
                                            <strong style="font-size:12px;">Adjunta factura para continuar</strong>
                                            <vue-dropzone class="mb-2" ref="myVueDropzone" id="dropzone" :options="dropzoneOptions" :useCustomSlot="true" v-on:vdropzone-success="uploadSuccess" v-on:vdropzone-error="uploadError" v-on:vdropzone-removed-file="fileRemoved"/>
                                            <v-btn @click="saveCompleted(shipping.id)"  small rounded color="primary" class="elevation-0"> Guardar</v-btn><!-- :disabled="fileName==''" -->
                                        </div>
                                    </v-menu>


                                </v-col>
                            </v-row>
                        </v-timeline-item>
                    </v-timeline>
                </v-card-text>
                <v-row class="ma-0 pt-6 pb-4 px-4">
                        <span style="font-weight:600;">Nota(s):</span>
                        {{shipping.note}}
                </v-row>
                <div class="pa-3" style="background:white; text-align: center!important; font-weight:600;">
                    Kilometraje recorrido: {{shipping.route}}kms
                </div>
                <v-row class="ma-0 pt-6 pb-4">
                    <v-col cols="6">
                        Creado:  {{shipping.created_at.slice(0, 10)}}
                    </v-col>
                    <v-col cols="6" style="text-align:right;">
                        Editado: {{shipping.updated_at.slice(0, 10)}}
                    </v-col>
                </v-row>
            </div>

            <v-btn bottom color="#e25200" dark fab fixed right @click="addDialog=true">
                <v-icon color="white">  mdi-plus </v-icon>
            </v-btn> 
        </div>

        <!-- Normal -->
        <v-col class="elevation-0 px-6 py-4 hidden-sm-and-down" v-if="company==undefined" cols="12" sm="6" md="10">
            <v-data-table :headers="headers" :items="shippingDetail" class="elevation-0" style="background: #f7f7f7;!important" dense>
                <template v-slot:[`item.completed`]="{ item }">
                    <v-icon v-if="item.completed==true">mdi-check</v-icon>

                    <v-menu v-else offset-y :close-on-content-click="false">
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn color="primary" dark v-bind="attrs" v-on="on" icon>
                                <v-icon>mdi-close</v-icon>
                            </v-btn>
                        </template>
                        <div class="pa-2" style="background:white;">
                            <strong style="font-size:12px;">Adjunta factura para continuar</strong>
                            <vue-dropzone class="mb-2" ref="myVueDropzone" id="dropzone" :options="dropzoneOptions" :useCustomSlot="true" v-on:vdropzone-success="uploadSuccess" v-on:vdropzone-error="uploadError" v-on:vdropzone-removed-file="fileRemoved"/>
                            <v-btn @click="saveCompleted(item.id)" :disabled="fileName==''" small rounded color="primary" class="elevation-0"> Guardar</v-btn>
                        </div>
                    </v-menu>
                </template>
                <!-- Tabla sin información -->
                <template v-slot:no-data>
                    No existen registros de envíos aún
                </template>
                <!-- Pdf -->
                <template v-slot:[`item.pdf`]="{ item }">
                    <v-btn v-if="item.pdf!=null && item.pdf!=undefined && item.pdf!=''" v-bind:href="liga + 'files/' + item.pdf" target="_blank" icon>
                        <v-icon small>mdi-download</v-icon>
                    </v-btn>
                </template>
                <!-- Creación -->
                <template v-slot:[`item.created_at`]="{ item }">
                    {{item.created_at.slice(0, 10)}}
                </template>
                <!-- Actualización -->
                <template v-slot:[`item.updated_at`]="{ item }">
                    {{item.updated_at.slice(0, 10)}}
                </template>
                 <!-- Acciones por fila -->
                <template v-slot:[`item.actions`]="{ item }">
                    <v-menu bottom left v-if="(permissions('editShippingDetails')==true || permissions('deleteShippingDetails')==true) && item.completed!=true">
                        <template v-slot:activator="{ on, attrs }">
                        <v-btn icon v-bind="attrs" v-on="on">
                            <v-icon>mdi-dots-vertical</v-icon>
                        </v-btn>
                        </template>
                        <v-list style="font-size:13px;">
                            <v-list-item @click="editItem(item.id)"  v-show="permissions('editShippingDetails')">
                                <v-icon small class="mr-2">
                                    mdi-pencil
                                </v-icon>
                                Editar
                            </v-list-item>
                            <v-list-item @click="deleteItem(item)"  v-show="permissions('deleteShippingDetails')">
                                <v-icon small class="mr-2">
                                    mdi-delete
                                </v-icon>
                                Eliminar
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </template>
            </v-data-table>
        </v-col>
        
        <v-col class="elevation-0 px-6 py-4 hidden-sm-and-down"  v-if="company==undefined" cols="12" sm="6" md="2">
            <v-btn @click="addDialog=true" color="primary" rounded class="elevation-0">Agregar</v-btn>
        </v-col>
        <!-- Crear envio -->
        <v-dialog v-model="addDialog" max-width="700px">
          <add @closeDialogAddShipping="closeDialogAddShipping" v-bind:shippingId="shipping"/>
        </v-dialog>
        <!-- Editar envio -->
        <v-dialog v-model="editDialog" max-width="700px">
          <edit v-bind:shippingOrder="shippingOrder" @closeDialogEditShipping="closeDialogEditShipping"/>
        </v-dialog>
        <!-- Dialogo confirmación de eliminación -->
        <div class="text-center">
            <v-bottom-sheet  v-model="sheet" inset>
                <v-sheet class="text-center" height="150px">
                    <div class="pt-6">
                    ¿Seguro que deseas borrar la venta {{deleteFolio}} del envío {{shipping.id}}?
                    </div>
                    <v-btn class="mt-4" text color="error" @click="deleteShipping()">
                    Eliminar
                    </v-btn>
                    <v-btn class="mt-4" text color="grey" @click="cancel()">
                    Cancelar
                    </v-btn>
                </v-sheet>
            </v-bottom-sheet>
        </div>
        <v-snackbar :color="snackbar.color" v-model="snackbar.show">
            {{ snackbar.message }}
        </v-snackbar>
    </v-row>
</template>

<script>
import vue2Dropzone from "vue2-dropzone";
import "vue2-dropzone/dist/vue2Dropzone.min.css";
import axios from "axios";
    import Add from "../detail/add"
    import Edit from "../detail/edit"
    export default {
        props:{
            shipping:Object,
            company:String
        },
        components: {
            vueDropzone: vue2Dropzone,
            'add':Add,
            'edit':Edit,
        },
        data: () => ({
            deleteFolio:'',
            completedId:'',
            dropzoneOptions: {
                url: process.env.VUE_APP_BACKEND_ROUTE + "api/v1/shipping_detail/files/",
                addRemoveLinks: true,
                maxFiles: 1,
                maxFilesize: 100,
            },
            fileName:'',
            addDialog:false,
            editDialog:false,
            sheet:false,
            deleteId:'',
            shippingOrder:'',
            snackbar: {
                show: false,
                message: null,
                color: null
            },
        }),
        computed: {
            liga(){
                return process.env.VUE_APP_BACKEND_ROUTE
            },
            currentUser:{
                get(){
                    return this.$store.state.currentUser.user;
                }
            },
            shippingDetail(){
                return this.shipping.details.map(id=>{
                    return{
                        id:id.id,
                        sale_id:id.sale.id,
                        shipping_id: this.shipping.id,
                        sale: id.sale.id + ' | ' + id.sale.company_name +this.contact(id.sale.contact),
                        completed: id.completed,
                        invoice: id.invoice,
                        pdf: id.pdf,
                        weight: id.sale.sale_weight + ' kg',
                        due: (id.sale.sale_due_balance*1).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})
                    }
                });
            },
            headers(){ 
                return [
                { text: 'Venta', value: 'sale' },
                { text: 'Entregado', value: 'completed' },
                { text: 'Factura', value: 'invoice' },
                { text: 'PDF', value: 'pdf' },
                { text: 'Peso', value: 'weight' },
                { text: 'Monto por cobrar', value: 'due' },
                { value: 'actions', sortable: false, align: 'end', },
            ]},
        },
        methods:{
            contact(contact){
                if(contact!=undefined){
                    return ' | '  + contact.name + ' ' + contact.last
                }else{
                    return ''
                }
            },
            calcWeight(details){
                var sum = 0
                for(var i=0; i<details.length; i++){
                    sum = sum + details[i].sale.sale_weight
                }
                return sum + ' kg' 
            },
            color(completed){
                if(completed==true){
                    return 'green'
                }else{
                    return 'red'
                }
            },
            saveCompleted(id){
                const filename = this.fileName
                var editedItem = {
                    pdf: filename,
                    completed: true
                }
                axios.patch(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/shipping_details/" + id, editedItem).then(response=>{
                    this.snackbar = {
                        message: 'Envío Completado',
                        color: 'success',
                        show: true
                    }
                    this.shipping.details.filter(detail=>detail.id == id)[0].pdf = filename
                    this.shipping.details.filter(detail=>detail.id == id)[0].completed = true
                    
                }).catch(error => {
                    this.snackbar = {
                        message: error.response.data.message,
                        color: 'error',
                        show: true
                    }
                })
            },
            uploadSuccess(file, response) {
                console.log('File Successfully Uploaded with file name: ' + response.file);
                this.fileName = response.file;
            },
            uploadError(file, message) {
                console.log('An Error Occurred');
            },
            fileRemoved() {
                this.fileName = ''
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
            deleteItem (item) {
                this.deleteId = item.id
                this.deleteFolio = item.sale_id
                this.sheet = true
            },
            deleteShipping(){
                var shhipping_detail = this.shipping.details.filter(shipping=>shipping.id == this.deleteId)[0]
                var deletedIndex = this.shipping.details.indexOf(shhipping_detail)
                axios.delete(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/shipping_details/"+this.deleteId).then(response => {
                    this.shipping.details.splice(deletedIndex, 1)
                    this.deleteId = ''
                    this.sheet = false
                }).catch(error => {
                    this.snackbar = {
                        message: error.response.data.message,
                        color: 'error',
                        show: true
                    }
                });
            },
            cancel(){
                this.deleteId = ''
                this.sheet = false
            },
            editItem(editedItem){
                this.shippingOrder = this.shipping.details.filter(detail=>detail.id == editedItem).map(id=>{
                    return{
                        completed:id.completed,
                        sale_id:id.sale.id,
                        shipping_id:this.shipping.id,
                        invoice:id.invoice,
                    }
                })[0]
                this.editDialog = true
            },
            closeDialogEditShipping: function(params) {
                this.editDialog = false;
                
            },
            closeDialogAddShipping: function(params) {
                this.addDialog = false;
                
            }
        }
    }
</script>