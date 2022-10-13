module.exports = function (router) {
    router.get('/:name', require('./manga'));
};
