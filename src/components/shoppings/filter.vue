<template>
    <v-container class="ma-0 pa-0">
        <v-row class="py-10 px-8">
            <strong>Filtros</strong>

            <div class="mt-4">
                Fecha
                <v-menu v-model="menuFrom" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px" >
                    <template v-slot:activator="{ on }">
                        <v-text-field @keydown.enter="filter()" v-model="shopping.dateFrom" label="Desde" clearable prepend-icon="mdi-calendar-today" readonly v-on="on"></v-text-field>
                    </template>
                    <v-date-picker color="primary" v-model="shopping.dateFrom" @input="menuFrom = false"></v-date-picker>
                </v-menu>
                <v-menu v-model="menuTo" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px" >
                    <template v-slot:activator="{ on }">
                        <v-text-field @keydown.enter="filter()" v-model="shopping.dateTo" label="Hasta" clearable prepend-icon="mdi-calendar" readonly v-on="on"></v-text-field>
                    </template>
                    <v-date-picker color="primary" v-model="shopping.dateTo" @input="menuTo = false"></v-date-picker>
                </v-menu>
            </div>

            <div class="mt-4">
                Fecha de Vencimiento
                <v-menu v-model="menuFrom2" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px" >
                    <template v-slot:activator="{ on }">
                        <v-text-field @keydown.enter="filter()" v-model="shopping.expirationDateFrom" label="Desde" clearable prepend-icon="mdi-calendar-today" readonly v-on="on"></v-text-field>
                    </template>
                    <v-date-picker color="primary" v-model="shopping.expirationDateFrom" @input="menuFrom2 = false"></v-date-picker>
                </v-menu>
                <v-menu v-model="menuTo2" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px" >
                    <template v-slot:activator="{ on }">
                        <v-text-field @keydown.enter="filter()" v-model="shopping.expirationDateTo" label="Hasta" clearable prepend-icon="mdi-calendar" readonly v-on="on"></v-text-field>
                    </template>
                    <v-date-picker color="primary" v-model="shopping.expirationDateTo" @input="menuTo2 = false"></v-date-picker>
                </v-menu>
            </div>

            <v-select v-model="shopping.paid" clearable :items="paid" label="Pagado"></v-select>

            <v-select v-model="shopping.serie" clearable :items="series" label="Serie"></v-select>

            <v-text-field @keydown.enter="filter()" v-model="shopping.invoice" label="Factura"></v-text-field>

            <v-autocomplete @keydown.enter="filter()" v-model="shopping.provider_id" :items="providerLists" item-text="name" item-value="id" attach chips label="Proveedor" multiple>
                <template slot="no-data" class="pa-2">No existen proveedores relacionados.</template>  
            </v-autocomplete>

            <!--v-autocomplete @keydown.enter="filter()" v-model="shopping.item_id" :items="itemLists" item-text="name" item-value="id" attach chips label="Producto" multiple>
                <template slot="no-data" class="pa-2">No existen productos relacionados.</template>  
            </v-autocomplete-->

            <!--v-autocomplete @keydown.enter="filter()" v-model="shopping.user_id" :items="userLists" item-text="name" item-value="id" attach chips label="Vendedor" multiple>
                <template slot="no-data" class="pa-2">No existen usuarios relacionados.</template>  
            </v-autocomplete-->

            <v-text-field @keydown.enter="filter()" v-model="shopping.notes" label="Descripción"></v-text-field>

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
        paid:['No', 'Si'],
        series:['Serie A', 'Serie B', 'Inversiones'],
        menuTo:false,
        menuFrom:false,
        menuTo2:false,
        menuFrom2:false,
        shopping:{
            dateFrom:'',
            dateTo:'',
            expirationDateFrom:'',
            expirationDateTo:'',
            notes:'',
            //user_id:'',
            provider_id:'',
            invoice:'',
            serie:'',
            paid:'',
            //item_id:''
        },
    }),
    computed: { 
        userLists(){
            return this.$store.state.user.users;
        }, 
        providerLists(){
            return this.$store.state.provider.providers;
        }, 
        itemLists(){
            return this.$store.state.item.items;
        }, 
    },
    created () {
    },
    methods: {
        filter(){
            this.$emit("filtersShopping", this.shopping);
        }
    }
  }
</script>