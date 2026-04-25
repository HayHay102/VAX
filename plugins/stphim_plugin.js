// =============================================================================
// VAAPP Plugin: Sưu Tầm Phim
// =============================================================================

// =============================================================================
// NHÓM 1: CẤU HÌNH (Config & Metadata)
// =============================================================================

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
        "playerType": "auto"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'phim-le', title: 'Phim Lẻ', type: 'Horizontal', path: 'search/label' },
        { slug: 'phim-bo', title: 'Phim Bộ', type: 'Horizontal', path: 'search/label' },
        { slug: 'long-tieng', title: 'Phim Lồng Tiếng', type: 'Horizontal', path: 'search/label' },        
        { slug: 'phim-moi', title: 'Mới Cập Nhật', type: 'Horizontal', path: 'search/label' }
    ]);
}

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
    return JSON.stringify({ sort: [], category: [] });
}

// =============================================================================
// NHÓM 2: SINH URL
// =============================================================================

function getUrlList(slug, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    // Nếu là trang chủ (phim-moi)
    if (slug === '/') {
        return "https://www.sieutamphim.pro//search/label/page" + page;
    }
    return "https://www.sieutamphim.pro/search/label/" + slug + "/page/" + page;
}

function getUrlSearch(keyword, filtersJson) {
    var page = JSON.parse(filtersJson || "{}").page || 1;
    return "https://www.sieutamphim.pro/" + "/page/" + page + "?s=" + encodeURIComponent(keyword);
}

function getUrlDetail(slug) {
    if (slug.indexOf('http') === 0) return slug;
    return "https://www.sieutamphim.pro/search/label/" + slug;
}

// =============================================================================
// NHÓM 3: PARSER
// =============================================================================

function parseListResponse(html) {
    try {
        var items = [];
        // Regex tìm kiếm các card phim trong danh sách
        var regex = /<div class="movie-item[^>]*>[\s\S]*?href="\/phim\/([^"]+)" title="([^"]+)"[\s\S]*?src="([^"]+)"/g;
        var match;
        while ((match = regex.exec(html)) !== null) {
            items.push({
                id: match[1],
                title: match[2].trim(),
                posterUrl: match[3].indexOf('http') === 0 ? match[3] : "https://www.sieutamphim.pro" + match[3]
            });
        }
        
        // Parse phân trang (tìm trang cuối cùng)
        var totalPages = 1;
        var pageMatch = html.match(/page=(\d+)"[^>]*>Cuối/);
        if (pageMatch) totalPages = parseInt(pageMatch[1]);

        return JSON.stringify({
            items: items,
            pagination: { currentPage: 1, totalPages: totalPages }
        });
    } catch (e) {
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
    }
}

function parseSearchResponse(html) {
    return parseListResponse(html);
}

function parseMovieDetail(html) {
    try {
        var title = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || ["", "Chưa rõ"])[1].trim();
        var description = (html.match(/<div id="movie-content"[^>]*>([\s\S]*?)<\/div>/) || ["", "Đang cập nhật..."])[1].replace(/<[^>]*>/g, '').trim();
        var poster = (html.match(/<div class="movie-image">[\s\S]*?src="([^"]+)"/) || ["", ""])[1];
        
        var servers = [];
        var episodeGroups = {};

        // Tìm tất cả link tập phim: href="/xem-phim/slug/tap-1"
        var epRegex = /href="\/xem-phim\/([^"]+)"[^>]*><span>([^<]+)<\/span>/g;
        var epMatch;
        var episodes = [];

        while ((epMatch = epRegex.exec(html)) !== null) {
            episodes.push({
                id: "https://www.sieutamphim.pro/xem-phim/" + epMatch[1],
                name: epMatch[2].trim(),
                slug: epMatch[1]
            });
        }

        if (episodes.length > 0) {
            servers.push({
                name: "Vietsub / Thuyết Minh",
                episodes: episodes
            });
        }

        return JSON.stringify({
            id: "", 
            title: title,
            posterUrl: poster,
            description: description,
            servers: servers,
            quality: "HD",
            status: "Hoàn tất"
        });
    } catch (e) {
        return JSON.stringify({ title: "Error parsing" });
    }
}

function parseDetailResponse(html) {
    try {
        // Tìm link iframe hoặc link m3u8 trong trang xem phim
        // Thông thường các web này ẩn link trong script hoặc iframe
        var playerMatch = html.match(/link":"([^"]+)"/) || html.match(/iframe[^>]*src="([^"]+)"/);
        var videoUrl = "";
        
        if (playerMatch) {
            videoUrl = playerMatch[1].replace(/\\/g, '');
        }

        // Nếu không thấy link trực tiếp, trả về chính URL đó để App xử lý qua Embed
        if (!videoUrl) {
            var currentUrlMatch = html.match(/<link rel="canonical" href="([^"]+)"/);
            videoUrl = currentUrlMatch ? currentUrlMatch[1] : "";
        }

        return JSON.stringify({
            url: videoUrl,
            headers: {
                "Referer": "https://www.sieutamphim.pro/",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            },
            isEmbed: videoUrl.includes("embed") || videoUrl.includes("link") 
        });
    } catch (e) {
        return JSON.stringify({ url: "" });
    }
}

function parseEmbedResponse(html, sourceUrl) {
    // Xử lý giải mã link nếu server sử dụng bảo vệ nhiều lớp
    var fileMatch = html.match(/"file"\s*:\s*"(https?[^"]+)"/) || html.match(/source\s*:\s*"(https?[^"]+)"/);
    if (fileMatch) {
        return JSON.stringify({
            url: fileMatch[1].replace(/\\/g, ''),
            isEmbed: false,
            mimeType: "application/x-mpegURL"
        });
    }
    return JSON.stringify({ url: "", isEmbed: false });
}

function parseCategoriesResponse(html) { return "[]"; }
function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
