<template>    
    <v-card>
        <!-- Titulo del dialogo -->
        <v-card-title class="py-0">
            <span>Crear Producto</span>
            <v-spacer></v-spacer>
            <!--v-col cols="12" sm="6" md="4">
                <v-select :rules="[v => !!v || 'Campo requerido']" v-model="editedItem.product_type" label="" :items="productTypes"></v-select>
                <v-autocomplete  class="pt-0 mt-0" v-if="editedItem.product_type=='Variación'" :rules="[v => !!v || 'Campo requerido']" v-model="editedItem.superiorID" :items="superiorProducts" label="Producto Padre" item-text="name" item-value="id">
                    <template slot="no-data">
                        No existen productos relacionados.
                    </template>
                </v-autocomplete>
            </v-col>
            <v-col cols="12" sm="6" md="4">
                <v-select :rules="[v => !!v || 'Campo requerido']" v-if="editedItem.product_type=='Simple' || editedItem.product_type=='Variación'" v-model="editedItem.type" label="Tipo de Producto" :items="types"></v-select>
            </v-col-->
        </v-card-title>

        <v-divider></v-divider>
            <!-- Formulario -->
        <v-form ref="form">
            <!--v-stepper v-model="e1" class="elevation-0">
                <v-stepper-header class="elevation-0">
                    <v-stepper-step style="font-weight:bolder!important;" :complete="e1 > 1" step="1"></v-stepper-step>
                    <v-divider></v-divider>
                    <v-stepper-step style="font-weight:bolder!important;" step="2"></v-stepper-step>
                </v-stepper-header>
                <v-stepper-items>
                    <v-stepper-content step="1" class="py-0"-->
                        <v-row class="py-0 px-6">
                            <v-col cols="12" sm="6" md="4" class="my-0 pb-0">
                                <v-text-field :rules="[v => !!v || 'Campo requerido']" v-model="editedItem.macro" label="Código SAE"></v-text-field>
                                <!--v-text-field :rules="[v => !!v || 'Campo requerido']" v-model="editedItem.sku" label="Código"></v-text-field-->
                                <v-autocomplete :rules="[v => !!v || 'Campo requerido']" v-model="editedItem.unit_id" v-if="editedItem.product_type!='Variable'" :items="units" label="Unidad" item-text="name" item-value="id">
                                    <template slot="no-data">
                                        <div class="px-6 pt-3">
                                            No existen unidades de medida relacionadas.
                                            <v-text-field v-model="createUnit.name" label="Nueva Unidad de Medida" append-icon="mdi-plus" @click:append="saveUnit()"></v-text-field>
                                        </div>
                                    </template>
                                </v-autocomplete>
                                <v-checkbox v-model="editedItem.is_published" v-if="editedItem.product_type!='Variable'" label="Publicado"></v-checkbox>
                            </v-col>
                            <v-col cols="12" sm="6" md="4" class="my-0 pb-0">
                                <v-text-field :rules="[v => !!v || 'Campo requerido']" v-model="editedItem.name" label="Producto"></v-text-field>
                                <!--v-text-field :rules="[v => !!v || 'Campo requerido']" type="number" v-model="editedItem.price" label="Precio"></v-text-field-->
                                <v-text-field :rules="[v => !!v || 'Campo requerido']" type="number" v-model="editedItem.ideal_inventory" v-if="editedItem.product_type!='Variable'" label="Inventario Ideal"></v-text-field>
                                <v-autocomplete :rules="[v => !!v || 'Campo requerido']" v-model="editedItem.provider_id" v-if="editedItem.type!='Fabricado'" :items="providers" label="Proveedor" item-text="name" item-value="id">
                                    <template slot="no-data">
                                        <div class="px-6 pt-3">
                                            No existen proveedores relacionados.
                                            <v-text-field v-model="createProvider.name" label="Proveedor" append-icon="mdi-plus" @click:append="saveProvider()"></v-text-field>
                                        </div>
                                    </template>
                                </v-autocomplete>
                            </v-col>
                            <v-col cols="12" sm="6" md="4" class="my-0 pb-0">
                                <v-text-field :rules="[v => !!v || 'Campo requerido']" type="number" v-model="editedItem.cost" label="Costo"></v-text-field>
                                <v-text-field :rules="[v => !!v || 'Campo requerido']" type="number" v-model="editedItem.inventory[0]" v-if="editedItem.product_type!='Variable'" label="Inventario"></v-text-field>
                                <v-autocomplete :rules="[v => !!v || 'Campo requerido']" multiple v-model="editedItem.categories" v-if="editedItem.product_type!='Variación'" :items="categories" label="Categoría" item-text="name" item-value="id">
                                    <template slot="no-data">
                                        <div class="px-6 pt-3">
                                            No existen categorías relacionadas.
                                            <v-text-field v-model="createCategory.name" label="Nueva Categoría" append-icon="mdi-plus" @click:append="saveCategory()"></v-text-field>
                                        </div>
                                    </template>
                                </v-autocomplete>
                                <v-text-field v-if="editedItem.unit_id!=1 && editedItem.unit_id!=''" v-model="editedItem.weight" label="Peso" suffix="Kg"></v-text-field>
                            </v-col>
                        </v-row>
                    <!--/v-stepper-content>
                    <v-stepper-content step="2" class="pt-0">
                        <div style="background-color: #94949417;" class="pt-4">
                            <v-row class="px-2 ma-0" v-for="(item,k) in editedItem.raw_materials" :key="k">
                                <v-col ols="12" sm ="4" md="3" class="py-0 my-0">
                                    <v-text-field type=number v-model="item.percentage" label="Cantidad"></v-text-field>
                                </v-col>
                                <v-col ols="12" sm ="8" md="8" class="py-0 my-0">
                                    <v-autocomplete item-text="name"  v-model="item.raw_material_id" :items="rawMaterials" item-value="id" label="Materia Prima" clearable>
                                        <template slot="no-data" class="pa-2">No existen productos relacionados.</template>  
                                    </v-autocomplete>
                                </v-col>
                                <v-col cols="12" sm ="4" md="1">
                                    <v-icon @click="remove(k)" v-show="k || ( !k && editedItem.raw_materials.length > 1)" color="red">mdi-close</v-icon>
                                    <v-icon @click="add(k)" v-show="k == editedItem.raw_materials.length-1" color="primary">mdi-plus</v-icon>
                                </v-col>
                            </v-row>
                        </div>
                    </v-stepper-content>
                </v-stepper-items>
            </v-stepper-->
        </v-form>
        <v-row class="ma-0 pa-0">
            <v-col cols="12" sm="12" md="4" class="mb-0 pb-0">
                <v-dialog v-model="dialog" width="800">
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn style="font-size:12px;" text v-bind="attrs" v-on="on">
                            <v-icon class="mr-2">mdi-attachment</v-icon> Fotografía
                        </v-btn>
                    </template>
                    <v-card>
                        <v-card-title>
                            <v-row>
                                <v-col v-for="(image, n) in editedItem.images" :key="n" class="d-flex child-flex" cols="1">
                                    <v-tooltip bottom>
                                        <template v-slot:activator="{ on, attrs }">
                                            <v-img :src="liga + 'files/items/'+image"
                                                aspect-ratio="1" class="grey lighten-2" v-bind="attrs" v-on="on">
                                                <template v-slot:placeholder>
                                                    <v-row class="fill-height ma-0" align="center" justify="center">
                                                        <v-progress-circular indeterminate color="grey lighten-5" ></v-progress-circular>
                                                    </v-row>
                                                </template>
                                                <v-btn small @click="deleteImage(n)" color="red" icon><v-icon>mdi-delete</v-icon></v-btn>
                                            </v-img>
                                        </template>
                                        <v-img width="350" height="auto" :src="liga + 'files/items/'+image"></v-img>
                                    </v-tooltip>
                                </v-col>
                            </v-row>
                        </v-card-title>
                        <vue-dropzone 
                            ref="myVueDropzone" 
                            id="dropzone" 
                            :options="dropzoneOptions" 
                            v-on:vdropzone-success="uploadSuccess" 
                            v-on:vdropzone-error="uploadError" 
                            v-on:vdropzone-removed-file="fileRemoved"/>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="blue darken-1" text @click="dialog=false">Terminar</v-btn>
                        </v-card-actions>
                    </v-card>
                    <v-snackbar :color="snackbar2.color" v-model="snackbar2.show">
                        {{ snackbar2.message }}
                    </v-snackbar>
                </v-dialog>
            </v-col>
            <v-col cols="12" sm="12" md="8" class="mb-0 pb-0 pl-0">
                <v-card-actions class="pb-6">
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="close">Cancelar</v-btn>
                    <!--v-btn color="blue darken-1" text  v-if="e1>1" @click="e1 = e1-1">
                        <v-icon>mdi-chevron-left</v-icon>
                        Regresar
                    </v-btn>
                    <v-btn color="blue darken-1" text  v-if="e1!=2" @click="e1 = e1+1">
                        Siguiente
                        <v-icon>mdi-chevron-right</v-icon>
                    </v-btn-->
                    <v-btn color="blue darken-1" text  :loading="gris" :disabled="gris || !valid" @click="save">Guardar</v-btn>
                </v-card-actions>
            </v-col>
        </v-row>
        <v-snackbar :color="snackbar.color" v-model="snackbar.show">
            {{ snackbar.message }}
        </v-snackbar>
    </v-card>
