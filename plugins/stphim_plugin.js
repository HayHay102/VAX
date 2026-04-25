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
    var offset = (page - 1) * 20; // Blogspot thường dùng max-results
    
    var url = "https://www.sieutamphim.pro/";
    if (url.indexOf('?') === -1) {
        url += "search/label/" + slug + "/page/" + page;
    } else {
        url += "search/label/";
    }
    return url;
}

function getUrlSearch(keyword, filtersJson) {
    return "https://www.sieutamphim.pro/?s=" + encodeURIComponent(keyword) + "&max-results=20";
}

function getUrlDetail(slug) {
    // Vì slug bây giờ là path đầy đủ (2026/04/abc.html)
    if (slug.indexOf('http') === 0) return slug;
    if (slug.indexOf('/') === 0) return "https://www.sieutamphim.pro" + slug;
    return "https://www.sieutamphim.pro/" + slug;
}

// =============================================================================
// NHÓM 3: PARSER
// =============================================================================

function parseListResponse(html) {
    try {
        var items = [];
        // Regex lấy link bài viết, ảnh và tiêu đề từ cấu trúc Blogspot
        // Tìm các thẻ a chứa link .html và ảnh thumbnail
        var regex = /<a[^>]*href="https:\/\/www\.sieutamphim\.pro\/([^"]+\.html)"[^>]*>[\s\S]*?<img[^>]*src="([^"]+)"[^>]*alt="([^"]+)"/g;
        var match;
        while ((match = regex.exec(html)) !== null) {
            var slug = match[1];
            var img = match[2];
            var title = match[3];

            // Tránh trùng lặp do Blogspot hay có nhiều link trong 1 post
            if (!items.some(function(i) { return i.id === slug; })) {
                items.push({
                    id: slug,
                    title: title.trim(),
                    posterUrl: img
                });
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
        // 1. Lấy Tiêu đề
        var titleMatch = html.match(/<h1[^>]*class="post-title"[^>]*>([\s\S]*?)<\/h1>/) || html.match(/<title>([\s\S]*?)<\/title>/);
        var title = titleMatch ? titleMatch[1].replace(/&amp;/g, '&').trim() : "Phim";

        // 2. Lấy Mô tả
        var descMatch = html.match(/<div[^>]*class="post-body[^>]*>([\s\S]*?)<\/div>/);
        var description = descMatch ? descMatch[1].replace(/<[^>]*>/g, '').substring(0, 300).trim() + "..." : "";

        // 3. Lấy Poster
        var posterMatch = html.match(/<div[^>]*class="post-body"[^>]*>[\s\S]*?<img[^>]*src="([^"]+)"/);
        var poster = posterMatch ? posterMatch[1] : "";

        // 4. Lấy Server và Tập phim
        // Với Blogspot, link xem thường nằm trong iframe hoặc các nút bấm
        var servers = [];
        var episodes = [];

        // Tìm tất cả iframe trong bài viết
        var iframeRegex = /<iframe[^>]*src="([^"]+)"/g;
        var iframeMatch;
        var count = 1;
        while ((iframeMatch = iframeRegex.exec(html)) !== null) {
            var url = iframeMatch[1];
            // Loại bỏ các iframe quảng cáo hoặc facebook nếu có
            if (url.indexOf('facebook') === -1 && url.indexOf('google') === -1) {
                episodes.push({
                    id: url,
                    name: "Tập " + count,
                    slug: "tap-" + count
                });
                count++;
            }
        }

        // Nếu không có iframe, thử tìm link xem phim trực tiếp (thường web này để ở cuối bài)
        if (episodes.length === 0) {
            episodes.push({
                id: "current_url", // Sẽ xử lý ở parseDetailResponse
                name: "Full HD",
                slug: "full"
            });
        }

        servers.push({
            name: "Server VIP",
            episodes: episodes
        });

        return JSON.stringify({
            id: "", 
            title: title,
            posterUrl: poster,
            description: description,
            servers: servers,
            quality: "HD",
            status: "Thuyết Minh"
        });
    } catch (e) {
        return JSON.stringify({ title: "Lỗi phân giải chi tiết" });
    }
}

function parseDetailResponse(html) {
    // Nếu ID truyền vào đã là một link iframe trực tiếp
    // (như link player.php, hoặc cdn...)
    
    // Ở đây tôi giả định App truyền URL iframe từ parseMovieDetail vào
    var videoUrl = "";
    
    // Tìm link video trong HTML (Blogspot thường dùng iframe lồng)
    var linkMatch = html.match(/file:\s*"([^"]+)"/) || html.match(/source\s*src="([^"]+)"/);
    
    if (linkMatch) {
        videoUrl = linkMatch[1];
    } else {
        // Nếu không tìm thấy, trả về HTML để App tự dùng WebView (Embed)
        var iframeMatch = html.match(/<iframe[^>]*src="([^"]+)"/);
        videoUrl = iframeMatch ? iframeMatch[1] : "";
    }

    return JSON.stringify({
        url: videoUrl,
        headers: {
            "Referer": "https://www.sieutamphim.pro/",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        },
        isEmbed: true // Đặt true để App mở bằng WebView nếu là link iframe
    });
}

function parseEmbedResponse(html, sourceUrl) {
    return JSON.stringify({ url: "", isEmbed: false });
}

function parseCategoriesResponse(html) { return "[]"; }
function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }