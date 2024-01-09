module.exports = function (router) {
    router.get('/:pub', require('./acm_early'));
};
