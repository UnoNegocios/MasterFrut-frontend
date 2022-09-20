import axios from "axios";
const state = {
    payment_methods:[]
};
const getters = {};

const actions = {
    getPaymentMethods( {commit} ){
        axios
        .get(process.env.VUE_APP_BACKEND_ROUTE + "api/v1/payment_method/all")
        .then(response => {
            commit('setPaymentMethods', response.data);
        });
    }
};

const mutations = {
    setPaymentMethods(state, data){
        state.payment_methods = data;
    }
};

export default{
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}