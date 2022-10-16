module.exports = function (router) {
    router.get('/video/:id', require('./play'));
};
