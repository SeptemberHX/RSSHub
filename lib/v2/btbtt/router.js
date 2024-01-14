module.exports = function (router) {
    router.get('/:tid/:keyword', require('./btbtt_post'));
};
