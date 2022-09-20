<template>
    <v-card>
        <v-card-title class="pb-0 pt-1" >
            <v-icon style="background: #e7e8e9; padding: 10px!important; border-radius: 50%;" class="mr-4">mdi-file-document-outline</v-icon>
            <span >{{title}}</span>
            <v-spacer></v-spacer>
                <v-col cols="12" sm="6" md="4">
                    <v-autocomplete  :rules="[v => !!v || 'Campo requerido']" v-if="permissions('assignCollections')" clearable v-model="collection.user_id" :items="usersLists" label="Vendedor" item-text="name" item-value="id">
                        <template slot="no-data" class="pa-2">No existen usuarios relacionados.</template>                      
                    </v-autocomplete>
                    <v-autocomplete v-else-if="collection.user_id=currentUser.id" disabled v-model="collection.user_id" :items="usersLists" label="Vendedor" item-text="name" item-value="id">                
                    </v-autocomplete>
                </v-col>
                <v-col cols="12" sm="6" md="2">
                        <v-checkbox v-model="collection.macro" label="Macro"></v-checkbox>
                </v-col>
        </v-card-title>
        <v-divider></v-divider>


          <v-stepper v-model="e1" class="elevation-0">
            <v-stepper-header class="elevation-0">
                <v-stepper-step style="font-weight:bolder!important;" :complete="e1 > 1" step="1"></v-stepper-step>
                <v-divider></v-divider>
                <v-stepper-step style="font-weight:bolder!important;" step="2"></v-stepper-step>
            </v-stepper-header>
            <v-stepper-items>
                <v-stepper-content step="1" class="py-0">
                    <v-card-text class="pb-0 pt-0">
                        <v-container class="pt-0">
                            <v-row >
                                <v-col cols="12" sm="6" md="6" class="pb-0">
                                    
                                    <v-autocomplete item-text="detail" clearable v-model="collection.company_id" :items="companyLists" label="Cliente" item-value="id">
                                        <template slot="no-data"><div class="px-4 py-1">No existen clientes relacionados.</div></template>                  
                                        
                                        <template v-slot:item="{item, attrs, on}">
                                            <v-list-item v-on="on" v-bind="attrs">
                                                <v-list-item-content>
                                                    <v-list-item-title>
                                                        {{item.name}}
                                                        <div>
                                                            <span style="font-size:14px;">{{item.razon_social}}</span>
                                                        </div>
                                                        <div>
                                                            <span style="font-size:12px;">Metodo de Pago: {{paymentMethod(item.payment_method_id)}}</span>
                                                        </div>
                                                    </v-list-item-title>
                                                </v-list-item-content>
                                            </v-list-item>
                                        </template> 
                                    </v-autocomplete>

                                    <v-autocomplete clearable v-model="collection.methods[0].method" :items="paymentMethodLists" label="Metodo de Pago" item-text="method" item-value="id">
                                        <template slot="no-data"><div class="px-4 py-1">No existen metodos relacionadas.</div></template>                      
                                    </v-autocomplete>
                                    <v-text-field type=number v-model="collection.amount" label="Monto"></v-text-field>
                                    
                                    <v-radio-group v-model="factura">
                                        <v-row>
                                            <v-col cols="12" sm="2" md="2">
                                                <v-radio color="primary" value="invoice"></v-radio>
                                            </v-col>
                                            <v-col cols="12" sm="10" md="10" class="py-0">
                                                <v-text-field class="pt-0" :disabled="factura=='remission'" v-model="collection.invoice" label="Factura"></v-text-field>
                                            </v-col>
                                            <v-col cols="12" sm="2" md="2">
                                                <v-radio color="primary" value="remission"></v-radio>
                                            </v-col>
                                            <v-col cols="12" sm="10" md="10" class="py-0">
                                                <v-text-field class="pt-0" :disabled="factura=='invoice'" v-model="collection.remission" label="Remisión"></v-text-field>
                                            </v-col>
                                        </v-row>
                                    </v-radio-group>

                                </v-col>
                                <v-col cols="12" sm="6" md="6" class="pb-0">
                                    <v-menu v-model="datePicker" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px" >
                                        <template v-slot:activator="{ on }">
                                            <v-text-field :rules="[v => !!v || 'Campo requerido']" clearable required v-model="collection.date" label="Fecha de Pago" prepend-icon="mdi-calendar" readonly v-on="on"></v-text-field>
                                        </template>
                                        <v-date-picker color="primary" v-model="collection.date" @input="datePicker = false"></v-date-picker>
                                    </v-menu>
                                    <v-container fluid>
                                        <v-textarea v-model="collection.note" label="Referencia"></v-textarea>
                                    </v-container>
                                </v-col>
                            </v-row>
                        </v-container>
                    </v-card-text>
                </v-stepper-content>
                <v-stepper-content step="2" class="pt-0">
                    <v-card-text class="pb-0 pt-0" v-if="collection.company_id!=''&&collection.company_id!=null&&collection.company_id!=undefined&&collection.amount!=''&&collection.amount!=null&&collection.amount!=undefined&&esperaLaInfo">
                        <v-container class="pt-0">
                            <div class="mb-5">
                                <strong>Monto de Pago: </strong>{{(collection.amount*1).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
                                <br>
                                <strong>Aplicado: </strong>{{(gastado).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
                                <br>
                                <strong>Quedan: </strong>{{((collection.amount*1)-gastado).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
                            </div>
                            <v-data-table v-if="renderComponent" :headers="headers" :items="salesLists" item-key="id" class="elevation-1">
                                <template v-slot:[`item.select`]="{ item }">
                                    <v-btn class="elevation-0" fab dark :outlined="paja(item.id)" style="height: 21px!important; width: 21px!important;" color="primary" @click="checkbox(item)">
                                        <v-icon dark small>
                                            mdi-check
                                        </v-icon>
                                    </v-btn>
                                </template>
                                <template v-slot:[`item.payment`]="{ item }">
                                    {{(item.total - item.newDue).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
                                </template>
                                <template v-slot:[`item.total`]="{ item }">
                                    {{item.total.toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
                                </template>
                                <template v-slot:[`item.newDue`]="{ item }">
                                    {{item.newDue.toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
                                </template>
                            </v-data-table>
                        </v-container>
                    </v-card-text>
                </v-stepper-content>
            </v-stepper-items>
        </v-stepper>

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
                    <v-btn color="blue darken-1" text @click="close">
                        Cancelar
                    </v-btn>
                    <v-btn color="blue darken-1" text  v-if="e1>1" @click="e1 = e1-1">
                        <v-icon v-if="!isMobile()">mdi-chevron-left</v-icon>
                        Regresar
                    </v-btn>
                    <v-btn color="blue darken-1" text  v-if="e1!=2" @click="e1 = e1+1" :disabled="grey">
                        Siguiente
                        <v-icon v-if="!isMobile()">mdi-chevron-right</v-icon>
                    </v-btn>
                    <v-btn color="blue darken-1" text @click="save" :loading="gris" :disabled="gris || grey || (seleccionado&&this.selected.length<1)">
                        Guardar
                    </v-btn>
                </v-card-actions>
            </v-col>
        </v-row>
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
        props:{
            company:String,
            collection:Object
        },
        components: {
            vueDropzone: vue2Dropzone,
        },   
        data: () => ({
            factura:'',
            snackbar: {
                show: false,
                message: null,
                color: null
            },
            gris:false,
            renderComponent: true,
            selected: [],
            index:0,
            headers: [
                { text: '', value: 'select', sortable: false, align: 'start', },
                { text: 'Id', value: 'id'},//, align: 'start', sortable: false, value: 'name',
                { text: 'Factura', value: 'invoice' },
                { text: 'Monto', value: 'total' },
                { text: 'Abonado', value: 'payment' },
                { text: 'Saldo Pendiente', value: 'newDue' },
                { text: 'Fecha de Facturación', value: 'invoice_date' },
            ],
            e1: 1,
            datePicker:'',
            dropzoneOptions: {
                url: process.env.VUE_APP_BACKEND_ROUTE + "api/v1/collection/files",
                addRemoveLinks: true,
                maxFiles: 1
            },
            rules: {
                required: value => !!value || 'Campo requerido',
            },
            valid: true,
            salesLists:[],
            esperaLaInfo: false,
        }),
        computed: {
            title(){
                if(this.factura == 'invice'){
                    this.collection.remission = ''
                }else if(this.factura == 'remission'){
                    this.collection.invoice = ''
                }
                return 'Editar Cobranza'
            },
            gastado(){
                var gastado = 0
                if(this.renderComponent == true){
                    var gastado = 0
                    if(this.selected.length>0){
                        for(var i=0; i<this.selected.length; i++){
                            gastado = gastado + this.selected[i].amount
                        }
                    }
                    
                }
                return gastado
            },
            grey(){
                if(process.env.VUE_APP_BACKEND_ROUTE == "https://suministros.uno/"){
                    if( this.collection.company_id==''||
                        this.collection.company_id==null||
                        this.collection.company_id==undefined ||
                        this.collection.amount==''||
                        this.collection.amount==null||
                        this.collection.amount==undefined){
                            return true
                    }else{
                        return false
                    }
                }else{
                    if( this.collection.amount==''||
                        this.collection.amount==null||
                        this.collection.amount==undefined){
                            return true
                    }else{
                        return false
                    }
                }
            },
            seleccionado(){
                if(process.env.VUE_APP_BACKEND_ROUTE == "https://suministros.uno/"){
                    return true
                }else{
                    return false
                }
            },
            usersLists(){
                return this.$store.state.user.users;
            }, 
            companyLists(){
                return this.$store.state.company.companies.map(id=>{
                    return{
                        detail:id.razon_social + ' ' + id.name,
                        name:id.name,
                        razon_social:id.razon_social,
                        payment_method_id:id.payment_method_id,
                        id:id.id
                    }
                })//.filter(company=>this.due(company.id) == true)
            },
            paymentMethodLists(){
                return this.$store.state.payment_method.payment_methods;
            },
            currentUser:{
                get(){
                    return this.$store.state.currentUser.user
                }
            },
            
        },
        watch:{
            collection:{
                handler(){
                    this.collections = []
                    this.index = 0
                    this.salesLists2().then(response=>{
                        for(var i=0; i<this.collection.salesID.length; i++){
                            this.add(this.salesLists.filter(sale=>sale.id == this.collection.salesID[i].sale.id)[0])
                        }
                    })
                    if(process.env.VUE_APP_BACKEND_ROUTE == "https://suministros.uno/"){
                        if(this.collection.invoice!=null){
                            this.factura = 'invoice'
                        }else if(this.collection.remission!=null){
                            this.factura = 'remission'
                        }
                    }
                }, deep:true
            }
        },
        created(){
            if(this.company!=undefined){
                this.collection.company_id=Number(this.company)
            }  
            this.salesLists2().then(response=>{
                for(var i=0; i<this.collection.salesID.length; i++){
                    this.add(this.salesLists.filter(sale=>sale.id == this.collection.salesID[i].sale.id)[0])
                }
            })
            if(process.env.VUE_APP_BACKEND_ROUTE == "https://suministros.uno/"){
                if(this.collection.invoice!=null){
                    this.factura = 'invoice'
                }else if(this.collection.remission!=null){
                    this.factura = 'remission'
                }
            }
            this.index = this.selected.length
            if(this.collection.invoice!=''&&this.collection.invoice!=null&&this.collection.invoice!=undefined){
                this.factura = 'invoice'
            }else if(this.collection.remission!=''&&this.collection.remission!=null&&this.collection.remission!=undefined){
                this.factura = 'remission'
            }
        },
        methods: {
            salesLists2(){
                return new Promise((resolve, reject) => {
                    axios.get(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/company/quotations", {params:{id:this.collection.company_id}})
                    .then((res) => {
                        this.esperaLaInfo = true
                        this.salesLists = res.data.data
                        .filter(sale=>this.due(sale.id, sale.total) > 0 || this.collection.salesID.filter(csale=>csale.sale.id == sale.id).length > 0)
                        .map(id=>{
                            return{
                                id:id.id,
                                total:id.total,//.toLocaleString('es-MX', { style: 'currency', currency: 'MXN',}),
                                invoice:id.invoice,
                                due:this.due(id.id, id.total),//.toLocaleString('es-MX', { style: 'currency', currency: 'MXN',}),
                                newDue:this.newDue(id.id, id.total),
                                invoice_date:id.invoice_date,
                                //payment: (id.total-this.due(id.id, id.total)).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})
                            }
                        });
                        resolve('listo')
                    })
                })
            },
            isMobile() {
                if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                    return true
                } else {
                    return false
                }
            },
            render(){
                this.renderComponent = false;
                this.$nextTick(() => {
                    this.renderComponent = true;
                });
            },
            checkbox(sale){
                var perro = ''
                for(var i=0; i<this.selected.length; i++){
                    if(this.selected[i].id==sale.id){
                        perro = i+3
                    }
                }
                //this.$nextTick(() => {
                    if(perro>2){
                        this.remove(perro-3)
                    }else{
                        this.add(sale)
                    }
                //})
            },
            add(sale){
                this.selected[this.index] = sale
                var sum = 0
                var oldSum = 0
                for(var i=0; i<this.selected.length; i++){
                    if(i>0){
                        oldSum = oldSum + this.selected[i-1].due
                    }
                    sum = sum + this.selected[i].due
                    if(this.collection.amount-sum < 0){
                        this.selected[i].amount = this.selected[i].due + (this.collection.amount-sum )
                    }else{
                        this.selected[i].amount = this.selected[i].due
                    }      
                }
                if(this.collection.amount-oldSum < 0){
                    this.remove(this.index)
                }else{
                    this.index=this.index+1
                }
                this.$nextTick(() => {
                    this.render()
                })
            },
            remove(index){
                this.selected.splice(index, 1);
                this.index = this.index-1
                this.$nextTick(() => {
                    this.render()
                })
            },
            paja(id){
                var perro = true
                for(var i=0; i<this.selected.length; i++){
                    if(this.selected[i].id==id){
                        perro = false
                    }
                }
                return perro
            },
            due(id, total){
                var collections = this.$store.state.collection.collections.filter(collection=>collection.company_id == collection.company_id)
                var sum = 0
                var collections2 = []
                for(var j=0; j<collections.length; j++){
                    var collections2 = collections[j].salesID
                    if(collections[j].id!=this.collection.id){
                        for(var i=0; i<collections2.length; i++){
                            if(collections2[i].id == id){
                                sum = (sum*1) + (collections2[i].amount*1)
                            }
                        }
                    }else{
                        return 5635
                    }
                }
                return ((total*1) - (sum*1))
            },
            newDue(id, total){
                var collections = this.$store.state.collection.collections.filter(collection=>collection.company_id == collection.company_id)//.map(collection=>collection.salesID)    
                var sum = 0
                var sum = 0
                var collections2 = []
                for(var j=0; j<collections.length; j++){
                    var collections2 = collections[j].salesID
                    if(collections[j].id!=this.collection.id){
                        for(var i=0; i<collections2.length; i++){
                            if(collections2[i].id == id){
                                sum = (sum*1) + (collections2[i].amount*1)
                            }
                        }
                    }
                }
                for(var i=0; i<this.selected.length; i++){
                    if(this.selected[i].id==id){
                        sum = (sum*1) + (this.selected[i].amount*1)
                    }
                }
                return ((total*1) - (sum*1))
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
            uploadSuccess(file, response) {
                console.log('File Successfully Uploaded with file name: ' + response.file);
                this.fileName = response.file;
                this.collection.pdf = this.fileName;
            },
            uploadError(file, message) {
                console.log('An Error Occurred');
            },
            fileRemoved() {
                
            },
            close () {
                this.e1 = 1
                this.gris = false
                this.collection = Object.assign({}, this.defaultItem)
                this.collection.macro = false
                if(this.company!=undefined){
                    this.collection.company_id=Number(this.company)
                }
                this.$nextTick(() => {
                    this.$emit("closeEditDialogCollection", false);
                })
            },
            save(){
                if(this.factura == 'invoice'){
                    this.collection.serie = 'Serie A'
                    this.collection.remission = ''
                }
                if(this.factura == 'remission'){
                    this.collection.serie = 'Serie B'
                    this.collection.invoice = ''
                }
                this.collection.methods[0].amount = this.collection.amount
                this.collection.payment_method_id = this.collection.methods[0].method
                this.collection.salesID = this.selected
                this.collection.last_updated_by_user_id = this.currentUser.id
                this.gris = true
                this.$nextTick(() => {
                    axios.patch(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/collections/" + this.collection.id,Object.assign(this.collection)).then(response=>{
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
            paymentMethod(id){
                return this.$store.state.payment_method.payment_methods.filter(method=>method.id == id).map(method=>method.method)[0]
            }
        },
    }
</script>
<style lang="css" scoped>
.v-text-field >>> label{
    font-size: 14px!important;
}
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