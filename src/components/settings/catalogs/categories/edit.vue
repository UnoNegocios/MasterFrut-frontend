<template>    
    <v-card>
        <!-- Titulo del dialogo -->
        <v-card-title>
            Editar Categoría de Producto
        </v-card-title>
        <v-divider></v-divider>
        <!-- Formulario -->
        <v-form ref="form">
            <v-row class="py-3 px-6">
                <v-col cols="12" sm="6" md="4">
                    <v-text-field :rules="[v => !!v || 'Campo requerido']" v-model="editedCategory.name" label="Categoría de Producto"></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="8">
                    <v-card-actions class="pt-4">
                        <v-spacer></v-spacer>
                        <v-btn color="blue darken-1" text @click="close">Cancelar</v-btn>
                        <v-btn color="blue darken-1" text :loading="gris" :disabled="gris || !valid" @click="save">Guardar</v-btn>
                    </v-card-actions>
                </v-col>
            </v-row>
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
        editedCategory:Object
    },
    data:()=>({  
        snackbar: {
            show: false,
            message: null,
            color: null
        },
        gris:false,
        valid: true,
        rules: {
            required: value => !!value || 'Campo requerido',
        },
    }),
    methods:{
        close () {
            this.gris = false
            this.$nextTick(() => {
                this.$emit("closeDialogCategory", false);
            })
        },
        save () {
            axios.put(process.env.VUE_APP_BACKEND_ROUTE + "api/v1/category/update",Object.assign(this.editedCategory)).then(response=>{
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