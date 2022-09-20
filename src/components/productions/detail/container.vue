<template>
    <v-row class="pa-6">
        <v-col cols="12" sm="6" md="10">
            <v-data-table show-expand :headers="headers" :items="productionDetail" class="elevation-0" style="background: #f7f7f7;!important" dense>
                <template v-slot:[`item.completed`]="{ item }">
                    <v-icon v-if="item.completed==true">mdi-check</v-icon>
                    <v-icon v-else>mdi-close</v-icon>
                </template>
                <!-- Tabla sin información -->
                <template v-slot:no-data>
                    No existen registros de producción aún
                </template>
                <!-- Detalle de compra -->
                <template v-slot:expanded-item="{ headers, item }">
                    <td :colspan="headers.length" style="background: white;!important">
                        <v-row class="pa-6">
                            <v-card-title class="py-4">
                                <span style="font-size:18px!important; font-weight:400;">Insumos Utilizados</span>
                            </v-card-title>
                            <v-card-text class="pb-0">
                                <v-data-table :headers="headersInsumos" :items="item.insumos" class="elevation-0" dense></v-data-table>
                            </v-card-text>
                        </v-row>
                    </td>
                </template>
                 <!-- Acciones por fila -->
                <template v-slot:[`item.actions`]="{ item }">
                    <v-menu bottom left> <!--v-if="(permissions('editProductionOrder')==true || permissions('deleteProductionOrder')==true) && item.completed==false"-->
                        <template v-slot:activator="{ on, attrs }">
                        <v-btn icon v-bind="attrs" v-on="on">
                            <v-icon>mdi-dots-vertical</v-icon>
                        </v-btn>
                        </template>
                        <v-list style="font-size:13px;">
                            <v-list-item @click="editItem(item.id)"  v-show="permissions('editProductionOrder')">
                                <v-icon small class="mr-2">
                                    mdi-pencil
                                </v-icon>
                                Editar
                            </v-list-item>
                            <v-list-item @click="deleteItem(item)"  v-show="permissions('deleteProductionOrder')">
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
        <v-col cols="12" sm="6" md="2">
            <v-btn @click="addDialog=true" color="primary" rounded class="elevation-0">Agregar</v-btn>
        </v-col>
        <!-- Crear envio -->
        <v-dialog v-model="addDialog" max-width="900px">
          <add @closeDialogAddProduction="closeDialogAddProduction" v-bind:productionId="production"/>
        </v-dialog>
        <!-- Editar envio -->
        <v-dialog v-model="editDialog" max-width="900px">
          <edit v-bind:productionOrder="productionOrder" @closeDialogEditProduction="closeDialogEditProduction"/>
        </v-dialog>
        <!-- Dialogo confirmación de eliminación -->
        <div class="text-center">
            <v-bottom-sheet  v-model="sheet" inset>
                <v-sheet class="text-center" height="150px">
                    <div class="pt-6">
                    ¿Seguro que deseas borrar este producto de la producción?
                    </div>
                    <v-btn class="mt-4" text color="error" @click="deleteProduction()">
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
            production:Number
        },
        components: {
            'add':Add,
            'edit':Edit,
        },
        data: () => ({
            addDialog:false,
            editDialog:false,
            sheet:false,
            deleteId:'',
            productionOrder:'',
            snackbar: {
                show: false,
                message: null,
                color: null
            },
        }),
        computed: {
            currentUser:{
                get(){
                    return this.$store.state.currentUser.user;
                }
            },
            productionsList(){
                return this.$store.state.production_detail.production_details;
            },
            productionDetail(){
                return this.$store.state.production_detail.production_details.filter(production=>production.production_id == this.production).map(id=>{
                    return{
                        id:id.id,
                        unit: this.itemUnit(id.item_id),
                        item_id: this.itemName(id.item_id),
                        quantity: id.quantity,
                        created_by_user_id: this.userName(id.created_by_user_id),
                        created_at: id.created_at,//.toLocaleString("sv-SE", {timeZone: "America/Monterrey"}).split('T').toString().slice(0,19),
                        last_updated_by_user_id: this.userName(id.last_updated_by_user_id),
                        updated_at: id.updated_at,//.toLocaleString("sv-SE", {timeZone: "America/Monterrey"}).split('T').toString().slice(0,19),
                        insumos: id.insumos.map(id=>{
                            return{
                                unit: this.itemUnit(id.item_id),
                                item_id: this.itemName(id.item_id),
                                quantity: id.quantity,
                            }
                        })
                    }
                });
            },
            headersInsumos(){ 
                return [
                { text: 'Cantidad', value: 'quantity' },
                { text: 'Unidad', value: 'unit' },
                { text: 'Producto', value: 'item_id' },
            ]},
            headers(){ 
                return [
                { text: '', value: 'data-table-expand' },
                { text: 'Cantidad', value: 'quantity' },
                { text: 'Unidad', value: 'unit' },
                { text: 'Producto', value: 'item_id' },
                { text: 'Crea', value: 'created_by_user_id' },
                { text: 'Creación', value: 'created_at' },
                { text: 'Edita', value: 'last_updated_by_user_id' },
                { text: 'Edición', value: 'updated_at' },
                { value: 'actions', sortable: false, align: 'end', },
            ]},
        },
        methods:{
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
            deleteProduction(){
                axios.delete(process.env.VUE_APP_BACKEND_ROUTE + "api/v1/production_detail/delete/"+this.deleteId).then(response => {
                    this.deleteId = ''
                    this.sheet = false
                    this.$store.dispatch('production_detail/getProductionDetails')
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
            editItem(id){
                this.productionOrder = this.productionsList.filter(production=>production.id == id)[0]
                this.editDialog = true
            },
            closeDialogEditProduction: function(params) {
                this.editDialog = false;
                this.$store.dispatch('production_detail/getProductionDetails')
            },
            closeDialogAddProduction: function(params) {
                this.addDialog = false;
                this.$store.dispatch('production_detail/getProductionDetails')
            },
        }

    }
</script>