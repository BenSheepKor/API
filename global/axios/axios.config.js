const axios = require('axios');

const globalAxios = axios.create({
    timeout: 1000,
    headers: { 'content-type' : 'application/json; charset=utf-8' }
})

const success = res => {
    if (res.status == 200 && res.data) {
        return res.data;
    }
};

globalAxios.interceptors.response.use(
    res => success(res),
);

module.exports = globalAxios;