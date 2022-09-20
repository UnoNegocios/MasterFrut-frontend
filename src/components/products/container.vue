<template>
    <v-container style="max-width:100vw;">
        <!-- Filtros -->
        <v-navigation-drawer style="top: 0px; max-height:100vh!important;" right v-model="filters" :clipped="$vuetify.breakpoint.lgAndUp" app>
            <filterInventory @filtersItem="filtersItem" v-bind:catalogo="'catalogo'"/>
        </v-navigation-drawer>
        <!-- Contenedor -->

        <v-data-table :headers="headers" :items="items" class="elevation-0 px-6 py-4">
            <!-- Header -->
            <template v-slot:top>
                <v-toolbar flat >
                    <v-toolbar-title>Productos | Servicios </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-text-field
                        v-model="search"
                        append-icon="mdi-magnify"
                        label="Buscar"
                        single-line
                        hide-details
                    ></v-text-field>
                    <v-spacer></v-spacer>
                    <v-btn icon>
                        <v-icon @click="openFilter()">mdi-filter</v-icon>
                    </v-btn>
                    <!--v-btn icon>
                        <v-icon @click="exportExcel">mdi-download</v-icon>
                    </v-btn-->
                </v-toolbar>
            </template>

            <template v-slot:[`item.gallery`]="{ item }">
                <v-icon v-if="item.gallery!=undefined" @click="viewGallery(item.images)" small>mdi-image-multiple</v-icon>
                <v-dialog v-model="dialogGallery" width="900">
                    <v-card>
                        <v-row justify="space-around" class="ma-0">
                            <v-col v-for="(image, n) in imagesGallery" :key="n" class="d-flex child-flex pa-0" cols="3" style="border: solid 1px #b7b7b7; border-collapse: collapse;">
                                <v-img :src="liga + 'files/items/'+image"
                                    aspect-ratio="1" class="grey lighten-2">
                                    <template v-slot:placeholder>
                                        <v-row class="fill-height ma-0" align="center" justify="center">
                                            <v-progress-circular indeterminate color="grey lighten-5" ></v-progress-circular>
                                        </v-row>
                                    </template>
                                    <a style="color:transparent!important; margin-left:10px;" :href="liga + 'files/items/'+image" :download="image" target="_blank"><v-icon>mdi-eye</v-icon></a>
                                </v-img>
                            </v-col>
                        </v-row>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="blue darken-1" text @click="dialog=false">Cerrar</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
            </template>

            <!-- Detalle PC -->
            <template v-slot:expanded-item="{ headers, item }">
                <td style="padding:0px!important;" :colspan="headers.length">
                    <v-data-table :headers="headers2" :items="variations(item.id)" class="elevation-0 pa-5" style="background: #f7f7f7;!important" dense>
                        <template slot="no-data">
                            No existen productos registrados.
                        </template>
                        <template v-slot:[`item.price`]="{ item }">
                            {{money(item.price)}}
                        </template>
                        <template v-slot:[`item.is_published`]="{ item }">
                            <v-icon v-if="item.is_published==true" color="green">mdi-record</v-icon>
                            <v-icon v-else color="red">mdi-record</v-icon>
                        </template>
                        <template v-slot:[`item.unit_id`]="{ item }">
                            {{unit(item.unit_id)}}
                        </template>
                    </v-data-table>
                </td>
            </template>

            <template slot="no-data">
                No existen productos registrados.
            </template>
            <template v-slot:[`item.price`]="{ item }">
                {{money(item.price)}}
            </template>

            <template v-slot:[`item.is_published`]="{ item }">
                <div v-if="item.product_type!='Variable'">
                    <v-icon v-if="item.is_published==true" color="green">mdi-record</v-icon>
                    <v-icon v-else color="red">mdi-record</v-icon>
                </div>
            </template>
            <template v-slot:[`item.unit_id`]="{ item }">
                {{unit(item.unit_id)}}
            </template>
        </v-data-table>
    </v-container>
