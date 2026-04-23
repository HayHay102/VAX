// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

const BASE_URL = "https://www.sieutamphim.pro";

function getManifest() {
    return JSON.stringify({
        id: "STPhim",
        name: "Siêu Tầm Phim",
        version: "1.0.0",
        baseUrl: BASE_URL,
        iconUrl: "https://www.sieutamphim.pro/posts/2024/06/cropped-logosieutamphim.png",
        isEnabled: true,
        isAdult: false,
        type: "MOVIE",
        playerType: "embed",
        layoutType: "VERTICAL"
    });
}

// =============================================================================
// HOME
// =============================================================================

function getHomeSections() {
    return JSON.stringify([
        { slug: "phim-hk-tk", title: "Phim Châu Á", type: "Horizontal", path: "category" },
        { slug: "phim-bo-kiem-hiep-co-trang", title: "Kiếm Hiệp Cổ Trang", type: "Horizontal", path: "category" },
        { slug: "tien-hiep-ngon-tinh", title: "Tiên Hiệp", type: "Horizontal", path: "category" },
        { slug: "ma-kinh-di", title: "Phim Ma", type: "Horizontal", path: "category" },
        { slug: "thap-nien-90", title: "Thập Niên 90", type: "Horizontal", path: "category" },
        { slug: "home", title: "Mới Cập Nhật", type: "Grid", path: "" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: "Kiếm Hiệp", slug: "phim-bo-kiem-hiep-co-trang" },
        { name: "Tiên Hiệp", slug: "tien-hiep-ngon-tinh" },
        { name: "Tâm Lý", slug: "tlhd" },
        { name: "Ma Kinh Dị", slug: "ma-kinh-di" },
        { name: "Châu Á", slug: "phim-hk-tk" },
        { name: "Âu Mỹ", slug: "dien-anh-tay" },
        { name: "Hàn Quốc", slug: "drama-hq-nb" },
        { name: "Anime", slug: "phim-hoat-hinh" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: "Cũ nhất", value: "oldest" },
            { name: "Mới nhất", value: "newest" }
        ]
    });
}

// =============================================================================
// URL FUNCTIONS
// =============================================================================

function getUrlList(slug, filtersJson) {
    const filters = JSON.parse(filtersJson || "{}");
    const page = filters.page || 1;

    if (!slug || slug === "home") {
        return page > 1
            ? `${BASE_URL}/page/${page}/`
            : `${BASE_URL}/`;
    }

    return page > 1
        ? `${BASE_URL}/category/${slug}/page/${page}/`
        : `${BASE_URL}/category/${slug}/`;
}

function getUrlSearch(keyword, filtersJson) {
    const filters = JSON.parse(filtersJson || "{}");
    const page = filters.page || 1;

    return page > 1
        ? `${BASE_URL}/page/${page}/?s=${encodeURIComponent(keyword)}`
        : `${BASE_URL}/?s=${encodeURIComponent(keyword)}`;
}

function getUrlDetail(slug) {
    if (!slug) return "";
    if (slug.startsWith("http")) return slug;

    return `${BASE_URL}/${slug}/`;
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }


// =============================================================================
// PARSE LIST
// =============================================================================

