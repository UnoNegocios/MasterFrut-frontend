<template>    
    <v-card>
        <!-- Titulo del dialogo -->
        <v-card-title>
            Crear Tipo de Actividad
        </v-card-title>
        <v-divider></v-divider>
            <!-- Formulario -->
        <v-form ref="form">
            <v-row class="py-3 px-6">
                <v-col cols="12" sm="6" md="8">
                    <v-text-field :rules="[v => !!v || 'Campo requerido']" v-model="editedType.type" label="Type"></v-text-field>
                </v-col>
                <v-col class="pt-5" cols="12" sm="6" md="4">
                    <v-menu :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px" >
                        <template v-slot:activator="{ on }">
                            <v-chip class="ma-2" :color="editedType.color" text-color="white" v-on="on"><v-avatar left><v-icon color="#676767"> mdi-palette</v-icon></v-avatar> Color</v-chip>
                        </template>
                        <v-color-picker :rules="[v => !!v || 'Campo requerido']" v-model="editedType.color" class="ma-2"></v-color-picker>
                    </v-menu> 
                </v-col>
            </v-row>
        </v-form>
        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="close">Cancelar</v-btn>
            <v-btn color="blue darken-1" text :loading="gris" :disabled="gris || !valid" @click="save">Guardar</v-btn>
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
        editedType:Object
    },
    data:()=>({  
        valid: true,
        rules: {
            required: value => !!value || 'Campo requerido',
        },
        snackbar: {
            show: false,
            message: null,
            color: null
        },
        gris:false,
    }),
    methods:{
        close () {
            this.gris = false
            this.$nextTick(() => {
                this.$emit("closeDialogoType", false);
            })
        },
        save () {
            axios.put(process.env.VUE_APP_BACKEND_ROUTE + "api/v1/activity/update",Object.assign(this.editedType)).then(response=>{
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