<template>
    <v-container class="ma-0 pa-0 pb-8">
        <v-row class="pt-10 px-8 pb-12">
            <v-row class="ma-0 mb-4">
                <strong>Filtros</strong>
                <v-spacer></v-spacer>
                <v-btn @click="removeFilter()" small class="elevation-0" style="border:solid 1px #dddddd;">
                    <v-icon small class="mr-1">mdi-filter-off</v-icon>Limpiar
                </v-btn>
            </v-row>

            <v-text-field @keydown.enter="filter()" v-model="collection.id" label="Id"></v-text-field>

            <v-autocomplete @keydown.enter="filter()" v-model="collection.company_id" :items="companyLists" :loading="isLoadingCompany" :search-input.sync="searchCompanies" hide-no-data item-value="id" item-text="name" label="Empresa(s)" placeholder="Escribe para buscar" attach chips multiple>
                <template v-slot:item="{item, attrs, on}">
                    <v-list-item v-on="on" v-bind="attrs">
                        <v-list-item-content>
                            <v-list-item-title v-if="item.name!=null">
                                <span v-if="item.macro!=null">{{item.macro}}</span>{{item.name}}
                                <div v-if="item.razon_social!=null">
                                    <span style="font-size:12px;">{{item.razon_social}}</span>
                                </div>
                            </v-list-item-title>
                            <v-list-item-title v-else-if="item.razon_social!=null">
                                {{item.razon_social}}
                            </v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                </template> 
            </v-autocomplete>

            <v-autocomplete @keydown.enter="filter()" v-model="collection.contact_id" :items="contactList" :loading="isLoadingContact" :search-input.sync="searchContacts" hide-no-data item-value="id" item-text="name" label="Contacto(s)" placeholder="Escribe para buscar" attach chips multiple>
                <template v-slot:item="{item, attrs, on}">
                    <v-list-item v-on="on" v-bind="attrs">
                        <v-list-item-content>
                            <v-list-item-title>
                                {{item.name}} <span v-if="item.last!=undefined">{{item.last}}</span>
                                <div>
                                    <span style="font-size:12px;">{{item.company}}</span>
                                </div>
                            </v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                </template> 
            </v-autocomplete>

            <v-menu offset-y :close-on-content-click="closeDatePicker(collection.date)">
                <template v-slot:activator="{ on, attrs }">
                    <v-text-field :rules="[v => !!v || 'Campo requerido']" clearable required v-model="collection.date" label="Fecha" prepend-icon="mdi-calendar" v-bind="attrs" readonly v-on="on"></v-text-field>
                </template>
                <v-date-picker v-model="collection.date" range></v-date-picker>
            </v-menu>

            <v-text-field @keydown.enter="filter()" v-model="collection.invoice" label="Factura"></v-text-field>
            <v-text-field @keydown.enter="filter()" v-model="collection.remission" label="Remisión"></v-text-field>
 
            <v-autocomplete @keydown.enter="filter()" v-model="collection.sale_id" :items="salesList" :loading="isLoadingSale" :search-input.sync="searchSales" hide-no-data item-value="id" item-text="id" label="ID venta" placeholder="Escribe para buscar" attach chips multiple>
                
            </v-autocomplete>

            <v-text-field @keydown.enter="filter()" v-model="collection.note" label="Referencia"></v-text-field>
            
            <v-select @keydown.enter="filter()" label="Serie" v-model="collection.type" :items="series"></v-select>

            <v-select @keydown.enter="filter()" v-model="collection.macro" clearable :items="macros" label="SAE"></v-select>

            <v-autocomplete @keydown.enter="filter()" v-model="collection.method_id" :items="methodLists" item-text="method" item-value="id" attach chips label="Metodo de Pago" multiple>
            </v-autocomplete>

            <v-autocomplete @keydown.enter="filter()" v-model="collection.user_id" :items="userList" item-text="name" item-value="id" attach chips label="Vendedor" multiple>
            </v-autocomplete>

            <v-autocomplete @keydown.enter="filter()" v-model="collection.created_by_user_id" :items="userList" hide-no-data item-value="id" item-text="name" label="Creador(es)" placeholder="Escribe para buscar" attach chips multiple></v-autocomplete>
            
            <v-menu offset-y :close-on-content-click="closeDatePicker(collection.created_at)">
                <template v-slot:activator="{ on, attrs }">
                    <v-text-field :rules="[v => !!v || 'Campo requerido']" clearable required v-model="collection.created_at" label="Fecha Creación" prepend-icon="mdi-calendar" v-bind="attrs" readonly v-on="on"></v-text-field>
                </template>
                <v-date-picker v-model="collection.created_at" range></v-date-picker>
            </v-menu>

            <v-autocomplete @keydown.enter="filter()" v-model="collection.last_updated_by_user_id" :items="userList" hide-no-data item-value="id" item-text="name" label="Editor(es)" placeholder="Escribe para buscar" attach chips multiple></v-autocomplete>

            <v-menu offset-y :close-on-content-click="closeDatePicker(collection.updated_at)">
                <template v-slot:activator="{ on, attrs }">
                    <v-text-field :rules="[v => !!v || 'Campo requerido']" clearable required v-model="collection.updated_at" label="Fecha Edición" prepend-icon="mdi-calendar" v-bind="attrs" readonly v-on="on"></v-text-field>
                </template>
                <v-date-picker v-model="collection.updated_at" range></v-date-picker>
            </v-menu>

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
import axios from "axios";
export default {
    props:{
        company:Object
    },
    data: () => ({
        macros:[{text:'Si', value:1}, {text:'No', value:0}],
        series:['Serie A', 'Serie B'],
        collection:{
            //multiples axios
            company_id:'',
            contact_id:'',
            sale_id:'',/* KHE */
            //multiples store
            user_id:'',
            method_id:'',
            created_by_user_id:'',
            last_updated_by_user_id:'',
            //abierto
            note:'',
            invoice:'',/* KHE */
            remission:'',/* KHE */
            id:'',
            //select data
            type:'',
            //boolean
            macro:'',
            //date
            date:[],
            created_at:[],
            updated_at:[],
        },
        entries:{
            companies: [],
            contacts:[],
            sales:[]
        },
        isLoadingCompany: false,
        isLoadingContact: false,
        isLoadingSale: false,
        searchCompanies: null,
        searchContacts: null,
        searchSales: null,
    }),
    watch: {
        searchCompanies(val){
            //if (this.companyLists.length > 0) return
            if (this.isLoadingCompany) return
            this.isLoadingCompany = true
            axios.get(process.env.VUE_APP_BACKEND_ROUTE + 'api/v2/company_p?filter[name]='+val)
            .then(res => {
                this.entries.companies = res.data.data
            }).finally(() => (this.isLoadingCompany = false))
        },
        searchContacts(val){
            //if (this.contactList.length > 0) return
            if (this.isLoadingContact) return
            this.isLoadingContact = true

            var length = this.collection.company_id.length
            if(length>0){
                var filter = 'filter[company_id]='
                for(var i=0; i<length; i++){
                    filter = filter + this.collection.company_id[i]
                    if(length>1 && i<length-1){
                        filter = filter + ','
                    }else{
                        filter = filter + "&"
                    }
                }
            }else{
                var filter = ''
            }
            axios.get(process.env.VUE_APP_BACKEND_ROUTE + 'api/v2/contact_p?' + filter + "filter[name]=" + val)
            .then(res => {
                this.entries.contacts = res.data.data
            }).finally(() => (this.isLoadingContact = false))
        },
        searchSales(val){
            //if (this.salesList.length > 0) return
            if (this.isLoadingSale) return
            this.isLoadingSale = true
            axios.get(process.env.VUE_APP_BACKEND_ROUTE + 'api/v2/sale_p?filter[id]='+val)
            .then(res => {
                this.entries.sales = res.data.data
            }).finally(() => (this.isLoadingSale = false))
        }
    },
    computed: {
        companyLists(){
            return this.entries.companies.map(id => {
                return{
                    id:id.id,
                    macro:id.macro,
                    name:id.name,
                    razon_social:id.razon_social
                }
            })
        },
        contactList(){
            return this.entries.contacts.map(id => {
                return{
                    id:id.id,
                    name:id.name,
                    last:id.last,
                    company:id.company.name,
                    job_position:id.job_position
                }
            })
        },
        userList(){
            return this.$store.state.user.users.map(id => {
                return{
                    id:id.id,
                    name:id.name + id.last,
                }
            })
        },
        methodLists(){
            return this.$store.state.payment_method.payment_methods;
        },
        salesList(){
            return this.entries.sales.map(id => {
                return{
                    id:id.id,
                }
            })
        }
    },
    created(){
        if(localStorage.getItem('selectorFiltersCollections')!=undefined){
            this.collection = JSON.parse(localStorage.getItem('selectorFiltersCollections'))
            this.entries = JSON.parse(localStorage.getItem('entriesFiltersCollections'))
        }
    },
    methods: {
        closeDatePicker(dates){
            if(dates!=undefined && dates.length==2){
                return true
            }else{
                return false
            }
        },
        filter(){
            var count = 0
            var filter = ''
            //abierto
            if(this.collection.id!=''){
                count = count+1
                filter = filter + '&filter[id]='+this.collection.id
            }
            if(this.collection.note!=''){
                count = count+1
                filter = filter + '&filter[note]='+this.collection.note
            }
            if(this.collection.invoice!=''){
                count = count+1
                filter = filter + '&filter[invoice]='+this.collection.invoice
            }
            if(this.collection.remission!=''){
                count = count+1
                filter = filter + '&filter[remission]='+this.collection.remission
            }
            //multiples
            if(this.collection.company_id!=undefined && this.collection.company_id.length>0){
                count = count+1
                filter = filter + '&filter[company_id]='
                var length = this.collection.company_id.length
                for(var i=0; i<length; i++){
                    filter = filter + this.collection.company_id[i]
                    if(length>1 && i<length-1){
                        filter = filter + ','
                    }
                }
            }
            if(this.collection.contact_id!=undefined && this.collection.contact_id.length>0){
                count = count+1
                filter = filter + '&filter[contact_id]='
                var length = this.collection.contact_id.length
                for(var i=0; i<length; i++){
                    filter = filter + this.collection.contact_id[i]
                    if(length>1 && i<length-1){
                        filter = filter + ','
                    }
                }
            }
            if(this.collection.created_by_user_id!=undefined && this.collection.created_by_user_id.length>0){
                count = count+1
                filter = filter + '&filter[created_by_user_id]='
                var length = this.collection.created_by_user_id.length
                for(var i=0; i<length; i++){
                    filter = filter + this.collection.created_by_user_id[i]
                    if(length>1 && i<length-1){
                        filter = filter + ','
                    }
                }
            }
            if(this.collection.last_updated_by_user_id!=undefined && this.collection.last_updated_by_user_id.length>0){
                count = count+1
                filter = filter + '&filter[last_updated_by_user_id]='
                var length = this.collection.last_updated_by_user_id.length
                for(var i=0; i<length; i++){
                    filter = filter + this.collection.last_updated_by_user_id[i]
                    if(length>1 && i<length-1){
                        filter = filter + ','
                    }
                }
            }
            if(this.collection.user_id!=undefined && this.collection.user_id.length>0){
                count = count+1
                filter = filter + '&filter[user_id]='
                var length = this.collection.user_id.length
                for(var i=0; i<length; i++){
                    filter = filter + this.collection.user_id[i]
                    if(length>1 && i<length-1){
                        filter = filter + ','
                    }
                }
            }
            if(this.collection.sale_id!=undefined && this.collection.sale_id.length>0){
                count = count+1
                filter = filter + '&filter[collectionDetails.sale_id]='
                var length = this.collection.sale_id.length
                for(var i=0; i<length; i++){
                    filter = filter + this.collection.sale_id[i]
                    if(length>1 && i<length-1){
                        filter = filter + ','
                    }
                }
            }
            if(this.collection.method_id!=undefined && this.collection.method_id.length>0){
                count = count+1
                filter = filter + '&filter[payment_method_id]='
                var length = this.collection.method_id.length
                for(var i=0; i<length; i++){
                    filter = filter + this.collection.method_id[i]
                    if(length>1 && i<length-1){
                        filter = filter + ','
                    }
                }
            }
            //select
            if(this.collection.type!=''){
                count = count+1
                filter = filter + '&filter[serie]='+this.collection.type
            }
            //boolean
            if(this.collection.macro!==''){
                count = count+1
                filter = filter + '&filter[macro]='+this.collection.macro
            }
            //date
            if(this.collection.date!=undefined && this.collection.date.length==2){
                count = count+1
                filter = filter + '&filter[date_between]='+this.collection.date[0]+','+this.collection.date[1]
            }
            if(this.collection.created_at!=undefined && this.collection.created_at.length==2){
                count = count+1
                filter = filter + '&filter[created_at]='+this.collection.created_at
            }
            if(this.collection.updated_at!=undefined && this.collection.updated_at.length==2){
                count = count+1
                filter = filter + '&filter[updated_at]='+this.collection.updated_at
            }
            localStorage.setItem('selectorFiltersCollections', JSON.stringify(this.collection));
            localStorage.setItem('entriesFiltersCollections', JSON.stringify(this.entries));
            localStorage.setItem('filtersCollections', JSON.stringify(filter.slice(1,filter.length)));
            localStorage.setItem('filtersCollectionsLength', count)
            this.$nextTick(() => {
                this.$emit("filtersCollection", false);
                this.$store.dispatch('collection/getTotals')
            })
        },
        removeFilter(){
            this.collection={
                //multiples axios
                company_id:'',
                contact_id:'',
                sale_id:'',/* KHE */
                //multiples store
                user_id:'',
                method_id:'',
                created_by_user_id:'',
                last_updated_by_user_id:'',
                //abierto
                note:'',
                invoice:'',/* KHE */
                remission:'',/* KHE */
                id:'',
                //select data
                type:'',
                //boolean
                macro:'',
                //date
                date:[],
                created_at:[],
                updated_at:[],
            },
            localStorage.removeItem("selectorFiltersCollections")
            localStorage.removeItem("filtersCollections")
            localStorage.removeItem("entriesFiltersCollections")
            localStorage.removeItem("filtersCollectionsLength")
            this.entries={
                companies: [],
                contacts:[],
                sales:[]
            },
            this.$nextTick(() => {
                this.$store.dispatch('collection/getTotals')
                this.$emit("filtersCollection", false);
            })
        }
    }
  }
</script>

<style >
.v-text-field {
    padding-top: 0px;
    margin-top: 0px;
}
</style>