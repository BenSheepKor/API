const ax = require('axios');

const axios = ax.create({
    headers: { 'content-type': 'application/json; charset=utf-8' },
});

const success = (res) => {
    if (res.status === 200 && res.data) {
        return res.data;
    }
};

axios.interceptors.response.use((res) => success(res));

module.exports = axios;
