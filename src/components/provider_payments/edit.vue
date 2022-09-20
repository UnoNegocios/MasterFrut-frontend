<template>
    <v-card>
        <v-card-title ><!--class="pb-0 pt-1" -->
            <v-icon style="background: #e7e8e9; padding: 10px!important; border-radius: 50%;" class="mr-4">mdi-file-document-outline</v-icon>
            <span >Editar Pago</span>
        </v-card-title>
        <v-divider></v-divider>
         <v-stepper v-model="e1" class="elevation-0">
            <v-stepper-header class="elevation-0">
                <v-stepper-step style="font-weight:bolder!important;" :complete="e1 > 1" step="1"></v-stepper-step>
                <v-divider></v-divider>
                <v-stepper-step style="font-weight:bolder!important;" step="2"></v-stepper-step>
            </v-stepper-header>
            <v-stepper-items>
                <v-stepper-content step="1" class="pt-0">
                    <v-card-text class="pb-0 pt-0">
                        <v-container class="pt-0">
                            <v-row >
                                <v-col cols="12" sm="6" md="6" class="pt-0">
                                    <v-autocomplete clearable v-model="provider_payment.provider_id" :items="providerList" label="Proveedor" item-text="name" item-value="id">
                                        <template slot="no-data"><div class="px-4 py-1">No existen proveedores relacionados.</div></template>                      
                                    </v-autocomplete>
                                    <v-autocomplete clearable v-model="provider_payment.payment_method" :items="paymentMethodLists" label="Metodo de Pago" item-text="method" item-value="id">
                                        <template slot="no-data"><div class="px-4 py-1">No existen metodos relacionadas.</div></template>                      
                                    </v-autocomplete>
                                </v-col>
                                <v-col cols="12" sm="6" md="6" class="pt-0">
                                    <v-menu v-model="datePicker" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px" >
                                        <template v-slot:activator="{ on }">
                                            <v-text-field :rules="[v => !!v || 'Campo requerido']" clearable required v-model="provider_payment.date" label="Fecha de Pago" prepend-icon="mdi-calendar" readonly v-on="on"></v-text-field>
                                        </template>
                                        <v-date-picker color="primary" v-model="provider_payment.date" @input="datePicker = false"></v-date-picker>
                                    </v-menu>
                                    <v-text-field type=number v-model="provider_payment.amount" label="Monto"></v-text-field>
                                </v-col>
                                <v-container fluid class="pt-0">
                                    <v-textarea v-model="provider_payment.note" label="Referencia" class="pt-0"></v-textarea>
                                </v-container>
                            </v-row>
                        </v-container>
                    </v-card-text>
                </v-stepper-content>
                <!-- Lista de Compras -->
                <v-stepper-content step="2" class="pt-0">
                    <v-card-text class="pb-0 pt-0" v-if="provider_payment.provider_id!=''&&provider_payment.provider_id!=null&&provider_payment.provider_id!=undefined&&provider_payment.amount!=''&&provider_payment.amount!=null&&provider_payment.amount!=undefined">
                        <v-container class="pt-0">
                            <div class="mb-5">
                                <strong>Monto de Pago: </strong>{{(provider_payment.amount*1).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
                                <br>
                                <strong>Aplicado: </strong>{{(gastado).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
                                <br>
                                <strong>Quedan: </strong>{{((provider_payment.amount*1)-gastado).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
                            </div>
                            <v-data-table v-if="renderComponent" :headers="headers" :items="shoppingList" item-key="id" class="elevation-1">
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
                                    {{newDue(item.id, item.total).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
                                </template>
                            </v-data-table>
                        </v-container>
                    </v-card-text>
                </v-stepper-content>
            </v-stepper-items>
        </v-stepper>
        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="close">
                Cancelar
            </v-btn>
            <v-btn color="blue darken-1" text  v-if="e1>1" @click="e1 = e1-1">
                <v-icon>mdi-chevron-left</v-icon>
                Regresar
            </v-btn>
            <v-btn color="blue darken-1" text  v-if="e1!=2" @click="e1 = e1+1" :disabled="grey">
                Siguiente
                <v-icon>mdi-chevron-right</v-icon>
            </v-btn>
            <v-btn color="blue darken-1" text @click="save" :loading="gris" :disabled="gris || selected.length==0">
                Guardar
            </v-btn>
        </v-card-actions>
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
            provider_payment:Object
        },
        components: {
            vueDropzone: vue2Dropzone,
        },   
        data: () => ({
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
                //{ text: 'Id', value: 'id'},
                { text: 'Fecha', value: 'date' },
                { text: 'Factura', value: 'invoice' },
                { text: 'Vencimiento', value: 'due_date' },
                { text: 'Monto', value: 'total' },
                { text: 'Abonado', value: 'payment' },
                { text: 'Saldo Pendiente', value: 'newDue' },
            ],
            e1: 1,
            datePicker:'',
            rules: {
                required: value => !!value || 'Campo requerido',
            },
            valid: true,
        }),
        computed: {
            gastado(){
                if(this.renderComponent == true){
                    var gastado = 0
                    if(this.selected.length>0){
                        for(var i=0; i<this.selected.length; i++){
                            gastado = gastado + this.selected[i].amount
                        }
                    }
                    return gastado
                }
            },
            grey(){
                if(this.provider_payment.provider_id==''||this.provider_payment.provider_id==null||this.provider_payment.provider_id==undefined ||
                    this.provider_payment.amount==''||this.provider_payment.amount==null||this.provider_payment.amount==undefined){
                        return true
                }else{
                    return false
                }
            },
            usersLists(){
                return this.$store.state.user.users;
            }, 
            paymentMethodLists(){
                return this.$store.state.payment_method.payment_methods;
            },
            currentUser:{
                get(){
                    return this.$store.state.currentUser.user
                }
            },
            providerList(){
                return this.$store.state.provider.providers
            },
            shoppingList(){
                return this.$store.state.shopping.shoppings
                .filter(shopping=>shopping.provider_id == this.provider_payment.provider_id)
                //.filter(shopping=>this.existentes(shopping.id))
                .map(id=>{
                    return{
                        id:id.id,
                        provider_id:id.provider_id,
                        serie:id.serie,
                        date:id.date,
                        invoice:id.invoice,
                        due_date:id.due_date,
                        subtotal: this.detail(id.id),
                        iva_percentage: id.iva_percentage,
                        isr_percentage: id.isr_percentage
                    }
                }).map(id=>{
                    return{
                        id:id.id,
                        provider_id:id.provider_id,
                        date:id.date,
                        invoice:id.invoice,
                        due_date:id.due_date,
                        subtotal: id.subtotal,
                        iva: this.iva(id.subtotal, id.iva_percentage, id.serie),
                        isr: this.isr(id.subtotal, id.isr_percentage),
                    }
                }).map(id=>{
                    return{
                        id:id.id,
                        provider_id:id.provider_id,
                        date:id.date,
                        invoice:id.invoice,
                        due_date:id.due_date,
                        total: this.total(id.subtotal, id.iva, id.isr),
                    }
                }).map(id=>{
                    return{
                        id:id.id,
                        date:id.date,
                        invoice:id.invoice,
                        due_date:id.due_date,
                        total: id.total,
                        due:(id.total*1) - (this.paid(id.provider_id, id.id)*1),
                        newDue:(id.total*1) - (this.paid(id.provider_id, id.id)*1),
                    }
                }).filter(shopping=>shopping.due>0||this.existentes(shopping.id))
            },
        },
        created(){
            this.selected = this.provider_payment.shoppingsID
            this.index = this.selected.length
        },
        methods: {
            detail(id){
                var sum = 0
                var products = this.$store.state.shopping_detail.shopping_details.filter(shopping=>shopping.shopping_id == id)
                for(var i=0; i<products.length; i++){
                    sum = sum + (products[i].unit_cost*products[i].quantity)
                }
                return sum
            },
            existentes(shopping){
                var respuesta = false
                for(var i=0; i<this.selected.length; i++){
                    if(this.selected[i].id==shopping){
                        respuesta = true
                    }
                }
                return respuesta
            },
            iva(amount, iva, serie){
                var response = 0
                if(iva==undefined || iva==0 || iva==null){
                    if(serie=='Serie A'){
                        response = amount*.16
                    }else if(serie=='Serie B'){
                        response = 0
                    }
                }else{
                    response = (amount/100)*iva
                }
                return response
            },
            isr(amount, isr){
                if(iva==undefined || iva==0 || iva==null){
                    return (amount/100)*isr
                }else{
                    return 0
                }
                
            },
            total(amount, iva, isr){
                return amount + iva - isr
            },
            render(){
                this.renderComponent = false;
                this.$nextTick(() => {
                    this.renderComponent = true;
                });
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
            checkbox(shopping){
                var perro = ''
                for(var i=0; i<this.selected.length; i++){
                    if(this.selected[i].id==shopping.id){
                        perro = i+3
                    }
                }
                this.$nextTick(() => {
                    if(perro>2){
                        this.remove(perro-3)
                    }else{
                        this.add(shopping)
                    }
                })
            },
            add(shopping){
                this.selected[this.index] = shopping
                var sum = 0
                var oldSum = 0
                for(var i=0; i<this.selected.length; i++){
                    if(i>0){
                        oldSum = oldSum + this.selected[i-1].due
                    }
                    sum = sum + this.selected[i].due
                    if(this.provider_payment.amount-sum < 0){
                        this.selected[i].amount = this.selected[i].due + (this.provider_payment.amount-sum )
                    }else{
                        this.selected[i].amount = this.selected[i].due
                    }      
                }
                if(this.provider_payment.amount-oldSum < 0){
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
            paid(providerId, id){
                var shoppings = this.$store.state.provider_payment.provider_payments.filter(payments=>payments.provider_id == providerId).map(payments=>payments.shoppingsID)
                var sum = 0
                if(shoppings.length>0){
                    var payments2 = []
                    for(var i=0; i<shoppings.length; i++){
                        for(var j=0; j<shoppings[i].length; j++){
                            payments2 = payments2.concat(shoppings[i][j])
                        }
                    }
                    payments2 = payments2.filter(payment=>payment.id == id)
                    for(var a=0; a<payments2.length; a++){
                        sum = sum + (payments2[a].amount*1)
                    }
                    return sum
                }else{
                    return 0*1
                }
            },
            newDue(id, total){
                var shoppings = this.$store.state.provider_payment.provider_payments
                .filter(provider_payment=>provider_payment.provider_id == this.provider_payment.provider_id)
                .filter(provider_payment=>provider_payment.id != this.provider_payment.id)
                .map(provider_payment=>provider_payment.shoppingsID)
                var sum = 0
                if(shoppings.length>0){
                    var payments2 = []
                    for(var i=0; i<shoppings.length; i++){
                        for(var j=0; j<shoppings[i].length; j++){
                            payments2 = payments2.concat(shoppings[i][j])
                        }
                    }
                    payments2 = payments2.filter(payment=>payment.id == id)
                    for(var a=0; a<payments2.length; a++){
                        sum = sum + (payments2[a].amount*1)
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
            close () {
                this.gris = false
                this.provider_payment = Object.assign({}, this.defaultItem)
                this.selected = []
                this.$nextTick(() => {
                    this.$emit("closeEditDialogProviderPayment", false);
                })
            },
            save(){
                this.provider_payment.shoppingsID = this.selected
                this.provider_payment.last_updated_by_user_id = this.currentUser.id
                this.$nextTick(() => {
                    axios.put(process.env.VUE_APP_BACKEND_ROUTE + "api/v1/provider_payment/update",Object.assign(this.provider_payment)).then(response=>{
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













