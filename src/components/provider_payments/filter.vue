<template>
    <v-container class="ma-0 pa-0">
        <v-row class="py-10 px-8">
            <strong>Filtros</strong>

            <div class="mt-4">
                Fecha
                <v-menu v-model="menuFrom" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px" >
                    <template v-slot:activator="{ on }">
                        <v-text-field @keydown.enter="filter()" v-model="payment.dateFrom" label="Desde" clearable prepend-icon="mdi-calendar-today" readonly v-on="on"></v-text-field>
                    </template>
                    <v-date-picker color="primary" v-model="payment.dateFrom" @input="menuFrom = false"></v-date-picker>
                </v-menu>
                <v-menu v-model="menuTo" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px" >
                    <template v-slot:activator="{ on }">
                        <v-text-field @keydown.enter="filter()" v-model="payment.dateTo" label="Hasta" clearable prepend-icon="mdi-calendar" readonly v-on="on"></v-text-field>
                    </template>
                    <v-date-picker color="primary" v-model="payment.dateTo" @input="menuTo = false"></v-date-picker>
                </v-menu>
            </div>

            <v-autocomplete @keydown.enter="filter()" v-model="payment.provider_id" :items="providerLists" item-text="name" item-value="id" attach chips label="Proveedor" multiple>
                <template slot="no-data" class="pa-2">No existen proveedores relacionados.</template>  
            </v-autocomplete>

            <v-autocomplete @keydown.enter="filter()" v-model="payment.method_id" :items="methodLists" item-text="method" item-value="id" attach chips label="Metodo" multiple>
                <template slot="no-data" class="pa-2">No existen metodos de pago relacionados.</template>  
            </v-autocomplete>

            <v-text-field @keydown.enter="filter()" v-model="payment.note" label="Descripción"></v-text-field>

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
    data: () => ({
        menuTo:false,
        menuFrom:false,
        payment:{
            dateFrom:'',
            dateTo:'',
            note:'',
            provider_id:'',
            method_id:''
        },
    }),
    computed: { 
        providerLists(){
            return this.$store.state.provider.providers;
        }, 
        methodLists(){
            return this.$store.state.payment_method.payment_methods;
        }, 
    },
    created () {
    },
    methods: {
        filter(){
            this.$emit("filtersProviderPayment", this.payment);
        }
    }
  }
</script>