</template>
<script>
import axios from "axios";
import vue2Dropzone from "vue2-dropzone";
import "vue2-dropzone/dist/vue2Dropzone.min.css";
export default {
    components: {
        vueDropzone: vue2Dropzone,
    },  
    data:()=>({ 
        e1: 1,
        dialog: false,
        dropzoneOptions: {
            url: process.env.VUE_APP_BACKEND_ROUTE + "api/v1/item/files",
            addRemoveLinks: true,
            thumbnailWidth: 150,
            dictDefaultMessage: 'Haz clic aquí o arrastra la(s) imagen(es) a subir.',
            dictFallbackMessage: "Tu navegador no puede subir archivos arrastarndolos a la pantalla.",
            dictFileTooBig: "File is too big ({{filesize}}MiB). Max filesize: {{maxFilesize}}MiB.",
            dictInvalidFileType: "No puede cargar archivos de este tipo.",
            dictCancelUpload: "Cancelar carga",
            dictCancelUploadConfirmation: "Estás seguro de que deseas cancelar esta carga?",
            dictRemoveFile: "Eliminar",
            dictMaxFilesExceeded: "No puedes subir más archivos.",
        },
        gris:false, 
        snackbar: {
            show: false,
            message: null,
            color: null
        },
        snackbar2: {
            show: false,
            message: null,
            color: null
        },
        index:0,
        disable:'',
        valid: true,
        editedItem: {
            weight:'',
            product_type:'Simple',
            name:'',
            //sku:'',
            macro:'',
            type:'Producto Final',
            provider_id:'',
            unit_id:'',
            superiorID:'',
            price:'',
            categories:[],
            cost:'',
            is_published:true,
            ideal_inventory:'',
            //e-commerce
            tax:'',
            tax_type:'',
            featured:'',
            short_description:'',
            description:'',
            start_promo:'',
            end_promo:'',
            longitude:'',
            height:'',
            width:'',
            discoiunt_price:'',
            buy_when_available:'',
            inventory:[],
            images:[],
            raw_materials:[{percentage:'', raw_material_id:''}]
        },
        productTypes:[
            'Simple', 'Variable', 'Variación'
        ],
        types:[
            'Insumo', 'Fabricado', 'Producto Final'
        ],
        createCategory:{
            name:'',
        },
        createProvider:{
            name:'',
        },
        createUnit:{
            name:'',
        },
        rules: {
            required: value => !!value || 'Campo requerido',
        },
    }),
    created(){
        
    },
    computed:{
        liga(){
            return process.env.VUE_APP_BACKEND_ROUTE
        },
        rawMaterials:{
            get(){
                return this.$store.state.raw_material.raw_materials
            }
        },
        currentUser:{
            get(){
                return this.$store.state.currentUser.user
            }
        },
        categories:{
            get(){
                return this.$store.state.category.categories;
            }
        },
        providers:{
            get(){
                return this.$store.state.provider.providers;
            }
        },
        superiorProducts:{
            get(){
                return this.$store.state.item.items.filter(item=>item.product_type == 'Variable');
            }
        },
        products:{
            get(){
                return this.$store.state.item.items;
            }
        },
        units:{
            get(){
                return this.$store.state.unit.units;
            }
        }
    },
    methods:{
        add() {
            this.editedItem.raw_materials.push({percentage:'', raw_material_id:''});
        },
        remove(index) {
            this.editedItem.raw_materials.splice(index, 1);
        },
        close () {
            this.editedItem.product_type='Simple'
            this.editedItem.name=''
            this.editedItem.sku=''
            this.editedItem.macro=''
            this.editedItem.type=''
            this.editedItem.provider_id=''
            this.editedItem.unit_id=''
            this.editedItem.superiorID=''
            this.editedItem.price=''
            this.editedItem.categories=[]
            this.editedItem.cost=''
            this.editedItem.is_published=true
            this.editedItem.ideal_inventory=''
            this.editedItem.inventory=[]
            this.editedItem.images=[]
            this.gris = false
            this.index = 0
            //this.$refs.myVueDropzone.removeAllFiles()
            this.dialog = false
            this.$nextTick(() => {
                this.$emit("closeDialogItem", false);
            })
        },
        save () {
            if(this.editedItem.product_type=='Simple'){
                this.cost=''
                this.price=''
                this.superiorID=''
            }else if(this.editedItem.product_type=='Variación'||this.editedItem.product_type=='Variable'){
                this.editedItem.type == 'Fabricado'
                this.provider_id=''
                if(this.editedItem.product_type=='Variable'){
                    this.editedItem.is_published=true
                    this.editedItem.ideal_inventory=''
                    this.editedItem.price=''
                    this.editedItem.superiorID=''
                    this.editedItem.unit_id=''
                    this.editedItem.provider_id=''
                }
                else if(this.editedItem.product_type=='Variación'){
                    this.editedItem.categories=[]
                    this.editedItem.provider_id=''
                }
            }
            this.$nextTick(() => {
                var perro = this.editedItem
                axios.post(process.env.VUE_APP_BACKEND_ROUTE + "api/v1/item/create",Object.assign(this.editedItem)).then(response=>{
                    var inventario = {
                        created_by_user_id: this.currentUser.id,
                        type:'Creación de Producto',
                        item_id: response.data.id,
                        quantity: perro.inventory[0]
                    }
                    axios.post(process.env.VUE_APP_BACKEND_ROUTE + "api/v1/inventory/create",Object.assign(inventario)).then(response=>{
                        location.reload()
                    }).catch(error => {
                        this.snackbar = {
                            message: error.response.data.message,
                            color: 'error',
                            show: true
                        }
                        this.gris = false
                    })
                }).catch(error => {
                    this.snackbar = {
                        message: error.response.data.message,
                        color: 'error',
                        show: true
                    }
                    this.gris = false
                })
            })
        },
        saveCategory(){
            axios.post(process.env.VUE_APP_BACKEND_ROUTE + "api/v1/category/create",Object.assign(this.createCategory)).then(response=>{
                this.$store.dispatch('category/getCategories')
                this.disable = true
                this.createCategory.name=''
            }) 
        },
        saveProvider(){
            axios.post(process.env.VUE_APP_BACKEND_ROUTE + "api/v1/provider/create",Object.assign(this.createProvider)).then(response=>{
                this.$store.dispatch('provider/getProviders')
                this.disable = true
                this.createProvider.name=''
            }) 
        },
        saveUnit(){
            axios.post(process.env.VUE_APP_BACKEND_ROUTE + "api/v1/unit/create",Object.assign(this.createUnit)).then(response=>{
                this.$store.dispatch('unit/getUnits')
                this.disable = true
                this.createUnit.name=''
            }) 
        },
        uploadSuccess(file, response) {
            console.log('File Successfully Uploaded with file name: ' + response.file);
            this.fileName = response.file;
            this.editedItem.images[this.index] = this.fileName;
            this.index = this.index+1
        },
        uploadError(file, message) {
            console.log('error')
            this.snackbar2 = {
                message: message.message,
                color: 'error',
                show: true
            }
        },
        fileRemoved(file) {
            var name = this.editedItem.images.filter(image=>image.includes(file.name))[0]
            var index = this.editedItem.images.indexOf(name)
            this.editedItem.images.splice(index, 1);
            this.index = this.index-1
        },
        deleteImage(index) {
            if (confirm('Seguro que deseas eliminar esta imagen?')) {
                this.editedItem.images.splice(index, 1);
                this.index = this.index-1
            }
        }
    }
}
</script>