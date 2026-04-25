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
        // Cải tiến Regex: Tìm linh hoạt hơn, hỗ trợ cả data-src và src thông thường
        var regex = /<div class="movie-item">[\s\S]*?href="\/phim\/([^"]+)"[\s\S]*?title="([^"]+)"[\s\S]*?(?:src|data-src)="([^"]+)"/g;
        var match;
        
        while ((match = regex.exec(html)) !== null) {
            var imgUrl = match[3];
            if (imgUrl.indexOf('http') !== 0) imgUrl = "https://www.sieutamphim.pro" + imgUrl;
            
            items.push({
                id: match[1],
                title: match[2].trim(),
                posterUrl: imgUrl
            });
        }
        
        // Nếu dùng regex trên không ra, thử regex dự phòng cho cấu trúc khác
        if (items.length === 0) {
            var altRegex = /<a href="\/phim\/([^"]+)" title="([^"]+)">[\s\S]*?src="([^"]+)"/g;
            while ((match = altRegex.exec(html)) !== null) {
                items.push({ id: match[1], title: match[2], posterUrl: match[3] });
            }
        }

        return JSON.stringify({
            items: items,
            pagination: { currentPage: 1, totalPages: 10 } 
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
        var title = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || ["", ""])[1].replace(/<[^>]*>/g, '').trim();
        var poster = (html.match(/<div class="movie-image">[\s\S]*?src="([^"]+)"/) || ["", ""])[1];
        var desc = (html.match(/<div id="movie-content"[^>]*>([\s\S]*?)<\/div>/) || ["", "Đang cập nhật..."])[1].replace(/<[^>]*>/g, '').trim();

        var servers = [];
        var episodes = [];
        
        // Lấy danh sách tập phim
        var epRegex = /href="\/xem-phim\/([^"]+)"[^>]*><span>([^<]+)<\/span>/g;
        var epMatch;
        while ((epMatch = epRegex.exec(html)) !== null) {
            episodes.push({
                id: "https://www.sieutamphim.pro/xem-phim/" + epMatch[1],
                name: epMatch[2].trim(),
                slug: epMatch[1]
            });
        }

        if (episodes.length > 0) {
            servers.push({ name: "Chính chủ", episodes: episodes });
        }

        return JSON.stringify({
            title: title,
            posterUrl: poster,
            description: desc,
            servers: servers
        });
    } catch (e) {
        return JSON.stringify({ title: "Lỗi phân giải chi tiết" });
    }
}

function parseDetailResponse(html) {
    // Tìm link video từ script player
    var playerMatch = html.match(/link":"([^"]+)"/) || html.match(/iframe[^>]*src="([^"]+)"/);
    var videoUrl = "";
    
    if (playerMatch) {
        videoUrl = playerMatch[1].replace(/\\/g, '');
    } else {
        // Fallback: nếu không tìm thấy link trực tiếp, trả về URL trang hiện tại để App tự xử lý qua WebView/Embed
        var canonical = html.match(/<link rel="canonical" href="([^"]+)"/);
        videoUrl = canonical ? canonical[1] : "";
    }

    return JSON.stringify({
        url: videoUrl,
        headers: { "Referer": "https://www.sieutamphim.pro/" },
        isEmbed: true // Luôn bật isEmbed để App tự động bắt link từ iframe
    });
}

function parseEmbedResponse(html, sourceUrl) {
    var fileMatch = html.match(/"file"\s*:\s*"(https?[^"]+)"/) || html.match(/source\s*:\s*"(https?[^"]+)"/);
    if (fileMatch) {
        return JSON.stringify({
            url: fileMatch[1].replace(/\\/g, ''),
            isEmbed: false
        });
    }
    return JSON.stringify({ url: "", isEmbed: false });
}