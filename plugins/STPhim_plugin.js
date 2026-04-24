// =============================================================================
// SIÊU TẦM PHIM PLUGIN
// =============================================================================

// =============================================================================
// CONFIG
// =============================================================================


function getManifest() {
    return JSON.stringify({
        id: "STPhim",
        name: "Siêu Tầm Phim",
        version: "1.0.1",
        baseUrl: BASE_URL,
        iconUrl: BASE_URL + "https://www.sieutamphim.pro/posts/2024/06/cropped-logosieutamphim-192x192.png",
        isEnabled: true,
        isAdult: false,
        type: "MOVIE",
        layoutType: "VERTICAL",
        playerType: "auto"
    });
}

function getHomeSections() {
    return JSON.stringify([
        {
            slug: "phim-le",
            title: "Phim Lẻ",
            type: "Horizontal",
            path: "search/label"
        },
        {
            slug: "phim-bo",
            title: "Phim Bộ",
            type: "Horizontal",
            path: "search/label"
        },
        {
            slug: "phim-chieu-rap",
            title: "Phim Chiếu Rạp",
            type: "Horizontal",
            path: "search/label"
        }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: "Hành Động", slug: "hanh-dong" },
        { name: "Tình Cảm", slug: "tinh-cam" },
        { name: "Kinh Dị", slug: "kinh-di" },
        { name: "Hoạt Hình", slug: "hoat-hinh" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [],
        category: []
    });
}

// =============================================================================
// URL FUNCTIONS
// =============================================================================

function getUrlList(slug, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;

    return BASE_URL + "/" + slug + "/page/" + page;
}

function getUrlSearch(keyword, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;

    return BASE_URL + "/search/" +
        encodeURIComponent(keyword) +
        "/page/" + page;
}

function getUrlDetail(slug) {
    return BASE_URL + "/phim/" + slug;
}

function getUrlCategories() {
    return "";
}

function getUrlCountries() {
    return "";
}

function getUrlYears() {
    return "";
}

// =============================================================================
// PARSE LIST
// =============================================================================

function parseListResponse(html) {
    try {
        var items = [];

        var regex = /<a[^>]*href="https:\/\/www\.sieutamphim\.pro\/phim\/([^"]+)"[^>]*>[\s\S]*?<img[^>]*src="([^"]+)"[\s\S]*?<h3[^>]*>([^<]+)<\/h3>/g;

        var match;
        while ((match = regex.exec(html)) !== null) {
            items.push({
                id: match[1],
                title: match[3].trim(),
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

// =============================================================================
// PARSE MOVIE DETAIL
// =============================================================================

function parseMovieDetail(html) {
    try {
        var titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/);
        var posterMatch = html.match(/<img[^>]*class="[^"]*poster[^"]*"[^>]*src="([^"]+)"/);

        var title = titleMatch ? titleMatch[1].trim() : "Không rõ";
        var poster = posterMatch ? posterMatch[1] : "";

        var episodes = [];
        var epRegex = /<a[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/g;

        var match;
        while ((match = epRegex.exec(html)) !== null) {
            episodes.push({
                id: match[1],
                name: match[2].trim(),
                slug: match[2].trim()
            });
        }

        return JSON.stringify({
            id: "",
            title: title,
            posterUrl: poster,
            backdropUrl: poster,
            description: "",
            servers: [
                {
                    name: "Server 1",
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

// =============================================================================
// PARSE VIDEO LINK
// =============================================================================

function parseDetailResponse(html) {
    try {
        var m3u8Match = html.match(/(https?:\/\/[^"' ]+\.m3u8[^"' ]*)/);

        if (m3u8Match) {
            return JSON.stringify({
                url: m3u8Match[1],
                headers: {
                    Referer: BASE_URL
                },
                subtitles: []
            });
        }

        var mp4Match = html.match(/(https?:\/\/[^"' ]+\.mp4[^"' ]*)/);

        if (mp4Match) {
            return JSON.stringify({
                url: mp4Match[1],
                headers: {
                    Referer: BASE_URL
                },
                subtitles: []
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

// =============================================================================
// OPTIONAL EMBED PARSER
// =============================================================================

function parseEmbedResponse(html, sourceUrl) {
    return JSON.stringify({
        url: "",
        isEmbed: false
    });
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