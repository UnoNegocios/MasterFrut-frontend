<template>
  <v-container v-if="show">
        <v-data-table :loading="loading" :headers="headers" :items="clients" class="elevation-0 px-6 py-4">
            <template v-slot:top>
                <v-toolbar flat >
                    <v-row class="ma-0">
                        <v-toolbar-title>Saldos Vencidos</v-toolbar-title>
                        <v-icon medium @click="filter=!filter" class="ml-4"> mdi-filter</v-icon>
                        <v-spacer/>
                        <!-- Filtrar por Responsable -->
                        <v-autocomplete v-if="filter" v-model="salesmanFilterValue" clearable :items="userLists" label="Responsable" item-text="name" item-value="id">
                            <template slot="no-data" class="pa-2">No existen usuarios relacionados.</template>                      
                        </v-autocomplete>
                        <v-btn v-if="filter" small rounded color="primary" class="elevation-0 ml-4" @click="filterNow()">Filtrar</v-btn>
                    </v-row>
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
import axios from 'axios';
export default {
    data: () => ({
        loading:false,
        salesmanFilterValue:null,
        filter:false,
        campo:'total',
        campos:[
            { text: '+0 días vencido', value: 'cero',},
            { text: '+30 días vencido', value: 'treinta',},
            { text: '+60 días vencido', value: 'sesenta',},
            { text: '+90 días vencido', value: 'noventa',},
            { text: 'Total', value: 'total',},
        ],
        totalType:'sum',
        sumavg:['sum', 'avg'],//, '+0 días vencido', '+30 días vencido', '+60 días vencido', '+90 días vencido'],
        clients:'',
        show: false,
    }),
    computed:{
        headers(){
            return[
                { text: 'Cliente', value: 'name'},
                { text: '+0 días vencido', value: 'cero',},
                { text: '+30 días vencido', value: 'treinta',},
                { text: '+60 días vencido', value: 'sesenta',},
                { text: '+90 días vencido', value: 'noventa',},
                { text: 'Total', value: 'total'},
        ]},
        userLists() {
            return this.$store.state.user.users.map(id=>{
                return{
                    id:id.id,
                    name: id.name + ' ' + id.last
                }
            });
        },
    },
    created(){
        this.getDueBalance()
    },
    methods:{
        filterNow(){
            if(this.salesmanFilterValue!=null){
                this.getDueBalance()
            }
        },
        getDueBalance(){
            this.loading = true
            axios.get(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/pez")
            .then(response=>{
                const unicos = [response.data[0]];
                for(var i = 1; i < response.data.length; i++) {
                    const elemento = response.data[i];
                    if (unicos.filter(unico=>unico.company == elemento.company).length == 0) {
                        unicos.push(elemento);
                    }
                }
                this.clients = unicos.map(id=>{
                    return{
                        name: id.company,
                        due: this.due(response.data.filter(sale=>sale.company == id.company)),
                        salesman: id.salesman.id
                    }
                }).map(id=>{
                    return{
                        name:id.name,
                        cero:id.due.cero,
                        treinta:id.due.treinta,
                        sesenta:id.due.sesenta,
                        noventa:id.due.noventa,
                        salesman:id.salesman,
                        total:id.due.total,
                    }
                })
                .filter(item=>item.total > 1)
                .sort((a, b) => b.total - a.total)
                if(this.salesmanFilterValue!=null){
                    this.clients = this.clients.filter(client=>client.salesman == this.salesmanFilterValue)
                    this.loading = false
                    this.show = true
                }else{
                    this.loading = false
                    this.show = true
                }
            })
        },
        sumField(key) {//suma
            var suma=this.clients.reduce((a, b) => a + (b[key] || 0), 0)
            return suma.toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})
        },
        avgField(key){//primedio
            var suma=this.clients.reduce((a, b) => a + (b[key] || 0), 0)
            return (suma/this.clients.length).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})
        },
        due(items){
            var due={
                cero:0,
                treinta:0,
                sesenta:0,
                noventa:0,
                total:0
            }
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
                due.total = due.total + (items[i].total*1)
            }
            return due
        },
    }
}
</script>