const got = require('@/utils/got');
const { CookieJar } = require('tough-cookie');
new CookieJar();
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const tid = ctx.params.tid;
    const keyword = ctx.params.keyword;

    const remoteUrl = `https://www.btbtt27.com/${tid}.htm`;
    const response = await got({
        method: 'GET',
        url: remoteUrl,
    });

    // 使用 cheerio 解析 HTML
    const $ = cheerio.load(response.body);

    // 提取并处理 meta description
    let title = $('meta[name="description"]').attr('content');
    title = title.replace('◎译　　名', '').trim();
    const results = [];

    // 遍历所有 div.bg1.border.post 元素
    $('div.bg1.border.post').each((i, elem) => {
        if (i === 0) {
            return;
        }

        // 检查是否包含指定的字符串
        if ($(elem).text().includes(keyword)) {
            // 如果包含，则将其添加到结果数组中
            results.push($(elem).html());
        }
    });

    const items = [];

    if (results.length > 0) {
        const firstResult = results[0];
        const $ = cheerio.load(firstResult);

        $('tbody tr').each((i, elem) => {
            if (i > 0) {
                // 跳过标题行
                const link = $(elem).find('a').attr('href');
                if (!link || link.length === 0) {
                    return;
                }

                const text = $(elem).find('a').text();
                items.push({
                    title: text,
                    link,
                    text,
                    description: text,
                });
            }
        });
    }

    ctx.state.data = {
        title,
        link: remoteUrl,
        item: items.reverse(),
    };
};
