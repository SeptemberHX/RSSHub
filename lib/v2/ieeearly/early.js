const got = require('@/utils/got');
const { CookieJar } = require('tough-cookie');
const cookieJar = new CookieJar();

module.exports = async (ctx) => {
    const pubId = ctx.params.pub;
    const issueId = ctx.params.issue;
    const remoteUrl = `https://ieeexplore.ieee.org/rest/search/pub/${pubId}/issue/${issueId}/toc`;

    const host = 'https://ieeexplore.ieee.org';
    const jrnlUrl = `${host}/xpl/mostRecentIssue.jsp?punumber=${pubId}`;

    const response = await got(`${host}/rest/publication/home/metadata?pubid=${pubId}`, {
        cookieJar,
    }).json();
    const jrnlName = response.displayTitle;

    const response2 = await got
        .post(remoteUrl, {
            cookieJar,
            json: {
                isnumber: issueId,
                sortType: 'vol-only-newest',
                punumber: pubId,
            },
        })
        .json();

    const list = [];
    if ('records' in response2) {
        for (const record of response2.records) {
            const authors = [];
            for (const author of record.authors) {
                authors.push(author.preferredName);
            }
            list.push({
                abstract: record.abstract,
                description: record.abstract,
                link: `https://ieeexplore.ieee.org${record.documentLink}`,
                title: record.articleTitle,
                author: authors.join(', '),
            });
        }
    }

    ctx.state.data = {
        title: jrnlName,
        link: jrnlUrl,
        item: list,
    };
};
