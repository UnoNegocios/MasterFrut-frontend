<template>
    <v-row class="ma-0 mb-4" v-if="loading">
        <v-col md="2" sm="6" class="px-2" v-for="(loader, index) in loaders" v-bind:key="index">
            <v-card class="pb-2 pt-3 px-4 elevation-0">
                <v-skeleton-loader type="text" width="40%"></v-skeleton-loader>
                <v-skeleton-loader type="text" width="80%"></v-skeleton-loader>
                <v-skeleton-loader type="text" width="80%"></v-skeleton-loader>
            </v-card>
        </v-col>
        <v-col md="2" sm="6" class="px-2" v-for="(loader, index) in loaders" v-bind:key="index">
            <v-card class="pb-2 pt-3 px-4 elevation-0">
                <v-skeleton-loader type="text" width="40%"></v-skeleton-loader>
                <v-skeleton-loader type="text" width="80%"></v-skeleton-loader>
                <v-skeleton-loader type="text" width="80%"></v-skeleton-loader>
            </v-card>
        </v-col>
    </v-row>
    <div v-else>
        <v-row class="ma-0" v-show="more">
            <v-col md="2" sm="6" class="px-2" v-for="(total, index) in totals" v-bind:key="index">
                <v-card class="py-2 px-4 elevation-0">
                    <v-icon x-small color="#47bdc6" class="mr-1">mdi-record</v-icon> 
                    <span style="font-size:12px;"><strong>{{total.label}}</strong></span>
                    <br/>{{(total.sum*1).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
                    <br/><span style="font-size:12px; color:grey;">Promedio:<strong>{{(total.avg*1).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}</strong></span>
                </v-card>
            </v-col>
        </v-row>
        <v-row class="ma-0 mb-2" v-show="!more">
            <v-spacer></v-spacer>
            <v-btn class="botonPerron" @click="buttonMore" icon><v-icon>mdi-chevron-down</v-icon></v-btn>
            <v-spacer></v-spacer>
        </v-row>
        <v-row class="ma-0 mb-2" v-show="more">
            <v-spacer></v-spacer>
            <v-btn class="botonPerron" @click="more=false" icon><v-icon>mdi-chevron-up</v-icon></v-btn>
            <v-spacer></v-spacer>
        </v-row>
    </div>
</template>

<script>

export default {
    props:{
        company:String
    },
    data: () => ({
        loaders:['loader-1', 'loader-2', 'loader-3', 'loader-4', 'loader-5', 'loader-6'],
        count:0,
        more:'',
    }),
    computed:{
        totals(){
            return this.$store.state.payroll.totals
        },
        loading(){
            return this.$store.state.payroll.total_loader
        },
        currentUser:{
            get(){
                return this.$store.state.currentUser.user;
            }
        }
    },
    methods:{
        buttonMore(){
            if(this.more=='' && this.more!==false){
                this.$store.dispatch('payroll/getTotals')
                this.more = true
            }else{
                this.more = true
            }
        },
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
    }
}
</script>
<style>
.botonPerron {
    background: white;
    border-radius: 5px;
    height: 25px!important;
    margin-bottom: -17px;
    width: 90px!important;
}
</style>