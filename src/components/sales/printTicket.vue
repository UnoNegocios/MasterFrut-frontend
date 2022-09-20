<template>
    <v-container v-if="perro">
        <v-row class="ma-0">
            Folio: #{{sale.id}}
            <v-spacer></v-spacer>
            {{date}} 
        </v-row>
        <div style="text-align:center;">
            <img src="https://masterfrut.com/wp-content/uploads/2021/07/MASTERFRUT.svg" style="width:100%; max-width:250px; margin-top:20px;">
            <br/>
            Razón Social:  {{sale.company.attributes.razon_social}}
            <br>
            Nombre Comercial: {{sale.company.attributes.name}}
            <br>
            Vendedor: {{sale.user.name}} {{sale.user.last}}
            <br>
            Fecha Programada: {{sale.date}}
            <br>
            Atendió: {{sale.created_by_user_id.name}} {{sale.created_by_user_id.last}} 
        </div>
        <div style="text-align:center;" class="py-2">Dirección: {{sale.company.attributes.delivery_address}}<br>
            Horario: {{sale.company.attributes.delivery_time}}
        </div>


        <v-row class="ma-0 mt-2">
            <!--v-col cols="3" style="border-bottom:1px solid black; font-weight:800; text-transform:uppercase;">
                Cant
            </v-col>
            <v-col cols="3" style="border-bottom:1px solid black; border-left:1px solid black; font-weight:800; text-transform:uppercase;">
                Concepto
            </v-col>
            <v-col cols="3" style="border-bottom:1px solid black; border-left:1px solid black; font-weight:800; text-transform:uppercase;">
                PU
            </v-col>
            <v-col cols="3" style="border-bottom:1px solid black; border-left:1px solid black; font-weight:800; text-transform:uppercase;">
                Total
            </v-col-->


            <v-row class="ma-0">
                <v-col cols="12" v-for="(item, index) in sale.items" v-bind:key="index" class="pa-0">
                    <v-row class="ma-0" style="border-bottom:1px solid black;">

                        <v-col cols="8">
                            {{item.item.name}} - {{item.quantity}}{{cropName(item.item.unit.name)}}<span v-if="(item.quantity*1)>1">s</span>
                        </v-col>
                        
                        <v-col cols="4">
                            <v-container fill-height fluid>
                                <v-row class="ma-0" align="center" justify="center">
                                    $
                                    <v-spacer/>
                                    {{(item.price).toFixed(2)}}
                                </v-row>
                            </v-container>
                        </v-col>

                    </v-row>
                </v-col>
            </v-row>
        </v-row>
        
        <v-row class="ma-0 py-2 mb-2" style="font-weight:800; text-transform:uppercase;">
            <!--Peso: {{sale_total_weight(sale.items)}} kg-->
            <v-spacer></v-spacer>
            Total: {{((sale.subtotal*1)+(sale.iva*1)).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
        </v-row>

        <div style="text-align:center; line-height:30px; padding-top:20px;">
            <strong>POLITICAS DE SERVICIO	</strong>		
            <br/>*La Responsabilidad del pedido sigue siendo de la tienda y/o lider, en el dia establecido y horario.			
            <br/>*El Pedido se debe realizarcon 24 hrs anticipadas al horario de las 12:00 pm para su programacion en su ruteo.			
        </div>

        <v-btn v-if="printButton==true" bottom color="#e25200" dark fab fixed right @click="dalecandela()">
            <v-icon color="white">  mdi-printer </v-icon>
        </v-btn> 
    </v-container>
</template>

<script>
import axios from "axios";
export default {
    data: () => ({
        sale:[],
        printButton:true,
        perro:false
    }),
    created(){
        var id = localStorage.getItem('printTicket')
        axios.get(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/sales/"+id).then(response => {
            this.sale = response.data.data
            this.perro = true
            localStorage.removeItem("printTicket")
        })
    },
    methods:{
        cropName(value){
            if(value=='kilogramo'){
                return 'kg'
            }else if(value=='Pieza'){
                return 'pza'
            }else{
                return value
            }
        },
        mostrador(bar){
            if(bar!=1){
                return 'No'
            }else{
                return 'Si'
            }
        },
        itemDetail(item){
            return this.$store.state.item.items.filter(item=>item.id == item.id)[0]
        },
        dalecandela() {
            this.printButton=false
            this.$nextTick(() => {
                window.print();
                this.$nextTick(() => {
                    window.print();
                    this.$nextTick(() => {
                        window.close();
                    })
                })
            })
        },
        sale_total_weight(items){
            console.log(items)
            var sum = 0
            for(var i=0; i<items.length; i++){
                sum = sum + items[i].quantity
            }
            return sum
        }
    },
    computed:{
        date(){
            var hours = new Date().getHours();
            var minutes = new Date().getMinutes();
            var ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12;
            minutes = minutes < 10 ? '0'+minutes : minutes;
            var strTime = hours + ':' + minutes + ' ' + ampm;
            return new Date().toLocaleDateString('es-MX') + ' ' + strTime
        }
    }
}
</script>
<style>
    .tablaBorder{
        border:solid 1px black!important;
    }
</style>