<template>
    <v-container>
        <v-tabs v-model="tab" centered style="border-bottom:2px solid #ccd2d4; height:66px;" class="pt-4">
            <v-tabs-slider></v-tabs-slider>
            <v-tab href="#tab-1">
                <v-icon >mdi-account</v-icon>
            </v-tab>
            <v-tab href="#tab-2" @click="getActivities()">
                <v-icon >mdi-clipboard-check-outline</v-icon>
            </v-tab>
            <!--v-tab href="#tab-3">
                <v-icon >mdi-clock-outline</v-icon>
            </v-tab-->
        </v-tabs>

        <v-tabs-items style="height:calc(60vh + 60px); overflow: scroll;" v-model="tab" class="pa-3">
            <v-tab-item :value="'tab-1'">
                <v-list>
                    <v-list-item style="border-bottom: solid 1px #ccd2d4" class="px-1">
                        <strong>Nombre</strong>
                        <v-spacer></v-spacer>
                        {{lead.name}} {{lead.last}}
                    </v-list-item>
                    <v-list-item style="border-bottom: solid 1px #ccd2d4" class="px-1">
                        <strong>Interes</strong>
                        <v-spacer></v-spacer>
                        <span v-if="editInterest==false">{{lead.interest}}</span>
                        <v-text-field style="width:100px;" dense v-else v-model="lead.interest"  @click:append="save" append-icon="mdi-content-save" label="Interes" placeholder="Interes" outlined></v-text-field>
                        <v-icon v-if="editInterest==false" @click="editInterest=true" small class="ml-2">mdi-pencil</v-icon>
                        <v-icon v-if="editInterest==true" @click="editInterest=false" small class="ml-2">mdi-close</v-icon>
                    </v-list-item>
                    <v-list-item style="border-bottom: solid 1px #ccd2d4" class="px-1">
                        <strong>Canal</strong>
                        <v-spacer></v-spacer>
                        {{lead.channel}}
                    </v-list-item>
                    <v-list-item style="border-bottom: solid 1px #ccd2d4" class="px-1">
                        <strong>Teléfono</strong>
                        <v-spacer></v-spacer>
                        <span v-if="editPhone==false">{{lead.phone}}</span>
                        <v-text-field style="width:100px;" dense v-else v-model="lead.phone"  @click:append="save" append-icon="mdi-content-save" label="Interes" placeholder="Interes" outlined></v-text-field>
                        <v-icon v-if="editPhone==false" @click="editPhone=true" small class="ml-2">mdi-pencil</v-icon>
                        <v-icon v-if="editPhone==true" @click="editPhone=false" small class="ml-2">mdi-close</v-icon>
                    </v-list-item>
                    <v-list-item style="border-bottom: solid 1px #ccd2d4" class="px-1">
                        <strong>Email</strong>
                        <v-spacer></v-spacer>
                        <span v-if="editEmail==false">{{lead.email}}</span>
                        <v-text-field style="width:100px;" dense v-else v-model="lead.email"  @click:append="save" append-icon="mdi-content-save" label="Interes" placeholder="Interes" outlined></v-text-field>
                        <v-icon v-if="editEmail==false" @click="editEmail=true" small class="ml-2">mdi-pencil</v-icon>
                        <v-icon v-if="editEmail==true" @click="editEmail=false" small class="ml-2">mdi-close</v-icon>
                    </v-list-item>
                    <v-list-item class="px-1">
                            <v-textarea label="Nota" background-color="amber lighten-4" v-model="lead.note"></v-textarea>
                    </v-list-item>
                    <v-row class="mx-0 mt-2 mb-4">
                        <v-spacer/>
                        <v-btn class="elevation-0" small rounded color="primary" @click="save()">Guardar</v-btn>
                    </v-row>
                </v-list>

                Creado el <strong>{{lead.created_at}}</strong>

            </v-tab-item>
            <v-tab-item :value="'tab-2'">
                <!-- Crear actividad -->
                <v-dialog v-model="createDialog" max-width="700px">
                    <template v-slot:activator="{ on, attrs }">
                        <v-row class="ma-0">
                            <v-spacer/>
                            <v-btn bottom class="mt-2" color="#e25200" small text v-bind="attrs" v-on="on">
                                Agendar Actividad
                            </v-btn> 
                        </v-row>
                    </template>
                    <createActivity v-bind:lead="lead.id" @closeCreateDialogCalendar="closeCreateDialogCalendar"/>
                </v-dialog>
                <div v-if="renderActivities" class="mt-2">
                    <v-card class="pa-4" v-for="(activity,index) in activities" v-bind:key="index">
                        <v-card-title style="font-size:16px;" class="pt-0 px-2">{{activity.activity_type.name}}
                            <v-spacer/>

                            <v-chip small v-if="activity.completed" color="primary" dark>
                                <v-icon small left>
                                    mdi-check
                                </v-icon>
                                Realizado
                            </v-chip>

                            <v-chip small v-else-if="pendiente(activity.date)" color="grey" @click="completeActivity(activity.id)" dark>
                                <v-icon small left>
                                    mdi-check
                                </v-icon>
                                Pendiente
                            </v-chip>

                            <v-chip small v-else color="red" dark @click="completeActivity(activity.id)">
                                <v-icon small left>
                                    mdi-check
                                </v-icon>
                                No Realizado
                            </v-chip>
                        </v-card-title>

                        <v-card-subtitle class="px-2 pb-2" style="font-size:14px;"><v-icon small class="mr-2">mdi-calendar</v-icon>{{activity.date}}</v-card-subtitle>
                        <v-card-text class="ma-0 pa-0">{{activity.description}}</v-card-text>
                    </v-card>
                </div>
                
            </v-tab-item>
            <!--v-tab-item :value="'tab-3'">
                
            </v-tab-item-->
        </v-tabs-items>
    </v-container>
</template>

<script>
import axios from "axios";
import createActivity from '../activities/create.vue'
export default {
    props:{
        lead:Object
    }, 
    components: {
        'createActivity':createActivity
    }, 
    created(){
        console.log(this.lead)
    },
    data(){
        return{
            createDialog:false,
            editInterest:false,
            editPhone:false,
            editEmail:false,
            tab:null,
            renderActivities:false,
            activities:[],
        }
    },
    computed:{
        today(){
            return new Date().toLocaleString("sv-SE", {timeZone: "America/Monterrey"})
        }
    },
    methods:{
        pendiente(date){
            console.log(date+' > '+this.today)
            if(date>this.today){
                return true
            }else{
                return false
            }
        },
        save(){
            var editedItem = {
                id: this.lead.id,
                interest: this.lead.interest,
                phone: this.lead.phone,
                email: this.lead.email
            }
            axios.patch(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/leads/" + editedItem.id,Object.assign(editedItem)).then(response=>{
                this.editInterest = false
                this.editPhone = false
                this.editEmail = false
            })
        },
        getActivities(){
            axios.get(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/calendars?filter[lead_id]=" + this.lead.id).then(response => {
                this.renderActivities = true
                this.activities = response.data.data
            })
        },
        closeCreateDialogCalendar: function(params) {
            this.createDialog = false;
            this.getActivities()
        },
        completeActivity(id){
            axios.patch(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/calendars/" + id, {'completed':true}).then(response=>{
                this.getActivities()
            })
        }
    }
}
</script>

<style>

</style>