function parseListResponse(htmlResponse) {
    const items = [];
    const regex = /<article.*?>[\s\S]*?<a href="([^"]+)".*?>[\s\S]*?<img.*?src="([^"]+)".*?alt="([^"]+)"/gi;

    let match;

    while ((match = regex.exec(htmlResponse)) !== null) {
        const link = match[1];
        const poster = match[2];
        const title = match[3]
            .replace(/&#8211;/g, "-")
            .replace(/&#8217;/g, "'")
            .trim();

        const slugMatch = link.match(/sieutamphim\.pro\/([^\/]+)\/?/);
        const slug = slugMatch ? slugMatch[1] : link;

        let year = 0;
        const yearMatch = title.match(/(19\d{2}|20\d{2})/);

        if (yearMatch) {
            year = parseInt(yearMatch[1]);
        }

        items.push({
            id: slug,
            title: title,
            posterUrl: poster,
            backdropUrl: poster,
            year: year
        });
    }

    return JSON.stringify({
        items: items,
        pagination: {
            currentPage: 1,
            totalPages: 1
        }
    });
}

function parseSearchResponse(htmlResponse) {
    return parseListResponse(htmlResponse);
}


// =============================================================================
// MOVIE DETAIL
// =============================================================================

function parseMovieDetail(htmlResponse) {
    try {
        let title = "";
        let posterUrl = "";
        let description = "";

        const titleMatch = htmlResponse.match(
            /<h1 class="single-title">([^<]+)<\/h1>/i
        );

        if (titleMatch) {
            title = titleMatch[1].trim();
        }

        const posterMatch = htmlResponse.match(
            /<img[^>]*class="[^"]*wp-post-image[^"]*"[^>]*src="([^"]+)"/i
        );

        if (posterMatch) {
            posterUrl = posterMatch[1];
        }

        const descMatch = htmlResponse.match(
            /<div class="sigle-post-content-area">([\s\S]*?)<\/div>/i
        );

        if (descMatch) {
            description = descMatch[1]
                .replace(/<[^>]+>/g, "")
                .trim();
        }

        let episodes = [];
        const episodeRegex = /<a href="([^"]*clbpx\.html\?v=[^"]+)".*?>(.*?)<\/a>/gi;

        let ep;

        while ((ep = episodeRegex.exec(htmlResponse)) !== null) {
            episodes.push({
                id: ep[1],
                name: ep[2].replace(/<[^>]+>/g, "").trim() || "Phim",
                slug: ep[1]
            });
        }

        const servers = episodes.length > 0
            ? [
                {
                    name: "Server 1",
                    episodes: episodes
                }
            ]
            : [];

        return JSON.stringify({
            id: "",
            title: title,
            posterUrl: posterUrl,
            backdropUrl: posterUrl,
            description: description,
            year: 0,
            rating: 0,
            quality: "HD",
            servers: servers,
            category: "",
            country: "",
            director: "",
            casts: ""
        });

    } catch (e) {
        return "null";
    }
}


// =============================================================================
// PLAYER
// =============================================================================

function parseDetailResponse(htmlResponse, fallbackUrl) {
    try {
        return JSON.stringify({
            url: fallbackUrl || "",
            headers: {
                Referer: BASE_URL + "/",
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
            }
        });
    } catch (e) {
        return JSON.stringify({
            url: "",
            headers: {}
        });
    }
}function getPrimaryCategories() {
    return JSON.stringify([
        { name: "Kiếm Hiệp", slug: "phim-bo-kiem-hiep-co-trang" },
        { name: "Tiên Hiệp", slug: "tien-hiep-ngon-tinh" },
        { name: "Ma Kinh Dị", slug: "ma-kinh-di" },
        { name: "Anime", slug: "phim-hoat-hinh" },
        { name: "TV Series", slug: "phim-tv" }
    ]);
}

// =============================================================================
// URL
// =============================================================================

function getUrlList(slug, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;

    if (!slug || slug === "home") {
        return page > 1
            ? BASE_URL + "/page/" + page + "/"
            : BASE_URL + "/";
    }

    return page > 1
        ? BASE_URL + "/search/label/" + slug + "/page/" + page + "/"
        : BASE_URL + "/search/label/" + slug + "/";
}

function getUrlSearch(keyword, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;

    return page > 1
        ? BASE_URL + "/page/" + page + "/?s=" + encodeURIComponent(keyword)
        : BASE_URL + "/?s=" + encodeURIComponent(keyword);
}

function getUrlDetail(slug) {
    if (!slug) return "";
    if (slug.startsWith("http")) return slug;

    return BASE_URL + "/" + slug + "/";
}

// =============================================================================
// LIST PARSER
// =============================================================================

function parseListResponse(html) {
    let items = [];
    
    let regex = /<article[\s\S]*?<a href="([^"]+)"[\s\S]*?<img[^>]+src="([^"]+)"[^>]+alt="([^"]+)"/gi;
    let match;

    while ((match = regex.exec(html)) !== null) {
        let link = match[1];
        let image = match[2];
        let title = match[3];

        let slug = link
            .replace(BASE_URL, "")
            .replace(/\//g, "")
            .trim();

        items.push({
            id: slug,
            title: title,
            posterUrl: image,
            backdropUrl: image
        });
    }

    return JSON.stringify({
        items: items,
        pagination: {
            currentPage: 1,
            totalPages: 999
        }
    });
}

function parseSearchResponse(html) {
    return parseListResponse(html);
}

// =============================================================================
// DETAIL PARSER
// =============================================================================

function parseMovieDetail(html) {
    try {
        let title = "";
        let poster = "";
        let description = "";

        let titleMatch = html.match(/<h1[^>]*class="single-title"[^>]*>(.*?)<\/h1>/i);
        if (titleMatch) {
            title = titleMatch[1].trim();
        }

        let posterMatch = html.match(/<meta property="og:image" content="([^"]+)"/i);
        if (posterMatch) {
            poster = posterMatch[1];
        }

        let descMatch = html.match(/<meta property="og:description" content="([^"]+)"/i);
        if (descMatch) {
            description = descMatch[1];
        }

        let episodes = [];
        let linkRegex = /<a href="(https?:\/\/www\.sieutamphim\.pro\/[^"]+)"/gi;
        let linkMatch;

        while ((linkMatch = linkRegex.exec(html)) !== null) {
            episodes.push({
                id: linkMatch[1],
                name: "Xem Phim",
                slug: linkMatch[1]
            });
        }

        return JSON.stringify({
            title: title,
            posterUrl: poster,
            backdropUrl: poster,
            description: description,
            servers: [
                {
                    name: "Server 1",
                    episodes: episodes
                }
            ]
        });

    } catch (e) {
        return "null";
    }
}

// =============================================================================
// PLAYER
// =============================================================================

function parseDetailResponse(html, fallbackUrl) {
    return JSON.stringify({
        url: fallbackUrl,
        headers: {
            Referer: BASE_URL + "/",
            "User-Agent": "Mozilla/5.0"
        }
    });
}

// =============================================================================
// OPTIONAL
// =============================================================================

function getUrlCategories() {
    return "";
}

function getUrlCountries() {
    return "";
}

function getUrlYears() {
    return "";
}        { name: 'Điện Ảnh Châu Á', slug: 'phim-hk-tk' },
        { name: 'Điện Ảnh Âu Mỹ', slug: 'dien-anh-tay' },
        { name: 'Hàn Quốc', slug: 'drama-hq-nb' },
        { name: 'Anime', slug: 'phim-hoat-hinh' },
        { name: 'TV Series', slug: 'phim-tv' },
        { name: 'Thập Niên 60', slug: 'thap-nien-60' },
        { name: 'Thập Niên 70', slug: 'thap-nien-70' },
        { name: 'Thập Niên 80', slug: 'thap-nien-80' },
        { name: 'Thập Niên 90', slug: 'thap-nien-90' },
        { name: 'Thập Niên 2000', slug: 'thap-nien-2000' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: 'Cũ nhất', value: 'oldest' },
            { name: 'Mới nhất', value: 'newest' }
        ]
    });
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    var baseUrl = "https://sieutamphim.pro";

    // URL rule for typical WP sites
    if (slug === '' || slug === 'home') {
        if (page > 1) {
            return baseUrl + "/page/" + page + "/";
        }
        return baseUrl + "/";
    }

    // Otherwise category
    if (page > 1) {
        return baseUrl + "/search/label/" + slug + "/page/" + page + "/";
    }
    return baseUrl + "/search/label/" + slug + "/";
}

function getUrlSearch(keyword, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    // Tự động phân trang khi search (WordPress format)
    if (page > 1) {
        return "https://sieutamphim.pro/page/" + page + "/?s=" + encodeURIComponent(keyword);
    }
    return "https://sieutamphim.pro/?s=" + encodeURIComponent(keyword);
}

function getUrlDetail(slug) {
    if (!slug) return "";
    if (slug.indexOf("http") === 0) return slug;
    return "https://sieutamphim.pro/" + slug + "/";
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(htmlResponse) {
    var items = [];
    var regex = /<article.*?id="post-[^>]+>[\s\S]*?<a href="([^"]+)".*?>\s*<figure[\s\S]*?<img.*?src="([^"]+)".*?alt="([^"]+)".*?>/gi;
    var match;

    while ((match = regex.exec(htmlResponse)) !== null) {
        var link = match[1] || "";
        var thumb = match[2] || "";
        var title = match[3] || "";

        // Convert title that contains HTML entities
        title = title.replace(/&#8211;/g, '-').replace(/&#8217;/g, "'");

        var slugMatch = link.match(/sieutamphim\.pro\/([^\/]+)\/?/);
        var slug = slugMatch ? slugMatch[1] : link;

        // Try extracting year conditionally from title if present
        var year = 0;
        var yearMatch = title.match(/19\d{2}|20\d{2}/);
        if (yearMatch) {
            year = parseInt(yearMatch[0], 10);
        }

        items.push({
            id: slug, // Use slug, not full URL, so cross-source lookups work
            title: title.trim(),
            posterUrl: thumb,
            backdropUrl: thumb,
            year: year
        });
    }

    var totalPages = 1;
    var currentPage = 1;
    var pageRegex = /<a class="page-numbers".*?>(\d+)<\/a>/gi;
    var pm;
    while ((pm = pageRegex.exec(htmlResponse)) !== null) {
        if (parseInt(pm[1]) > totalPages) {
            totalPages = parseInt(pm[1]);
        }
    }
    var curPageMatch = htmlResponse.match(/<span aria-current="page" class="page-numbers current">(\d+)<\/span>/i);
    if (curPageMatch) {
        currentPage = parseInt(curPageMatch[1]);
        if (currentPage > totalPages) totalPages = currentPage;
    }

    return JSON.stringify({
        items: items,
        pagination: {
            currentPage: currentPage,
            totalPages: totalPages
        }
    });
}

function parseSearchResponse(htmlResponse) {
    return parseListResponse(htmlResponse);
}

function parseMovieDetail(htmlResponse) {
    try {
        var id = "";
        var title = "";
        var posterUrl = "";
        var description = "";

        var titleMatch = htmlResponse.match(/<h1 class="single-title">([^<]+)<\/h1>/i);
        if (titleMatch) title = titleMatch[1].trim();

        // Convert html entities
        title = title.replace(/&#8211;/g, '-').replace(/&#8217;/g, "'");

        // Try wp-post-image class first (most reliable for WordPress)
        var posterMatch = htmlResponse.match(/<img[^>]*class="[^"]*wp-post-image[^"]*"[^>]*src="([^"]+)"/i);
        if (!posterMatch) {
            // Try src before class
            posterMatch = htmlResponse.match(/<img[^>]*src="([^"]+)"[^>]*class="[^"]*wp-post-image[^"]*"/i);
        }
        if (!posterMatch) {
            // Fallback: image inside figure inside article
            posterMatch = htmlResponse.match(/<article[^>]*>[\s\S]*?<figure>\s*<img[^>]*src="([^"]+)"/i);
        }
        if (posterMatch) posterUrl = posterMatch[1];
        else {
            // Last fallback: og:image
            var ogImg = htmlResponse.match(/<meta property="og:image" content="([^"]+)"/i);
            if (ogImg) posterUrl = ogImg[1];
        }

        var descMatch = htmlResponse.match(/<div class="sigle-post-content-area">([\s\S]*?)<a href/i);
        if (descMatch) {
            description = descMatch[1].replace(/<[^>]+>/g, '').trim();
        }

        var year = 0;
        var yearMatch = title.match(/(19\d{2}|20\d{2})/);
        if (yearMatch) year = parseInt(yearMatch[1], 10);

        // Find episode links grouped by server sections
        // HTML structure: <b>(Lồng Tiếng)<br>..links..</b> <b>(Phụ Đề)<br>..links..</b>
        var servers = [];

        // Detect server sections by looking for <b> tags containing server names
        var contentArea = "";
        var contentMatch = htmlResponse.match(/<div class="sigle-post-content-area">([\s\S]*?)<\/div>/i);
        if (contentMatch) {
            contentArea = contentMatch[1];
        } else {
            contentArea = htmlResponse;
        }

        // Known server name patterns
        var serverPatterns = [
            { pattern: /\(L\u1ed3ng Ti\u1ebfng\)/gi, name: "Lồng Tiếng" },
            { pattern: /\(L&#7891;ng Ti&#7871;ng\)/gi, name: "Lồng Tiếng" },
            { pattern: /\(Ph\u1ee5 \u0110\u1ec1\)/gi, name: "Phụ Đề" },
            { pattern: /\(Ph&#7909; &#272;&#7873;\)/gi, name: "Phụ Đề" },
            { pattern: /\(Thuy\u1ebft Minh\)/gi, name: "Thuyết Minh" },
            { pattern: /\(Thuy&#7871;t Minh\)/gi, name: "Thuyết Minh" }
        ];

        // Try splitting content by <b> sections containing server names
        // Strategy: find each <b>...</b> block, detect server name, parse links inside
        var boldSections = [];
        var boldRegex = /<b[^>]*>([\s\S]*?)<\/b>/gi;
        var bMatch;
        while ((bMatch = boldRegex.exec(contentArea)) !== null) {
            boldSections.push(bMatch[1]);
        }

        if (boldSections.length > 0) {
            // Parse each bold section as a potential server
            for (var si = 0; si < boldSections.length; si++) {
                var section = boldSections[si];
                var serverName = "";

                // Detect server name from section content
                for (var pi = 0; pi < serverPatterns.length; pi++) {
                    serverPatterns[pi].pattern.lastIndex = 0;
                    if (serverPatterns[pi].pattern.test(section)) {
                        serverName = serverPatterns[pi].name;
                        break;
                    }
                }

                // If no known server name found, try to extract text before first <a> or <br>
                if (!serverName) {
                    var headerMatch = section.match(/^\s*\(([^)]+)\)/);
                    if (headerMatch) {
                        serverName = headerMatch[1].trim();
                    }
                }

                // Parse episode links in this section
                var sectionEpisodes = [];
                var sectionLinkRegex = /<a href="(https?:\/\/sieutamphim\.pro\/[a-zA-Z0-9_-]+)"[^>]*>([\s\S]*?)<\/a>/gi;
                var slMatch;
                while ((slMatch = sectionLinkRegex.exec(section)) !== null) {
                    var epUrl = slMatch[1];
                    var epLabel = slMatch[2].replace(/<[^>]+>/g, '').trim();

                    if (!epLabel || epLabel.length === 0) {
                        epLabel = "Phim";
                    }

                    sectionEpisodes.push({
                        id: epUrl,
                        name: epLabel,
                        slug: epUrl
                    });
                }

                if (sectionEpisodes.length > 0) {
                    servers.push({
                        name: serverName || ("Server " + (servers.length + 1)),
                        episodes: sectionEpisodes
                    });
                }
            }
        }

        // Fallback: if no server sections found, collect all links as one server
        if (servers.length === 0) {
            var episodes = [];
            var allLinksRegex = /<a href="(https?:\/\/sieutamphim\.pro\/[a-zA-Z0-9_-]+)"[^>]*>([\s\S]*?)<\/a>/gi;
            var lMatch;
            while ((lMatch = allLinksRegex.exec(htmlResponse)) !== null) {
                var epUrl = lMatch[1];
                var epLabel = lMatch[2].replace(/<[^>]+>/g, '').trim();

                if (!epLabel || epLabel.length === 0) {
                    epLabel = "Phim";
                }

                episodes.push({
                    id: epUrl,
                    name: epLabel,
                    slug: epUrl
                });
            }

            if (episodes.length === 0) {
                // Fallback single play button (empty <a> tag with play image)
                var playBtnRegex = /<a href="(https?:\/\/sieutamphim\.pro\/[a-zA-Z0-9_-]+)"[^>]*><\/a>/gi;
                var sMatch;
                while ((sMatch = playBtnRegex.exec(htmlResponse)) !== null) {
                    episodes.push({
                        id: sMatch[1],
                        name: "Phim",
                        slug: sMatch[1]
                    });
                }
            }

            if (episodes.length > 0) {
                servers.push({
                    name: "Thuyết Minh",
                    episodes: episodes
                });
            }
        }

        return JSON.stringify({
            id: id,
            title: title,
            posterUrl: posterUrl,
            backdropUrl: posterUrl,
            description: description,
            year: year,
            rating: 0,
            quality: "HD",
            servers: servers,
            category: "",
            country: "",
            director: "",
            casts: ""
        });
    } catch (error) {
        return "null";
    }
}

function parseDetailResponse(htmlResponse, fallbackUrl) {
    try {
        var streamUrl = fallbackUrl || "";

        var customJs = "var style = document.createElement('style');" +
            "style.innerHTML = '#playback { display: none !important; }';" +
            "document.head.appendChild(style);";

        return JSON.stringify({
            url: streamUrl,
            headers: {
                "Referer": "https://sieutamphim.pro/",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Custom-Js": customJs
            }
        });
    } catch (error) {
        return JSON.stringify({ url: "", headers: {} });
    }
}
