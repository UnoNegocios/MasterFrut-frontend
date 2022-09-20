<template>
    <div class="py-4 px-12">
        <v-menu offset-y>
            <template v-slot:activator="{ on, attrs }">
                <v-row class="ma-0" >
                    <span v-bind="attrs" v-on="on" style="font-size:21px;"> 
                        🧠 {{funnel.name}}
                        <v-tooltip right>
                            <template v-slot:activator="{ on, attrs }">
                                <v-icon v-bind="attrs" v-on="on" small class="ml-4">mdi-information-outline</v-icon>
                            </template>
                            <span>{{funnel.description}}</span>
                        </v-tooltip>
                    </span>
                    <v-btn class="elevation-0 ml-10" color="white" @click="editFunnelDialog=true">Editar Funnel</v-btn>
                    <v-spacer/>
                    <v-text-field class="pt-0 mt-0 pb-0 buscador" append-icon="mdi-magnify" style="background:white;" @keydown.enter="buscar = true" dense outlined color="white" v-model="search" placeholder="Buscador"></v-text-field>
                </v-row>
            </template>
            <v-list>
                <v-list-item v-for="(item, index) in funnels" :key="index">
                    <v-tooltip right>
                        <template v-slot:activator="{ on, attrs }">
                            <v-list-item-title v-bind="attrs" v-on="on" @click="selectFunel(item)">{{ item.name }}</v-list-item-title>
                        </template>
                        <span>{{item.description}}</span>
                    </v-tooltip>
                </v-list-item>
                <v-list-item>
                    <v-btn class="elevation-0" small rounded color="primary" @click="createFunnelDialog=true">Agregar Funnel</v-btn>
                </v-list-item>
            </v-list>
        </v-menu>
        <v-progress-linear v-if="load_funnel_phases" color="primary" class="mt-4" indeterminate rounded height="6"></v-progress-linear>
        <div v-else>
            <vue-horizontal class="ma-6">
                <v-card style="width:20%; margin:15px; background:transparent;" v-for="(funnel_phase, index) in funnel_phases" v-bind:key="index" class="elevation-0 ma-1 item">
                    <v-card-title class="py-1 px-3" :style="'border-bottom: 2px ' + funnel.color + ' solid; font-size:15px;' + 'background:white;'">
                        {{funnel_phase.name}}
                        <v-spacer/>
                        <v-icon small>mdi-message-processing</v-icon> <span class="ml-2">{{leads[index].data.length}}</span>
                    </v-card-title>
                    <div>
                        <div class="text-center py-6" v-if="leads[index].load_leads">
                            <v-progress-circular indeterminate color="primary"></v-progress-circular>
                        </div>
                        <draggable id="scroll" v-else @end="changeLeadOfFunnelPhase" :list="leads[index].data" :class="funnel_phase.id" draggable=".item" group="a" :scroll-sensitivity="200">
                            <v-list-item @click="openConversation(element)" class="list-group-item item mt-2 px-4 elevation-0" v-for="element in leads[index].data" :key="element.id" style="background:white; min-height: 60px;">
                                <v-badge class="icon_style" avatar bordered overlap>
                                    <template v-slot:badge>
                                        <v-avatar v-if="element.conversation!=null">
                                            <v-img v-if="element.conversation.channel == 'whatsapp' " src="https://unocrm.mx/wp-content/uploads/2021/08/whatsapp-icon-seeklogo.com_.svg"></v-img>
                                            <v-img v-else-if="element.conversation.channel == 'facebook' " src="https://upload.wikimedia.org/wikipedia/commons/b/be/Facebook_Messenger_logo_2020.svg"></v-img>
                                            <v-img v-else-if="element.conversation.channel == 'instagram' " src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg"></v-img>
                                            <v-img v-else-if="element.channel == 'cliengo'" src="/hand_cliengo.svg"></v-img>
                                        </v-avatar>
                                        <v-avatar v-else>
                                            <v-img v-if="element.channel == 'cliengo'" src="/hand_cliengo.svg"></v-img>
                                        </v-avatar>
                                    </template>
                                    <v-list-item-avatar size="35" color="#ccd2d4">
                                        <v-img v-if="element.conversation!=undefined && element.conversation.client_picture!=null" :src="element.conversation.client_picture"></v-img>
                                        <span style="text-transform: uppercase; text-align: center; width: 35px;" class="white--text text-h6" v-else><strong>{{element.name.slice(0,1)}}</strong></span>
                                    </v-list-item-avatar>
                                </v-badge>
                                <v-list-item-content style="display: block;">
                                    <v-list-item-title style="font-size:15px;">{{element.name}} <span v-if="element.last!=null">{{element.last}}</span></v-list-item-title>
                                    <v-list-item-subtitle style="font-size:12px;" v-if="element.conversation!=undefined && element.conversation.latest_message!=null">{{element.conversation.latest_message.contents.text}}</v-list-item-subtitle>
                                    <v-list-item-subtitle v-else-if="element.channel == 'cliengo'" style="font-size:12px;">
                                        <span v-if="element.additional_data.final_question!='null'">{{element.additional_data.final_question}}</span>
                                        <span v-else>...</span>
                                     </v-list-item-subtitle>
                                </v-list-item-content>
                            </v-list-item>
                        </draggable>
                    </div>
                </v-card>
                <v-btn @click="createFunnelPhaseDialog=true" color="primary" fab class="elevation-0 my-auto ml-3" x-small><v-icon>mdi-plus</v-icon></v-btn>
            </vue-horizontal>
        </div>
        <v-dialog @click:outside="closeDialog" v-model="conversation_dialog" width="1250">
            <conversation v-if="propData.lead!=undefined && propData.lead.channel!='cliengo' && propData.lead.channel!='Carga Manual'" v-bind:propData="propData" @closeConversation="closeConversation"></conversation>
            <cliengo v-else-if="propData.lead!=undefined && propData.lead.channel=='cliengo'" v-bind:propData="propData" @refresh="refresh"></cliengo>
            <v-card v-else>
                <v-toolbar v-if="propData.lead!=undefined" class="pl-3 pr-6" color="#ededed" dark elevation="0" style="border-bottom:solid #ccd2d4 2px;">
                    <v-list-item-avatar size="30" color="#ccd2d4">
                        <span style="text-transform: uppercase; text-align: center; width: 30px;" class="white--text text-h6"><strong>{{propData.lead.name.slice(0,1)}}</strong></span>
                    </v-list-item-avatar>

                    <div v-if="propData.lead.name!=undefined">
                        <span style="color:black;">{{propData.lead.name}} {{propData.lead.last}}</span> 
                    </div>
                    <div class="ml-6">
                        <v-dialog v-model="createCompanyDialog" max-width="800px">
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn class="elevation-0" small color="#1976d226" style="color:#1976d2!important;" @click="convertToClient(propData.lead)" v-bind="attrs" v-on="on">Convertir en Cliente</v-btn>
                            </template>
                            <createCompany v-bind:companyFromLead="company" @closeCreateDialogCompany="closeCreateDialogCompany"/>
                        </v-dialog>
                    </div>
                    <v-spacer></v-spacer>

                    <v-btn icon>
                        <v-icon color="#919191">mdi-dots-vertical</v-icon>
                    </v-btn>
                </v-toolbar>
                <detail v-bind:lead="propData.lead" @refresh="refresh"></detail>
            </v-card>
        </v-dialog>
        <v-dialog v-model="createFunnelDialog" max-width="400px">
            <v-card class="pt-3 pb-6 px-8">
                <div>
                    <v-text-field label="Nombre del Funnel" v-model="created_funnel.name"></v-text-field>
                    <v-textarea label="Descripción" v-model="created_funnel.description"></v-textarea>
                    <v-menu :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px" >
                        <template v-slot:activator="{ on }">
                            <v-chip class="ma-2 mt-0" :color="created_funnel.color" text-color="white" v-on="on"><v-avatar left><v-icon color="#676767"> mdi-palette</v-icon></v-avatar> Color Calendario</v-chip>
                        </template>
                        <v-color-picker v-model="created_funnel.color" class="ma-2"></v-color-picker>
                    </v-menu> 
                </div>
                <v-row class="ma-0 mt-2">
                    <v-spacer></v-spacer>
                    <v-btn class="elevation-0" text color="grey" @click="closeFunnelDialog()">Cancelar</v-btn>
                    <v-btn class="elevation-0" text color="primary" @click="saveFunnel()">Guardar</v-btn>
                </v-row>
            </v-card>
        </v-dialog>
        <v-dialog v-model="createDialog" max-width="700px">
          <template v-slot:activator="{ on, attrs }">
            <v-btn bottom color="#e25200" dark fab fixed right v-bind="attrs" v-on="on">
                <v-icon color="white">  mdi-plus </v-icon>
            </v-btn> 
          </template>
          <create @closeCreateDialogLead="closeCreateDialogLead"/>
        </v-dialog>
        <v-dialog v-model="editFunnelDialog" max-width="850px">
            <v-row class="px-8 py-4 ma-0" style="background:white;">

                <v-col cols="6">
                    <div>
                        <v-text-field label="Nombre del Funnel" v-model="funnel.name"></v-text-field>
                        <v-textarea label="Descripción" v-model="funnel.description"></v-textarea>
                        <v-menu :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px" >
                            <template v-slot:activator="{ on }">
                                <v-chip class="ma-2 mt-0" :color="funnel.color" text-color="white" v-on="on"><v-avatar left><v-icon color="#676767"> mdi-palette</v-icon></v-avatar> Color Calendario</v-chip>
                            </template>
                            <v-color-picker v-model="created_funnel.color" class="ma-2"></v-color-picker>
                        </v-menu> 
                    </div>
                    <v-row class="ma-0 mt-2">
                        <v-spacer></v-spacer>
                        <v-btn class="elevation-0" text color="grey" @click="closeFunnelDialog()">Cancelar</v-btn>
                        <v-btn class="elevation-0" text color="primary" @click="saveFunnel()">Guardar</v-btn>
                    </v-row>
                </v-col>

                <v-col cols="6">
                    <div style="background:#f4f5fa; max-height:40vh!important; min-height:40vh!important;" class="pa-4 mb-3">
                        <strong>Orden de las Fases</strong>
                        <draggable class="mt-3" @end="changeFunnelPhaseOrder" :list="funnel_phases" draggable=".item" group="a" :scroll-sensitivity="200">
                            <v-card style="margin:15px; background:transparent;" v-for="(funnel_phase, index) in funnel_phases" v-bind:key="index" :disabled="index==0" class="elevation-0 ma-1 item">
                                <v-card-title class="py-1 px-3" :style="'border-bottom: 2px ' + funnel.color + ' solid; font-size:15px;' + 'background:white;'">
                                    {{funnel_phase.name}}
                                    <v-spacer/>
                                    <v-icon small>mdi-message-processing</v-icon> <span class="ml-2">{{leads[index].data.length}}</span>
                                </v-card-title>
                            </v-card>
                        </draggable>
                    </div>
                </v-col>

            </v-row>
        </v-dialog>
        <v-dialog v-model="createFunnelPhaseDialog" max-width="600px">
            <v-card class="pt-3 pb-6 px-8">
                <div>
                    <v-text-field label="Nombre del Funnel Phase" v-model="created_funnel_phase.name"></v-text-field>
                    <v-textarea label="Descripción" v-model="created_funnel_phase.description"></v-textarea>
                </div>
                <v-row class="ma-0 mt-2">
                    <v-spacer></v-spacer>
                    <v-btn class="elevation-0" text color="grey" @click="closeFunnelPhaseDialog()">Cancelar</v-btn>
                    <v-btn class="elevation-0" text color="primary" @click="saveFunnelPhase()">Guardar</v-btn>
                </v-row>
            </v-card>
        </v-dialog>
    </div>  
</template>

<script>
import axios from 'axios'
import draggable from 'vuedraggable'
import VueHorizontal from 'vue-horizontal';
import Conversation from '../leads/conversation.vue'
import Cliengo from '../leads/cliengo.vue'
import CreateLead from '../leads/create.vue'
import Detail from '../leads/detail.vue'
import CreateCompany from "../clients/companies/create.vue"

export default {
    components: {
        draggable,
        VueHorizontal,
        'conversation':Conversation,
        'cliengo':Cliengo,
        'create':CreateLead,
        'detail': Detail,
        'createCompany' : CreateCompany
    },
    data() {
        return {
            buscar:false,
            search:'',
            createCompanyDialog:false,
            company:'',
            funnel:{
                name:'',
                id:''
            },
            created_funnel_phase:{
                days: null,
                description: null,
                name: '',
                time: null,
                funnel_id:'',
                order:''
            },
            funnel_phases:'',
            load_funnel_phases:true,
            leads:[],
            conversation_dialog:false,
            createFunnelPhaseDialog:false,
            editFunnelDialog:false,
            createFunnelDialog:false,
            createDialog:false,
            propData:{},
            created_funnel:{
                name:'',
                description:'',
                color:'grey'
            },
        };
    },
    created(){
        this.$emit("closeDrawer", false);
        this.$store.dispatch('funnel/getFunnels')
        this.getFunnelPhasesFromApi()
    },
    computed:{
        funnels(){
            var funnels = this.$store.state.funnel.funnels
            if(funnels.length>0){
                this.funnel = funnels[0]
            }
            return funnels
        },
    },
    watch: {
        buscar: {
            handler () {
                this.getFunnelPhasesFromApi()
                this.buscar = false
            },
            deep: true,
        },
    },
    methods: {
        closeCreateDialogCompany: function(params) {
            this.createCompanyDialog = params;
        },
        convertToClient(lead){
            this.company = {
                name:lead.name,
                origin_id:this.notNull(lead.origin),
                phone:lead.phone,
                email:lead.email,
                special_note:lead.note,
                user_id:this.notNull(lead.user)
            }
        },
        notNull(item){
            if(item!=undefined){
                return item.id
            }
            else{
                return ''
            }
        },
        refresh: function(params) {
            this.getFunnelPhasesFromApi()
        },
        closeCreateDialogLead: function(params) {
            this.leads.filter(funnel=>funnel.funnel_phase_id == params.funnel_phase_id)[0].data.push(params)
            this.createDialog = false
        },
        closeDialog(){
            this.propData = {'lead':undefined, 'funnel_phases':undefined, 'pause': 'no', 'reload': 'si'}
            this.conversation_dialog = false
        },
        openConversation(lead){
            this.propData = {'lead':lead, 'funnel_phases':this.funnel_phases, 'pause': 'no', 'reload': 'no'}
            this.conversation_dialog = true
        },
        closeConversation: function(params) {
            this.lead = {}
            this.conversation_dialog = params
        },
        changeFunnelPhaseOrder: function (evt) {
            console.log(evt)
        },
        changeLeadOfFunnelPhase: function (evt) {
            if(evt.from._prevClass!=evt.to._prevClass){
                var editedItem = {
                    id: evt.item._underlying_vm_.id,
                    funnel_phase_id: evt.to._prevClass
                }
                axios.patch(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/leads/" + editedItem.id, editedItem)
                .then(response=>{
                    
                })
            }
        },
        getLeads(i) {
            var filter = ''
            if(this.search!=''&&this.search!=null){
                filter = '&filter[name]=' + this.search
            }
            axios.get(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/leads?filter[funnel_phase_id]=" + this.leads[i].funnel_phase_id + filter)
            .then(response=>{
                this.leads[i].data = response.data.data
                this.leads[i].load_leads = false
            })
        },
        selectFunel(item){
            this.funnel = item
            this.getFunnelPhasesFromApi()
        },
        getFunnelPhasesFromApi(){
            this.load_funnel_phases = true
            this.funnel_phases = ''
            this.leads = []
            this.getFunnelPhases().then(data => {
                this.funnel_phases = data.items
                for(var i=0; i<this.funnel_phases.length; i++){
                    this.leads.push({
                        load_leads: true, data:[], funnel_phase_id: this.funnel_phases[i].id,
                    })
                    this.getLeads(i)
                }
                this.load_funnel_phases = false
            })
        },
        getFunnelPhases() {
            return new Promise((resolve, reject) => {
                axios.get(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/funnel_phases?filter[funnel_id]=" + this.funnel.id)
                .then(response=>{
                    var items = response.data.data
                    resolve({
                        items
                    })
                })
            })
        },
        saveFunnel(){
            axios.post(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/funnels", this.created_funnel)
            .then(response=>{
                this.closeFunnelDialog()
                this.$store.dispatch('funnel/getFunnels')
            })
        },
        saveFunnelPhase(){
            this.created_funnel_phase.funnel_id = this.funnel.id
            this.created_funnel_phase.order = (this.funnel_phases.length*1)+1
            axios.post(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/funnel_phases", this.created_funnel_phase)
            .then(response=>{
                this.closeFunnelPhaseDialog()
                this.getFunnelPhasesFromApi()
            })
        },
        closeFunnelDialog(){
            this.created_funnel = {
                name:'',
                description:'',
                color:'grey'
            }
            this.createFunnelDialog = false
        },
        closeFunnelPhaseDialog(){
            this.created_funnel_phase = {
                days: null,
                description: null,
                name: '',
                time: null,
                funnel_id:'',
                order:''
            }
            this.createFunnelPhaseDialog = false
        }
    }
};
</script>
<style>
    #scroll{
        overflow-y:scroll!important;
        max-height:70vh!important;
        min-height:70vh!important;
        -overflow-scrolling:touch!important;
        -webkit-overflow-scrolling:touch!important;
    }
    .v-text-field__details {
        display: none;
    }
    .theme--light.v-timeline::before {
        background-image: linear-gradient(#c7c7c7 33%, rgba(255,255,255,0) 0%)!important;
        background-position: right!important;
        background-size: 2px 7px!important;
        background-repeat: repeat-y!important;
        background-color: white!important;
    }
    .v-timeline .mdi-google-maps::before {
        content: "\F05F5"!important;
        color: #1976d2!important;
    }
    .v-timeline-item__dot {
        box-shadow: none!important;
    }
    .icon_style .v-badge__badge.primary{    
        inset: auto auto 0px 5px!important;
    }
    .buscador .v-input__slot{
        margin-bottom:0px!important;
    }
</style>