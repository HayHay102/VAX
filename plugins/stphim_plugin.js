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
    var page = JSON.parse(filtersJson || "{}").page || 1;
    // Blogger pagination thường dùng max-results, ở đây giả định site hỗ trợ query page hoặc dùng mặc định
    return "https://www.sieutamphim.pro/search/label/" + encodeURIComponent(slug) + "?max-results=20";
}

function getUrlSearch(keyword, filtersJson) {
    return "https://www.sieutamphim.pro/?s=" + encodeURIComponent(keyword);
}

function getUrlDetail(slug) {
    // Nếu slug đã là URL tuyệt đối thì trả về luôn, nếu không thì ghép với baseUrl
    if (slug.indexOf('http') === 0) return slug;
    return "https://www.sieutamphim.pro/" + slug;
}

// =============================================================================
// NHÓM 3: PARSER
// =============================================================================

function parseListResponse(html) {
    try {
        var items = [];
        // Regex bóc tách item phim trong template Blogger (thường nằm trong class post-item hoặc tương tự)
        // Lấy link, ảnh và tiêu đề
        var regex = /<div class=['"]post-item['"][\s\S]*?href=['"]([^'"]+)['"][\s\S]*?src=['"]([^'"]+)['"][\s\S]*?alt=['"]([^'"]+)['"]/g;
        
        // Backup regex nếu class khác
        if (html.match(regex) === null) {
            regex = /<a[^>]*href="([^"]+)"[^>]*>[\s\S]*?<img[^>]*src="([^"]+)"[\s\S]*?alt="([^"]+)"/g;
        }

        var match;
        while ((match = regex.exec(html)) !== null) {
            var url = match[1];
            var id = url.replace("https://www.sieutamphim.pro/", ""); // Lấy slug
            items.push({
                id: url, // Dùng full URL làm ID để dễ truy xuất cho detail
                title: match[3].trim(),
                posterUrl: match[2]
            });
        }
        
        return JSON.stringify({
            items: items,
            pagination: { currentPage: 1, totalPages: 1 }
        });
    } catch (e) {
        return JSON.stringify({ items: [], error: e.toString() });
    }
}

function parseSearchResponse(html) {
    return parseListResponse(html);
}

function parseMovieDetail(html) {
    try {
        var title = "";
        var titleMatch = html.match(/<h1[^>]*class=['"]post-title['"][^>]*>([\s\S]*?)<\/h1>/);
        if (titleMatch) title = titleMatch[1].trim();

        var desc = "";
        var descMatch = html.match(/<div[^>]*class=['"]post-body['"][^>]*>([\s\S]*?)<\/div>/);
        if (descMatch) desc = descMatch[1].replace(/<[^>]*>/g, "").substring(0, 300).trim() + "...";

        var poster = "";
        var posterMatch = html.match(/meta property="og:image" content="([^"]+)"/);
        if (posterMatch) poster = posterMatch[1];

        // Tìm danh sách tập phim dựa theo cấu trúc link bạn cung cấp: ?server=xxx&tap=yyy
        var servers = [];
        var episodesByServer = {};

        // Regex tìm các link tập phim
        var epRegex = /href="([^"]+\?server=([^&]+)&tap=([^"]+))"[^>]*>([\s\S]*?)<\/a>/g;
        var match;
        while ((match = epRegex.exec(html)) !== null) {
            var fullUrl = match[1];
            var svName = match[2].toUpperCase();
            var epName = "Tập " + match[3];
            
            if (!episodesByServer[svName]) {
                episodesByServer[svName] = [];
            }
            episodesByServer[svName].push({
                id: fullUrl, // ID chính là link dẫn đến tập đó
                name: epName,
                slug: "tap-" + match[3]
            });
        }

        // Chuyển object sang array format cho App
        for (var sv in episodesByServer) {
            servers.push({
                name: "Server " + sv,
                episodes: episodesByServer[sv]
            });
        }

        // Nếu không tìm thấy tập phim theo link, thử tạo 1 server mặc định (phim lẻ)
        if (servers.length === 0) {
            servers.push({
                name: "Default",
                episodes: [{ id: "current_url", name: "Full", slug: "full" }]
            });
        }

        return JSON.stringify({
            title: title,
            posterUrl: poster,
            description: desc,
            servers: servers,
            status: "Hoàn thành",
            category: "Phim"
        });
    } catch (e) {
        return JSON.stringify({ title: "Lỗi parser", description: e.toString() });
    }
}

function parseDetailResponse(html) {
    try {
        // Tìm iframe chứa video (thường các site Blogger nhúng từ hxfile, ok.ru, blogger, v.v.)
        var iframeMatch = html.match(/<iframe[^>]*src="([^"]+)"/i);
        var videoUrl = "";
        
        if (iframeMatch) {
            videoUrl = iframeMatch[1];
            // Nếu là link iframe, trả về để App mở hoặc fetch tiếp qua parseEmbedResponse
            return JSON.stringify({
                url: videoUrl,
                isEmbed: true,
                headers: { "Referer": "https://www.sieutamphim.pro/" }
            });
        }

        // Nếu không thấy iframe, tìm trực tiếp link m3u8 hoặc mp4 trong script (nếu có)
        var streamMatch = html.match(/["']?file["']?\s*:\s*["']([^"']+\.m3u8[^"']*)["']/);
        if (streamMatch) {
            return JSON.stringify({
                url: streamMatch[1],
                isEmbed: false,
                mimeType: "application/x-mpegURL"
            });
        }

        return JSON.stringify({ url: "" });
    } catch (e) {
        return JSON.stringify({ url: "" });
    }
}

function parseEmbedResponse(html, sourceUrl) {
    // Xử lý nếu iframe dẫn đến một trang trung gian khác
    // Ví dụ: Tìm link stream trực tiếp từ HTML của iframe
    var fileMatch = html.match(/["']?file["']?\s*:\s*["']([^"']+)["']/);
    if (fileMatch) {
        var url = fileMatch[1];
        return JSON.stringify({
            url: url,
            isEmbed: false,
            mimeType: url.indexOf("m3u8") !== -1 ? "application/x-mpegURL" : "video/mp4"
        });
    }
    
    return JSON.stringify({ url: sourceUrl, isEmbed: false });
}
