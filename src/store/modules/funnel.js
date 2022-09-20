import axios from "axios";
const state = {
    funnels:[],
    phases:[]
};
const getters = {};

const actions = {
    getFunnels( {commit} ){
        axios
        .get(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/funnels")
        .then(response => {
            commit('setFunnels', response.data.data);
        });
    },
    getPhases( {commit} ){
        axios
        .get(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/funnel_phases")
        .then(response => {
            commit('setPhases', response.data.data);
        });
    }
};

const mutations = {
    setFunnels(state, data){
        state.funnels = data;
    },
    setPhases(state, data){
        state.phases = data;
    },
};

export default{
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}