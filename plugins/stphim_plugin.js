// ========================================================
// SIÊU TẦM PHIM VAAPP PLUGIN
// ========================================================

const BASE_URL = "https://www.sieutamphim.pro";

// ========================================================
// MANIFEST
// ========================================================

function getManifest() {
    return JSON.stringify({
        "id": "stphim",
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
        { slug: 'phim-le', title: 'Phim Lẻ', type: 'Horizontal', path: 'search/label' },
        { slug: 'phim-bo', title: 'Phim Bộ', type: 'Horizontal', path: 'search/label' },
        { slug: 'long-tieng', title: 'Phim Lồng Tiếng', type: 'Horizontal', path: 'search/label' },        
        { slug: 'phim-moi', title: 'Mới Cập Nhật', type: 'Horizontal', path: 'search/label' }
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

    return BASE_URL + "/search/label/" + slug + "/page/" + page;
}

function getUrlSearch(keyword, filtersJson) {
    const filters = JSON.parse(filtersJson || "{}");
    const page = filters.page || 1;

    return BASE_URL +
        "/page/" + page + "?s=" + encodeURIComponent(keyword);
}

function getUrlDetail(id) {
    if (id.startsWith("http")) {
        return id;
    }

    return BASE_URL + "/" + id;
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// ========================================================
// PARSE LIST
// ========================================================

function parseListResponse(html) {
    try {
        let items = [];
        let added = {};

        // chỉ lấy block phim chính
        const blockRegex = /<div class="col post-item[\s\S]*?<\/article>/g;
        const blocks = html.match(blockRegex) || [];

        for (let i = 0; i < blocks.length; i++) {
            let block = blocks[i];

            // link phim
            let linkMatch = block.match(
                /href="(https:\/\/www\.sieutamphim\.pro\/\d{4}\/\d{2}\/[^"]+\.html)"/
            );

            // ảnh
            let posterMatch = block.match(
                /<img[^>]+src="([^"]+)"/
            );

            // title
            let titleMatch = block.match(
                /aria-label="([^"]+)"/
            );

            if (linkMatch) {
                let url = linkMatch[1];

                // chống trùng
                if (added[url]) continue;
                added[url] = true;

                items.push({
                    id: url,
                    title: titleMatch ? titleMatch[1].trim() : "Unknown",
                    posterUrl: posterMatch ? posterMatch[1] : ""
                });
            }
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
// PARSE MOVIE DETAIL
// ========================================================

function parseMovieDetail(html) {
    try {
        const titleMatch = html.match(/<title>(.*?)<\/title>/i);
        const posterMatch = html.match(/property="og:image" content="([^"]+)"/i);
        const descMatch = html.match(/property="og:description" content="([^"]+)"/i);
        const urlMatch = html.match(/property="og:url" content="([^"]+)"/i);

        const title = titleMatch
            ? titleMatch[1].replace(" - Siêu Tầm Phim", "").trim()
            : "Unknown";

        const poster = posterMatch ? posterMatch[1] : "";
        const description = descMatch ? descMatch[1] : "";

        // lấy đúng URL hiện tại của phim
        const movieUrl = urlMatch ? urlMatch[1] : "";

        let episodes = [];

        const epRegex = /\?server=([^"&]+)&tap=([0-9]+)[^"]*">([^<]+)</g;
        let epMatch;

        while ((epMatch = epRegex.exec(html)) !== null) {
            episodes.push({
                id: movieUrl +
                    "?server=" +
                    epMatch[1] +
                    "&tap=" +
                    epMatch[2],

                name: epMatch[3].trim(),
                slug: epMatch[2]
            });
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
            title: title,
            posterUrl: poster,
            backdropUrl: poster,
            description: description,
            servers: [
                {
                    name: "Server 1",
                    episodes: episodes
                }
            ],
            quality: "HD",
            status: "Completed"
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

        // iframe
        let iframeMatch = html.match(/<iframe[^>]+src="([^"]+)"/i);

        if (iframeMatch) {
            return JSON.stringify({
                url: iframeMatch[1],
                headers: {
                    Referer: BASE_URL
                },
                isEmbed: true
            });
        }

        // m3u8
        let m3u8Match = html.match(/(https?:\/\/[^"' ]+\.m3u8[^"' ]*)/i);

        if (m3u8Match) {
            return JSON.stringify({
                url: m3u8Match[1],
                headers: {
                    Referer: BASE_URL
                },
                mimeType: "application/x-mpegURL"
            });
        }

        // mp4
        let mp4Match = html.match(/(https?:\/\/[^"' ]+\.mp4[^"' ]*)/i);

        if (mp4Match) {
            return JSON.stringify({
                url: mp4Match[1],
                headers: {
                    Referer: BASE_URL
                }
            });
        }

        return JSON.stringify({
            url: "",
            headers: {}
        });

    } catch (e) {
        return JSON.stringify({
            url: "",
            headers: {}
        });
    }
}

// ========================================================
// EMBED
// ========================================================

function parseEmbedResponse(html, sourceUrl) {
    try {

        let m3u8Match = html.match(/(https?:\/\/[^"' ]+\.m3u8[^"' ]*)/i);

        if (m3u8Match) {
            return JSON.stringify({
                url: m3u8Match[1],
                isEmbed: false,
                mimeType: "application/x-mpegURL"
            });
        }

        let mp4Match = html.match(/(https?:\/\/[^"' ]+\.mp4[^"' ]*)/i);

        if (mp4Match) {
            return JSON.stringify({
                url: mp4Match[1],
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

function parseCategoriesResponse(html) {
    return "[]";
}

function parseCountriesResponse(html) {
    return "[]";
}

function parseYearsResponse(html) {
    return "[]";
}