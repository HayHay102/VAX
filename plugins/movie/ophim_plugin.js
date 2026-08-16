BASEURL = "https://ophim1.com";
BASEAPI = "https://ophim1.com/v1/api";
BASECDN = "https://ophim1.com/uploads/movies/";
var popup_html = "<div class='donate-container'><h2 class='donate-heading'>DONATE</h2><p class='donate-description'>Anh em yêu quý có thể mời bọn mình 2 ly cà phê nhé. Để có động lực duy trì App, cập nhật plugin và tìm thêm nhiều nguồn mới và hay cho anh em. Một chút lòng thành cũng làm bọn mình tiếp tục hoạt động tốt hơn, cám ơn anh em.</p><div class='donate-grid'><div class='donate-card'><div class='donate-title'>Donate Tác giả Plugin</div><div class='qr-wrapper'><img src='https://vaxplugin.alokillgtv.workers.dev/img/qrht.png' alt='Donate Tác giả Plugin' /></div></div><div class='donate-card'><div class='donate-title'>Donate Tác giả App</div><div class='qr-wrapper'><img src='https://vaxplugin.alokillgtv.workers.dev/img/qryb.png' alt='Donate Tác giả App' /></div></div></div></div><style>.donate-container{max-width:800px;margin:0 auto;padding:10px;box-sizing:border-box;font-family:Arial,sans-serif;text-align:center;color:#eee}.donate-heading{font-size:22px;font-weight:bold;margin:0 0 12px 0;color:#fff;text-transform:uppercase;letter-spacing:1px}.donate-description{font-size:14px;line-height:1.5;margin-bottom:18px;color:#ccc}.donate-grid{display:flex;flex-direction:row;justify-content:center;align-items:stretch;gap:16px}.donate-card{flex:1;min-width:0;background:#22252a;border-radius:12px;padding:14px;border:1px solid #33373e;display:flex;flex-direction:column;align-items:center}.donate-title{font-weight:bold;font-size:15px;margin-bottom:12px;color:#fff}.qr-wrapper{width:100%;max-width:240px;aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;background:#181a1d;border-radius:8px;padding:8px;box-sizing:border-box}.qr-wrapper img{width:100%;height:100%;object-fit:contain;border-radius:4px}@media(max-width:600px){.donate-grid{flex-direction:column}.donate-heading{font-size:18px;margin-bottom:8px}.donate-description{font-size:13px;margin-bottom:12px}.qr-wrapper{max-width:180px}}</style>"
function getManifest() {
    return JSON.stringify({
        "id": "ophim",
        "name": "OPhim",
        "version": "1.0.8",
        "baseUrl": BASEURL,
        "layoutType": "HORIZONTAL",
        "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/ophim.png",
        "isEnabled": true,
      "author": "Alokillgtv",
     popup_html:  popup_html,
        "type": "MOVIE"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'phim-chieu-rap', title: 'Phim Chiếu Rạp', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'phim-bo', title: 'Phim Bộ', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'phim-le', title: 'Phim Lẻ', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'hoat-hinh', title: 'Hoạt Hình', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'tv-shows', title: 'TV Shows', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'phim-moi', title: 'Phim Mới Cập Nhật', type: 'Grid', path: 'danh-sach' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Phim mới', slug: 'phim-moi' },
        { name: 'Phim bộ', slug: 'phim-bo' },
        { name: 'Phim lẻ', slug: 'phim-le' },
        { name: 'Shows', slug: 'tv-shows' },
        { name: 'Hoạt hình', slug: 'hoat-hinh' },
        { name: 'Phim vietsub', slug: 'phim-vietsub' },
        { name: 'Phim thuyết minh', slug: 'phim-thuyet-minh' },
        { name: 'Phim lồng tiếng', slug: 'phim-long-tien' },
        { name: 'Phim bộ đang chiếu', slug: 'phim-bo-dang-chieu' },
        { name: 'Phim bộ đã hoàn thành', slug: 'phim-bo-hoan-thanh' },
        { name: 'Phim sắp chiếu', slug: 'phim-sap-chieu' },
        { name: 'Subteam', slug: 'subteam' },
        { name: 'Phim chiếu rạp', slug: 'phim-chieu-rap' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: 'Mới cập nhật', value: 'update' },
            { name: 'Năm xuất bản', value: 'year' },
            { name: 'Lượt xem', value: 'view' }
        ]
    });
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = filters.page || 1;
        var limit = filters.limit || 24;

        var baseUrl = BASEAPI;
        var finalPath = "";
        var mainLists = ['phim-le', 'phim-bo', 'hoat-hinh', 'tv-shows', 'phim-chieu-rap', 'phim-moi', 'sap-chieu'];

        if (mainLists.indexOf(slug) >= 0) {
            finalPath = "/danh-sach/" + slug;
        } else if (/^\d{4}$/.test(slug)) {
            finalPath = "/nam-phat-hanh/" + slug;
        } else if (filters.year) {
            finalPath = "/nam-phat-hanh/" + filters.year;
        } else if (filters.category) {
            if (filters.category.indexOf(',') > -1) {
                finalPath = "/danh-sach/" + filters.category;
            } else {
                finalPath = "/the-loai/" + filters.category;
            }
        } else if (filters.country) {
            finalPath = "/quoc-gia/" + filters.country;
        } else {
            finalPath = "/the-loai/" + slug;
        }

        var url = baseUrl + finalPath + "?page=" + page + "&limit=" + limit;

        if (filters.category && finalPath.indexOf(filters.category) === -1) {
            url += "&category=" + filters.category;
        }
        if (filters.country && finalPath.indexOf(filters.country) === -1) {
            url += "&country=" + filters.country;
        }
        if (filters.year && finalPath.indexOf(filters.year) === -1) {
            url += "&year=" + filters.year;
        }
        if (filters.sort) {
            url += "&sort_field=" + filters.sort;
        }

        return url;
    } catch (e) {
        return BASEAPI + "/danh-sach/" + slug;
    }
}

function getUrlSearch(keyword, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    return BASEAPI + "/tim-kiem?keyword=" + encodeURIComponent(keyword || "") + "&page=" + page;
}

function getUrlDetail(slug) {
    return BASEAPI + "/phim/" + slug;
}

function getUrlCategories() { return BASEAPI + "/the-loai"; }
function getUrlCountries() { return BASEAPI + "/quoc-gia"; }
function getUrlYears() { return BASEAPI + "/nam-phat-hanh"; }

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(apiResponseJson, url) {
    try {
        console.log("parseListResponse: \n" + url);
        var response = JSON.parse(apiResponseJson);

        var root = (response && response.data) ? response.data : response;
        var items = (root && root.items) ? root.items : [];
        var params = (root && root.params) ? root.params : {};
        var pagination = (params && params.pagination) ? params.pagination : {};

        var movies = items.map(function (item) {
            if (!item) return null;
            return {
                id: item.slug || "",
                title: item.name || "",
                posterUrl: getImageUrl(item.thumb_url),
                backdropUrl: getImageUrl(item.poster_url),
                year: item.year || 0,
                quality: item.quality || "",
                episode_current: item.episode_current || "",
                lang: item.lang || ""
            };
        }).filter(Boolean);

        var totalItems = pagination.totalItems || 0;
        var itemsPerPage = pagination.totalItemsPerPage || 24;
        var totalPages = pagination.totalPages || Math.ceil(totalItems / itemsPerPage) || 1;

        return JSON.stringify({
            items: movies,
            pagination: {
                currentPage: pagination.currentPage || 1,
                totalPages: totalPages,
                totalItems: totalItems,
                itemsPerPage: itemsPerPage
            }
        });
    } catch (error) {
        console.log("Error in parseListResponse: " + error);
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
    }
}

function parseSearchResponse(apiResponseJson, url) {
    return parseListResponse(apiResponseJson, url);
}

