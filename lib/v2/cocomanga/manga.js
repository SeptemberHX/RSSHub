const cheerio = require('cheerio');
const dateParser = require('@/utils/dateParser');

module.exports = async (ctx) => {
    const browser = await require('@/utils/puppeteer')();

    const paramId = ctx.params.id;
    const homeUrl = 'http://www.cocomanga.com';
    const mangaUrl = `http://www.cocomanga.com/${paramId}/`;

    const page = await browser.newPage();
    await page.goto(mangaUrl, {
        waitUntil: 'domcontentloaded',
    });

    const html = await page.evaluate(() => document.querySelector('html').innerHTML);

    const $ = cheerio.load(html);
    let author = '';
    let title = '';
    for (const dd of $('dd.fed-deta-content')) {
        const h1s = $(dd).find('h1');
        if (h1s && h1s.length > 0) {
            title = h1s.textContent;
        }

        for (const info of $(dd).find('li')) {
            const spans = $(info).find('span');
            if (spans && spans.length === 1) {
                switch (spans[0].textContent) {
                    case '作者':
                        author = info.textContent;
                        break;
                    default:
                        break;
                }
            }
        }
    }

    const items = [];
    for (const pageE of $('.fed-btns-info.fed-rims-info.fed-part-eone')) {
        if (items.length >= 10) {
            break;
        }

        if (pageE.attribs.href.startsWith(`/${paramId}`)) {
            items.push({
                title: pageE.attribs.title,
                author,
                // eslint-disable-next-line no-await-in-loop
                description: '',
                pubDate: dateParser(new Date().toISOString()), // No Time for now
                link: homeUrl + pageE.attribs.href,
            });
        }
    }

    ctx.state.data = {
        title,
        link: mangaUrl,
        description: '',
        language: ctx.params.lang,
        item: items,
    };
};
