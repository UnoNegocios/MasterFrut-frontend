<template>
    <v-container class="ma-0 pa-0">
        <v-row class="py-10 px-8">
            <strong>Filtros</strong>

            <div class="mt-4">
                Fecha
                <v-menu v-model="menuFrom" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px" >
                    <template v-slot:activator="{ on }">
                        <v-text-field @keydown.enter="filter()" v-model="expenses.dateFrom" label="Desde" clearable prepend-icon="mdi-calendar-today" readonly v-on="on"></v-text-field>
                    </template>
                    <v-date-picker color="primary" v-model="expenses.dateFrom" @input="menuFrom = false"></v-date-picker>
                </v-menu>
                <v-menu v-model="menuTo" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px" >
                    <template v-slot:activator="{ on }">
                        <v-text-field @keydown.enter="filter()" v-model="expenses.dateTo" label="Hasta" clearable prepend-icon="mdi-calendar" readonly v-on="on"></v-text-field>
                    </template>
                    <v-date-picker color="primary" v-model="expenses.dateTo" @input="menuTo = false"></v-date-picker>
                </v-menu>
            </div>

            <div class="mt-4">
                Fecha de Vencimiento
                <v-menu v-model="menuFrom2" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px" >
                    <template v-slot:activator="{ on }">
                        <v-text-field @keydown.enter="filter()" v-model="expenses.expirationDateFrom" label="Desde" clearable prepend-icon="mdi-calendar-today" readonly v-on="on"></v-text-field>
                    </template>
                    <v-date-picker color="primary" v-model="expenses.expirationDateFrom" @input="menuFrom2 = false"></v-date-picker>
                </v-menu>
                <v-menu v-model="menuTo2" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px" >
                    <template v-slot:activator="{ on }">
                        <v-text-field @keydown.enter="filter()" v-model="expenses.expirationDateTo" label="Hasta" clearable prepend-icon="mdi-calendar" readonly v-on="on"></v-text-field>
                    </template>
                    <v-date-picker color="primary" v-model="expenses.expirationDateTo" @input="menuTo2 = false"></v-date-picker>
                </v-menu>
            </div>

            <v-select @keydown.enter="filter()" v-model="expenses.pay" :items="sinoLists" item-text="text" item-value="value" label="Pagado"></v-select>

            <v-text-field @keydown.enter="filter()" v-model="expenses.invoice" label="Factura"></v-text-field>

            <v-autocomplete @keydown.enter="filter()" v-model="expenses.type_id" :items="typeLists" item-text="name" item-value="id" attach chips label="Tipo de Gasto" multiple>
                <template slot="no-data" class="pa-2">No existen tipos de gasto relacionados.</template>  
            </v-autocomplete>

            <v-text-field @keydown.enter="filter()" v-model="expenses.concept" label="Concepto"></v-text-field>

            <v-autocomplete @keydown.enter="filter()" v-model="expenses.provider_id" :items="providerLists" item-text="name" item-value="id" attach chips label="Proveedor" multiple>
                <template slot="no-data" class="pa-2">No existen proveedores relacionados.</template>  
            </v-autocomplete>
            <v-autocomplete @keydown.enter="filter()" v-model="expenses.serie" :items="serieLists" item-text="name" item-value="id" attach chips label="Serie" multiple>
                <template slot="no-data" class="pa-2">No existen series relacionadas.</template>  
            </v-autocomplete>
            <v-autocomplete @keydown.enter="filter()" v-model="expenses.payment_method_id" :items="paymentLists" item-text="method" item-value="id" attach chips label="Metodo de Pago" multiple>
                <template slot="no-data" class="pa-2">No existen metodos de pago relacionados.</template>  
            </v-autocomplete>

            

            

            <v-autocomplete @keydown.enter="filter()" v-model="expenses.user_id" :items="userLists" item-text="name" item-value="id" attach chips label="Creador" multiple>
                <template slot="no-data" class="pa-2">No existen usuarios relacionados.</template>  
            </v-autocomplete>

            <v-text-field @keydown.enter="filter()" v-model="expenses.description" label="Descripción"></v-text-field>


            <div class="mt-4">
                Fecha de Pago
                <v-menu v-model="menuFrom1" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px" >
                    <template v-slot:activator="{ on }">
                        <v-text-field @keydown.enter="filter()" v-model="expenses.payDateFrom" label="Desde" clearable prepend-icon="mdi-calendar-today" readonly v-on="on"></v-text-field>
                    </template>
                    <v-date-picker color="primary" v-model="expenses.payDateFrom" @input="menuFrom1 = false"></v-date-picker>
                </v-menu>
                <v-menu v-model="menuTo1" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px" >
                    <template v-slot:activator="{ on }">
                        <v-text-field @keydown.enter="filter()" v-model="expenses.payDateTo" label="Hasta" clearable prepend-icon="mdi-calendar" readonly v-on="on"></v-text-field>
                    </template>
                    <v-date-picker color="primary" v-model="expenses.payDateTo" @input="menuTo1 = false"></v-date-picker>
                </v-menu>
            </div>

        </v-row>
        <v-card style="position:absolute; bottom:0; width:100%;" tile color="primary">
            <v-list-item link @click="filter()" dark>
                <v-list-item-content>
                    <strong>Filtrar (0)</strong>
                </v-list-item-content>
            </v-list-item>    
        </v-card>
    </v-container>
</template>
<script>
  export default {
    props:{
        company:String
    },
    data: () => ({
        menuTo:false,
        menuFrom:false,
        menuTo1:false,
        menuFrom1:false,
        menuTo2:false,
        menuFrom2:false,
        expenses:{
            expirationDateFrom:'',
            expirationDateTo:'',

            payDateFrom:'',
            payDateTo:'',

            user_id:'',
            description:'',
            type_id:'',
            provider_id:'',
            serie:'',
            payment_method_id:'',

            dateFrom:'',
            dateTo:'',

            concept:''
        },
    }),
    computed: {
        userLists(){
            return this.$store.state.user.users;
        }, 
        typeLists(){
            return this.$store.state.expense_type.expense_types;
        }, 
        providerLists(){
            return this.$store.state.provider.providers;
        }, 
        serieLists(){
            return ['Serie A', 'Serie B']
        }, 
        paymentLists(){
            return this.$store.state.payment_method.payment_methods;
        }, 
        sinoLists(){
            return [{text:'Si', value:true}, {text:'No', value:'perro'}]
        }
    },
    created () {
    },
    methods: {
        filter(){
            this.$emit("filtersExpense", this.expenses);
        }
    }
  }
</script>