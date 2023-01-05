<template>
    <v-container class="letritasss">
        <v-row class="ma-0 tabla">
            <v-col cols=12 class="tabla header" style="font-size:18px; text-align:center;">EFI INDUSTRIAL</v-col>

            <v-col cols=4 class="tabla py-1">Folio: {{shipping.id}}</v-col>
            <v-col cols=4 class="tabla py-1">Fecha: {{shipping.date}}</v-col>
            <v-col cols=4 class="tabla py-1">Chofer: {{shipping.driver}}</v-col>

            <v-col cols=4 class="tabla py-1">Unidad: {{shipping.vehicle}}</v-col>
            <v-col cols=4 class="tabla py-1">Peso: {{shipping.weight}}</v-col>
            <v-col cols=4 class="tabla py-1">Impresión: {{date}}</v-col>

            <v-col cols=12 class="tabla py-1">Notas: {{shipping.note}}</v-col>

            <v-col cols=4 class="tabla py-2">Hora Salida:</v-col>
            <v-col cols=4 class="tabla py-2">Nombre:</v-col>
            <v-col cols=4 class="tabla py-2">Firma:</v-col>
        </v-row>

        <div class="ma-3 mt-4" style="font-size:14px; text-align:center;">Detalle de Envío</div>

        <v-row class="ma-0 tabla">
            <v-col cols=2 class="tabla header">Venta</v-col>
            <v-col cols=2 class="tabla header">Domicilio</v-col>
            <v-col cols=2 class="tabla header">Condiciones Especiales</v-col>
            <v-col cols=1 class="tabla header">Estatus</v-col>
            <v-col cols=2 class="tabla header">Monto por cobrar</v-col>
            <v-col cols=2 class="tabla header">Monto cobrado</v-col>
            <v-col cols=1 class="tabla header">Forma de pago</v-col>
            <v-row class="ma-0" v-for="(sale, index) in sales" v-bind:key="index">

                <v-col cols=2 class="tabla">{{sale.id}} - {{sale.company.attributes.name}}</v-col>
                <v-col cols=2 class="tabla">{{sale.company.attributes.delivery_address}} | {{sale.company.attributes.delivery_references}} | {{sale.company.attributes.delivery_time}}</v-col>
                <v-col cols=2 class="tabla">{{sale.note}}</v-col>
                <v-col cols=1 class="tabla">{{sale.payment_status}}</v-col>
                <v-col cols=2 class="tabla">{{(sale.due_balance*1).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}</v-col>
                <v-col cols=2 class="tabla"></v-col>
                <v-col cols=1 class="tabla"></v-col>

                <v-row class="ma-0 tabla pt-2 pb-1 px-4" style="background:#e3e3e3;">
                    <div v-for="(item, index) in sale.items" v-bind:key="index" style="width: 100%; height:20px;">
                        <span>• {{item.quantity}}{{item.item.unit.name}} <span class="px-3"> | </span> {{item.item.name}} <span class="px-3"> | </span> {{item.price.toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}</span>
                    </div>
                </v-row>

                <v-btn v-if="printButton==true" bottom color="#e25200" dark fab fixed right @click="dalecandela()">
                    <v-icon color="white">  mdi-printer </v-icon>
                </v-btn> 
            </v-row>
        </v-row>
    </v-container>
</template>

<script>
import axios from 'axios';
import moment from 'moment';
export default {
    data: () => ({
        sales:[],
        shipping:'',
        printButton:true,
    }),
    created(){
        this.shipping = JSON.parse(localStorage.getItem('printShipping'));
        localStorage.removeItem("printShipping");
        axios.get(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/sales?filter[id]=" + this.shipping.details.map(sale=>sale.sale.id)).then(response => {
            this.sales = response.data.data
        })
    },
    methods:{
        dalecandela() {
            this.printButton=false
            this.$nextTick(() => {
                window.print();
                this.$nextTick(() => {
                    window.close();
                })
            })
        },
        print() {
            this.printButton=false
            this.$nextTick(() => {
                window.print();
                this.$nextTick(() => {
                    localStorage.removeItem("printShipping");
                    window.close();
                })
            })
        },
    },
    computed:{
        date(){
            var hours = new Date().getHours();
            var minutes = new Date().getMinutes();
            var ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            minutes = minutes < 10 ? '0'+minutes : minutes;
            var strTime = hours + ':' + minutes + ' ' + ampm;
            return new Date().toLocaleDateString('es-MX') + ' ' + strTime
        },
    }
}
</script>

<style>
.tabla{
    border: solid 1px black;
}
.header{
    background: rgb(185, 185, 185);
    font-weight: 600;
}
.letritasss{
    font-size:10px!important;
   line-height: 15px!important;
}
</style>