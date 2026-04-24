// ========================================================
// SIÊU TẦM PHIM VAAPP PLUGIN
// ========================================================

const baseUrl = "https://www.sieutamphim.pro";

// ========================================================
// MANIFEST
// ========================================================

function getManifest() {
    return JSON.stringify({
        "id": "STPhim",
        "name": "Siêu Tầm Phim",
        "version": "1.0.1",
        "baseUrl": "https://www.sieutamphim.pro",
        "iconUrl": "https://www.sieutamphim.pro/posts/2024/06/cropped-logosieutamphim-192x192.png",
        "isEnabled": true,
        "isAdult": false,
        "type": "MOVIE",
        "playerType": "embed",
        "layoutType": "VERTICAL"
    });
}

// ========================================================
// HOME
// ========================================================

function getHomeSections() {
    return JSON.stringify([
        { slug: 'phim-moi', title: 'Phim Mới', type: 'Horizontal', path: 'search/label' },
        { slug: 'phim-le', title: 'Phim Lẻ', type: 'Horizontal', path: 'search/label' },
        { slug: 'phim-bo', title: 'Phim Bộ', type: 'Horizontal', path: 'search/label' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Phim Bộ', slug: 'phim-bo' },
        { name: 'Phím Mới', slug: 'phim-moi' },
        { name: 'Kinh Dị', slug: 'kinh-di' },
        { name: 'Hoạt Hình', slug: 'hoat-hinh' }
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
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = filters.page || 1;

        var start = (page - 1) * 24;

        return baseUrl + "/search/label/" + slug +
            "?max-results=24&start=" + start;

    } catch (e) {
        return baseUrl;
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = filters.page || 1;

        var start = (page - 1) * 24;

        return baseUrl +
            "/search?q=" +
            encodeURIComponent(keyword) +
            "&max-results=24&start=" + start;

    } catch (e) {
        return baseUrl;
    }
}

function getUrlDetail(slug) {
    if (slug.startsWith("http")) {
        return slug;
    }

    if (slug.includes(".html")) {
        return baseUrl + "/" + slug;
    }

    return baseUrl + "/" + slug;
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// ========================================================
// LIST PARSER
// ========================================================

function parseListResponse(html) {
    try {
        var items = [];

        var regex = /<a[^>]*href="(https:\/\/www\.sieutamphim\.pro\/[^"]+\.html)"[^>]*>[\s\S]*?<img[^>]*src="([^"]+)"[\s\S]*?<h2[^>]*>([^<]+)<\/h2>/g;

        var match;

        while ((match = regex.exec(html)) !== null) {
            items.push({
                id: match[1],
                title: cleanText(match[3]),
                posterUrl: match[2]
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
// MOVIE DETAIL
// ========================================================

function parseMovieDetail(html) {
    try {
        var title = "";
        var poster = "";
        var description = "";

        var titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/);
        if (titleMatch) {
            title = cleanText(titleMatch[1]);
        }

        var posterMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
        if (posterMatch) {
            poster = posterMatch[1];
        }

        var descMatch = html.match(/<meta name="description" content="([^"]+)"/);
        if (descMatch) {
            description = cleanText(descMatch[1]);
        }

        var episodes = [];

        var episodeRegex = /<a[^>]*href="([^"]+\?server=[^"]+&tap=\d+)"[^>]*>([^<]+)<\/a>/g;
        var match;

        while ((match = episodeRegex.exec(html)) !== null) {
            var epUrl = match[1];

            if (!epUrl.startsWith("http")) {
                epUrl = baseUrl + epUrl;
            }

            episodes.push({
                id: epUrl,
                name: cleanText(match[2]),
                slug: cleanText(match[2])
            });
        }

        // nếu không có tập thì phát trực tiếp
        if (episodes.length === 0) {
            episodes.push({
                id: getCurrentPageUrl(html),
                name: "Xem phim",
                slug: "full"
            });
        }

        return JSON.stringify({
            id: "",
            title: title,
            posterUrl: poster,
            backdropUrl: poster,
            description: description,
            quality: "HD",
            status: "Completed",
            servers: [
                {
                    name: "Server HX",
                    episodes: episodes
                }
            ]
        });

    } catch (e) {
        return JSON.stringify({
            servers: []
        });
    }
}

// ========================================================
// VIDEO PARSER
// ========================================================

function parseDetailResponse(html) {
    try {
        // m3u8
        var m3u8Match = html.match(/https?:\/\/[^"' ]+\.m3u8[^"' ]*/);
        if (m3u8Match) {
            return JSON.stringify({
                url: m3u8Match[0],
                headers: {
                    Referer: baseUrl
                },
                subtitles: []
            });
        }

        // mp4
        var mp4Match = html.match(/https?:\/\/[^"' ]+\.mp4[^"' ]*/);
        if (mp4Match) {
            return JSON.stringify({
                url: mp4Match[0],
                headers: {
                    Referer: baseUrl
                },
                subtitles: []
            });
        }

        // jwplayer
        var jwMatch = html.match(/file:\s*["'](https?:\/\/[^"']+)["']/);
        if (jwMatch) {
            return JSON.stringify({
                url: jwMatch[1],
                headers: {
                    Referer: baseUrl
                }
            });
        }

        // iframe
        var iframeMatch = html.match(/<iframe[^>]+src="([^"]+)"/);
        if (iframeMatch) {
            return JSON.stringify({
                url: iframeMatch[1],
                isEmbed: true
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
// EMBED PARSER
// ========================================================

function parseEmbedResponse(html, sourceUrl) {
    try {
        var m3u8Match = html.match(/https?:\/\/[^"' ]+\.m3u8[^"' ]*/);

        if (m3u8Match) {
            return JSON.stringify({
                url: m3u8Match[0],
                isEmbed: false,
                headers: {
                    Referer: sourceUrl
                }
            });
        }

        var mp4Match = html.match(/https?:\/\/[^"' ]+\.mp4[^"' ]*/);

        if (mp4Match) {
            return JSON.stringify({
                url: mp4Match[0],
                isEmbed: false,
                headers: {
                    Referer: sourceUrl
                }
            });
        }

        var iframeMatch = html.match(/<iframe[^>]+src="([^"]+)"/);

        if (iframeMatch) {
            return JSON.stringify({
                url: iframeMatch[1],
                isEmbed: true
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
// HELPERS
// ========================================================

function cleanText(text) {
    if (!text) return "";

    return text
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .trim();
}

function getCurrentPageUrl(html) {
    var match = html.match(/<link rel="canonical" href="([^"]+)"/);
    return match ? match[1] : "";
}

// ========================================================

function parseCategoriesResponse(html) {
    return "[]";
}

function parseCountriesResponse(html) {
    return "[]";
}

function parseYearsResponse(html) {
    return "[]";
}