<template>
    <v-card class="ma-0" v-if="propData.lead!=undefined">
        <v-toolbar class="pl-3 pr-6" color="#ededed" dark elevation="0" style="border-bottom:solid #ccd2d4 2px;">

            <v-list-item-avatar size="30" color="#ccd2d4">
                <v-img v-if="lead.conversation!=undefined && lead.conversation.client_picture!=null" :src="lead.conversation.client_picture"></v-img>
                <span style="text-transform: uppercase; text-align: center; width: 30px;" class="white--text text-h6" v-else><strong>{{lead.name.slice(0,1)}}</strong></span>
            </v-list-item-avatar>

            <div v-if="lead.name!=undefined">
                <span style="color:black;">{{lead.name}} {{lead.last}}</span> 
            </div>
            <div class="ml-6">
                <v-btn class="elevation-0" small color="#1976d226" style="color:#1976d2!important;" @click="convertToClient()">Convertir en Cliente</v-btn>
            </div>
            <!--div v-else>
                <span style="color:black;">{{lead.conversation.to}}</span> <v-btn x-small @click="asociarDialog=true" class="ml-4 elevation-0" rounded color="primary">Asociar</v-btn>
            </div-->
            <v-spacer></v-spacer>
            <!--v-btn icon>
                <v-icon color="#919191">mdi-magnify</v-icon>
            </v-btn>
            <v-btn icon>
                <v-icon color="#919191">mdi-dots-vertical</v-icon>
            </v-btn-->
        </v-toolbar>

        <v-row class="ma-0">
            <v-col md=9 class="pa-0" style="border-right:solid #ccd2d4 2px;">
                <v-toolbar class="px-2" color="white" elevation="0">
                    <!--v-select outlined dense class="mr-2" :items="funnel_phases" v-model="lead.funnel_phase.id" item-text="name" item-value="id" style="width:25%;"></v-select>

                    <v-select outlined dense class="mr-2" v-if="lead.user!=null" v-model="lead.user.id" :items="users" item-text="name" item-value="id" style="width:25%;">
                        <template v-slot:selection="{ item }">
                            <v-avatar size="32px" class="mr-4">
                                <img :src="item.profile_photo_url">
                            </v-avatar>
                            <span>{{item.name}} {{item.last}}</span>
                        </template>
                        <template v-slot:item="{ item }">
                            <v-avatar size="32px" class="mr-4">
                                <img :src="item.profile_photo_url">
                            </v-avatar>
                            <span>{{item.name}} {{item.last}}</span>
                        </template>
                    </v-select-->

                    <v-select label="Status" outlined dense class="mr-2" style="width:25%;">
                        <template v-slot:selection="{ item }">
                            <v-icon :color="item.color">mdi-square-rounded</v-icon>
                            <span>{{item.name}}</span>
                        </template>
                        <template v-slot:item="{ item }">
                            <v-icon :color="item.color">mdi-square-rounded</v-icon>
                            <span>{{item.name}}</span>
                        </template>
                    </v-select>

                    <v-spacer></v-spacer>
                    <div>
                        <!--v-btn icon small><v-icon>mdi-close</v-icon></v-btn>
                        <v-btn icon small class="mx-2"><v-icon>mdi-close</v-icon></v-btn>
                        <v-btn icon small><v-icon>mdi-close</v-icon></v-btn-->
                        
                    </div>
                </v-toolbar>
                <div  style="border-top:solid #ccd2d4 1px; background-color: white; background-repeat: repeat; background-size: 412.5px 749.25px; background-image: linear-gradient(120deg,rgb(229 221 213 / 90%) 60%,rgb(229 221 213 / 90%) 60%),url(https://unocrm.mx/wp-content/uploads/2021/07/bg-chat-tile-light_04fcacde539c58cca6745483d4858c52.png)!important;">
                    <div style="height:60vh;" class="chat__body pl-7 pr-10 pt-5 pb-0" ref="container">
                        <infinite-loading direction="top" @infinite="getMessages"></infinite-loading>
                        <!-- Message -->
                        <div v-for="(message_item, index) in messages" :key="index">
                            <v-row class="ma-0">
                                <v-spacer></v-spacer>
                                <v-chip small style="font-weight:500;" color="#f0f0f0" class="elevation-1" light v-if="(index>=1 && message_item.zenvia_timestamp.slice(0,10)!=messages[index-1].zenvia_timestamp.slice(0,10)) || index==0">
                                    {{dateFormat(message_item.zenvia_timestamp)}}
                                </v-chip>
                                <v-spacer></v-spacer>   
                            </v-row>

                            

                            <p :class="message_item.direction === 'OUT' ? 'chat__sender chat__message': 'chat__reciever chat__message'" :style="{'padding-right':checkPadding(message_item.direction),}"> 
                                
                                <span v-if="message_item.contents.type=='text'">{{ message_item.contents.text }} </span>

                                <v-dialog v-else-if="message_item.contents.type=='file'" width="600">
                                    <template v-slot:activator="{ on, attrs }">
                                        <img v-bind="attrs" v-on="on" style="margin-right:-30px; margin-bottom:5px;" width="400px" :src="message_item.contents.fileUrl"/>
                                    </template>
                                    <img style="margin-right:-30px; margin-bottom:5px;" width="600px" :src="message_item.contents.fileUrl"/>
                                </v-dialog>

                                <span v-if="message_item.contents.type=='card'">
                                    <span>{{ message_item.contents.text }} </span>
                                    <v-row class="ma-0 mt-1">
                                        <v-btn disabled v-for="(button, index) in message_item.contents.buttons" v-bind:key="index" class="elevation-0 mt-1" style="min-width: 100%;" small>{{ button.text }}</v-btn>
                                    </v-row>
                                </span>

                                <!-- Hour -->
                                <span class="chat__timestamp">{{new Date(message_item.zenvia_timestamp).getHours()}}:{{new Date(message_item.zenvia_timestamp).getMinutes()}}</span>
                                <!-- Seen -->
                                <v-icon v-if="message_item.statuses!=undefined && message_item.direction === 'OUT' && message_item.statuses[message_item.statuses.length-1].code == 'CLOCK'" x-small color="grey" class="chat__checkmark">mdi-clock-outline</v-icon>
                                <v-icon v-if="message_item.statuses!=undefined && message_item.direction === 'OUT' && message_item.statuses[message_item.statuses.length-1].code == 'SENT'" x-small color="grey" class="chat__checkmark">mdi-check</v-icon>
                                <v-icon v-if="message_item.statuses!=undefined && message_item.direction === 'OUT' && message_item.statuses[message_item.statuses.length-1].code == 'DELIVERED'" x-small color="grey" class="chat__checkmark">mdi-check-all</v-icon>
                                <v-icon v-if="message_item.statuses!=undefined && message_item.direction === 'OUT' && message_item.statuses[message_item.statuses.length-1].code == 'READ'" x-small color="primary" class="chat__checkmark">mdi-check-all</v-icon>
                                <v-icon v-if="message_item.statuses!=undefined && message_item.direction === 'OUT' && message_item.statuses[message_item.statuses.length-1].code == 'REJECTED'" x-small color="red" class="chat__checkmark">mdi-alert-circle-outline</v-icon>
                            </p>

                        </div>
                    </div>
                    <!-- Type Message-->
                    <v-row style="background:#f0f0f0; width:100%;" class="px-6 py-3 type ma-0">
                        <v-textarea full-width rows="1" no-resize auto-grow v-model="message" prepend-icon="mdi-attachment" filled rounded 
                        dense single-line hide-details label="Escribe un mensaje aquí" color="#919191" @keydown.enter="sendMessage"
                        ></v-textarea>
                        <v-btn small style="margin:6.3px;" class="mr-0" v-if="this.message!=''" icon @click="sendMessage"><v-icon>mdi-send</v-icon></v-btn>
                        <v-btn small style="margin:6.3px;" class="mr-0" v-else-if="!recording" icon @click="recordAudio"><v-icon>mdi-microphone</v-icon></v-btn>
                        <v-btn small style="margin:6.3px;" class="mr-0" v-else icon @click="stop()"><v-icon> mdi-stop-circle-outline </v-icon></v-btn>
                    </v-row>

                    <div id="audio" class="audio" controls></div>
                </div>
            </v-col>
            <v-col md="3" class="pa-0">
                <leadDetail v-bind:lead="lead"/>
            </v-col>
        </v-row>
    </v-card>
</template>

<script>

//import InfiniteLoading from 'vue-infinite-loading';
import axios from "axios";
import leadDetail from '../leads/detail.vue'
import EmojiPicker from "vue-emoji-picker";
export default {
    data() {
        return {
            tab:null,
            messages:[],
            asociarDialog:false,
            message:'',
            lead:'',
            funnel_phases:'',
            editInterest:false,
            editPhone:false,
            editEmail:false,
            page:1,
            pause:'no',
            recorder: null,
            chunks: [],
            device: null,
            blobObj: null,
            recording:false
        }
    },
    computed:{
        users(){
            return this.$store.state.user.users
        },
        currentUser(){
            return this.$store.state.currentUser.user
        },
    },
    components: {
        EmojiPicker,
        //InfiniteLoading,
        'leadDetail':leadDetail
    }, 
    props:{
        propData:Object
    }, 
    created(){
        this.lead = this.propData.lead
        this.funnel_phases = this.propData.funnel_phases
        if(this.propData.lead.conversation!=undefined){
            this.messages.push(this.propData.lead.conversation.latest_message)
        }
        this.scroll
    },
    beforeUpdate(){
        console.log('perro')
            if(this.propData.lead!=undefined && this.pause=='no'){
                console.log('raton')
                this.lead = this.propData.lead
                this.funnel_phases = this.propData.funnel_phases
                this.messages.push(this.propData.lead.conversation.latest_message)
                this.scroll
                this.pause='si'
            }else if(this.propData.lead==undefined){
                console.log('pez')
                this.tab=null,
                this.messages=[],
                this.asociarDialog=false,
                this.message='',
                this.lead='',
                this.funnel_phases='',
                this.editInterest=false,
                this.editPhone=false,
                this.editEmail=false,
                this.page=1
                this.pause='no'
            }
    },
    methods:{
        convertToClient(){
            console.log()
        },
        recordAudio() {
            this.recording = true
            this.device = navigator.mediaDevices.getUserMedia({ audio: true });
            this.device.then((stream) => {
                this.recorder = new MediaRecorder(stream);
                this.recorder.ondataavailable = (e) => {
                    this.chunks.push(e.data);
                    if (this.recorder.state === "inactive") {
                        var audio = document.getElementById("audio");
                        var mainaudio = document.createElement("audio");
                        mainaudio.setAttribute("controls", "controls");
                        audio.appendChild(mainaudio);
                        var url = URL.createObjectURL(new Blob(this.chunks, { type: "audio/wav" }))
                        mainaudio.innerHTML = '<source src="' + url.slice(5,url.length) + '" type="audio/wav" />';
                        console.log(url.slice(5,url.length))
                        this.chunks = [];
                        this.blobObj = null;
                    }
                };
                this.recorder.start();
            });
        },
        stop() {
            console.log(this.recorder)
            this.recording = false
            // stop
            this.recorder.stop();
        },
        callback (data) {
            console.debug(data)
        },
        dateFormat(date){
            // Creamos el objeto fecha instanciándolo con la clase Date
            const fecha = new Date(date.slice(0,10));
            // Creamos array con los días de la semana
            const dias_semana = ['Domingo', 'Lunes', 'martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
            //Creamos constante para el dia de hoy
            const hoy = new Date(new Date().toLocaleString("sv-SE", {timeZone: "America/Monterrey"}).slice(0,10))
            //sacamos diferencia
            const difference = (Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()) - Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()))/(1000*60*60*24)

            if((difference)<7){
                if(difference==0){
                    return 'Hoy'
                }else if(difference==1){
                    return 'Ayer'
                }else{
                    return dias_semana[fecha.getDay()]
                }
            }else{
                // Creamos array con los meses del año
                const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
                // Construimos el formato de salida
                if(fecha.getUTCFullYear()!=new Date().getUTCFullYear()){
                    return dias_semana[fecha.getDay()] + ', ' + fecha.getDate() + ' de ' + meses[fecha.getMonth()];
                }else{
                    return dias_semana[fecha.getDay()] + ', ' + fecha.getDate() + ' de ' + meses[fecha.getMonth()] + ' de ' + fecha.getUTCFullYear();
                }
            }
        },
        scroll() {
            this.messages !== null &&
            this.messages !== undefined
            ? this.scrollToEnd()
            : null;
        },
        save(){
            var editedItem = {
                id: this.lead.id,
                interest: this.lead.interest,
                phone: this.lead.phone,
                email: this.lead.email
            }
            axios.patch(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/leads",Object.assign(editedItem)).then(response=>{
                this.editInterest = false
                this.editPhone = false
                this.editEmail = false
            })
        },
        sendMessage(){
            if(this.message!=''){
                var message = this.message
                this.message = ''
                var messageInput = {
                    conversation_id: this.propData.lead.conversation.id,
                    user_id: this.currentUser.id,
                    contents:{
                        type: "text",
                        text: message
                    },
                    channel: this.propData.lead.conversation.channel,
                    uuid:'',
                    from:'',
                    to:'',
                    direction:'OUT',
                    statuses:[{code:'CLOCK'}],
                    zenvia_timestamp: new Date().toLocaleString("sv-SE", {timeZone: "America/Monterrey"}),
                }
                this.messages.push(messageInput)
                if(this.propData.lead.conversation.channel == 'whatsapp'){
                    var server = "fearless-plain"
                }else if(this.propData.lead.conversation.channel == 'facebook'){
                    var server = "giant-whale"
                }
                else if(this.propData.lead.conversation.channel == 'instagram'){
                    var server = "clear-pruner"
                }
                axios({
                    method: "POST",
                    url: "https://api.zenvia.com/v2/channels/" + this.propData.lead.conversation.channel + "/messages",
                    headers: {
                        "Content-Type": "application/json",
                        "X-API-TOKEN": "6xk4uuY_WH-kGMb9y2o_E78KShJ34TlW-HPb"
                    },
                    data: {
                        from:server,
                        to:this.propData.lead.conversation.channelId,
                        contents:[{
                            type:"text",
                            text:message
                        }]
                    },
                }).then(response => {
                    messageInput.statuses[0].code = 'SENT'
                    messageInput.uuid = response.data.id,
                    messageInput.from = response.data.from,
                    messageInput.to = response.data.to,
                    axios.post(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/messages",Object.assign(messageInput)).then(response=>{
                        this.messages[this.messages.length-1] = messageInput
                    })
                })
            }else{
                
            }
        },
        getMessages($state) {
            axios.get(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/messages?filter[conversation_id]=" + this.propData.lead.conversation.id + "&page=" + this.page)
            .then(response=>{
                if (response.data.data.length) {
                    var messages = response.data.data.sort(function(a,b){
                        return new Date(a.created_at) - new Date(b.created_at);
                    });
                    if(this.page == 1){
                        this.messages = messages
                    }else{
                        this.messages = this.messages.concat(messages).sort(function(a,b){
                            return new Date(a.created_at) - new Date(b.created_at);
                        });
                    }
                    $state.loaded();
                    this.page += 1;
                } else {
                    $state.complete();
                }
            })
        },
        checkPadding(direction){
            if(direction=='OUT'){
                return '45px!important'
            }else if(direction=='IN'){
                return '40px!important'
            }
        },
        scrollToEnd() {
            const content = this.$refs.container;
            if(content!=undefined){
                content.scrollTop = content.scrollHeight;
            }
        },
    },

}
</script>
<style>
    .chat__timestamp {
        margin-left: 10px;
        font-size: xx-small;
        position:absolute;
        bottom:2px;
    }
    .chat__checkmark {
        position:absolute;
        bottom:-9px;
        right:-37px;
    }
    .chat__message {
        position: relative;
        font-size: 14.2px;
        padding: 6px 0px 8px 9px;
        border-radius: 7.5px;
        background-color: #ffffff;
        width: fit-content;
        margin-bottom: 30px;
        max-width: 65%;
    }
    .chat__reciever:after {
        content: "";
        position: absolute;
        margin-top: -6px;
        margin-left: -5px;
        border-left: 12px solid transparent;
        border-right: 12px solid transparent;
        border-bottom: 12px solid #ffffff !important;
        transform: rotate(42deg);
        left: -6px;
        top: 4px;
    }
    .chat__sender {
        margin-left: auto;
        background-color: #dcf8c6;
    }
    .chat__sender:after {
        content: "";
        position: absolute;
        margin-top: -6px;
        margin-left: -5px;
        border-left: 12px solid transparent;
        border-right: 12px solid transparent;
        border-bottom: 12px solid #dcf8c6 !important;
        transform: rotate(-42deg);
        right: -10px;
        top: 4px;
    }
    .chat__body{
        flex: 1;
        overflow: scroll;
    }
    .search-bar .v-text-field.v-text-field--solo:not(.v-text-field--solo-flat) > .v-input__control > .v-input__slot {
        box-shadow: 0px 3px 1px -2px rgba(255, 255, 255, 0), 0px 2px 2px 0px rgba(255, 255, 255, 0), 0px 1px 5px 0px rgba(255, 255, 255, 0)!important;
    }
    .search-bar .v-label {
        font-size: 15px;
        color:#919191;
    }
    .search-bar .mdi-magnify::before {
        font-size: 18px;
        color:#919191;
    }
    .wrapper {
        position: relative;
        display: inline-block;
    }
    .regular-input {
        padding: 0.5rem 1rem;
        border-radius: 3px;
        border: 1px solid #ccc;
        width: 20rem;
        height: 12rem;
        outline: none;
    }
    .regular-input:focus {
        box-shadow: 0 0 0 3px rgba(66,153,225,.5);
    }
    .regular-input {
        padding: 0.5rem 1rem;
        border-radius: 3px;
        border: 1px solid #ccc;
        width: 20rem;
        height: 12rem;
        outline: none;
    }
    .regular-input:focus {
        box-shadow: 0 0 0 3px rgba(66,153,225,.5);
    }
    .perros .theme--light.v-text-field--filled > .v-input__control > .v-input__slot {
        background: white;
    }
    .perros textarea{
        overflow: auto!important;
        max-height: 120px!important;
    }
    .v-icon.notranslate.v-icon--link.mdi.theme--light{
        color:#919191!important;
    }
    .perros .v-input__control{
        margin: 0px 10px!important;
    }
    .khe .v-badge__badge.primary{    
        inset: auto auto -5px -5px!important;
    }
    @media (max-width: 980px){
        .perros{
            width: 100vw!important;
        }
        header{
            margin-top:-13px;
        }
        .chat__body{
            max-height: 5vh!important;
            min-height: 5vh!important;
        }
        .altocel{
            height:calc(100vh - 60px - 56px)!important;
        }
        .altocel2{
            height:calc(100vh - 56px)!important;
        }
    }
    /*
    .space .theme--light.v-input input, .theme--light.v-input textarea {
        padding: 15px 20px;
    }
    .v-input__slot{
        margin-bottom: 0px!important;
    }
    */
</style>