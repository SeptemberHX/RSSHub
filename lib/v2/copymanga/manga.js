module.exports = async (ctx) => {
    const mangaName = ctx.params.name;

    // 使用 RSSHub 提供的 puppeteer 工具类，初始化 Chrome 进程
    const browser = await require('@/utils/puppeteer')();
    // 创建一个新的浏览器页面
    const page = await browser.newPage();
    const link = `https://www.copymanga.site/comic/${mangaName}`;
    await page.goto(link);
    await page.waitForSelector('#default全部');
    const items = await page.evaluate(() => {
        const items = [];
        const elDiv = document.querySelector('div#default全部');
        if (elDiv) {
            for (const itemEl of elDiv.querySelectorAll('a')) {
                items.push({
                    title: itemEl.text,
                    description: itemEl.text,
                    abstract: itemEl.text,
                    link: itemEl.href,
                });
            }
        }
        return [items, document.title];
    });
    browser.close();

    ctx.state.data = {
        title: items[1],
        link,
        item: items[0],
    };
};
