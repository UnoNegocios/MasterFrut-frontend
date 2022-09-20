<template>
    <v-row class="ma-2">{{salesList2}}
        <v-row class="ma-0 my-2">
            <v-spacer></v-spacer>
                <v-chip style="border-radius:5px!important; font-size:14px;" :color="color('hoy')" class="mx-1" @click="filter='hoy', dates=[]">Hoy</v-chip>
                <v-chip style="border-radius:5px!important; font-size:14px;" :color="color('mañana')" class="mx-1" @click="filter='mañana', dates=[]">Mañana</v-chip>
                <v-chip style="border-radius:5px!important; font-size:14px;" :color="color('7')" class="mx-1" @click="filter='7', dates=[]">7 días</v-chip>
                <v-menu offset-y :close-on-content-click="closeDatePicker">
                    <template v-slot:activator="{ on, attrs }">
                        <v-chip style="border-radius:5px!important; font-size:14px;" :color="color('mas')" class="mx-1" v-bind="attrs" v-on="on">otro...</v-chip>
                    </template>
                    <v-date-picker v-model="dates" range></v-date-picker>
                </v-menu>
            <v-spacer></v-spacer>
        </v-row>
        
        <v-card style="width:100%;" class="pa-4 ma-2 pb-0" @click="viwDetail(sale)" v-for="(sale, index) in salesList" v-bind:key="index">
            <v-row class="ma-0">
                <v-col cols="6" class="pl-0">
                    <v-card-subtitle class="py-0 pl-0" style="font-size:14px; font-weight:700; color: rgba(0, 0, 0, 0.4);"> Folio: {{sale.id}}</v-card-subtitle>
                </v-col>
                <v-col cols="6" style="text-align:right;">
                    <v-chip v-if="sale.bar == true" small style="border-radius:5px!important; font-size:12px;" color="#e7e8e9">Mostrador</v-chip>
                    <v-chip v-if="sale.is_in_production" small style="border-radius:5px!important; font-size:12px; color:#e25200; font-weight: 500;" dark class="ml-2" color="#e2520040">
                        <div class="pulsatingCircle" style="margin:8px 10px 5px 5px!important;">
                            <span class="secondCircle"></span>
                            <span class="thirdCircle"></span>
                        </div>
                        En Producción
                    </v-chip>
                    
                </v-col>
            </v-row>
            <span>{{sale.company.attributes.name}}</span>
            <br/>
            <span style="font-size:14px;">{{sale.company.attributes.razon_social}}</span>
            <br/>
            <div class="ma-0">
                <v-spacer></v-spacer>
                <v-card-text class="px-2 pt-2" style="font-size:14px; text-align:right;"><v-icon small class="mr-2">mdi-calendar</v-icon>{{sale.date}}</v-card-text>
            </div>
        </v-card>

        <v-dialog v-model="dialog"  fullscreen hide-overlay transition="dialog-bottom-transition"> 
            <v-card style="background:#f4f5fa;" v-if="dialog==true">
                <v-toolbar dark color="primary" class="elevation-0">
                    <v-toolbar-title>Detalle de Pedido</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn icon dark @click="dialog = false">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-toolbar>
                <div class="pa-4">
                    <v-card class="pt-3 pb-1 px-4 elevation-0 mb-2">
                        <v-row class="mx-0 mt-0">
                            <v-col cols="6">
                                <v-card-subtitle class="pt-2 pl-0" style="font-size:14px; font-weight:700; color: rgba(0, 0, 0, 0.4);"> Folio: {{detail.id}}</v-card-subtitle>
                            </v-col>
                            <v-col cols="6" style="text-align:right;">
                                <v-card-text class="px-2 pt-2" style="font-size:14px;"><v-icon small class="mr-2">mdi-calendar</v-icon>{{detail.date}}</v-card-text>
                            </v-col>
                        </v-row>
                        <v-card-title style="font-size:16px;" class="pt-2 pb-4 px-2">{{detail.company.attributes.name}}</v-card-title>
                        <v-card-subtitle>Vendedor: {{detail.user.name}} {{detail.user.last}}</v-card-subtitle>
                    </v-card>
                    <v-row class="pa-6 ma-0" v-for="(item, index) in detail.items" v-bind:key="index">
                        <div>
                            <strong>{{item.quantity}}{{item.item.unit.name}} | </strong>
                            <br/>
                            {{item.item.name}}
                        </div>
                    </v-row>
                    <v-row class="ma-0 py-5 px-6" style="background-color:#ffedb3;">
                            <span style="font-weight:600;" class="mr-2">Nota(s): </span>
                            {{detail.note}}
                    </v-row>

                    <v-btn v-if="detail.is_in_production!=true" @click="sheet = true" bottom x-large color="#e25200" dark fixed right style="margin-bottom:70px;">
                        <strong style="font-size:21px;">modificar peso de pedidos</strong>
                    </v-btn>
                    <v-btn @click="sheet2 = true" bottom x-large color="primary" dark fixed right>
                        <strong style="font-size:21px;">surtido</strong>
                    </v-btn>
                </div>
            </v-card>
        </v-dialog>

        <div class="text-center">
            <v-bottom-sheet v-model="sheet" inset>
                <v-sheet class="text-center" height="150px">
                    <div class="pt-6">
                    ¿Vamos a comenzar?
                    </div>
                    <v-btn class="mt-4" :loading="gris" :disabled="gris" text color="primary" @click="save()">
                    Si
                    </v-btn>
                    <v-btn class="mt-4" text color="grey" @click="sheet=false">
                    Cancelar
                    </v-btn>
                </v-sheet>
            </v-bottom-sheet>
        </div>

        <div class="text-center">
            <v-bottom-sheet  v-model="sheet2" inset>
                <v-sheet class="text-center" height="150px">
                    <div class="pt-6">
                    ¿Seguro que ya surtiste este pedido?
                    </div>
                    <v-btn class="mt-4" :loading="gris" :disabled="gris" text color="primary" @click="save2()">
                    Si
                    </v-btn>
                    <v-btn class="mt-4" text color="grey" @click="sheet2=false">
                    Cancelar
                    </v-btn>
                </v-sheet>
            </v-bottom-sheet>
        </div>
    </v-row>
</template>

<script>
import axios from "axios";
export default {
    data: () => ({
        sheet:false,
        sheet2:false,
        dialog:false,
        detail:'',
        filter:'hoy',
        dates:[],
        gris:false,
        salesList:[],
        loading:false,
    }),
    computed:{
        salesList2(){
            var mañana = new Date(new Date().setDate(new Date().getDate() + 1)).toLocaleString("sv-SE", {timeZone: "America/Monterrey"}).split('T')[0].slice(0,10)
            var hoy = new Date().toLocaleString("sv-SE", {timeZone: "America/Monterrey"}).split('T')[0].slice(0,10)
            var siete = new Date(new Date().setDate(new Date().getDate() + 7)).toLocaleString("sv-SE", {timeZone: "America/Monterrey"}).split('T')[0].slice(0,10)
            switch(this.filter){
                case 'hoy': 
                    axios.get(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/orders/orders_to_dispatch?filter[date_between]=" + hoy + ',' + hoy).then(response=>{
                        this.salesList = response.data.data
                        this.loading = true
                    })
                break;
                case 'mañana': 
                    axios.get(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/orders/orders_to_dispatch?filter[date_between]="+ mañana + ',' + mañana).then(response=>{
                        this.salesList = response.data.data
                        this.loading = true
                    })
                break;
                case '7': 
                    axios.get(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/orders/orders_to_dispatch?filter[date_between]="+ hoy + ',' + siete).then(response=>{
                        this.salesList = response.data.data
                        this.loading = true
                    })
                break;
                case 'mas': 
                    axios.get(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/orders/orders_to_dispatch?filter[date_between]="+this.dates[0] + ',' + this.dates[1]).then(response=>{
                        this.salesList = response.data.data
                        this.loading = true
                    })
                break;
            }
            return ''
        },
        closeDatePicker(){
            if(this.dates.length==2){
                return true
            }else{
                return false
            }
        },
    },
    methods:{
        viwDetail(sale){
            this.detail = sale
            this.dialog = true
        },
        color(value){
            if(value == this.filter){
               return 'primary'
            }else if(this.dates.length==2 && value == 'mas'){
                this.filter = 'mas'
                return 'primary'
            }else{
                return '#e7e8e9'
            }
        },
        save(){
            this.gris = true
            var order = [this.detail].map(id=>{
                return{
                    id:id.id,
                    quotation_items:id.items.map(item=>{
                        return{
                            item_id:item.item.id,
                            quantity:item.quantity
                        }
                    }),
                    created_by_user_id:id.created_by_user_id.id,
                }
            })[0]
            this.$nextTick(() => {
                axios.post(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/orders/start_order_production", order).then(response=>{
                    this.sheet = false
                    this.dialog = false
                    this.gris = false
                    this.salesList = []
                    this.$nextTick(() => {
                        var mañana = new Date(new Date().setDate(new Date().getDate() + 1)).toLocaleString("sv-SE", {timeZone: "America/Monterrey"}).split('T')[0].slice(0,10)
                        var hoy = new Date().toLocaleString("sv-SE", {timeZone: "America/Monterrey"}).split('T')[0].slice(0,10)
                        var siete = new Date(new Date().setDate(new Date().getDate() + 7)).toLocaleString("sv-SE", {timeZone: "America/Monterrey"}).split('T')[0].slice(0,10)
                        switch(this.filter){
                            case 'hoy': 
                                axios.get(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/orders/orders_to_dispatch?filter[date_between]=" + hoy + ',' + hoy).then(response=>{
                                    this.salesList = response.data.data
                                    this.loading = true
                                })
                            break;
                            case 'mañana': 
                                axios.get(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/orders/orders_to_dispatch?filter[date_between]="+ mañana + ',' + mañana).then(response=>{
                                    this.salesList = response.data.data
                                    this.loading = true
                                })
                            break;
                            case '7': 
                                axios.get(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/orders/orders_to_dispatch?filter[date_between]="+ hoy + ',' + siete).then(response=>{
                                    this.salesList = response.data.data
                                    this.loading = true
                                })
                            break;
                            case 'mas': 
                                axios.get(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/orders/orders_to_dispatch?filter[date_between]="+this.dates[0] + ',' + this.dates[1]).then(response=>{
                                    this.salesList = response.data.data
                                    this.loading = true
                                })
                            break;
                        }
                    })
                }).catch(error => {
                    this.snackbar = {
                        message: error.response.data.message,
                        color: 'error',
                        show: true
                    }
                })
            })
        },
        save2(){
            this.gris = true
            var order = [this.detail].map(id=>{
                return{
                    id:id.id,
                    quotation_items:id.items.map(item=>{
                        return{
                            item_id:item.item.id,
                            quantity:item.quantity
                        }
                    }),
                    created_by_user_id:id.created_by_user_id.id,
                }
            })[0]
            console.log(order)
            this.$nextTick(() => {
                axios.post(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/orders/dispatch_sale_order", order).then(response=>{
                    this.sheet2 = false
                    this.dialog = false
                    this.gris = false
                    this.salesList = []
                    this.$nextTick(() => {
                        var mañana = new Date(new Date().setDate(new Date().getDate() + 1)).toLocaleString("sv-SE", {timeZone: "America/Monterrey"}).split('T')[0].slice(0,10)
                        var hoy = new Date().toLocaleString("sv-SE", {timeZone: "America/Monterrey"}).split('T')[0].slice(0,10)
                        var siete = new Date(new Date().setDate(new Date().getDate() + 7)).toLocaleString("sv-SE", {timeZone: "America/Monterrey"}).split('T')[0].slice(0,10)
                        switch(this.filter){
                            case 'hoy': 
                                axios.get(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/orders/orders_to_dispatch?filter[date_between]=" + hoy + ',' + hoy).then(response=>{
                                    this.salesList = response.data.data
                                    this.loading = true
                                })
                            break;
                            case 'mañana': 
                                axios.get(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/orders/orders_to_dispatch?filter[date_between]="+ mañana + ',' + mañana).then(response=>{
                                    this.salesList = response.data.data
                                    this.loading = true
                                })
                            break;
                            case '7': 
                                axios.get(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/orders/orders_to_dispatch?filter[date_between]="+ hoy + ',' + siete).then(response=>{
                                    this.salesList = response.data.data
                                    this.loading = true
                                })
                            break;
                            case 'mas': 
                                axios.get(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/orders/orders_to_dispatch?filter[date_between]="+this.dates[0] + ',' + this.dates[1]).then(response=>{
                                    this.salesList = response.data.data
                                    this.loading = true
                                })
                            break;
                        }
                    })
                }).catch(error => {
                    this.snackbar = {
                        message: error.response.data.message,
                        color: 'error',
                        show: true
                    }
                })
            })
        }
    },
    mounted(){
        Echo.channel('felix').listen('OrderToFillCreated', (e) => {
            var mañana = new Date(new Date().setDate(new Date().getDate() + 1)).toLocaleString("sv-SE", {timeZone: "America/Monterrey"}).split('T')[0].slice(0,10)
            var hoy = new Date().toLocaleString("sv-SE", {timeZone: "America/Monterrey"}).split('T')[0].slice(0,10)
            var siete = new Date(new Date().setDate(new Date().getDate() + 7)).toLocaleString("sv-SE", {timeZone: "America/Monterrey"}).split('T')[0].slice(0,10)
            switch(this.filter){
                case 'hoy': 
                    axios.get(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/orders/orders_to_dispatch?filter[date_between]=" + hoy + ',' + hoy).then(response=>{
                        this.salesList = response.data.data
                        this.loading = true
                    })
                break;
                case 'mañana': 
                    axios.get(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/orders/orders_to_dispatch?filter[date_between]="+ mañana + ',' + mañana).then(response=>{
                        this.salesList = response.data.data
                        this.loading = true
                    })
                break;
                case '7': 
                    axios.get(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/orders/orders_to_dispatch?filter[date_between]="+ hoy + ',' + siete).then(response=>{
                        this.salesList = response.data.data
                        this.loading = true
                    })
                break;
                case 'mas': 
                    axios.get(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/orders/orders_to_dispatch?filter[date_between]="+this.dates[0] + ',' + this.dates[1]).then(response=>{
                        this.salesList = response.data.data
                        this.loading = true
                    })
                break;
            }
        })
    },
}
</script>
<style scoped>
        .pulsatingCircle{
			width:1px;
			height:1px;
			display:block;
			position:relative;
            margin:10% auto;
            transform:scale(3,3);
			-webkit-transform:scale(3,3);
		}
		.secondCircle,
		.thirdCircle{
			top:15%;
			left:15%;
			display:block;
			border-radius:50%;
			position:absolute;
			vertical-align:middle;
		}
		.secondCircle{
			width:4px;
			height:4px;
			margin:-2px 0 0 -2px;
			border:calc(1px /5) solid #e25200;
			animation:2000ms pulseIn ease-in-out infinite;
			-webkit-animation:2000ms pulseIn ease-in-out infinite;						
		}
		
		@keyframes pulseIn{
			0%{
				opacity:0;
				transform:scale(0.2,0.2);
			}
			50%{
				opacity:1;
				transform:scale(1,1);
			}
			100%{
				opacity:0;
				transform:scale(0.2,0.2);
			}
		}
		
		@-webkit-keyframes pulseIn{
			0%{
				opacity:0;
				-webkit-transform:scale(0.2,0.2);
			}
			50%{
				opacity:1;
				-webkit-transform:scale(1,1);
			}
			100%{
				opacity:0;
				-webkit-transform:scale(0.2,0.2);
			}
		}
					
		.thirdCircle{
			width:4px;
			height:4px;
			border:calc(1px /5) solid #e25200;
			margin:-2px 0 0 -2px;
			animation:2000ms pulseIn 500ms ease-in-out infinite;
			-webkit-animation:2000ms pulseIn 500ms ease-in-out infinite		
		}
		
</style>