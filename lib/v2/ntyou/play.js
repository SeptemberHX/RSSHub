const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const remoteUrl = `http://www.ntyou.cc/video/${id}.html`;
    const response = await got({
        method: 'GET',
        url: remoteUrl,
    });
    const $ = cheerio.load(response.data); // 使用 cheerio 加载返回的 HTML
    const title = $('title').text();
    const videosLists = $('div .movurl');
    const items = [];
    if (videosLists.length > 0) {
        for (const itemEl of videosLists.first().find('a')) {
            items.push({
                title: $(itemEl).text(),
                url: `http://www.ntyou.cc$(itemEl).attr('href')`,
                description: $(itemEl).text(),
            });
        }
    }

    ctx.state.data = {
        title,
        link: remoteUrl,
        item: items,
    };
};
