import axios from "axios";
const state = {
    vehicles:[]
};
const getters = {};

const actions = {
    getVehicles( {commit} ){
        axios
        .get(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/vehicles")
        .then(response => {
            commit('setVehicles', response.data.data);
        });
    }
};

const mutations = {
    setVehicles(state, data){
        state.vehicles = data;
    }
};

export default{
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}