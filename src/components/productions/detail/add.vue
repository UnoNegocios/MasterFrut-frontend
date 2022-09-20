<template>
    <v-card>
        <v-card-title class="py-4" >
            <v-icon style="background: #e7e8e9; padding: 10px!important; border-radius: 50%;" class="mr-4">mdi-file-document-outline</v-icon>
            <span>Agregar detalle de Producción</span>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pb-0">
            <v-container>
                <v-row v-for="(item,j) in products" :key="j">
                    <v-col cols="12" sm="12" md="6">
                        <strong style="font-size:18px;">Producto</strong>
                        <v-row style="background-color: #94949417;" class="px-2 ma-0 py-1 mt-4">
                            <v-col cols="12" sm="5" md="3" class="py-0 my-0">
                                <v-text-field type=number v-model="item.quantity" label="Cantidad"></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="5" md="9" class="py-0 my-0">

                                <v-autocomplete item-text="detail"  v-model="item.item_id" :items="itemLists" item-value="id" label="Producto" clearable>
                                    <template slot="no-data" class="pa-2">No existen productos relacionados.</template>  
                                    <template v-slot:item="{item, attrs, on}">
                                        <v-list-item v-on="on" v-bind="attrs">
                                            <v-list-item-content>
                                                <v-list-item-title>
                                                    {{item.name}} | {{(item.price*1).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
                                                    <div>
                                                        <span style="font-size:12px;">Categoría:</span>
                                                        <template v-for="(category, index) in item.categories">
                                                            <v-chip  v-bind:key="index" small class="ml-2"  style="font-size:8px;">{{categoryName(category)}}</v-chip>
                                                        </template>
                                                    </div>
                                                    <div>
                                                        <span style="font-size:14px;">Inventario:
                                                            <strong v-if="item.inventory<1" style="color:red!important;">{{item.inventory}}</strong>
                                                            <strong v-else style="color:green!important;">{{item.inventory}}</strong>
                                                        </span>
                                                    </div>
                                                </v-list-item-title>
                                            </v-list-item-content>
                                        </v-list-item>
                                    </template> 
                                </v-autocomplete>
                            </v-col>
                        </v-row>
                    </v-col>
                    <v-col cols="12" sm="12" md="6">
                        <strong style="font-size:18px;">Insumos</strong>
                        <v-row style="background-color: #94949417;" class="px-2 ma-0 py-0 mt-4" v-for="(insumo,k) in products[j].insumos" :key="k">
                            <v-col cols="12" sm="5" md="3" class="py-0 my-0">
                                <v-text-field type=number v-model="insumo.quantity" label="Cantidad"></v-text-field><!--:disabled="yanohay(insumo.quantity, insumo.item_id, j, k)"-->
                            </v-col>
                            <v-col cols="12" sm="5" md="8" class="py-0 my-0">
                                <v-autocomplete item-text="name"  v-model="insumo.item_id" :items="insumoLists" item-value="id" label="Insumo" clearable>
                                    <template slot="no-data" class="pa-2">No existen insumos relacionados.</template>  
                                    <template v-slot:item="{item, attrs, on}">
                                        <v-list-item v-on="on" v-bind="attrs">
                                            <v-list-item-content>
                                                <v-list-item-title>
                                                    {{item.name}} <!--| {{(item.price*1).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}-->
                                                    <div class="mt-4">
                                                        <span style="font-size:14px;">Inventario:
                                                            <strong v-if="item.inventory<1" style="color:red!important;">{{item.inventory}}</strong>
                                                            <strong v-else style="color:green!important;">{{item.inventory}}</strong>
                                                        </span>
                                                        <v-chip small class="ml-2" >{{item.provider}}</v-chip>
                                                    </div>
                                                </v-list-item-title>
                                            </v-list-item-content>
                                        </v-list-item>
                                    </template> 
                                </v-autocomplete>
                            </v-col>
                            <v-col cols="12" sm="2" md="1">
                                <v-icon @click="remove2(k, j)" v-show="k || ( !k && products[j].insumos.length > 1)" color="red">mdi-close</v-icon>
                                <v-icon @click="add2(k, j)" v-show="k == products[j].insumos.length-1" color="primary">mdi-plus</v-icon>
                            </v-col>
                        </v-row>
                    </v-col>
                    <div style="width: 100%;">
                        <v-icon style="margin: auto; display: flex;" @click="remove(j)" v-show="j || ( !j && products.length > 1)" color="red">mdi-close</v-icon> <v-icon style="margin: auto; display: flex;" @click="add(j)" v-show="j == products.length-1" color="primary">mdi-plus</v-icon>
                    </div>
                </v-row>
            </v-container>
        </v-card-text>
        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="close">
                Cancelar
            </v-btn>
            <v-btn :loading="gris" :disabled="gris" color="blue darken-1" text @click="save">
                Guardar
            </v-btn>
        </v-card-actions>
        <v-snackbar :color="snackbar.color" v-model="snackbar.show">
            {{ snackbar.message }}
        </v-snackbar>
    </v-card>
</template>

<script>
import axios from "axios";
    export default {
        props:{
            productionId:Number
        },  
        data: () => ({
            snackbar: {
                show: false,
                message: null,
                color: null
            },
            gris:false,
            datePicker:'',
            products:[{
                production_id:'',
                item_id:'',
                quantity:1,
                insumos:[{
                    //production_id:'',
                    item_id:'',
                    quantity:1,
                    //shopping_id:'',
                }]
            }],
            rules: {
                required: value => !!value || 'Campo requerido',
            },
            valid: true,
        }),
    computed: {
        currentUser:{
            get(){
                return this.$store.state.currentUser.user
            }
        },
        itemLists(){
            return this.$store.state.item.items//.filter(item=>item.type != 'Insumo')
            .map(id=>{
                return{
                    id:id.id,
                    name:id.name,
                    detail: id.name + ' (' + this.categories(id.categories) + ')',
                    categories:id.categories,
                    inventory:this.inventoryCalc(id.id),
                    price:id.price,
                }
            });
        },
        insumoLists(){
            return this.$store.state.item.items//.filter(item=>item.type == 'Insumo')
            .map(id=>{
                return{
                    id:id.id,
                    name:id.name,
                    detail: id.name + ' (' + this.categories(id.categories) + ')',
                    categories:id.categories,
                    inventory:this.inventoryCalc(id.id),
                    price:id.price,
                }
            });
            /*
            return this.$store.state.shopping_detail.shopping_details.filter(shopping=>shopping.used < shopping.quantity)
            .map(id=>{
                return{
                    id:id.id,
                    item_id:id.item_id,
                    name: this.itemName(id.item_id),
                    inventory: (id.quantity*1) - (id.used*1),
                    provider: this.provider(id.shopping_id)
                }
            });
            */
        },
    },
    created(){
    },
    methods: {
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
        provider(sId){
            var id = this.$store.state.shopping.shoppings.filter(shopping=>shopping.id == sId).map(item=>item.provider_id)[0]
            return this.$store.state.provider.providers.filter(provider=>provider.id == id).map(provider=>provider.name)[0]
        },
        itemName(id){
            return this.$store.state.item.items.filter(item=>item.id == id).map(item=>item.name)[0]
        },
        categories(categories){
            var respuesta = ''
            for(var i=0; i<categories.length; i++){
                if(i>0){
                    respuesta = respuesta + ', ' + this.categoryName(categories[i])
                }
                else{
                    respuesta = this.categoryName(categories[i])
                }
            }
            return respuesta
        },
        categoryName(id){
            return this.$store.state.category.categories.filter(category => category.id == id).map(category => category.name)[0];
        },
        yanohay(quantity, item_id, index1, index2){
            var perro = false
            if(item_id!=undefined && item_id!='' && item_id!=null){
                var inventory = this.insumoLists.filter(item=>item.id == item_id).map(item=>item.inventory)[0]//[0]
                if(quantity>=inventory){
                    perro = true
                    this.products[index1].insumos[index2].quantity = inventory
                }
            }
            return perro
        },
        add(index) {
            this.products.push({
                production_id:'',
                item_id:'',
                quantity:'',
                insumos:[{
                    //production_id:'',
                    item_id:'',
                    quantity:'',
                }]
            });
        },
        remove(index) {
            this.products.splice(index, 1);
        },
        add2(index, a) {
            this.products[a].insumos.push({
                //production_id:'',
                item_id:'',
                quantity:'',
            });
        },
        remove2(index, a) {
            this.products[a].insumos.splice(index, 1);
        },
        permissions(permission){
            if(this.currentUser.id==1){
                return true
            }else if(this.currentUser.permissions!=undefined){
                if(this.currentUser.permissions.includes(permission)){
                    return true
                }else{
                    return false
                }
            }else{
                return false
            }
        },
        close () {
            this.gris = false
            this.production = Object.assign({}, this.defaultItem)
            this.$nextTick(() => {
                this.$emit("closeDialogAddProduction", false);
            })
        },
        save(){
            for(var i=0; i<this.products.length; i++){
                this.products[i].production_id=this.productionId
                this.products[i].created_by_user_id=this.currentUser.id;
                this.products[i].last_updated_by_user_id=this.currentUser.id;
                let perro = this.products[i]
                /* Alta de detalle de producción */
                axios.post(process.env.VUE_APP_BACKEND_ROUTE + "api/v1/production_detail/create",Object.assign(this.products[i])).then(response=>{
                    /* Alta de entrada de productos fabricados */
                    let inventarioProductos = {
                        created_by_user_id: perro.created_by_user_id,
                        type: 'Entrada Producción',
                        item_id: perro.item_id,
                        quantity: perro.quantity,
                        production_id: perro.production_id
                    }
                    axios.post(process.env.VUE_APP_BACKEND_ROUTE + "api/v1/inventory/create",Object.assign(inventarioProductos)).then(response=>{
                        for(var j=0; j<perro.insumos.length; j++){
                            let gato = perro.insumos[j]
                            /* Alta de salida de insumos  */
                            let inventarioInsumos = {
                                created_by_user_id: perro.created_by_user_id,
                                type: 'Salida Producción',
                                item_id: gato.item_id,
                                quantity: gato.quantity,
                                production_id: perro.production_id
                            }
                            axios.post(process.env.VUE_APP_BACKEND_ROUTE + "api/v1/inventory/create",Object.assign(inventarioInsumos)).catch(error => {
                                this.snackbar = {
                                    message: error.response.data.message,
                                    color: 'error',
                                    show: true
                                }
                            })
                        }
                    }).catch(error => {
                        this.snackbar = {
                            message: error.response.data.message,
                            color: 'error',
                            show: true
                        }
                    })
                }).catch(error => {
                    this.snackbar = {
                        message: error.response.data.message,
                        color: 'error',
                        show: true
                    }
                })
            }
            this.close()
        },
    },
}
</script>
<style lang="css" scoped>
.v-text-field >>> label{
    font-size: 14px!important;
}
</style>
<style>
.v-input__icon--prepend-inner i::before {
    font-size: 18px!important;
    color:#1976D2;
}
.v-text-field input, .v-label {
    font-size: 14px;
}
.v-picker__title.primary{
    display:none;
}
</style>