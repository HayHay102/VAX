// ========================================================
// SIÊU TẦM PHIM VAAPP PLUGIN (FIX FULL)
// ========================================================

const BASE_URL = "https://www.sieutamphim.pro";

// ========================================================
// MANIFEST
// ========================================================

function getManifest() {
    return JSON.stringify({
        "id": "test1",
        "name": "Sưu Tầm Phim",
        "version": "1.0.1",
        "baseUrl": "https://www.sieutamphim.pro",
        "iconUrl": "https://www.sieutamphim.pro/posts/2024/06/cropped-logosieutamphim-192x192.png",
        "isEnabled": true,
        "isAdult": false,
        "type": "MOVIE",
        "layoutType": "VERTICAL",
        "playerType": "embed"
    });
}
// ========================================================
// HOME
// ========================================================

function getHomeSections() {
    return JSON.stringify([
        { slug: "phim-bo", title: "Phim Bộ", type: "Horizontal" },
        { slug: "phim-le", title: "Phim Lẻ", type: "Horizontal" },
        { slug: "long-tieng", title: "Phim Lồng Tiếng", type: "Horizontal" },
        { slug: "phim-moi", title: "Mới cập nhật", type: "Grid" }
    ]);
}
// ========================================================
// CATEGORY
// ========================================================

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'IQIYI', slug: 'iqiyi' },
        { name: 'Netflix', slug: 'netflix' },
        { name: 'CGV Cinemas VN', slug: 'cgv-cinemas-vietnam' },
        { name: 'VieON', slug: 'vieon' },
        { name: 'Kplus', slug: 'kplus' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [],
        category: []
    });
}

// ========================================================
// URL
// ========================================================

function getUrlList(slug, filtersJson) {
    const filters = JSON.parse(filtersJson || "{}");
    const page = filters.page || 1;

    if (page === 1) {
        return `${BASE_URL}/search/label/${slug}`;
    }

    return `${BASE_URL}/search/label/${slug}/page/${page}`;
}

function getUrlSearch(keyword, filtersJson) {
    const filters = JSON.parse(filtersJson || "{}");
    const page = filters.page || 1;

    return `${BASE_URL}/page/${page}?s=${encodeURIComponent(keyword)}`;
}

function getUrlDetail(id) {
    return id.startsWith("http") ? id : BASE_URL + "/" + id;
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// ========================================================
// PARSE LIST (FIX CLICK SAI PHIM)
// ========================================================

function parseListResponse(html) {
    try {
        let items = [];
        let used = {};

        // tách từng block phim
        const blockRegex = /<div[^>]*class="[^"]*box-image[^"]*"[\s\S]*?<\/div>\s*<\/div>/gi;
        let block;

        while ((block = blockRegex.exec(html)) !== null) {
            let blockHtml = block[0];

            // link phim
            let urlMatch = blockHtml.match(/<a[^>]+href="([^"]+\.html)"/i);
            if (!urlMatch) continue;

            let url = urlMatch[1];

            if (!url.startsWith("http")) {
                url = BASE_URL + url;
            }

            if (used[url]) continue;
            used[url] = true;

            // title
            let titleMatch =
                blockHtml.match(/alt="([^"]+)"/i) ||
                blockHtml.match(/title="([^"]+)"/i);

            let title = titleMatch
                ? titleMatch[1].trim()
                : "Unknown";

            // poster (ưu tiên nhiều kiểu)
            let posterMatch =
                blockHtml.match(/data-lazy-src="([^"]+)"/i) ||
                blockHtml.match(/data-src="([^"]+)"/i) ||
                blockHtml.match(/src="([^"]+)"/i) ||
                blockHtml.match(/srcset="([^"]+)"/i);

            let poster = posterMatch ? posterMatch[1] : "";

            // nếu srcset -> lấy ảnh đầu tiên
            if (poster.includes(",")) {
                poster = poster.split(",")[0].trim().split(" ")[0];
            }

            // fix protocol //
            if (poster.startsWith("//")) {
                poster = "https:" + poster;
            }

            items.push({
                id: url,
                title: title,
                posterUrl: poster
            });
        }

        return JSON.stringify({
            items: items,
            pagination: {
                currentPage: 1,
                totalPages: 999
            }
        });

    } catch (e) {
        return JSON.stringify({
            items: [],
            pagination: {
                currentPage: 1,
                totalPages: 1
            }
        });
    }
}

function parseSearchResponse(html) {
    return parseListResponse(html);
}

// ========================================================
// PARSE DETAIL
// ========================================================

function parseMovieDetail(html) {
    try {
        const title =
            (html.match(/<meta property="og:title" content="([^"]+)"/i) || [])[1] ||
            (html.match(/<title>(.*?)<\/title>/i) || [])[1] ||
            "Unknown";

        const poster =
            (html.match(/<meta property="og:image" content="([^"]+)"/i) || [])[1] ||
            "";

        const description =
            (html.match(/<meta property="og:description" content="([^"]+)"/i) || [])[1] ||
            "";

        const movieUrl =
            (html.match(/<meta property="og:url" content="([^"]+)"/i) || [])[1] ||
            "";

        let episodes = [];
        let usedEp = {};

        const epRegex = /href="([^"]+\?server=[^"]+tap=\d+)"/gi;
        let epMatch;

        while ((epMatch = epRegex.exec(html)) !== null) {
            let epUrl = epMatch[1];

            if (!epUrl.startsWith("http")) {
                epUrl = BASE_URL + epUrl;
            }

            if (!usedEp[epUrl]) {
                usedEp[epUrl] = true;

                let epNum = episodes.length + 1;

                episodes.push({
                    id: epUrl,
                    name: "Tập " + epNum,
                    slug: String(epNum)
                });
            }
        }

        // phim lẻ
        if (episodes.length === 0) {
            episodes.push({
                id: movieUrl,
                name: "Full",
                slug: "full"
            });
        }

        return JSON.stringify({
            id: movieUrl,
            title: title.replace(" - Siêu Tầm Phim", "").trim(),
            posterUrl: poster,
            backdropUrl: poster,
            description: description,
            servers: [
                {
                    name: "Server 1",
                    episodes: episodes
                }
            ],
            quality: movie.quality || "",
            year: movie.year || 0,
            status: movie.status || ""
        });

    } catch (e) {
        return JSON.stringify({
            servers: []
        });
    }
}

// ========================================================
// PARSE VIDEO
// ========================================================

function parseDetailResponse(html) {
    try {
        let iframe = html.match(/<iframe[^>]+src="([^"]+)"/i);

        if (iframe) {
            return JSON.stringify({
                url: iframe[1],
                headers: {
                    Referer: BASE_URL
                },
                isEmbed: true
            });
        }

        let m3u8 = html.match(/(https?:\/\/[^"' ]+\.m3u8[^"' ]*)/i);

        if (m3u8) {
            return JSON.stringify({
                url: m3u8[1],
                mimeType: "application/x-mpegURL",
                isEmbed: false
            });
        }

        let mp4 = html.match(/(https?:\/\/[^"' ]+\.mp4[^"' ]*)/i);

        if (mp4) {
            return JSON.stringify({
                url: mp4[1],
                isEmbed: false
            });
        }

        return JSON.stringify({
            url: "",
            isEmbed: false
        });

    } catch (e) {
        return JSON.stringify({
            url: "",
            isEmbed: false
        });
    }
}

// ========================================================
// EMBED
// ========================================================

function parseEmbedResponse(html, sourceUrl) {
    return parseDetailResponse(html);
}

// ========================================================


function parseCategoriesResponse(html) { return "[]"; }
function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }