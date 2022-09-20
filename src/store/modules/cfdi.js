import axios from "axios";
const state = {
    cfdis:[]
};
const getters = {};

const actions = {
    getCfdi( {commit} ){
        axios
        .get(process.env.VUE_APP_BACKEND_ROUTE + "api/v1/cfdi/all")
        .then(response => {
            commit('setCfdi', response.data);
        });
    }
};

const mutations = {
    setCfdi(state, data){
        state.cfdis = data;
    }
};

export default{
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}