<template>
    <div>
        {{sales}}
        <vue-horizontal class="ma-6 mt-0">
            <div style="width:20%; margin:15px;" v-for="(shipping, index) in shippings" v-bind:key="index">
                <v-row class="ma-0 mb-1">
                    <v-spacer/>
                    <v-btn text x-small color="red" style="text-transform: capitalize;" @click="removeShipping(index)">Eliminar</v-btn>
                </v-row>
                <div style="background:white;" class="px-0 pt-2 scroll">
                    <div style="text-align:center; font-size:13px;">
                        <strong v-if="weight(shipping.sales)<=shipping.vehicle_id.max_weight_capacity*1">{{weight(shipping.sales)*1}} de {{shipping.vehicle_id.max_weight_capacity*1}} kgs</strong>
                        <strong style="color:red;" v-else>{{weight(shipping.sales)*1}} de {{shipping.vehicle_id.max_weight_capacity*1}} kgs </strong> <span style="color:#9f9f9f;"> ({{shipping.sales.length}} ventas)</span>
                    </div>
                    <v-row class="ma-0 pa-3">
                        <span style="font-size:14px; line-height:25px;" @click="shipping.driver_id=''" small v-if="shipping.driver_id!=''"><strong>{{(shipping.driver_id.name + ' ' +shipping.driver_id.last).slice(0,15)}}</strong></span>
                        <v-spacer/>
                        <v-chip @click="shipping.vehicle_id=''" small v-if="shipping.vehicle_id!=''">{{shipping.vehicle_id.name}}</v-chip>
                    </v-row>
                    <v-row class="ma-0" v-if="shipping.driver_id==''||shipping.vehicle_id==''">
                        <v-autocomplete clearable v-if="shipping.driver_id==''" v-model="shipping.driver_id" style="transform: scale(.8); padding:0px;" dense outlined :items="usersLists" label="Chofer" item-text="name" item-value="attributes">
                            <template slot="no-data"><div class="px-4 py-1">No existen choferes relacionadas.</div></template>                      
                        </v-autocomplete>
                        <v-autocomplete v-if="shipping.vehicle_id==''" clearable v-model="shipping.vehicle_id" style="transform: scale(.8); padding:0px;" dense outlined :items="vehicleLists" label="Vehiculo" item-text="name" item-value="attributes">
                            <template slot="no-data"><div class="px-4 py-1">No existen vehiculos relacionadas.</div></template>                      
                        </v-autocomplete>
                    </v-row>
                    <v-timeline align-top dense class="pt-2" style="height:80%!important; margin-left:-30px;">
                        <draggable style="height:100%!important;" :list="shipping.sales" class="list-group" draggable=".item" group="a">
                            <v-timeline-item fill-dot light small color="white" icon="mdi-google-maps" v-for="element in shipping.sales" :key="element.id" class="list-group-item item pb-4">
                                <div style="font-size:14px; line-height:16px!important; margin-left:-25px;">{{element.company.attributes.delivery_address}}</div>
                                <strong style="font-size:12px; margin-left:-25px;">{{element.items_kg_total}} kgs</strong>
                            </v-timeline-item>
                        </draggable>
                    </v-timeline>
                </div>
            </div>
            <v-btn @click="addShipping" color="primary" fab class="elevation-0 my-auto" x-small><v-icon>mdi-plus</v-icon></v-btn>
        </vue-horizontal>
        <vue-horizontal v-if="render" class="ma-6"> 
            <div v-for="(zone, index) in zones" v-bind:key="index" style="width:calc(100% / 5);" class="pa-0" v-if="mapSales(zone).length>0">
            {{zone}} ({{mapSales(zone).length}})
                <draggable :list="mapSales(zone)" class="list-group scroll" draggable=".item" group="a" :scroll-sensitivity="200">
                    <v-card class="list-group-item item ma-0 px-3 py-2 ma-2 elevation-0" v-for="element in mapSales(zone)" :key="element.id">
                        <v-row class="ma-0">
                            <v-col cols="3" class="pa-0">
                                <v-chip x-small style="border-radius:5px!important; font-size:11px;" color="#e7e8e9"> {{element.id}} </v-chip>
                            </v-col>
                            <v-col cols="9" style="text-align:right;" class="pa-0">
                                <v-card-subtitle class="pa-0" style="font-size:12px; font-weight:700; color: rgba(0, 0, 0, 0.4);">{{element.company.attributes.name.slice(0,20)}}...</v-card-subtitle>
                            </v-col>
                        </v-row>
                        <v-row class="ma-0 py-1" style="font-size:13px; line-height:17px;">{{element.company.attributes.delivery_address}}</v-row>
                        <v-row class="ma-0">
                            <v-col cols="6" class="pa-0">
                                <v-card-text class="pa-0" style="font-size:12px;"><v-icon small class="mr-2">mdi-calendar</v-icon>{{element.date}}</v-card-text>
                            </v-col>
                            <v-col cols="6" style="text-align:right;" class="pa-0">
                                <v-card-text class="pa-0" style="font-size:12px; text-align:right;"><strong>{{element.items_kg_total}} kgs</strong></v-card-text>
                            </v-col>
                        </v-row>
                    </v-card>
                </draggable>
            </div>
        </vue-horizontal>
        <v-progress-linear class="my-2 mx-12" v-else color="primary" indeterminate rounded height="6"></v-progress-linear>
        <!-- Guardar -->
        
        <v-menu top :close-on-content-click="closeDatePicker" content-class="elevation-0">
            <template v-slot:activator="{ on, attrs }">
                <v-btn v-bind="attrs" v-on="on" small bottom color="primary" dark fab fixed right style="bottom: 90px; right: 25px;">
                    <v-chip v-if="dateFilter.length==2" small style="margin-left:-210px; width:360px; margin-right:18px; border-radius:5px;"> {{dateFilter[0]}} al {{dateFilter[1]}} </v-chip>
                    <v-icon color="white" small>mdi-filter</v-icon>
                </v-btn>
            </template>
            <v-row class="ma-0">
                <v-spacer/>
                <v-chip v-if="dateFilter.length==2" small style="border-radius:5px;" class="mb-2" @click="dateFilter=[] "> <strong>Limpiar Filtro</strong> <v-icon x-small>mdi-filter-off</v-icon> </v-chip>
            </v-row>
            <v-date-picker v-model="dateFilter" range></v-date-picker>
        </v-menu>
        
        <v-btn @click="confirmShipping" bottom color="#e25200" dark fab fixed right>
            <v-icon color="white">  mdi-content-save-outline </v-icon>
        </v-btn> 
        <v-dialog v-model="saveDialog" max-width="900px">
            <v-card class="pa-6" v-if="render">
                <v-expansion-panels class="ma-0">
                    <v-expansion-panel class="my-1" v-for="(shipping, index) in itemToSave" v-bind:key="index">
                        <v-expansion-panel-header>
                            <div>
                                {{shippings[index].driver_id.name + ' ' + shippings[index].driver_id.last}}
                                <v-chip small class="ml-2">{{shippings[index].vehicle_id.name}}</v-chip>
                                <v-chip small class="ml-2">{{weight(shippings[index].sales)}} kg</v-chip>
                            
                                <v-menu :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px" >
                                    <template v-slot:activator="{ on }">
                                        <span class="ml-4" v-on="on">
                                            <v-icon>mdi-notebook-edit-outline</v-icon>
                                            Nota
                                        </span>
                                    </template>
                                    <v-card class="pa-6 pt-3">
                                        <v-textarea v-model="shipping.note" label="Nota"></v-textarea>
                                    </v-card>
                                </v-menu>
                                <v-menu :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px" >
                                    <template v-slot:activator="{ on }">
                                        <span class="ml-4" v-on="on">
                                            <v-icon>mdi-calendar</v-icon>
                                            {{shipping.date}}
                                        </span>
                                    </template>
                                    <v-date-picker color="primary" v-model="shipping.date" @input="shipping.date!=''"></v-date-picker>
                                </v-menu>
                            </div>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <v-row class="mx-0 my-1 py-1 px-4" v-for="(sale, index2) in shipping.shipping_details" v-bind:key="index2" style="background:white; border-bottom:2px solid #f4f5fa;">
                                <span class="py-2">ID:{{sale.sale_id}} | {{shippings[index].sales[index2].company.attributes.name}} | {{shippings[index].sales[index2].items_kg_total}} kg </span>
                                <v-spacer/>
                                <v-text-field v-model="sale.invoice" rounded outlined dense class="pa-0 ma-0" label="Factura"></v-text-field>
                            </v-row>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-row class="ma-0 mt-4">
                        <v-spacer/><v-btn color="primary" class="elevation-0" @click="save()" :loading="gris" :disabled="gris">GUARDAR</v-btn><v-spacer/>
                    </v-row>
                </v-expansion-panels>
                
            </v-card>
        </v-dialog>
        <v-snackbar :color="snackbar.color" v-model="snackbar.show">
            {{ snackbar.message }}
        </v-snackbar>
    </div>  