</template>
<script>
import filterInventory from "../inventary/filter"
export default {
    components: {
        'filterInventory':filterInventory
    },
    data:()=>({ 
        search:'',
        items:'',
        dialogGallery:false,
        imagesGallery:[],
        filters: false,
        info:true,
        headers2:[
            {text: 'Nombre', value: 'name'},
            //{text: 'Codigo', value: 'sku'},
            {text: 'Codigo SAE', value: 'macro'},
            //{text: 'Tipo', value: 'type'},
            //{text: 'Proveedor', value: 'provider_id'},
            {text: 'Unidad', value: 'unit_id'},
            //{text: 'Peso', value: 'weight'},
            {text: 'Precio', value: 'price'},
            {text: 'Costo', value: 'cost'},
            {text: 'Categoría', value: 'categories'},
            {text: 'Publicado', value: 'is_published'},
            {text: 'Inventario Ideal', value: 'ideal_inventory'},
            {text: 'Inventario', value: 'inventory'},
            {text: 'Acciones', value: 'actions', sortable: false },
        ],
    }),
    computed:{
        liga(){
            return process.env.VUE_APP_BACKEND_ROUTE
        },
        itemsList(){
            var perro = this.$store.state.item.items.filter(item=>item.product_type != 'Variable').map(id=>{
                    return{
                        id:id.id,
                        name:id.name,
                        sku:id.sku,
                        macro:id.macro,
                        is_published:id.is_published,
                        superiorID:id.superiorID,
                        type:id.type,
                        provider_id:this.provider(id.provider_id),
                        unit_id:this.searchUnit(id.unit_id, id.id),
                        cost:id.cost,
                        price:id.price,
                        product_type:id.product_type,
                        created_by_user_id:id.created_by_user_id,
                        weight:id.weight + ' kg',
                        inventory:this.inventoryCalc(id.id),
                        categories:this.category(id.categories),
                        ideal_inventory:id.ideal_inventory,
                        images:id.images,

                        items:this.variations(id.id)
                        /*
                        weight:id.weight,
                        longitude:id.longitude,
                        heihgt:id.heihgt,
                        width:id.width,
                        discoiunt_price:id.discoiunt_price,
                        images:id.images,
                        featured:id.featured,
                        short_description:id.short_description,
                        description:id.description,
                        start_promo:id.start_promo,
                        end_promo:id.end_promo,
                        tax:id.tax,
                        tax_type:id.tax_type,
                        buy_when_available:id.buy_when_available,
                        */
                    }
                })
            if(this.search!=''&&this.search!=null&&this.search!=undefined){
                var words = this.search.split(" ")
                for(var i=0; i<words.length; i++){
                    perro = perro.filter(item=>this.lowerCase(JSON.stringify(item)).includes(words[i].toLowerCase()))
                }
            }
            return perro
        },
        headers(){
            this.items = this.itemsList
            return [
                //{text: '', value: 'data-table-expand' },
                {text: 'Nombre', value: 'name'},
                //{text: 'Codigo', value: 'sku'},
                //{text: 'Codigo Macro', value: 'macro'},
                {text: 'Fotos', value: 'gallery', sortable: false },
                //{text: 'Tipo', value: 'type'},
                //{text: 'Proveedor', value: 'provider_id'},
                {text: 'Unidad', value: 'unit_id'},
                //{text: 'Peso', value: 'weight'},
                {text: 'Precio', value: 'price'},
                //{text: 'Costo', value: 'cost'},
                {text: 'Categoría', value: 'categories'},
                {text: 'Publicado', value: 'is_published'},
                //{text: 'Inventario Ideal', value: 'ideal_inventory'},
                {text: 'Inventario', value: 'inventory'},
                //{text: 'Acciones', value: 'actions', sortable: false },
            ]
        },
    },
    methods:{
        searchUnit(unit, id){
            if(unit!=undefined && unit!=null && unit!=''){
                return unit
            }else{
                var variation = this.$store.state.item.items.filter(item=>item.superiorID == id).map(item=>item.unit_id)[0]
                return variation
            }
        },
        inventoryCalc(id){
            var quantities = this.$store.state.inventory.inventories.filter(inventory=>inventory.item_id == id)
            var sum = 0
            for(var i=0; i<quantities.length; i++){
                if(quantities[i].type == 'Salida Producción' || quantities[i].type == 'Salida Venta' || quantities[i].type == 'Devolución'){
                    sum = sum - quantities[i].quantity
                }
                else if(quantities[i].type == 'Entrada Producción' || quantities[i].type == 'Entrada Compra' || quantities[i].type == 'Ajuste Manual' || quantities[i].type == 'Creación de Producto' || quantities[i].type == 'Ajuste Inventario Físico'){
                    sum = sum + quantities[i].quantity
                }
            }
            return sum
        },
        filtersItem: function(params) {
            this.items = ''
            var filterItems = this.$store.state.item.items.filter(item=>item.product_type != 'Variable')
            //name
            if(params.name!=''&&params.name!=undefined&&params.name!=null){
                filterItems=filterItems.filter(item=>this.lowerCase(item.name).includes(params.name.toLowerCase()))
            }
            //type
            if(params.type!==''&&params.type!==undefined&&params.type!==null){
                filterItems=filterItems.filter(item=>item.type === params.type)
            }
            //product_type
            if(params.product_type!==''&&params.product_type!==undefined&&params.product_type!==null){
                filterItems=filterItems.filter(item=>item.product_type === params.product_type)
            }
            //code
            if(params.code!=''&&params.code!=undefined&&params.code!=null){
                filterItems=filterItems.filter(item=>this.lowerCase(item.macro).includes(params.code.toLowerCase()))
            }
            //provider
            if(params.provider!=''&&params.provider!=undefined&&params.provider!=null){
                var uno = filterItems.filter(item=>item.provider_id == params.provider[0])
                for(var i=1; i<params.provider.length; i++){
                    uno=uno.concat(filterItems.filter(item=>item.provider_id == params.provider[i]))   
                }
                filterItems = this.removeDuplicates(uno, "id");
            }
            //category
            if(params.category!=''&&params.category!=undefined&&params.category!=null){
                var dos = filterItems.filter(item=>item.categories == params.category[0])
                for(var i=1; i<params.category.length; i++){
                    dos=dos.concat(filterItems.filter(item=>item.categories == params.category[i]))   
                }
                filterItems = this.removeDuplicates(dos, "id");
            }
            //publish
            if(params.publish!==''&&params.publish!==undefined&&params.publish!==null){
                filterItems=filterItems.filter(item=>item.is_published == params.publish)
            }
            this.items = filterItems
        },
        removeDuplicates(originalArray, prop) {
            var newArray = [];
            var lookupObject  = {};
            for(var i in originalArray) {
                lookupObject[originalArray[i][prop]] = originalArray[i];
            }
            for(i in lookupObject) {
                newArray.push(lookupObject[i]);
            }
            return newArray;
        },
        lowerCase(text){
            if(text!=null&&text!=undefined&&text!=''){
                return text.toLowerCase()
            }else{
                return ' '
            }
        },
        money(amount){
            if(amount!=undefined){
                return (amount*1).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})
            }else{
                return '-'
            }
        },
        variations(item_id){
            var respuesta = this.$store.state.item.items.filter(item=>item.product_type == 'Variación').filter(item=>item.superiorID == item_id)
            return respuesta
        },
        provider(id){
            if(id!=undefined){
                return this.$store.state.provider.providers.filter(provider=>provider.id == id).map(provider=>provider.name)[0];
            }else{
                return '-'
            }
        },
        unit(id){
            if(id!=undefined){
                return this.$store.state.unit.units.filter(unit=>unit.id == id).map(unit=>unit.name)[0];
            }else{
                return '-'
            }
        },
        viewGallery(images){
            this.imagesGallery = images
            this.dialogGallery = true
        },
        category(categoriesIds){
            if(categoriesIds.length>0){
                var categoriesNames = this.$store.state.category.categories
                var catName = categoriesNames.filter(category=>category.id == categoriesIds[0]).map(category => category.name)[0];
                for(var i=1; i<categoriesIds.length; i++){
                    catName = catName + ', ' + categoriesNames.filter(category=>category.id == categoriesIds[i]).map(category => category.name)[0];
                }
                return catName
            }else{
                return '-'
            }
        },
        openFilter(){
            if(this.filters == false){
                this.$emit("closeDrawer", false);
                this.filters = true
            }else{
                this.$emit("closeDrawer", true);
                this.filters = false
            }
        },
    },
}
</script>