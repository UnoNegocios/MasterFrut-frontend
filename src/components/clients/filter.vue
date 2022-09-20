<template>
    <v-container class="ma-0 pa-0">
        <v-row class="py-10 px-8 mb-12">
            <strong>Filtros</strong>
            <v-spacer></v-spacer>
            <v-btn @click="deleteFilters" small class="elevation-0" style="border:solid 1px #dddddd;">
                <v-icon small class="mr-1">mdi-filter-off</v-icon>Limpiar
            </v-btn>

            <v-select @keydown.enter="filter()" v-model="company.semaforo" :items="semaforos" item-text="name" item-value="id" attach chips label="Semaforo" multiple>
            </v-select>

            <v-menu offset-y :close-on-content-click="closeDatePicker(company.dateCreate)">
                <template v-slot:activator="{ on, attrs }">
                    <v-text-field :rules="[v => !!v || 'Campo requerido']" clearable required v-model="company.dateCreate" label="Fecha de Creación" prepend-icon="mdi-calendar" v-bind="attrs" readonly v-on="on"></v-text-field>
                </template>
                <v-date-picker v-model="company.dateCreate" range></v-date-picker>
            </v-menu>

            <v-text-field @keydown.enter="filter()" v-model="company.name" label="Nombre"></v-text-field>
            <v-text-field @keydown.enter="filter()" v-model="company.address" label="Dirección"></v-text-field>
            <v-text-field @keydown.enter="filter()" v-model="company.phone" label="Teléfono"></v-text-field>
            <v-text-field @keydown.enter="filter()" v-model="company.email" label="Correo Electrónico"></v-text-field>
            <v-text-field @keydown.enter="filter()" v-model="company.rfc" label="RFC"></v-text-field>
            <!--v-text-field @keydown.enter="filter()" v-model="company.razon_social" label="Razón Social"></v-text-field-->
            <v-text-field @keydown.enter="filter()" v-model="company.bank_account_number" label="Numero de Cuenta"></v-text-field>

            <v-select @keydown.enter="filter()" v-model="company.origins" :items="originLists" item-text="name" item-value="id" attach chips label="Procedencia" multiple>
            </v-select>
            
            <v-select @keydown.enter="filter()" v-model="company.phases" :items="phaseLists" item-text="name" item-value="id" attach chips label="Rango de Consumo" multiple>
            </v-select>

            <v-select @keydown.enter="filter()" v-model="company.statuses" :items="statusLists" item-text="name" item-value="id" attach chips label="Estatus" multiple>
            </v-select>

            <v-select @keydown.enter="filter()" v-model="company.users" :items="usersLists" item-text="name" item-value="id" attach chips label="Vendedor" multiple>
            </v-select>

            <v-menu offset-y :close-on-content-click="closeDatePicker(company.dateUpdate)">
                <template v-slot:activator="{ on, attrs }">
                    <v-text-field :rules="[v => !!v || 'Campo requerido']" clearable required v-model="company.dateUpdate" label="Última Actualización " prepend-icon="mdi-calendar" v-bind="attrs" readonly v-on="on"></v-text-field>
                </template>
                <v-date-picker v-model="company.dateUpdate" range></v-date-picker>
            </v-menu>
        </v-row>

        <v-card style="position:absolute; bottom:0; width:100%;" tile color="primary"><!-- # d71182 -->
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
    data: () => ({
        semaforos:[
            {name: 'verde', id: 'green',},
            {name: 'amarillo', id: 'yellow',},
            {name: 'rojo', id: 'red',},
        ],
        company:{
            users:'',
            phases:'',
            origins:'',
            statuses:'',
            name:'',
            address:'',
            phone:'',
            email:'',
            rfc:'',
            //razon_social:'',
            dateCreate:[],
            dateUpdate:[],
            semaforo:'',
            bank_account_number:''
        },
    }),
    computed: {
        usersLists(){
            return this.$store.state.user.users;
        },
        originLists(){
            return this.$store.state.origin.origins;
        },
        phaseLists(){
            return this.$store.state.phase.phases;
        },
        statusLists(){
            return this.$store.state.status.statuses;
        },
    },
    created () {
        let params = JSON.parse(localStorage.getItem('filtersCompany'))
        if(params!=undefined){
            this.company = params
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
            if(this.company.name!=''){
                count = count+1
                filter = filter + '&filter[name_razon_social]='+this.company.name
            }
            if(this.company.address!=''){
                count = count+1
                filter = filter + '&filter[address]='+this.company.address
            }
            if(this.company.phone!=''){
                count = count+1
                filter = filter + '&filter[phone]='+this.company.phone
            }
            if(this.company.email!=''){
                count = count+1
                filter = filter + '&filter[email]='+this.company.email
            }
            if(this.company.rfc!=''){
                count = count+1
                filter = filter + '&filter[rfc]='+this.company.rfc
            }
            /*if(this.company.razon_social!=''){
                count = count+1
                filter = filter + '&filter[razon_social]='+this.company.razon_social
            }*/
            if(this.company.bank_account_number!=''){
                count = count+1
                filter = filter + '&filter[bank_account_number]='+this.company.bank_account_number
            }
            //multiples
            if(this.company.users!=undefined && this.company.users.length>0){
                count = count+1
                filter = filter + '&filter[user_id]='
                var length = this.company.users.length
                for(var i=0; i<length; i++){
                    filter = filter + this.company.users[i]
                    if(length>1 && i<length-1){
                        filter = filter + ','
                    }
                }
            }
            if(this.company.phases!=undefined && this.company.phases.length>0){
                count = count+1
                filter = filter + '&filter[phase_id]='
                var length = this.company.phases.length
                for(var i=0; i<length; i++){
                    filter = filter + this.company.phases[i]
                    if(length>1 && i<length-1){
                        filter = filter + ','
                    }
                }
            }
            if(this.company.origins!=undefined && this.company.origins.length>0){
                count = count+1
                filter = filter + '&filter[origin_id]='
                var length = this.company.origins.length
                for(var i=0; i<length; i++){
                    filter = filter + this.company.origins[i]
                    if(length>1 && i<length-1){
                        filter = filter + ','
                    }
                }
            }
            if(this.company.statuses!=undefined && this.company.statuses.length>0){
                count = count+1
                filter = filter + '&filter[status_id]='
                var length = this.company.statuses.length
                for(var i=0; i<length; i++){
                    filter = filter + this.company.statuses[i]
                    if(length>1 && i<length-1){
                        filter = filter + ','
                    }
                }
            }
            if(this.company.semaforo!=undefined && this.company.semaforo.length>0){
                count = count+1
                filter = filter + '&filter[activity_indicator]='
                var length = this.company.semaforo.length
                for(var i=0; i<length; i++){
                    filter = filter + this.company.semaforo[i]
                    if(length>1 && i<length-1){
                        filter = filter + ','
                    }
                }
            }
            //dates
            if(this.company.dateCreate!=undefined && this.company.dateCreate.length==2){
                count = count+1
                filter = filter + '&filter[created_between]=' + this.company.dateCreate[0] + ',' + this.company.dateCreate[1]
            }
            if(this.company.dateUpdate!=undefined && this.company.dateUpdate.length==2){
                count = count+1
                filter = filter + '&filter[updated_between]=' + this.company.dateUpdate[0] + ',' + this.company.dateUpdate[1]
            }

            localStorage.setItem('selectorFiltersClients', JSON.stringify(this.company));
            localStorage.setItem('filtersClient', JSON.stringify(filter.slice(1,filter.length)));
            localStorage.setItem('filtersClientsLength', count)
            this.$nextTick(() => {
                this.$emit("filtersCompanies", false);
            })
        },
        deleteFilters(){
            this.company = {
                users:'',
                phases:'',
                origins:'',
                statuses:'',
                name:'',
                address:'',
                phone:'',
                email:'',
                rfc:'',
                //razon_social:'',
                dateCreate:[],
                dateUpdate:[],
                semaforo:'',
                bank_account_number:''
            },
            localStorage.removeItem("filtersClient")
            this.$nextTick(() => {
                this.$emit("filtersCompanies", 'perro');
            })
        }
    }
  }
</script>