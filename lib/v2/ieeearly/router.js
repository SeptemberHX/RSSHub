module.exports = function (router) {
    router.get('/:pub/:issue', require('./early'));
};
