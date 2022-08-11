const got = require('@/utils/got');
const cheerio = require('cheerio');
const { ProcessFeed } = require('@/v2/kxmhcc/utils');

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

    const items = await ProcessFeed(chapterList, ctx.cache, mangaUrl, author);

    ctx.state.data = {
        title: manhuaTitle,
        link: mangaUrl,
        description,
        language: ctx.params.lang,
        item: items,
    };
};
