const got = require('@/utils/got');
const cheerio = require('cheerio');
const dateParser = require('@/utils/dateParser');

// eslint-disable-next-line require-await
const ProcessFeed = async (list, cache, mangaUrl, author) => {
    const items = await Promise.all(
        list.map(async (e) => {
            const description = await cache.tryGet(e.href, async () => {
                const chapterPage = await got.get(e.href, {
                    headers: {
                        Referer: mangaUrl,
                        'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.81 Mobile Safari/537.36 Edg/104.0.1293.47',
                    },
                });
                const $ = cheerio.load(chapterPage.data);
                let page = '';
                for (const figure of $('#imgsec').find('img')) {
                    page += `<figure><img src="${figure.attribs['data-src']}"></figure>\n`;
                }
                return page;
            });
            return {
                title: e.title.trim(),
                author,
                // eslint-disable-next-line no-await-in-loop
                description,
                pubDate: dateParser(new Date().toISOString()), // No Time for now
                link: e.href,
            };
        })
    );

    return items;
};

module.exports = {
    ProcessFeed,
};
