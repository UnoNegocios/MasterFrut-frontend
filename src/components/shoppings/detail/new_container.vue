<template>
    <v-row class="pa-6">
        <v-col cols="12" sm="6" md="10">
            <v-data-table :headers="headers" :items="shoppingDetail" class="elevation-0" style="background: #f7f7f7;!important" dense>
                <!-- Tabla sin información -->
                <template v-slot:no-data>
                    No existen registros de envíos aún
                </template>
                 <!-- Acciones por fila -->
                <template v-slot:[`item.actions`]="{ item }">
                    <v-menu bottom left v-if="(permissions('editShoppingOrder')==true || permissions('deleteShoppingOrder')==true) && shopping.received!=true">
                        <template v-slot:activator="{ on, attrs }">
                        <v-btn icon v-bind="attrs" v-on="on">
                            <v-icon>mdi-dots-vertical</v-icon>
                        </v-btn>
                        </template>
                        <v-list style="font-size:13px;">
                            <v-list-item @click="editItem(item.editedItem)"  v-show="permissions('editShoppingOrder')">
                                <v-icon small class="mr-2">
                                    mdi-pencil
                                </v-icon>
                                Editar
                            </v-list-item>
                            <v-list-item @click="deleteItem(item)"  v-show="permissions('deleteShoppingOrder')">
                                <v-icon small class="mr-2">
                                    mdi-delete
                                </v-icon>
                                Eliminar
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </template>
            </v-data-table>
        </v-col>
        <v-col cols="12" sm="6" md="2" v-if="shopping.received!=true">
            <v-btn @click="addDialog=true" color="primary" rounded class="elevation-0">Agregar</v-btn>
        </v-col>
        <!-- Crear envio -->
        <v-dialog v-model="addDialog" max-width="900px">
          <add @closeDialogAddShopping="closeDialogAddShopping" v-bind:compra="shopping"/>
        </v-dialog>
        <!-- Editar envio -->
        <v-dialog v-model="editDialog" max-width="700px">
          <edit v-bind:shoppingOrder="shoppingOrder" @closeDialogEditShopping="closeDialogEditShopping"/>
        </v-dialog>
        <!-- Dialogo confirmación de eliminación -->
        <div class="text-center">
            <v-bottom-sheet  v-model="sheet" inset>
                <v-sheet class="text-center" height="150px">
                    <div class="pt-6">
                    ¿Seguro que deseas borrar este producto de la compra?
                    </div>
                    <v-btn class="mt-4" text color="error" @click="deleteShopping()">
                    Eliminar
                    </v-btn>
                    <v-btn class="mt-4" text color="grey" @click="cancel()">
                    Cancelar
                    </v-btn>
                </v-sheet>
            </v-bottom-sheet>
        </div>
        <v-snackbar :color="snackbar.color" v-model="snackbar.show">
            {{ snackbar.message }}
        </v-snackbar>
    </v-row>
</template>

<script>
    import axios from "axios";
    import Add from "../detail/add"
    import Edit from "../detail/edit"
    export default {
        props:{
            shopping:Object
        },
        components: {
            'add':Add,
            'edit':Edit,
        },
        created(){
            const details = this.shopping.details
            this.shoppingDetail = details.map(id=>{
                return{
                    id:id.id,
                    unit: id.item.unit.name,
                    item_id: id.item.id,
                    macro: id.item.macro,
                    quantity: id.quantity,
                    //kg: id.kg+'kg',
                    unit_cost: (id.unit_cost*1).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',}),
                    total: (id.unit_cost*id.quantity).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',}),
                    editedItem: [id].map(p=>{
                        return{
                            item_id: p.item.id*1,
                            quantity: p.quantity,
                            unit_cost: p.unit_cost
                        }
                    })[0]
                }
            });
        },
        data: () => ({
            shoppingDetail:[],
            addDialog:false,
            editDialog:false,
            sheet:false,
            deleteId:'',
            shoppingOrder:'',
            snackbar: {
                show: false,
                message: null,
                color: null
            },
            originalShopping:''
        }),
        computed: {
            currentUser:{
                get(){
                    return this.$store.state.currentUser.user;
                }
            },
            headers(){ 
                return [
                { text: 'Unidad', value: 'unit' },
                { text: 'Codigo SAE', value: 'macro',},
                { text: 'Producto', value: 'item_id' },
                { text: 'Cantidad', value: 'quantity' },
                //{ text: 'Kg', value: 'kg' },
                { text: 'Costo Unitario', value: 'unit_cost' },
                { text: 'Costo total', value: 'total' },//quitar
                //{ text: 'Crea', value: 'created_by_user_id' },
                //{ text: 'Creación', value: 'created_at' },
                //{ text: 'Edita', value: 'last_updated_by_user_id' },
                //{ text: 'Edición', value: 'updated_at' },
                { value: 'actions', sortable: false, align: 'end', },
            ]},
        },
        methods:{
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
            deleteItem (item) {
                this.deleteId = item.id
                this.sheet = true
            },
            deleteShopping(){
                axios.delete(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/shopping_detail/"+this.deleteId).then(response => {
                    this.deleteId = ''
                    this.sheet = false
                    this.$store.dispatch('shopping_detail/getShoppingDetails')
                }).catch(error => {
                    this.snackbar = {
                        message: error.response.data.message,
                        color: 'error',
                        show: true
                    }
                });
            },
            cancel(){
                this.deleteId = ''
                this.sheet = false
            },
            editItem(editedItem){
                this.shoppingOrder = editedItem
                this.editDialog = true
            },
            closeDialogEditShopping: function(params) {
                this.editDialog = false;
                this.$store.dispatch('shopping_detail/getShoppingDetails')
            },
            closeDialogAddShopping: function(params) {
                this.addDialog = false;
                this.$store.dispatch('shopping_detail/getShoppingDetails')
            },
        }
    }
</script>