</template>

<script>
import axios from 'axios'
import draggable from 'vuedraggable'
import VueHorizontal from 'vue-horizontal';
export default {
    components: {
        draggable,
        VueHorizontal
    },
    data() {
        return {
            dateFilter:[],
            gris:false,
            snackbar: {
                show: false,
                message: null,
                color: null
            },
            render:false,
            itemToSave:[],
            saveDialog: false,
            zones:['Monterrey',
                'Guadalupe',
                'San Nicolás',
                'Apodaca',
                'Saltillo',
                'San Pedro',
                'Escobedo',
                'Santa Catarina',
                'Pesquería',
                'Otros'],
            shippings:[{driver_id:'',vehicle_id:'', sales:[]}],
            monterreySales:[],
            guadalupeSales:[],
            sannicolasSales:[],
            apodacaSales:[],
            saltilloSales:[],
            sanpedroSales:[],
            escobedoSales:[],
            santacatarinaSales:[],
            pesqueriaSales:[],
            otroSales:[],
            render:false,
        };
    },
    created(){
        this.$emit("closeDrawer", false);
    },
    computed:{
        closeDatePicker(){
            if(this.dateFilter.length==2 || this.dateFilter.length==0){
                return true
            }else{
                return false
            }
        },
        today(){
            return new Date().toLocaleString("sv-SE", {timeZone: "America/Monterrey"}).toString().slice(0, 10)
        },
        tomorrow(){
            var date = new Date()
            return new Date(date.getFullYear(), date.getMonth(), date.getDate()+1).toLocaleString("sv-SE", {timeZone: "America/Monterrey"}).toString().slice(0, 10)
        },
        currentUser:{
            get(){
                return this.$store.state.currentUser.user
            }
        },
        sales(){
            if(this.dateFilter.length==2||this.dateFilter.length==0){
                this.getSales()
            }
            return ''
        },
        vehicleLists(){
            return this.$store.state.vehicle.vehicles.map(id=>{
                return{
                    attributes: {'name':id.name, 'id': id.id, 'max_weight_capacity': id.max_weight_capacity},
                    name: id.name
                }
            });
        },
        usersLists(){
            return this.$store.state.user.users.filter(user=>user.job_position == 'Chofer Repartidor' || user.job_position == 'Chofer Ejecutivo').map(id=>{
                return{
                    attributes: {'name':id.name, 'last': id.last, 'id': id.id},
                    name: id.name + ' ' + id.last
                }
            });
        },
    },
    methods: {
        getSales(){
            var date =[]
            if(this.dateFilter.length==2){
                date = this.dateFilter.sort()
                this.dateFilter = date
            }else{
                date = [this.today,this.tomorrow]
            }
            this.render = false
            axios.get(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/orders/dispatched_orders?filter[date_between]="+date+"&itemsPerPage=500").then(response => {
                this.monterreySales = response.data.data.filter(data=>this.lowerCase(data.company.attributes.delivery_address).includes('monterrey') || this.lowerCase(data.company.attributes.delivery_address).includes('mty'))
                this.guadalupeSales = response.data.data.filter(data=>this.lowerCase(data.company.attributes.delivery_address).includes('guadalupe') || this.lowerCase(data.company.attributes.delivery_address).includes('gpe'))
                this.sannicolasSales = response.data.data.filter(data=>this.lowerCase(data.company.attributes.delivery_address).includes('san nicolas') || this.lowerCase(data.company.attributes.delivery_address).includes('san nicolás'))
                this.apodacaSales = response.data.data.filter(data=>this.lowerCase(data.company.attributes.delivery_address).includes('apodaca'))
                this.saltilloSales = response.data.data.filter(data=>this.lowerCase(data.company.attributes.delivery_address).includes('saltillo'))
                this.sanpedroSales = response.data.data.filter(data=>this.lowerCase(data.company.attributes.delivery_address).includes('san pedro'))
                this.escobedoSales = response.data.data.filter(data=>this.lowerCase(data.company.attributes.delivery_address).includes('escobedo'))
                this.santacatarinaSales = response.data.data.filter(data=>this.lowerCase(data.company.attributes.delivery_address).includes('santa catarina'))
                this.pesqueriaSales = response.data.data.filter(data=>this.lowerCase(data.company.attributes.delivery_address).includes('pesqueria') || this.lowerCase(data.company.attributes.delivery_address).includes('pesquería'))
                this.otroSales = response.data.data.filter(data=>
                    !this.lowerCase(data.company.attributes.delivery_address).includes('monterrey') &&
                    !this.lowerCase(data.company.attributes.delivery_address).includes('mty') &&
                    !this.lowerCase(data.company.attributes.delivery_address).includes('guadalupe') &&
                    !this.lowerCase(data.company.attributes.delivery_address).includes('gpe') &&
                    !this.lowerCase(data.company.attributes.delivery_address).includes('san nicolas') &&
                    !this.lowerCase(data.company.attributes.delivery_address).includes('san nicolás') &&
                    !this.lowerCase(data.company.attributes.delivery_address).includes('apodaca') &&
                    !this.lowerCase(data.company.attributes.delivery_address).includes('saltillo') &&
                    !this.lowerCase(data.company.attributes.delivery_address).includes('san pedro') &&
                    !this.lowerCase(data.company.attributes.delivery_address).includes('escobedo') &&
                    !this.lowerCase(data.company.attributes.delivery_address).includes('santa catarina') &&
                    !this.lowerCase(data.company.attributes.delivery_address).includes('pesqueria') &&
                    !this.lowerCase(data.company.attributes.delivery_address).includes('pesquería')
                )
                this.render = true
            })
        },
        save(){
            this.$nextTick(() => {
                axios.post(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/shipping/bulk-create", this.itemToSave).then(response=>{
                    this.getSales()
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
        confirmShipping(){
            var editedItem = []
            for(var i=0; i<this.shippings.length; i++){
                editedItem.push({
                    driver_id:this.shippings[i].driver_id.id,
                    date:this.today,
                    vehicle_id:this.shippings[i].vehicle_id.id,
                    note:'',
                    last_updated_by_user_id: this.currentUser.id,
                    created_by_user_id: this.currentUser.id,
                    shipping_details: this.mapSalesforShippings(this.shippings[i].sales)
                })
            }
            this.itemToSave = editedItem
            this.$nextTick(()=>{
                this.saveDialog = true
                this.render = true
            })
        },
        mapSalesforShippings(sales){
            var editedItem = []
            for(var i=0; i<sales.length; i++){
                editedItem.push({
                    created_by_user_id: this.currentUser.id,
                    invoice: '',
                    last_updated_by_user_id: this.currentUser.id,
                    sale_id: sales[i].id,
                    company_id: sales[i].company.id
                })
            }
            return editedItem
        },
        weight(sales){
            var sum = 0
            for(var i = 0; i<sales.length; i++){
                sum = sum + sales[i].items_kg_total
            }
            return sum
        },
        mapSales(zone){
            switch(zone){
                case 'Monterrey': return this.monterreySales
                case 'Guadalupe': return this.guadalupeSales
                case 'San Nicolás': return this.sannicolasSales
                case 'Apodaca': return this.apodacaSales
                case 'Saltillo': return this.saltilloSales
                case 'San Pedro': return this.sanpedroSales
                case 'Escobedo': return this.escobedoSales
                case 'Santa Catarina': return this.santacatarinaSales
                case 'Pesquería': return this.pesqueriaSales
                case 'Otros': return this.otroSales
            }
        },
        lowerCase(text){
            if(text!=null&&text!=undefined&&text!=''){
                return text.toLowerCase()
            }else{
                return ' '
            }
        },
        addShipping: function() {
            this.shippings.push({driver_id:'',vehicle_id:'', sales:[]})
        },
        removeShipping(index) {
            this.shippings.splice(index, 1);
        },
        userName(id){
            return this.$store.state.user.users.filter(user=>user.id == id).map(user=>user.name + '' + user.last)[0]
        },
        vehicleName(id){
            return this.$store.state.vehicle.vehicles.filter(vehicle=>vehicle.id == id).map(vehicle=>vehicle.name)[0]
        }
    }
};
</script>
<style>
    .scroll{
        overflow-y:scroll!important;
        max-height:50vh!important;
        -overflow-scrolling:touch!important;
        -webkit-overflow-scrolling:touch!important;
    }
    .v-text-field__details {
        display: none;
    }
    .theme--light.v-timeline::before {
        background-image: linear-gradient(#c7c7c7 33%, rgba(255,255,255,0) 0%)!important;
        background-position: right!important;
        background-size: 2px 7px!important;
        background-repeat: repeat-y!important;
        background-color: white!important;
    }
    .v-timeline .mdi-google-maps::before {
        content: "\F05F5"!important;
        color: #1976d2!important;
    }
    .v-timeline-item__dot {
        box-shadow: none!important;
    }
</style>