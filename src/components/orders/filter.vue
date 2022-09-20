<template>
    <v-container class="ma-0 pa-0 pb-8">
        <v-row class="pt-10 px-8 pb-12">
            <strong>Filtros</strong>
            <v-spacer></v-spacer>
            <v-btn @click="removeFilter()" small class="elevation-0" style="border:solid 1px #dddddd;">
                <v-icon small class="mr-1">mdi-filter-off</v-icon>Limpiar
            </v-btn>

            <v-autocomplete class="mt-4" v-model="quotation.company_id" :items="companyLists" :loading="isLoadingCompany" :search-input.sync="searchCompanies" hide-no-data item-value="id" item-text="name" label="Empresa(s)" placeholder="Escribe para buscar" attach chips multiple>
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

            <v-autocomplete v-model="quotation.user_id" :items="userList" hide-no-data item-value="id" item-text="name" label="Venedor(es)" placeholder="Escribe para buscar" attach chips multiple></v-autocomplete>
            <v-autocomplete v-model="quotation.created_by_user_id" :items="userList" hide-no-data item-value="id" item-text="name" label="Creador(es)" placeholder="Escribe para buscar" attach chips multiple></v-autocomplete>
            <v-autocomplete v-model="quotation.last_updated_by_user_id" :items="userList" hide-no-data item-value="id" item-text="name" label="Editor(es)" placeholder="Escribe para buscar" attach chips multiple></v-autocomplete>

            <v-menu offset-y :close-on-content-click="closeDatePicker(quotation.date)">
                <template v-slot:activator="{ on, attrs }">
                    <v-text-field :rules="[v => !!v || 'Campo requerido']" clearable required v-model="quotation.date" label="Fecha" prepend-icon="mdi-calendar" v-bind="attrs" readonly v-on="on"></v-text-field>
                </template>
                <v-date-picker v-model="quotation.date" range></v-date-picker>
            </v-menu>
            <v-menu offset-y :close-on-content-click="closeDatePicker(quotation.created_at)">
                <template v-slot:activator="{ on, attrs }">
                    <v-text-field :rules="[v => !!v || 'Campo requerido']" clearable required v-model="quotation.created_at" label="Fecha Creación" prepend-icon="mdi-calendar" v-bind="attrs" readonly v-on="on"></v-text-field>
                </template>
                <v-date-picker v-model="quotation.created_at" range></v-date-picker>
            </v-menu>
            <v-menu offset-y :close-on-content-click="closeDatePicker(quotation.updated_at)">
                <template v-slot:activator="{ on, attrs }">
                    <v-text-field :rules="[v => !!v || 'Campo requerido']" clearable required v-model="quotation.updated_at" label="Fecha Edición" prepend-icon="mdi-calendar" v-bind="attrs" readonly v-on="on"></v-text-field>
                </template>
                <v-date-picker v-model="quotation.updated_at" range></v-date-picker>
            </v-menu>

            <v-text-field label="Folio" v-model="quotation.id"></v-text-field>
            <v-text-field label="Nota" v-model="quotation.note"></v-text-field>

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
    data: () => ({
        booleans:[{text:'Si', value:1}, {text:'No', value:0}],
        series:['Serie A', 'Serie B'],
        quotation:{
            //multiples axios
            company_id:'',
            //multiples store
            user_id:'',
            created_by_user_id:'',
            last_updated_by_user_id:'',
            //abierto
            id:'',
            note:'',
            //date
            date:[],
            created_at:[],
            updated_at:[],
        },
        entries:{
            companies: []
        },
        isLoadingCompany: false,
        searchCompanies: null,
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
    },
    computed:{
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
        userList(){
            return this.$store.state.user.users.map(id => {
                return{
                    id:id.id,
                    name:id.name + id.last,
                }
            })
        },
    },
    created(){
        if(localStorage.getItem('selectorFiltersOrders')!=undefined){
            this.quotation = JSON.parse(localStorage.getItem('selectorFiltersOrders'))
            this.entries = JSON.parse(localStorage.getItem('entriesFiltersOrders'))
        }
    },
    methods:{
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
            if(this.quotation.id!=''){
                count = count+1
                filter = filter + '&filter[id]='+this.quotation.id
            }
            if(this.quotation.note!=''){
                count = count+1
                filter = filter + '&filter[note]='+this.quotation.note
            }
            //multiples
            if(this.quotation.company_id!=undefined && this.quotation.company_id.length>0){
                count = count+1
                filter = filter + '&filter[company_id]='
                var length = this.quotation.company_id.length
                for(var i=0; i<length; i++){
                    filter = filter + this.quotation.company_id[i]
                    if(length>1 && i<length-1){
                        filter = filter + ','
                    }
                }
            }
            if(this.quotation.created_by_user_id!=undefined && this.quotation.created_by_user_id.length>0){
                count = count+1
                filter = filter + '&filter[created_by_user_id]='
                var length = this.quotation.created_by_user_id.length
                for(var i=0; i<length; i++){
                    filter = filter + this.quotation.created_by_user_id[i]
                    if(length>1 && i<length-1){
                        filter = filter + ','
                    }
                }
            }
            if(this.quotation.last_updated_by_user_id!=undefined && this.quotation.last_updated_by_user_id.length>0){
                count = count+1
                filter = filter + '&filter[last_updated_by_user_id]='
                var length = this.quotation.last_updated_by_user_id.length
                for(var i=0; i<length; i++){
                    filter = filter + this.quotation.last_updated_by_user_id[i]
                    if(length>1 && i<length-1){
                        filter = filter + ','
                    }
                }
            }
            if(this.quotation.user_id!=undefined && this.quotation.user_id.length>0){
                count = count+1
                filter = filter + '&filter[user_id]='
                var length = this.quotation.user_id.length
                for(var i=0; i<length; i++){
                    filter = filter + this.quotation.user_id[i]
                    if(length>1 && i<length-1){
                        filter = filter + ','
                    }
                }
            }
            //date
            if(this.quotation.date!=undefined && this.quotation.date.length==2){
                count = count+1
                filter = filter + '&filter[date_between]='+this.quotation.date
            }
            if(this.quotation.created_at!=undefined && this.quotation.created_at.length==2){
                count = count+1
                filter = filter + '&filter[created_between]='+this.quotation.created_at
            }
            if(this.quotation.updated_at!=undefined && this.quotation.updated_at.length==2){
                count = count+1
                filter = filter + '&filter[updated_between]='+this.quotation.updated_at
            }
            localStorage.setItem('selectorFiltersOrders', JSON.stringify(this.quotation));
            localStorage.setItem('entriesFiltersOrders', JSON.stringify(this.entries));
            localStorage.setItem('filtersOrders', JSON.stringify(filter.slice(1,filter.length)));
            localStorage.setItem('filtersOrdersLength', count)

            this.$nextTick(() => {
                this.$emit("filtersSale", false);
                this.$store.dispatch('quotation/getTotals')
            })
        },
        removeFilter(){
            this.quotation={
                //multiples axios
                company_id:'',
                //multiples store
                user_id:'',
                created_by_user_id:'',
                last_updated_by_user_id:'',
                //abierto
                id:'',
                note:'',
                //date
                date:[],
                created_at:[],
                updated_at:[],
            },
            localStorage.removeItem("selectorFiltersOrders")
            localStorage.removeItem("filtersOrders")
            localStorage.removeItem("entriesFiltersOrders")
            localStorage.removeItem("filtersOrdersLength")
            this.$nextTick(() => {
                this.$emit("filtersSale", false);
            })
        }
    }
}
</script>

<style>
.v-text-field {
    padding-top: 0px;
    margin-top: 0px;
}
.v-label {
    font-size: 14px;
}
</style>