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
        created(){
            this.shoppingDetail = this.$store.state.shopping_detail.shopping_details.filter(shopping=>shopping.shopping_id == this.shopping.id).map(id=>{
                return{
                    id:id.id,
                    unit: this.itemUnit(id.item_id),
                    item_id: this.itemName(id.item_id),
                    macro: this.itemMacro(id.item_id),
                    quantity: id.quantity,
                    //kg: id.kg+'kg',
                    unit_cost: (id.unit_cost*1).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',}),
                    total: (id.unit_cost*id.quantity).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',}),
                    created_by_user_id: this.userName(id.created_by_user_id),
                    created_at: id.created_at.slice(0, 10),
                    last_updated_by_user_id: this.userName(id.last_updated_by_user_id),
                    updated_at: id.updated_at.slice(0, 10),
                    editedItem: [id].map(p=>{
                        return{
                            item_id: p.item_id,
                            quantity: p.quantity,
                            unit_cost: p.unit_cost
                        }
                    })[0]
                }
            });
        },
        props:{
            shopping:Number
        },
        components: {
            'add':Add,
            'edit':Edit,
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
            shoppingsList(){
                return this.$store.state.shopping_detail.shopping_details;
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
                { text: 'Crea', value: 'created_by_user_id' },
                { text: 'Creación', value: 'created_at' },
                { text: 'Edita', value: 'last_updated_by_user_id' },
                { text: 'Edición', value: 'updated_at' },
                { value: 'actions', sortable: false, align: 'end', },
            ]},
        },
        methods:{
            itemMacro(id){
                return this.$store.state.item.items.filter(item=>item.id == id).map(item => item.macro)[0]
            },
            userName(id){
                return this.$store.state.user.users.filter(user=>user.id==id).map(user=>user.name + ' ' + user.last)[0]
            },
            itemUnit(id){
                var unitId =  this.$store.state.item.items.filter(item=>item.id == id).map(item=>item.unit_id)[0]
                return this.$store.state.unit.units.filter(unit=>unit.id == unitId).map(unit=>unit.name)[0]
            },
            itemName(id){
                return this.$store.state.item.items.filter(item=>item.id == id).map(item=>item.name)[0]
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
            deleteItem (item) {
                this.deleteId = item.id
                this.sheet = true
            },
            deleteShopping(){
                axios.delete(process.env.VUE_APP_BACKEND_ROUTE + "api/v1/shopping_detail/delete/"+this.deleteId).then(response => {
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