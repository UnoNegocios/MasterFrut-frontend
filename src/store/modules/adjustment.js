
import axios from "axios";

const state = {
    adjustments:[]
};

const getters = {};

const actions = {
    getAdjustments( {commit} ){
        axios
        .get(process.env.VUE_APP_BACKEND_ROUTE + "api/v1/adjustment/all")
        .then(response => {
            commit('setAdjustments', response.data);
        });
    }
};

const mutations = {
    setAdjustments(state, data){
        state.adjustments = data;
    }
};

export default{
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
