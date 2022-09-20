<template>    
    <v-card>
        <!-- Titulo del dialogo -->
        <v-card-title>
            <span>Editar Producción</span>
            <v-spacer></v-spacer>
            <v-autocomplete  :rules="[v => !!v || 'Campo requerido']" clearable v-model="editedItem.user_id" :items="changoLists" label="Usuario Preparador " item-text="name" item-value="id">
                <template slot="no-data" class="pa-2">No existen usuarios relacionados.</template>                      
            </v-autocomplete>
        </v-card-title>
        <v-divider></v-divider>
            <!-- Formulario -->
        <v-form ref="form">
            <v-row class="pt-3 px-12">
                <v-col cols="12" sm="6" md="5">
                    <v-select :items="status" v-model="editedItem.status" label="Estatus"></v-select>
                </v-col>
                <v-spacer></v-spacer>
                <v-col cols="12" sm="6" md="5">
                    <v-menu v-model="datePicker" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px" >
                        <template v-slot:activator="{ on }">
                            <v-text-field :rules="[v => !!v || 'Campo requerido']" clearable required v-model="editedItem.date" label="Fecha" prepend-icon="mdi-calendar" readonly v-on="on"></v-text-field>
                        </template>
                        <v-date-picker color="primary" v-model="editedItem.date" @input="datePicker = false"></v-date-picker>
                    </v-menu>
                </v-col>
                <v-col cols="12" sm="6" md="1"></v-col>
            </v-row>
            <v-row class="pb-3 px-12">
                <v-col cols="12" sm="6" md="5" class="px-4 py-t pb-0" style="background:#94949417;">
                    Hora Inicio
                    <v-row>
                        <v-col cols="3">
                            <v-text-field  :rules="rules2" v-model="start_time.hour" type="number"></v-text-field>
                        </v-col>
                        <v-col cols="3">
                            <v-text-field  ::rules="rules2" v-model="start_time.minute" type="number"></v-text-field>
                        </v-col>
                        <v-col cols="6">
                            <v-select  :items="ampm" v-model="start_time.ampm" label="Estatus"></v-select>
                        </v-col>
                    </v-row>
                </v-col>
                <v-spacer></v-spacer>
                <v-col cols="12" sm="6" md="5" class="px-4 py-t pb-0" style="background:#94949417;">
                    Hora Fin
                    <v-row>
                        <v-col cols="3">
                            <v-text-field :rules="rules2" v-model="end_time.hour" type="number"></v-text-field>
                        </v-col>
                        <v-col cols="3">
                            <v-text-field :rules="rules2" v-model="end_time.minute" type="number"></v-text-field>
                        </v-col>
                        <v-col cols="6">
                            <v-select :items="ampm" v-model="end_time.ampm" label="Estatus"></v-select>
                        </v-col>
                    </v-row>
                </v-col>
                <v-col cols="12" sm="6" md="1"></v-col>
            </v-row>
            <v-card-actions class="pt-4">
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="close">Cancelar</v-btn>
                <v-btn color="blue darken-1" text :loading="gris" :disabled="gris || !valid" @click="save">Guardar</v-btn>
            </v-card-actions>
        </v-form>
        <v-snackbar :color="snackbar.color" v-model="snackbar.show">
            {{ snackbar.message }}
        </v-snackbar>
    </v-card>
</template>
<script>
import axios from "axios";
export default { 
    props:{
        editedItem:Object
    },
    data:()=>({
        snackbar: {
            show: false,
            message: null,
            color: null
        },
        gris:false,
        valid: true,
        datePicker:false,
        show1: false,
        status:['En Captura', 'Terminada'],
        ampm:['a.m.', 'p.m.'],
        start_time:{
            hour:'00',
            minute:'00',
            ampm:'a.m.'
        },
        end_time:{
            hour:'00',
            minute:'00',
            ampm:'a.m.'
        },
        rules: {
            required: value => !!value || 'Campo requerido',
        },
        rules2: [v => v.length <= 2 || 'Max 2 caracteres'],
    }),
    created(){
        this.start_time.hour = this.editedItem.start_time.slice(0, 2)
        this.start_time.minute = this.editedItem.start_time.slice(3, 5)
        this.end_time.hour = this.editedItem.end_time.slice(0, 2)
        this.end_time.minute = this.editedItem.end_time.slice(3, 5)

        if((this.start_time.hour*1)<12){
            this.start_time.ampm = 'a.m.'
        }else{
            this.start_time.hour = this.format(((this.start_time.hour*1) - 12).toString())
            this.start_time.ampm =  'p.m.'
        }
        if((this.end_time.hour*1)<12){
            this.end_time.ampm = 'a.m.'
        }else{
            this.end_time.hour = this.format(((this.end_time.hour*1) - 12).toString())
            this.end_time.ampm =  'p.m.'
        }
    },
    computed:{
        currentUser:{
            get(){
                return this.$store.state.currentUser.user
            }
        },
        changoLists(){
            return this.$store.state.user.users.filter(user=>user.job_position == 'Producción').map(id=>{
                return{
                    id:id.id,
                    name: id.name + ' ' + id.last
                }
            });
        }
    },
    methods:{
        time(hour){
            if(hour.ampm == 'p.m.'){
                return this.format(((hour.hour*1)+12).toString()) + ':' + this.format(hour.minute) + ':00'
            }else{
                return this.format(hour.hour) + ':' + this.format(hour.minute) + ':00'
            }
        },
        format(n){
            if(n.length ==  1){
                return '0' + n
            }else if(n.length == 2){
                return n
            }
        },
        close () {
            this.gris = false
            this.editedItem = Object.assign({}, this.defaultItem)
            this.$nextTick(() => {
                this.$emit("closeDialogEditProduction", false);
            })
        },
        save () {
            this.editedItem.last_updated_by_user_id = this.currentUser.id
            axios.put(process.env.VUE_APP_BACKEND_ROUTE + "api/v1/production/update",Object.assign(this.editedItem)).then(response=>{
                this.close()
            }).catch(error => {
                this.snackbar = {
                    message: error.response.data.message,
                    color: 'error',
                    show: true
                }
                this.gris = false
            })
        },
    }
}
</script>