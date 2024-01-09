const got = require('@/utils/got');
const { CookieJar } = require('tough-cookie');
new CookieJar();
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const pubId = ctx.params.pub;
    const remoteUrl = `https://dl.acm.org/toc/${pubId}/justaccepted`;
    const response = await got({
        method: 'GET',
        url: remoteUrl,
    });

    const $ = cheerio.load(response.data); // 使用 cheerio 加载返回的 HTML
    const jrnlName = $('meta[property="og:site_name"]').attr('content');

    let items = [];

    $('.issue-item__content').each(function () {
        const title = $(this).find('.issue-item__title a').text().trim();
        const link = $(this).find('.issue-item__title a').attr('href');
        let authors = [];
        $(this).find('.rlist--inline.loa li').each(function () {
            authors.push($(this).text().trim());
        });
        const abstract = $(this).find('.issue-item__abstract p').text().trim();

        items.push({
            title,
            link,
            author: authors.join(''),
            description: abstract
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
        title: jrnlName,
        link: remoteUrl,
        item: items,
    };
};
