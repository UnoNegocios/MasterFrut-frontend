import axios from "axios";
const state = {
    calendars:[],
};
const getters = {};

const actions = {
    getCalendars( {commit} ){
        axios
        .get(process.env.VUE_APP_BACKEND_ROUTE + "api/v1/calendar/all")
        .then(response => {
            commit('setCalendars', response.data);
        });
    }
};

const mutations = {
    setCalendars(state, data){
        state.calendars = data;
    },
};

export default{
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}