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

function parseDetailResponse(html, url) {
    log("Parsing Stream for: " + url);
    try {
        if (url.includes("?id=") && url.includes("&server=")) {
            var server = (url.match(/server=([^&]+)/) || [])[1];
            var tapStr = (url.match(/tap=(\d+)/) || [])[1];
            var tap = parseInt(tapStr, 10);
            
            if (server && tap) {
                // Tìm block chứa data-episodes của server tương ứng
                var epBlockRegex = new RegExp('data-server=["\']' + server + '["\'][\\s\\S]*?data-episodes=([\'"])([\\s\\S]*?)\\1', "i");
                var epBlockMatch = html.match(epBlockRegex);
                
                if (epBlockMatch) {
                    var rawEpisodes = epBlockMatch[2];
                    var epRegex = /{"([^"]+)","([^"]+)"}/g;
                    var epMatch;
                    var currentIndex = 1;
                    while ((epMatch = epRegex.exec(rawEpisodes)) !== null) {
                        if (currentIndex === tap) {
                            var rawSrc = epMatch[1];
                            // Giải mã XOR với khóa 42 để lấy link abyssplayer.com thật
                            var decrypted = "";
                            for (var i = 0; i < rawSrc.length; i++) {
                                decrypted += String.fromCharCode(rawSrc.charCodeAt(i) ^ 42);
                            }
                            decrypted = decrypted.replace(/https?:\/\/(short\.ink|short\.icu)\//g, "https://abyssplayer.com/");
                            log("Decrypted Stream URL: " + decrypted);
                            
                            if (decrypted.indexOf(".m3u8") !== -1) {
                                return JSON.stringify({
                                    url: decrypted,
                                    mimeType: "application/x-mpegURL",
                                    isEmbed: false
                                });
                            } else {
                                var isAbyss = decrypted.indexOf("abyssplayer.com") !== -1 || 
                                              decrypted.indexOf("abyss.to") !== -1 || 
                                              decrypted.indexOf("short.ink") !== -1 || 
                                              decrypted.indexOf("short.icu") !== -1;
                                
                                if (isAbyss) {
                                    // Tạo trang HTML bọc iframe của abyssplayer để tránh redirect bypass sang abyss.to
                                    var iframeHtml = '<html><body style="margin:0;padding:0;background:#000;"><iframe src="' + decrypted + '" style="width:100%;height:100%;border:none;" allowfullscreen></iframe></body></html>';
                                    var base64Url = "data:text/html;base64," + base64Encode(iframeHtml);
                                    
                                    return JSON.stringify({
                                        url: base64Url,
                                        isEmbed: true,
                                        headers: { "Referer": BASE_URL + "/" }
                                    });
                                } else {
                                    // Các link khác (như blogger.com) trả về trực tiếp để tránh WebView chặn load data URL
                                    return JSON.stringify({
                                        url: decrypted,
                                        isEmbed: true,
                                        headers: { "Referer": BASE_URL + "/" }
                                    });
                                }
                            }
                        }
                        currentIndex++;
                    }
                }
            }
        }

        var iframeMatch = html.match(/<iframe[^>]*src="([^"]+)"/i);
        if (iframeMatch) {
            var embedUrl = iframeMatch[1];
            log("Found iframe in HTML: " + embedUrl);
            if (embedUrl.startsWith("//")) embedUrl = "https:" + embedUrl;
            if (embedUrl === url || embedUrl.length < 5) {
                return JSON.stringify({ url: url, isEmbed: true, headers: { "Referer": BASE_URL } });
            }
            return JSON.stringify({ url: embedUrl, headers: { "Referer": BASE_URL }, isEmbed: true });
        }

        var m3u8 = html.match(/(https?:\/\/[^"' ]+\.m3u8[^"' ]*)/i);
        if (m3u8) {
            log("Found direct M3U8: " + m3u8[1]);
            return JSON.stringify({ url: m3u8[1], mimeType: "application/x-mpegURL", isEmbed: false });
        }

        log("No stream found, returning fallback URL");
        return JSON.stringify({ url: url, isEmbed: true, headers: { "Referer": BASE_URL } });
    } catch (e) { 
        log("Error in parseDetailResponse: " + e.message);
        return JSON.stringify({ url: "", isEmbed: false }); 
    }
}
  
function parseCategoriesResponse(html) { return "[]"; }
function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }