const got = require('@/utils/got');
const { CookieJar } = require('tough-cookie');
const { parseDate } = require('@/utils/parse-date');

new CookieJar();
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const remoteUrl = `https://service.most.gov.cn/kjjh_tztg/`;
    const response = await got({
        method: 'GET',
        url: remoteUrl,
    });

    const $ = cheerio.load(response.data); // 使用 cheerio 加载返回的 HTML
    const announceName = '国家科技管理信息系统通知公告';

    const items = [];

    $('tr').each(function () {
        const title = $(this).find('.table_gkgs_title').text().trim();
        const author = $(this).find('.table_gkgs_unit').text().trim();
        const date = $(this).find('.table_gkgs_date').text().trim();

        const titleElement = $(this).find('td.table_gkgs_title > div');
        const link = titleElement.attr('onclick').match(/['"]([^'"]+)['"]/)[1];

        items.push({
            title,
            link,
            author,
            description: title,
            pubDate: parseDate(date),
        });
    });

    // items = items.slice(0, 20);
    // for (const item of items) {
    //     console.log(item.title);
    //     try {
    //         const response = await got('https://dl.acm.org' + item.link, {
    //             headers: {
    //                 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
    //             }
    //         });
    //         const $ = cheerio.load(response.body);
    //         const abstract = $('.abstractSection.abstractInFull p').text().trim();
    //         console.log(abstract);
    //         if (abstract.length > 0) {
    //             item.description = abstract;
    //         }
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }

    ctx.state.data = {
        title: announceName,
        link: remoteUrl,
        item: items,
    };
};
