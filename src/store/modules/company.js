import axios from "axios";
const state = {
    companies:[]
};
const getters = {};

const actions = {
  getCompanies( {commit} ){
    axios
    .get(process.env.VUE_APP_BACKEND_ROUTE + "api/v1/company/all")
    .then(response => {
        commit('setCompanies', response.data);
    });
  }
};

const mutations = {
  setCompanies(state, data){
    state.companies = data;
  }
};

export default{
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}