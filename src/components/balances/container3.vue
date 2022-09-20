<template>
  <v-container>
        <v-data-table :headers="headers" :items="clients" class="elevation-0 px-6 py-4">
            <!-- Header -->
            <template v-slot:top>
                <v-toolbar flat >
                    <v-toolbar-title>Saldos Vanecidos</v-toolbar-title>
                </v-toolbar>
            </template>
            <template v-slot:[`item.cero`]="{ item }">
                {{item.cero.toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
            </template>
            <template v-slot:[`item.treinta`]="{ item }">
                {{item.treinta.toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
            </template>
            <template v-slot:[`item.sesenta`]="{ item }">
                {{item.sesenta.toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
            </template>
            <template v-slot:[`item.noventa`]="{ item }">
                {{item.noventa.toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
            </template>
            <template v-slot:[`item.total`]="{ item }">
                {{(item.total).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
            </template>
            <!-- Footer -->
            <template v-slot:footer>
                <v-container style="margin-bottom:-80px!important;">
                    <v-select :items="sumavg" v-model="totalType" style="width: 100px; display: inline-block; margin-right:30px; font-size: 14px;"></v-select>
                    <v-select :items="campos" v-model="campo" item-text="text" item-value="value" style="width: 100px; display: inline-block; margin-right:30px; font-size: 14px;"></v-select>
                    <strong v-if="totalType=='sum'">Total = {{ sumField(campo) }}</strong>
                    <strong v-if="totalType=='avg'">Promedio = {{ avgField(campo) }}</strong>
                </v-container>
            </template> 
        </v-data-table>
  </v-container>
</template>

<script>
import moment from 'moment';
export default {
    data: () => ({
        campo:'total',
        campos:[
            { text: '0 días', value: 'cero',},
            { text: '30 días', value: 'treinta',},
            { text: '60 días', value: 'sesenta',},
            { text: '90+ días', value: 'noventa',},
            { text: 'Total', value: 'total',},
        ],
        totalType:'sum',
        sumavg:['sum', 'avg'],
    }),
    computed:{
        headers(){
            return[
                { text: 'Cliente', value: 'name',},
                { text: '0 días', value: 'cero',},
                { text: '30 días', value: 'treinta',},
                { text: '60 días', value: 'sesenta',},
                { text: '90+ días', value: 'noventa',},
                { text: 'Total', value: 'total',},
        ]},
        clients(){
            return this.$store.state.company.companies.filter(company=>company.credit_days>0).map(id=>{
                return{
                    name:id.name,
                    due:this.due(id.id),
                }
            }).map(id=>{
                return{
                    name:id.name,
                    cero:id.due.cero,
                    treinta:id.due.treinta,
                    sesenta:id.due.sesenta,
                    noventa:id.due.noventa,
                    total:(id.due.cero + id.due.treinta + id.due.sesenta + id.due.noventa)
                }
            }).filter(item=>item.total>1)
            .sort((a, b) => b.total - a.total)
        }
    },
    methods:{
        sumField(key) {//suma
            // sum data in give key (property)
            var suma=this.clients.reduce((a, b) => a + (b[key] || 0), 0)
            return suma.toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})
        },
        avgField(key){//primedio
            var suma=this.clients.reduce((a, b) => a + (b[key] || 0), 0)
            return (suma/this.clients.length).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})
        },
        due(id){
            var due={
                cero:0,
                treinta:0,
                sesenta:0,
                noventa:0
            }
            var items = this.$store.state.quotation.quotations
            .filter(quotation=>quotation.status == 'vendido' && quotation.company_id == id)
            .filter(quotation=>new Date(quotation.created_at) <= new Date('2022-04-30'))
            .map(id=>{
                return{
                    expiration_days:this.expirationDays(id.date, id.company_id),
                    total:this.expired_debt(id.id, this.total(id.id, id.type), id.date, id.company_id)
                }
            })
            for(var i=0; i<items.length; i++){
                if((items[i].expiration_days*1)<30 && (items[i].expiration_days*1)>=0){
                    due.cero = due.cero + (items[i].total*1)
                }else if((items[i].expiration_days*1)<60 && (items[i].expiration_days*1)>=30){
                    due.treinta = due.treinta + (items[i].total*1)
                }else if((items[i].expiration_days*1)<90 && (items[i].expiration_days*1)>=60){
                    due.sesenta = due.sesenta + (items[i].total*1)
                }else if((items[i].expiration_days*1)>=90){
                    due.noventa = due.noventa + (items[i].total*1)
                }
            }
            return due
        },
        total(id, type){
            var sum = 0
            var details = this.$store.state.quotation.quotation_items
            .filter(quotation=>quotation.quotation_id == id)
            .filter(quotation=>new Date(quotation.created_at) <= new Date('2022-04-30'))
            for(var i=0; i<details.length; i++){
                sum = sum+((details[i].price*1)*(details[i].quantity*1))
            }
            if(type == 'Serie A'){
                return sum*1.16
            }else if(type == 'Serie B'){
                return sum*1.08
            }
        },
        expired_debt(id, total, date, company_id){
            if(this.expirationDays(date, company_id)>0){
                return this.debt(total, id)
            }else{
                return 0
            }
        },
        invoiceDays(date){
            if(date!=undefined){
                return moment(new Date('2022-04-30')).diff(moment(new Date(date)), 'days')//'2022-04-30'
            }
        },
        expirationDays(date, company_id){
            var credit_days = this.$store.state.company.companies.filter(company=>company.id == company_id).map(company=>company.credit_days)[0]*1
            var invoice_days = this.invoiceDays(date)*1
            if(invoice_days>credit_days){
                return (invoice_days-credit_days)
            }else{
                return -1
            }
        },
        debt(total, id){
            return ((total*1) - (this.payments(id)*1))
        },
        payments(id){
            var collections = this.$store.state.collection.collection_details
            .filter(collection=>collection.sale.id == id)
            .filter(collection=>new Date(collection.created_at) <= new Date('2022-04-30'))
            if(collections.length>0){
                var respuesta = 0
                for(var i=0; i<collections.length; i++){
                    respuesta = respuesta + (collections[i].amount*1)
                }
                return respuesta
            }else{
                return 0
            }
        },
    }
}
</script>

<style>

</style>