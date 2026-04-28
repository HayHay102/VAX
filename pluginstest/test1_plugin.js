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
                ? decodeHtmlEntities(titleMatch[1])
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
// FIX HTML ENTITY TITLE
// ========================================================

function decodeHtmlEntities(str) {
    if (!str) return "";

    return str
        .replace(/&#8211;/g, "-")
        .replace(/&#8212;/g, "-")
        .replace(/&#8220;/g, '"')
        .replace(/&#8221;/g, '"')
        .replace(/&#8216;/g, "'")
        .replace(/&#8217;/g, "'")
        .replace(/&#038;/g, "&")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, " ")
        .trim();
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

        // =========================
        // PARSE SERVER + EPISODES
        // =========================
        let servers = [];
        let usedServer = {};

        // lấy từng block episodeGroup
        const groupRegex =
            /class="episodeGroup"[^>]*data-server="([^"]+)"[^>]*data-episodes='([^']+)'/gi;

        let match;

        while ((match = groupRegex.exec(html)) !== null) {
            const serverId = match[1];
            const episodeRaw = match[2];

            if (usedServer[serverId]) continue;
            usedServer[serverId] = true;

            let episodes = [];

            try {
                // lấy tên tập trong data-episodes
                const epRegex = /"([^"]+)"\s*}/g;
                let epMatch;
                let usedEpisode = {};

                while ((epMatch = epRegex.exec(episodeRaw)) !== null) {
                    const epName = epMatch[1];

                    if (usedEpisode[epName]) continue;
                    usedEpisode[epName] = true;

                    episodes.push({
                        id:
                            movieUrl +
                            "?server=" +
                            encodeURIComponent(serverId) +
                            "&tap=" +
                            encodeURIComponent(epName),

                        name:
                            epName.toLowerCase() === "full"
                                ? "Full"
                                : "Tập " + epName,

                        slug: epName
                    });
                }

            } catch (e) {}

            // fallback nếu parse lỗi
            if (episodes.length === 0) {
                episodes.push({
                    id:
                        movieUrl +
                        "?server=" +
                        encodeURIComponent(serverId),
                    name: "Full",
                    slug: "full"
                });
            }

            servers.push({
                name: serverId.toUpperCase(),
                episodes: episodes
            });
        }

        // =========================
        // fallback nếu không có server
        // =========================
        if (servers.length === 0) {
            servers.push({
                name: "Default",
                episodes: [
                    {
                        id: movieUrl,
                        name: "Full",
                        slug: "full"
                    }
                ]
            });
        }

        // =========================
        // RETURN
        // =========================
        return JSON.stringify({
            id: movieUrl,
            title: decodeHtmlEntities(
                title.replace(" - Siêu Tầm Phim", "").trim()
            ),
            posterUrl: poster,
            backdropUrl: poster,
            description: description,
            servers: servers,
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
        // =========================
        // 1. Tìm link m3u8 trực tiếp
        // =========================
        let m3u8Match = html.match(
            /(https?:\/\/[^"' ]+\.m3u8[^"' ]*)/i
        );

        if (m3u8Match) {
            return JSON.stringify({
                url: m3u8Match[1],
                headers: {
                    Referer: "https://www.sieutamphim.pro/"
                },
                mimeType: "application/x-mpegURL"
            });
        }

        // =========================
        // 2. Tìm link mp4 trực tiếp
        // =========================
        let mp4Match = html.match(
            /(https?:\/\/[^"' ]+\.mp4[^"' ]*)/i
        );

        if (mp4Match) {
            return JSON.stringify({
                url: mp4Match[1],
                headers: {
                    Referer: "https://www.sieutamphim.pro/"
                }
            });
        }

        // =========================
        // 3. Tìm iframe player
        // =========================
        let iframeMatch = html.match(
            /<iframe[^>]+src="([^"]+)"/i
        );

        if (iframeMatch) {
            let iframeUrl = iframeMatch[1];

            if (iframeUrl.startsWith("//")) {
                iframeUrl = "https:" + iframeUrl;
            }

            return JSON.stringify({
                url: iframeUrl,
                isEmbed: true,
                headers: {
                    Referer: "https://www.sieutamphim.pro/"
                }
            });
        }

        // =========================
        // 4. JWPlayer source
        // =========================
        let fileMatch = html.match(
            /file\s*:\s*"([^"]+)"/i
        );

        if (fileMatch) {
            return JSON.stringify({
                url: fileMatch[1],
                headers: {
                    Referer: "https://www.sieutamphim.pro/"
                },
                mimeType: "application/x-mpegURL"
            });
        }

        // =========================
        // 5. Không mở web nữa
        // =========================
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

function parseEmbedResponse(html, sourceUrl) {
    try {
        // m3u8
        let m3u8Match = html.match(
            /(https?:\/\/[^"' ]+\.m3u8[^"' ]*)/i
        );

        if (m3u8Match) {
            return JSON.stringify({
                url: m3u8Match[1],
                isEmbed: false,
                mimeType: "application/x-mpegURL"
            });
        }

        // mp4
        let mp4Match = html.match(
            /(https?:\/\/[^"' ]+\.mp4[^"' ]*)/i
        );

        if (mp4Match) {
            return JSON.stringify({
                url: mp4Match[1],
                isEmbed: false
            });
        }

        // source/file json
        let fileMatch = html.match(
            /["']file["']\s*:\s*["']([^"']+)["']/i
        );

        if (fileMatch) {
            return JSON.stringify({
                url: fileMatch[1],
                isEmbed: false,
                mimeType: "application/x-mpegURL"
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
  
function parseCategoriesResponse(html) { return "[]"; }
function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }