import axios from "axios";
const state = {
    raw_materials:[]
};
const getters = {};

const actions = {
    getRawMaterial( {commit} ){
        axios
        .get(process.env.VUE_APP_BACKEND_ROUTE + "api/v2/raw_materials")
        .then(response => {
            commit('setRawMaterial', response.data.data);
        });
    }
};

const mutations = {
    setRawMaterial(state, data){
        state.raw_materials = data;
    }
};

export default{
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}