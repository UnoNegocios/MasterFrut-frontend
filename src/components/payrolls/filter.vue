<template>
    <v-container class="ma-0 pa-0">
        <v-row class="py-10 px-8 mb-12">
            <strong>Filtros</strong>
            <v-spacer></v-spacer>
            <v-btn @click="deleteFilters" small class="elevation-0" style="border:solid 1px #dddddd;">
                <v-icon small class="mr-1">mdi-filter-off</v-icon>Limpiar
            </v-btn>
            
            <div class="mt-4">
                Fecha
                <v-menu offset-y :close-on-content-click="closeDatePicker(payroll.date)">
                    <template v-slot:activator="{ on, attrs }">
                        <v-text-field :rules="[v => !!v || 'Campo requerido']" clearable required v-model="payroll.date" label="Fecha" prepend-icon="mdi-calendar" v-bind="attrs" readonly v-on="on"></v-text-field>
                    </template>
                    <v-date-picker v-model="payroll.date" range></v-date-picker>
                </v-menu>
            </div>

            <v-autocomplete @keydown.enter="filter()" v-model="payroll.user_id" :items="userLists" item-text="name" item-value="id" attach chips label="Personal" multiple>
            </v-autocomplete>

            <v-autocomplete @keydown.enter="filter()" v-model="payroll.job_position" :items="positions" attach chips label="Área" multiple>
            </v-autocomplete>

            <v-autocomplete @keydown.enter="filter()" v-model="payroll.sub_job_position" :items="subPositions" attach chips label="Puesto" multiple>
            </v-autocomplete>

            <v-text-field @keydown.enter="filter()" v-model="payroll.notes" label="Notas"></v-text-field>

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
    props:{
        company:Object
    },
    data: () => ({
        payroll:{
            notes:'',
            user_id:'',
            sub_job_position:'',
            job_position:'',
            date:[],
        },
        subPositions:[
            'Administración',
            'Asistente dirección',
            'Contabilidad', 
            'Almacén',
            'Calidad',
            'Logística', 
            'Montacargas',
            'Cobranza',
            'Compras', 
            'Ecommerce',
            'Publicidad',
            'Ventas', 
            'Ventas Industria',
            'App',
            'Trapo'
        ],
        positions:[
            'Administración',
            'Almacén',
            'Chofer Ejecutivo',
            'Chofer Repartidor',
            'Comercial',
            'Dirección',
            'Producción',
            'Sistemas'
        ],
    }),
    created(){
        if(localStorage.getItem('selectorFiltersPayrolls')!=undefined){
            this.payroll = JSON.parse(localStorage.getItem('selectorFiltersPayrolls'))
        }
    },
    computed: {
        userLists(){
            return this.$store.state.user.users;
        }, 
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
            if(this.payroll.notes!=''){
                count = count+1
                filter = filter + '&filter[notes]='+this.payroll.notes
            }
            //date
            if(this.payroll.date!=null && this.payroll.date!=undefined && this.payroll.date.length==2){
                count = count+1
                filter = filter + '&filter[date_between]=' + this.payroll.date[0] + ',' + this.payroll.date[1]
            }
            //multiples
            if(this.payroll.user_id!=undefined && this.payroll.user_id.length>0){
                count = count+1
                filter = filter + '&filter[user_id]='
                var length = this.payroll.user_id.length
                for(var i=0; i<length; i++){
                    filter = filter + this.payroll.user_id[i]
                    if(length>1 && i<length-1){
                        filter = filter + ','
                    }
                }
            }
            if(this.payroll.sub_job_position!=undefined && this.payroll.sub_job_position.length>0){
                count = count+1
                filter = filter + '&filter[user.sub_job_position]='
                var length = this.payroll.sub_job_position.length
                for(var i=0; i<length; i++){
                    filter = filter + this.payroll.sub_job_position[i]
                    if(length>1 && i<length-1){
                        filter = filter + ','
                    }
                }
            }
            if(this.payroll.job_position!=undefined && this.payroll.job_position.length>0){
                count = count+1
                filter = filter + '&filter[user.job_position]='
                var length = this.payroll.job_position.length
                for(var i=0; i<length; i++){
                    filter = filter + this.payroll.job_position[i]
                    if(length>1 && i<length-1){
                        filter = filter + ','
                    }
                }
            }
            localStorage.setItem('selectorFiltersPayrolls', JSON.stringify(this.payroll));
            localStorage.setItem('filtersPayroll', JSON.stringify(filter.slice(1,filter.length)));
            localStorage.setItem('filtersPayrollsLength', count)
            this.$nextTick(() => {
                this.$store.dispatch('payroll/getTotals')
                this.$emit("filtersPayroll", false);
            })
        },
        deleteFilters(){
            this.payroll = {
                notes:'',
                user_id:'',
                sub_job_position:'',
                job_position:'',
                date:[],
            },
            localStorage.removeItem("filtersPayroll")
            localStorage.removeItem("selectorFiltersPayrolls")
            this.$nextTick(() => {
                this.$store.dispatch('payroll/getTotals')
                this.$emit("filtersPayroll", false);
            })
        }
    }
  }
</script>