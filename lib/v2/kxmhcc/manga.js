const got = require('@/utils/got');
const dateParser = require('@/utils/dateParser');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const paramId = ctx.params.id;
    const homeUrl = 'http://www.kxmh.cc';
    const mangaUrl = `http://www.kxmh.cc/manga/${paramId}/`;
    const episodeUrlPrefix = 'http://www.kxmh.cc';

    const manhuaPage = await got.get(mangaUrl, {
        headers: {
            Referer: homeUrl,
        },
    });
    const $ = cheerio.load(manhuaPage.data);
    let manhuaTitle = paramId;
    let author = '';
    let description = '';
    for (const meta of $('meta')) {
        if (meta.attribs.property) {
            if (meta.attribs.property.endsWith('author')) {
                author = meta.attribs.content;
            } else if (meta.attribs.property === 'og:title') {
                manhuaTitle = meta.attribs.content;
            } else if (meta.attribs.property === 'og:description') {
                description = meta.attribs.content;
            }
        }
    }

    let chapterList = [];
    for (const chapter of $('#j_chapter_list').find('a')) {
        chapterList.push({
            title: chapter.attribs.title,
            href: episodeUrlPrefix + chapter.attribs.href,
        });
    }
    if (chapterList.length > 10) {
        chapterList = chapterList.slice(chapterList.length - 10);
    }

    ctx.state.data = {
        title: manhuaTitle,
        link: mangaUrl,
        description,
        language: ctx.params.lang,
        item: chapterList.map(async (e) => ({
            title: e.title.trim(),
            author,
            description: await ctx.cache.tryGet(e.href, async () => {
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
            }),
            pubDate: dateParser(new Date().toISOString()), // No Time for now
            link: e.href,
        })),
    };
};
