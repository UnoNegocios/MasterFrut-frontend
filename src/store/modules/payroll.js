import axios from "axios";
const state = {
    payrolls:[],
    totals:[],
    total_loader:false,
};
const getters = {};

const actions = {
    getPayrolls( {commit} ){
        axios
        .get(process.env.VUE_APP_BACKEND_ROUTE + "api/v1/payroll/all")
        .then(response => {
            commit('setPayrolls', response.data);
        });
    },
    getTotals( {commit} ){
        state.total_loader = true
        /*var startDate = []
        var date = new Date()
        startDate[0] = new Date(date.getFullYear(), date.getMonth(), 1).toLocaleString("sv-SE", {timeZone: "America/Monterrey"}).toString().slice(0, 10)
        startDate[1] = new Date(date.getFullYear(), date.getMonth() + 1, 0).toLocaleString("sv-SE", {timeZone: "America/Monterrey"}).toString().slice(0, 10)
        if(localStorage.getItem('filtersSales')==undefined&&localStorage.getItem('filtersSales')==null){
            axios
            .get(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/sale/totals"+'?filter[date_between]='+startDate)
            .then(response => {
                state.total_loader = false
                commit('setTotals', response.data);
            });
        }else{*/
            axios
            .get(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/payroll/totals?"+ JSON.parse(localStorage.getItem('filtersPayroll')))
            .then(response=>{
                state.total_loader = false
                commit('setTotals', response.data);
            })
        //}
    },
};

const mutations = {
    setPayrolls(state, data){
        state.payrolls = data;
    },
    setTotals(state, data){
        state.totals = data;
    },
};

export default{
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}