function parseMovieDetail(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var movie = response.movie || (response.data && response.data.item) || response.item || {};
        var rawEpisodes = response.episodes || (response.data && response.data.item && response.data.item.episodes) || [];

        var servers = [];
        rawEpisodes.forEach(function (server) {
            if (!server) return;
            var episodes = [];
            if (server.server_data) {
                server.server_data.forEach(function (ep) {
                    if (!ep) return;
                    episodes.push({
                        id: ep.link_m3u8 || ep.link_embed || "",
                        name: ep.name || "",
                        slug: ep.slug || ""
                    });
                });
            }
            if (episodes.length > 0) {
                servers.push({ name: server.server_name || "SV", episodes: episodes });
            }
        });

        var rating = 0;
        if (movie.tmdb && movie.tmdb.vote_average) {
            rating = movie.tmdb.vote_average;
        } else if (movie.imdb && movie.imdb.vote_average) {
            rating = movie.imdb.vote_average;
        }

        var categories = (movie.category || []).map(function (c) { return c ? c.name : ""; }).filter(Boolean).join(", ");
        var countries = (movie.country || []).map(function (c) { return c ? c.name : ""; }).filter(Boolean).join(", ");
        var directors = (movie.director || []).join(", ");
        var actors = (movie.actor || []).join(", ");

        var tmdbId = movie.tmdb && movie.tmdb.id ? movie.tmdb.id : "";
        var tmdbSeason = movie.tmdb && movie.tmdb.season ? parseInt(movie.tmdb.season, 10) : 0;
        var tmdbType = movie.tmdb && movie.tmdb.type ? movie.tmdb.type : "";

        return JSON.stringify({
            id: movie.slug || "",
            title: movie.name || "",
            originName: movie.origin_name || "",
            posterUrl: getImageUrl(movie.thumb_url),
            backdropUrl: getImageUrl(movie.poster_url),
            description: (movie.content || "").replace(/<[^>]*>/g, ""),
            year: movie.year || 0,
            rating: rating,
            quality: movie.quality || "",
            servers: servers,
            episode_current: movie.episode_current || "",
            lang: movie.lang || "",
            category: categories,
            country: countries,
            director: directors,
            casts: actors,
            tmdbId: String(tmdbId),
            tmdbSeason: tmdbSeason || 0,
            tmdbType: tmdbType || ""
        });
    } catch (error) { return "null"; }
}

function parseDetailResponse(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var movie = response.movie || (response.data && response.data.item) || {};
        var episodes = response.episodes || (response.data && response.data.item && response.data.item.episodes) || [];

        var streamUrl = "";
        if (episodes.length > 0) {
            var firstServer = episodes[0];
            if (firstServer && firstServer.server_data && firstServer.server_data.length > 0) {
                streamUrl = firstServer.server_data[0].link_m3u8 || firstServer.server_data[0].link_embed || "";
            }
        }

        return JSON.stringify({
            url: streamUrl,
            headers: { "User-Agent": "Mozilla/5.0", "Referer": BASEURL },
            subtitles: []
        });
    } catch (error) { return "{}"; }
}

function parseCategoriesResponse(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var items = (response.data && response.data.items) ? response.data.items : [];
        return JSON.stringify(items.map(function (i) { return { name: i.name || "", slug: i.slug || "" }; }));
    } catch (e) { return "[]"; }
}

function parseCountriesResponse(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var items = (response.data && response.data.items) ? response.data.items : [];
        return JSON.stringify(items.map(function (i) { return { name: i.name || "", value: i.slug || "" }; }));
    } catch (e) { return "[]"; }
}

function parseYearsResponse(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var items = (response.data && response.data.items) ? response.data.items : [];
        return JSON.stringify(items.map(function (i) { return { name: String(i.year || ""), value: String(i.year || "") }; }));
    } catch (e) { return "[]"; }
}

function getImageUrl(path) {
    if (!path || typeof path !== "string") return "";
    if (path.indexOf("http") === 0) return path;
    return BASECDN + path;
}