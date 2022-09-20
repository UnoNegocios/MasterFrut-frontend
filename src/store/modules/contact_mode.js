import axios from "axios";
const state = {
    contact_modes:[]
};
const getters = {};

const actions = {
    getContactModes( {commit} ){
        axios
        .get(process.env.VUE_APP_BACKEND_ROUTE + "api/v1/contact_mode/all")
        .then(response => {
            commit('setContactModes', response.data);
        });
    }
};

const mutations = {
    setContactModes(state, data){
        state.contact_modes = data;
    }
};

export default{
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}