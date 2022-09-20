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

            <v-menu offset-y :close-on-content-click="closeDatePicker(shipping.date)">
                <template v-slot:activator="{ on, attrs }">
                    <v-text-field :rules="[v => !!v || 'Campo requerido']" clearable required v-model="shipping.date" label="Fecha" prepend-icon="mdi-calendar" v-bind="attrs" readonly v-on="on"></v-text-field>
                </template>
                <v-date-picker v-model="shipping.date" range></v-date-picker>
            </v-menu>

            <v-text-field @keydown.enter="filter()" v-model="shipping.id" label="Folio"></v-text-field>

            <v-autocomplete @keydown.enter="filter()" v-model="shipping.company_id" :items="companyLists" :loading="isLoadingCompany" :search-input.sync="searchCompanies" hide-no-data item-value="id" item-text="name" label="Empresa(s)" placeholder="Escribe para buscar" attach chips multiple>
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

            <v-select @keydown.enter="filter()" v-model="shipping.driver_id" :items="userLists" item-text="name" item-value="id" attach chips label="Chofer" multiple>
            </v-select>

            <v-select @keydown.enter="filter()" v-model="shipping.vehicle_id" :items="unitLists" item-text="name" item-value="id" attach chips label="Unidad" multiple>
            </v-select>

            <v-text-field @keydown.enter="filter()" v-model="shipping.sale_id" label="Folio de Venta"></v-text-field>

            <v-text-field @keydown.enter="filter()" v-model="shipping.note" label="Notas"></v-text-field>
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
import axios from 'axios'
  export default {
    props:{
        company:Object
    },
    data: () => ({
        shipping:{
            date:[],
            vehicle_id:[],
            sale_id:'',
            company_id:[],
            note:'',
            driver_id:[],
            id:''
        },
        entries:{
            companies: []
        },
        isLoadingCompany: false,
        searchCompanies: null,
    }),
    watch:{
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
        userLists(){
            return this.$store.state.user.users.filter(user=>user.job_position == 'Chofer Repartidor').map(id=>{
                return{
                    id:id.id,
                    name: id.name + ' ' + id.last
                }
            });
        },
        unitLists(){
            return this.$store.state.vehicle.vehicles;
        },
    },
    created(){
        if(localStorage.getItem('selectorFiltersShippings')!=undefined){
            this.quotation = JSON.parse(localStorage.getItem('selectorFiltersShippings'))
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
        removeFilter(){
            this.shipping = {
                date:[],
                vehicle_id:[],
                sale_id:'',
                company_id:[],
                note:'',
                driver_id:[],
                id:''
            }
            localStorage.removeItem("selectorFiltersShippings")
            localStorage.removeItem("filtersShippings")
            localStorage.removeItem("filtersShippingsLength")
            this.$nextTick(() => {
                this.$emit("filtersShipping", false);
            })
        },
        filter(){
            var count = 0
            var filter = ''
            //abierto
            if(this.shipping.id!=''){
                count = count+1
                filter = filter + '&filter[id]='+this.shipping.id
            }
            if(this.shipping.note!=''){
                count = count+1
                filter = filter + '&filter[note]='+this.shipping.note
            }
            if(this.shipping.sale_id!=''){
                count = count+1
                filter = filter + '&filter[shippingDetail.sale_id]='+this.shipping.sale_id
            }
            //date
            if(this.shipping.date!=null && this.shipping.date.length==2){
                count = count+1
                filter = filter + '&filter[date_between]=' + this.shipping.date[0] + ',' + this.shipping.date[1]
            }
            //multiples
            if(this.shipping.driver_id!=undefined && this.shipping.driver_id.length>0){
                count = count+1
                filter = filter + '&filter[driver_id]='
                var length = this.shipping.driver_id.length
                for(var i=0; i<length; i++){
                    filter = filter + this.shipping.driver_id[i]
                    if(length>1 && i<length-1){
                        filter = filter + ','
                    }
                }
            }
            if(this.shipping.vehicle_id!=undefined && this.shipping.vehicle_id.length>0){
                count = count+1
                filter = filter + '&filter[vehicle_id]='
                var length = this.shipping.vehicle_id.length
                for(var i=0; i<length; i++){
                    filter = filter + this.shipping.vehicle_id[i]
                    if(length>1 && i<length-1){
                        filter = filter + ','
                    }
                }
            }
            if(this.shipping.company_id!=undefined && this.shipping.company_id.length>0){
                count = count+1
                filter = filter + '&filter[shippingDetail.company_id]='
                var length = this.shipping.company_id.length
                for(var i=0; i<length; i++){
                    filter = filter + this.shipping.company_id[i]
                    if(length>1 && i<length-1){
                        filter = filter + ','
                    }
                }
            }
            localStorage.setItem('selectorFiltersShippings', JSON.stringify(this.shipping));
            localStorage.setItem('filtersShippings', JSON.stringify(filter.slice(1,filter.length)));
            localStorage.setItem('filtersShippingsLength', count)
            this.$nextTick(() => {
                this.$emit("filtersShipping", false);
            })
        }
    }
  }
</script>