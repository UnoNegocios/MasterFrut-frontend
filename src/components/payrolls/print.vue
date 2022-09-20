<template>
    <v-container>
        <v-row v-for="(payroll, index) in payrolls" :key="index" class="tamanioletra" style="margin: 15px; margin-bottom:0px!important;">
            <v-col cols="6" class="header" style="border: solid black; border-width: 1px 0px 1px 1px!important;">
                RECIBO
            </v-col>
            <v-col cols="6" class="header" style="border: solid black; border-width: 1px 1px 1px 1px!important;">
                N-{{payroll.id}}
            </v-col>
            <v-col cols="6" style="border: solid black; border-width: 0px 0px 1px 1px!important;">
                Pagado por:
                
                <strong>EFI Industrial S.A. de C.V.</strong>
            </v-col>
            <v-col cols="6" style="border: solid black; border-width: 0px 1px 1px 1px!important;">
                Pagado a: {{payroll.user_id}}
                <br>
                <strong></strong>
            </v-col>

            <v-col cols="4" style="border: solid black; border-width: 0px 0px 1px 1px!important;">
                FIJOS {{(payroll.amount*1).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
            </v-col>
            <v-col cols="4" style="border: solid black; border-width: 0px 0px 1px 1px!important;">
                SUMA {{(payroll.sum*1).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
            </v-col>
            <v-col cols="4" style="border: solid black; border-width: 0px 1px 1px 1px!important;">
                RESTA {{(payroll.rest*1).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
            </v-col>

            <v-col cols="4" style="padding: 12px 10px; border: solid black; border-width: 0px 0px 1px 1px!important;">
                Sueldo diario: {{(payroll.daily_salary*1).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
                <br>
                IMSS: {{(payroll.imss*1).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
                <br>
                Puesto: {{payroll.job_position}} <span v-show="payroll.sub_job_position!=undefined&&payroll.sub_job_position!=undefined&&payroll.sub_job_position!=''"> | </span> {{payroll.sub_job_position}}
            </v-col>
            <v-col cols="4" style="border: solid black; border-width: 0px 0px 1px 1px!important;">
                Tiempo extra: {{(payroll.extra_time*1).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
                <br>
                Premio puntualidad: {{(payroll.punctuality_award*1).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
                <br> 
                Premio rendimiento: {{(payroll.performance_award*1).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
                <br>
                Premio producción: {{(payroll.production_award*1).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
                <br>
                Vacaciones: {{(payroll.holidays*1).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
                <br>
                Prima Vacacional: {{(payroll.prima_vacacional*1).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
            </v-col>
            <v-col cols="4" style="padding: 24px 10px; border: solid black; border-width: 0px 1px 1px 1px!important;">
                Infonavit: {{(payroll.infonavit*1).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
                <br>
                Faltas: {{(payroll.absence*1).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
                <br>
                Prestamo: {{(payroll.loan*1).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}
            </v-col>

            <v-col cols="6" class="header" style="text-align: right; border: solid black; border-width: 0px 0px 0px 1px!important;">
                <strong>Neto a pagar:</strong>
            </v-col>
            <v-col cols="6" class="header" style="border: solid black; border-width: 0px 1px 0px 1px!important;">
                <strong>{{(payroll.total*1).toLocaleString('es-MX', { style: 'currency', currency: 'MXN',})}}</strong>
            </v-col>

            <v-col cols="6" style="border: solid black; border-width: 1px 0px 1px 1px!important;">
                Fecha: {{payroll.date}}
            </v-col>
            <v-col cols="6" style="border: solid black; border-width: 1px 1px 1px 1px!important;">
                Recibido por:
            </v-col>

            <div v-if="multiplo(index)" style="height:45px;">-</div>
            
        </v-row>

        <v-btn v-if="printButton==true" bottom color="#e25200" dark fab fixed right @click="print()">
            <v-icon color="white">  mdi-printer </v-icon>
        </v-btn> 
    </v-container>
</template>

<script>
export default {
    data: () => ({
        payrolls:'',
        printButton:true,
    }),
    created(){
        this.payrolls = JSON.parse(localStorage.getItem('nominas'));
        localStorage.removeItem("nominas");
    },
    methods:{
        multiplo(index){
            if(index==0){
                return false
            }
            else if(( (index+1) % 4 ) == 0){
                return true
            }else{
                return false
            }
        },
        print() {
            this.printButton=false
            this.$nextTick(() => {
                window.print();
                this.$nextTick(() => {
                    localStorage.removeItem("nominas");
                    window.close();
                })
            })
        }
    }

}
</script>
<style>
    .header{
        background: #d9d9d9;
    }
    .col-6, .col-4{
        padding:0px 10px;
    }
    .tamanioletra{
        font-size: 14px;
    }
</style>