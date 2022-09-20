
import axios from "axios";

const state = {
    activities:[]
};

const getters = {};

const actions = {
    getActivities( {commit} ){
        axios
        .get(process.env.VUE_APP_BACKEND_ROUTE + "api/v1/activity/all")
        .then(response => {
            commit('setActivities', response.data);
        });
    }
};

const mutations = {
    setActivities(state, data){
        state.activities = data;
    }
};

export default{
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}



