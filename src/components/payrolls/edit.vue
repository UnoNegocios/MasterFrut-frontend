<template>
    <v-card>
        <v-card-title class="pb-0 pt-1" >
            <v-icon style="background: #e7e8e9; padding: 10px!important; border-radius: 50%;" class="mr-4">mdi-file-document-outline</v-icon>
            <span >Alta de Nomina</span>
            <v-spacer></v-spacer>
            <v-col cols="12" sm="6" md="4">
                <v-autocomplete  :rules="[v => !!v || 'Campo requerido']" clearable v-model="payroll.user_id" :items="usersLists" label="Empleado" item-text="name" item-value="id">
                    <template slot="no-data" class="pa-2">No existen usuarios relacionados.</template>                      
                </v-autocomplete>
            </v-col>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pb-0">
            <v-container>
                <v-row>

                    <v-col cols="12" sm="6" md="6" class="pb-0">
                        <v-menu v-model="datePicker" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px" >
                            <template v-slot:activator="{ on }">
                                <v-text-field :rules="[v => !!v || 'Campo requerido']" clearable required v-model="payroll.date" label="Fecha de Pago" prepend-icon="mdi-calendar" readonly v-on="on"></v-text-field>
                            </template>
                            <v-date-picker color="primary" v-model="payroll.date" @input="datePicker = false"></v-date-picker>
                        </v-menu>
                    </v-col>
                    <v-col cols="12" sm="6" md="6" class="pb-0">
                        <v-text-field type=number v-model="payroll.amount" label="Monto"></v-text-field>
                    </v-col>

                    
                    <v-col cols="12" sm="6" md="6" class="py-0">
                        <v-text-field type=number v-model="payroll.imss" label="IMSS"></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="6" class="py-0">
                        <v-text-field type=number v-model="payroll.production_award" label="Premio Producción"></v-text-field>
                    </v-col>


                    <v-col cols="12" sm="6" md="6" class="py-0">
                        <v-text-field type=number v-model="payroll.infonavit" label="Infonavit"></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="6" class="py-0">
                        <v-text-field type=number v-model="payroll.performance_award" label="Premio Rendimiento"></v-text-field>
                    </v-col>


                    <v-col cols="12" sm="6" md="6" class="py-0">
                        <v-text-field type=number v-model="payroll.absence" label="Faltas"></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="6" class="py-0">
                        <v-text-field type=number v-model="payroll.punctuality_award" label="Premio Puntualidad"></v-text-field>
                    </v-col>

                    <v-col cols="12" sm="6" md="6" class="py-0">
                        <v-text-field type=number v-model="payroll.loan" label="Prestamo"></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="6" class="py-0">
                        <v-text-field type=number v-model="payroll.extra_time" label="Tiempo Extra"></v-text-field>
                    </v-col>

                    <v-col cols="12" sm="6" md="6" class="py-0">
                        <v-container fluid>
                            <v-textarea v-model="payroll.notes" label="Notas"></v-textarea>
                        </v-container>
                    </v-col>
                    <v-col cols="12" sm="6" md="6" class="pt-0">
                        <v-text-field type=number v-model="payroll.holidays" label="Vacaciones"></v-text-field>
                        <v-text-field type=number v-model="payroll.prima_vacacional" label="Prima Vacacional"></v-text-field>
                        <div style="font-size:21px;"><strong>Total a Pagar: </strong>{{neto.toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}</div>
                    </v-col>

                </v-row>
            </v-container>
        </v-card-text>
        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="close">
                Cancelar
            </v-btn>
            <v-btn color="blue darken-1" text @click="save" :loading="gris" :disabled="gris">
                Guardar
            </v-btn>
        </v-card-actions>

        <v-snackbar :color="snackbar.color" v-model="snackbar.show">
            {{ snackbar.message }}
        </v-snackbar>
    </v-card>
</template>

<script>
    import axios from "axios";
    export default {
        props:{
            payroll:Object,
        }, 
        data: () => ({
            snackbar: {
                show: false,
                message: null,
                color: null
            },
            gris:false,
            datePicker:'',
            rules: {
                required: value => !!value || 'Campo requerido',
            },
            valid: true,
        }),
        computed: {
            neto(){
                return (this.payroll.amount*1)
                - (this.payroll.imss*1)
                - (this.payroll.infonavit*1)
                - (this.payroll.absence*1)
                - (this.payroll.loan*1)
                + (this.payroll.extra_time*1)
                + (this.payroll.production_award*1)
                + (this.payroll.punctuality_award*1)
                + (this.payroll.performance_award*1)
                + (this.payroll.prima_vacacional*1)
                + (this.payroll.holidays*1)
                
            },
            usersLists(){
                return this.$store.state.user.users.map(id=>{
                    return{
                        id:id.id,
                        name:id.name + ' ' + id.last
                    }
                });
            }, 
            currentUser:{
                get(){
                    return this.$store.state.currentUser.user
                }
            },
        },
        created(){
        },
        methods: {
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
            close () {
                this.gris = false
                this.$nextTick(() => {
                    this.$emit("closeEditDialogPayroll", false);
                })
            },
            save(){
                this.payroll.last_updated_by_user_id = this.currentUser.id
                this.$nextTick(() => {
                    axios.put(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/payrolls/" + this.payroll.id,Object.assign(this.payroll)).then(response=>{
                        this.close()
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
        },
    }
</script>
<style lang="css" scoped>
.v-text-field >>> label{
    font-size: 14px!important;
}
.v-input__icon--prepend-inner i::before {
    font-size: 18px!important;
    color:#1976D2;
}
.v-text-field input, .v-label {
    font-size: 14px;
}
.v-picker__title.primary{
    display:none;
}
</style>