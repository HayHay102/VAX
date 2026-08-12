BASEURL = "https://clbpx.alokillgtv.workers.dev";
BASESOURCE = "";
function getManifest() {
    return JSON.stringify({
        "id": "clbpxVIP",
        "name": "CLB Phim Xưa VIP",
        "version": "1.4.6",
        "info": "Đã nâng cấp thêm cơ chế lưu lịch sử và qua tập. Khỏi cần đăng nhập vẫn xem đc.",
        "BASEURL": "https://clbpx.alokillgtv.workers.dev",
        "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/clbpx.png",
        "isEnabled": true,
        "isAdult": false,
        "type": "MOVIE",
        "playerType": "embed",
        "layoutType": "HORIZONTAL"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'home', title: 'Mới Cập Nhật', type: 'Grid', path: '' }
    ]);
}

function getPrimaryCategories() {
    if (typeof localStorage !== 'undefined' && localStorage.getItem("SVDATA")) {
        localStorage.removeItem("SVDATA");
    }
    return JSON.stringify([
        { name: 'Kiếm Hiệp', slug: 'phim-bo-kiem-hiep-co-trang' },
        { name: 'Tiên Hiệp', slug: 'tien-hiep-ngon-tinh' },
        { name: 'Tâm Lý', slug: 'tlhd' },
        { name: 'Ma Kinh Dị', slug: 'ma-kinh-di' },
        { name: 'Điện Ảnh Châu Á', slug: 'phim-hk-tk' },
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
    var baseUrl = BASEURL;

    if (slug === '' || slug === 'home') {
        if (page > 1) {
            return baseUrl + "/page/" + page + "/";
        }
        return baseUrl + "/";
    }

    if (page > 1) {
        return baseUrl + "/category/" + slug + "/page/" + page + "/";
    }
    return baseUrl + "/category/" + slug + "/";
}

function getUrlSearch(keyword, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    if (page > 1) {
        return BASEURL + "/page/" + page + "/?s=" + encodeURIComponent(keyword);
    }
    return BASEURL + "/?s=" + encodeURIComponent(keyword);
}

function getUrlDetail(slug) {
    if (!slug) return "";
    if (slug.indexOf("http") === 0) return slug;
    return BASEURL + "/" + slug + "/";
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(htmlResponse, url) {
    console.log("list\n" + url);
    var items = [];
    var regex = /<article.*?id="post-[^>]+>[\s\S]*?<a href="([^"]+)".*?>\s*<figure[\s\S]*?<img.*?src="([^"]+)".*?alt="([^"]+)".*?>/gi;
    var match;

    while ((match = regex.exec(htmlResponse)) !== null) {
        var link = match[1] || "";
        var thumb = match[2] || "";
        var title = match[3] || "";

        title = title.replace(/&#8211;/g, '-').replace(/&#8217;/g, "'");

        var slugMatch = link.match(/clbphimxua\.com\/([^\/]+)\/?/);
        var slug = slugMatch ? slugMatch[1] : link;
        var year = 0;
        var yearMatch = title.match(/19\d{2}|20\d{2}/);
        if (yearMatch) {
            year = parseInt(yearMatch[0], 10);
        }

        items.push({
            id: slug,
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
    console.log("list:\n" + JSON.stringify(items));
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

function extractVideoId(url) {
    if (!url) return "";
    var match = url.match(/[?&]v=([^&]+)/);
    return match ? match[1] : url;
}

function BASE64ENCODE(str) {
  try {
    if (!str) return "";

    var utf8Bytes = [];
    for (var i = 0; i < str.length; i++) {
      var code = str.charCodeAt(i);
      if (code < 128) {
        utf8Bytes.push(code);
      } else if (code < 2048) {
        utf8Bytes.push((code >> 6) | 192, (code & 63) | 128);
      } else if (
        (code & 0xfc00) === 0xd800 &&
        i + 1 < str.length &&
        (str.charCodeAt(i + 1) & 0xfc00) === 0xdc00
      ) {
        code =
          0x10000 + ((code & 0x03ff) << 10) + (str.charCodeAt(++i) & 0x03ff);
        utf8Bytes.push(
          (code >> 18) | 240,
          ((code >> 12) & 63) | 128,
          ((code >> 6) & 63) | 128,
          (code & 63) | 128,
        );
      } else {
        utf8Bytes.push(
          (code >> 12) | 224,
          ((code >> 6) & 63) | 128,
          (code & 63) | 128,
        );
      }
    }

    var chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var encoded = "";
    var byte1, byte2, byte3;
    var b1, b2, b3, b4;

    for (var j = 0; j < utf8Bytes.length; j += 3) {
      byte1 = utf8Bytes[j];
      byte2 = j + 1 < utf8Bytes.length ? utf8Bytes[j + 1] : NaN;
      byte3 = j + 2 < utf8Bytes.length ? utf8Bytes[j + 2] : NaN;

      b1 = byte1 >> 2;
      b2 = ((byte1 & 3) << 4) | (isNaN(byte2) ? 0 : byte2 >> 4);
      b3 = isNaN(byte2)
        ? 64
        : ((byte2 & 15) << 2) | (isNaN(byte3) ? 0 : byte3 >> 6);
      b4 = isNaN(byte3) ? 64 : byte3 & 63;

      encoded +=
        chars.charAt(b1) +
        chars.charAt(b2) +
        chars.charAt(b3) +
        chars.charAt(b4);
    }

    return encoded;
  } catch (e) {
    console.log("[BASE64ENCODE Error]:", e.message || e);
    return "";
  }
}

function parseMovieDetail(htmlResponse) {
    try {
        var id = "";
        var title = "";
        var posterUrl = "";
        var description = "";
        var saveSV = [];
        var nameMV = "";
        var slugMatch = htmlResponse.match(/<link rel="canonical" href="([^"]+)"/i);
        if (slugMatch) {
            var canonicalUrl = slugMatch[1];
            var parts = canonicalUrl.split('/');
            id = parts[parts.length - 2] || parts[parts.length - 1] || "unknown_movie";
        } else {
            id = "movie_" + new Date().getTime();
        }

        var titleMatch = htmlResponse.match(/<h1 class="single-title">([^<]+)<\/h1>/i);
        if (titleMatch) title = titleMatch[1].trim();
        title = title.replace(/&#8211;/g, '-').replace(/&#8217;/g, "'");
        nameMV = title;
        var posterMatch = htmlResponse.match(/<img[^>]*class="[^"]*wp-post-image[^"]*"[^>]*src="([^"]+)"/i);
        if (!posterMatch) {
            posterMatch = htmlResponse.match(/<img[^>]*src="([^"]+)"[^>]*class="[^"]*wp-post-image[^"]*"/i);
        }
        if (!posterMatch) {
            posterMatch = htmlResponse.match(/<article[^>]*>[\s\S]*?<figure>\s*<img[^>]*src="([^"]+)"/i);
        }
        if (posterMatch) posterUrl = posterMatch[1];
        else {
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

        var servers = [];
        var contentArea = "";
        var contentMatch = htmlResponse.match(/<div class="sigle-post-content-area">([\s\S]*?)<\/div>/i);
        contentArea = contentMatch ? contentMatch[1] : htmlResponse;

        var serverPatterns = [
            { pattern: /\(L\u1ed3ng Ti\u1ebfng\)/gi, name: "Lồng Tiếng" },
            { pattern: /\(L&#7891;ng Ti&#7871;ng\)/gi, name: "Lồng Tiếng" },
            { pattern: /\(Ph\u1ee5 \u0110\u1ec1\)/gi, name: "Phụ Đề" },
            { pattern: /\(Ph&#7909; &#272;&#7873;\)/gi, name: "Phụ Đề" },
            { pattern: /\(Thuy\u1ebft Minh\)/gi, name: "Thuyết Minh" },
            { pattern: /\(Thuy&#7871;t Minh\)/gi, name: "Thuyết Minh" }
        ];

        var boldSections = [];
        var boldRegex = /<b[^>]*>([\s\S]*?)<\/b>/gi;
        var bMatch;
        while ((bMatch = boldRegex.exec(contentArea)) !== null) {
            boldSections.push(bMatch[1]);
        }

        function normalizeEpUrl(rawUrl) {
            if (!rawUrl) return "";
            if (typeof BASEURL !== 'undefined') {
                if (rawUrl.startsWith("http")) {
                    return rawUrl.replace(/^https?:\/\/[^\/]+(\/api\/clbpx)?/, BASEURL);
                }
                return BASEURL + (rawUrl.startsWith("/") ? "" : "/") + rawUrl;
            }
            return rawUrl;
        }

        if (boldSections.length > 0) {
            for (var si = 0; si < boldSections.length; si++) {
                var section = boldSections[si];
                var serverName = "";

                for (var pi = 0; pi < serverPatterns.length; pi++) {
                    serverPatterns[pi].pattern.lastIndex = 0;
                    if (serverPatterns[pi].pattern.test(section)) {
                        serverName = serverPatterns[pi].name;
                        break;
                    }
                }

                if (!serverName) {
                    var headerMatch = section.match(/^\s*\(([^)]+)\)/);
                    if (headerMatch) serverName = headerMatch[1].trim();
                }

                var sectionEpisodes = [];
                var sectionLinkRegex = /<a href="([^"]*clbpx(?:\.html)?\?v=[a-zA-Z0-9_-]+)"[^>]*>([\s\S]*?)<\/a>/gi;
                var slMatch;
                var saveEp = [];
                
                while ((slMatch = sectionLinkRegex.exec(section)) !== null) {
                    var epUrl = normalizeEpUrl(slMatch[1]);
                    var epLabel = slMatch[2].replace(/<[^>]+>/g, '').trim();

                    if (!epLabel || /^\s*$/.test(epLabel) || /<img/i.test(slMatch[2])) {
                        epLabel = sectionEpisodes.length === 0 && boldSections.length === 1 ? "Xem phim" : "Tập " + (sectionEpisodes.length + 1);
                    }
                    
                    var vMatch = epUrl.match(/[?&]v=([a-zA-Z0-9_-]+)/);
                    var videoId = vMatch ? vMatch[1] : "";
                    if (videoId) saveEp.push(videoId); // ✅ Đã sửa lỗi dư thừa cú pháp

                    sectionEpisodes.push({
                        id: epUrl,
                        name: epLabel,
                        slug: epUrl
                    });
                }

                if (sectionEpisodes.length > 0) {
                    var finalServerName = serverName || ("Server " + (servers.length + 1));
                    saveSV.push({
                        nameMV: nameMV,
                        name: finalServerName,
                        episodes: saveEp
                    });
                    servers.push({
                        name: finalServerName,
                        episodes: sectionEpisodes
                    });
                }
            }
        }

        if (servers.length === 0) {
            var episodes = [];
            var fallbackSaveEp = []; // ✅ Đã đổi tên biến để tránh trùng lặp
            var allLinksRegex = /<a href="([^"]*clbpx(?:\.html)?\?v=[a-zA-Z0-9_-]+)"[^>]*>([\s\S]*?)<\/a>/gi;
            var lMatch;
          
            while ((lMatch = allLinksRegex.exec(htmlResponse)) !== null) {
                var epUrl = normalizeEpUrl(lMatch[1]);
                var epLabel = lMatch[2].replace(/<[^>]+>/g, '').trim();

                if (!epLabel || /^\s*$/.test(epLabel) || /<img/i.test(lMatch[2])) {
                    epLabel = "Tập " + (episodes.length + 1);
                }
                
                var vMatch = epUrl.match(/[?&]v=([a-zA-Z0-9_-]+)/);
                var videoId = vMatch ? vMatch[1] : "";
                if (videoId) fallbackSaveEp.push(videoId);

                episodes.push({
                    id: epUrl,
                    name: epLabel,
                    slug: epUrl
                });
            }

            if (episodes.length > 0) {
                saveSV.push({
                    nameMV: nameMV,
                    name: "Thuyết Minh",
                    episodes: fallbackSaveEp
                });
                servers.push({
                    name: "Thuyết Minh",
                    episodes: episodes
                });
            }
        }

        function getMovieStats(serverList) {
            if (!Array.isArray(serverList)) return { totalEpisodes: 0, serverCount: 0 };
            var totalEp = serverList.reduce(function(sum, server) {
                var epCount = (server && Array.isArray(server.episodes)) ? server.episodes.length : 0;
                return sum + epCount;
            }, 0);

            return {
                totalEpisodes: totalEp,
                serverCount: serverList.length
            };
        }

        var idplay = id;
        if (typeof BASE64ENCODE === 'function') {
            idplay = BASE64ENCODE(id);
        } else if (typeof BASE64 !== 'undefined' && typeof BASE64.encode === 'function') {
            idplay = BASE64.encode(id);
        }

        var keyToUse = idplay;
        var svDATA = {};

        if (typeof localStorage !== 'undefined' && localStorage.getItem("SVDATA")) {
            try {
                svDATA = JSON.parse(localStorage.getItem("SVDATA"));
            } catch (e) {
                svDATA = {};
            }
        }
        
        var data64 = "";
        if (typeof BASE64 !== 'undefined' && typeof BASE64.encode === 'function') {
            data64 = BASE64.encode(JSON.stringify(saveSV));
        } else if (typeof BASE64ENCODE === 'function') {
            data64 = BASE64ENCODE(JSON.stringify(saveSV));
        } else if (typeof btoa === 'function') {
            data64 = btoa(JSON.stringify(saveSV));
        }

        function appendSaveAdsToServers(serverList, adsData) {
            return serverList.map(function(server) {
                return Object.assign({}, server, {
                    episodes: (server.episodes || []).map(function(ep) {
                        if (!ep.id) return ep;
                        var separator = ep.id.indexOf('?') !== -1 ? '&' : '?';
                        return Object.assign({}, ep, {
                            id: ep.id + separator + "save=" + adsData
                        });
                    })
                });
            });
        }

        servers = appendSaveAdsToServers(servers, data64);
        var newStats = getMovieStats(servers);

        if (svDATA[idplay]) {
            var savedStats = getMovieStats(svDATA[idplay]);
            var isBetter = false;

            if (newStats.totalEpisodes > savedStats.totalEpisodes) {
                isBetter = true;
            } else if (newStats.totalEpisodes === savedStats.totalEpisodes && newStats.serverCount > savedStats.serverCount) {
                isBetter = true;
            }

            if (isBetter) {
                svDATA[idplay] = servers;
            }
        } else {
            svDATA[idplay] = servers;
        }
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem("SVDATA", JSON.stringify(svDATA));
            localStorage.setItem("CURRENT_MOVIE_ID", keyToUse);
        }
        var $return = JSON.stringify({
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
            casts: "",
            datasend: ""
        });

        console.log("return parseMovie\n" + $return);
        return $return;

    } catch (error) {
        console.error("parseMovieDetail error: ", error);
        return "null";
    }
}

function parseDetailResponse(htmlResponse, fallbackUrl, datasend) {
    try {
        console.log("parseDetailResponse url:\n" + fallbackUrl);
        console.log("datasend:\n" + JSON.stringify(datasend));
        var extractVid = function(url) {
            if (!url) return "";
            var match = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
            if (match) return match[1].trim();

            var clean = url.split("?")[0].split("#")[0];
            var parts = clean.split("/").filter(Boolean);
            return parts.length > 0 ? parts[parts.length - 1].trim() : url.trim();
        };

        var currentMovieKey = (typeof localStorage !== 'undefined' && localStorage.getItem("CURRENT_MOVIE_ID")) || "";
        var initialVideoId = extractVid(fallbackUrl);

        var scriptContent = rawJS(initialVideoId, fallbackUrl, currentMovieKey);
        var checkraw = typeof checkRaw === 'function' ? checkRaw(scriptContent, true) : scriptContent;

        return JSON.stringify({
            url: fallbackUrl || "",
            headers: {
                "Referer": "https://clbphimxua.com/",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Custom-Js": checkraw
            }
        });
    } catch (error) {
        console.log("Lỗi parseDetail\n" + error);
        return JSON.stringify({ url: fallbackUrl || "", headers: {} });
    }
}
function rawJS(initialVideoId, fallbackUrl, movieKey) {
    return `
(function () {
  if (window.__CUSTOM_PLAYER_INITED__) return;
  window.__CUSTOM_PLAYER_INITED__ = true;

  function bridgeLog(msg) {
    try {
      if (window.SnifferBridge && typeof window.SnifferBridge.log === 'function') {
        window.SnifferBridge.log(msg);
      } else if (typeof console !== 'undefined' && console.log) {
        console.log(msg);
      }
    } catch(e) {}
  }

  bridgeLog("[CustomJS] Bắt đầu khởi tạo...");

  function initPlayer() {
    var ABYSS_BASE_URL = "https://abysscdn.com/?v=";
    var serversList = [];
    var currentServerIndex = 0;
    var currentIndex = 0;
    var activeMovieKey = "${movieKey}";
    var fallbackUrlStr = "${fallbackUrl}";
    var initVid = "${initialVideoId}";
    var movieTitle = "";
    var saveHistoryTimeout = null;
    var loadingTimeout = null;
    var histAutoCloseTimeout = null;
    var titleDisplayTimeout = null;

    function extractId(urlOrId) {
      if (!urlOrId) return "";
      var match = String(urlOrId).match(/[?&]v=([^&]+)/);
      if (match) return match[1].trim();
      var clean = String(urlOrId).split("?")[0].split("#")[0];
      var parts = clean.split("/").filter(Boolean);
      return parts.length > 0 ? parts[parts.length - 1].trim() : String(urlOrId).trim();
    }

    function decodeBase64Utf8(str) {
      if (!str) return null;
      try {
        var base64 = decodeURIComponent(str);
        base64 = base64.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4 !== 0) {
          base64 += '=';
        }
        var binary = atob(base64);
        var bytes = new Uint8Array(binary.length);
        for (var i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }

        if (typeof TextDecoder !== "undefined") {
          return new TextDecoder("utf-8").decode(bytes);
        }

        var escaped = "";
        for (var j = 0; j < binary.length; j++) {
          escaped += "%" + ("00" + binary.charCodeAt(j).toString(16)).slice(-2);
        }
        return decodeURIComponent(escaped);
      } catch (e) {
        bridgeLog("[CustomJS] Lỗi decode base64 detail: " + e.message);
        return null;
      }
    }

    // 1. DỰNG GIAO DIỆN VÀ PLAY VIDEO NGAY LẬP TỨC
    if (document.body) document.body.innerHTML = "";
    
    var css = "#playback { display: none !important; } * { box-sizing: border-box; margin: 0; padding: 0; } html, body { width: 100%; height: 100%; background: #000; overflow: hidden; font-family: sans-serif; color: #fff; } #player-frame { width: 100%; height: 100%; border: 0; display: block; position: relative; z-index: 1; } .v-fade-ctrl { opacity: 0.4; transition: opacity 0.3s ease; z-index: 20; } .v-fade-ctrl:hover, body:active .v-fade-ctrl { opacity: 1; } .v-menu-wrap { position: absolute; top: 15px; right: 15px; z-index: 25; } .v-btn-toggle { background: rgba(0, 0, 0, 0.7); color: #fff; border: 1px solid rgba(255,255,255,0.3); padding: 8px 14px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 14px; } .v-title-overlay { position: absolute; top: 15px; left: 15px; z-index: 25; background: rgba(0,0,0,0.75); border: 1px solid rgba(255,255,255,0.2); padding: 8px 14px; border-radius: 6px; font-size: 13px; font-weight: bold; color: #fff; max-width: calc(100vw - 160px); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; pointer-events: none; transition: opacity 0.4s ease; opacity: 0; } .v-title-overlay.show { opacity: 1; } .v-playlist-panel { display: none; position: absolute; top: 45px; right: 0; width: calc(100vw - 30px); max-width: 340px; max-height: calc(80vh - 70px); background: rgba(15, 15, 15, 0.96); border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; padding: 12px; overflow-y: auto; -webkit-overflow-scrolling: touch; box-shadow: 0 4px 20px rgba(0,0,0,0.8); } .v-playlist-panel.active { display: block; } .v-history-bar { display: none; background: rgba(229, 9, 20, 0.15); border: 1px solid rgba(229, 9, 20, 0.4); border-radius: 6px; padding: 10px; margin-bottom: 12px; } .v-hist-title { font-size: 12px; color: #ddd; margin-bottom: 8px; line-height: 1.3; } .v-hist-title strong { color: #ff4d4d; } .v-hist-btns { display: flex; gap: 5px; } .v-hbtn { flex: 1; padding: 6px 0; font-size: 11px; font-weight: bold; border-radius: 4px; border: none; cursor: pointer; text-align: center; } .v-btn-main { background: #e50914; color: #fff; } .v-btn-sub { background: rgba(255, 255, 255, 0.2); color: #fff; } .v-btn-close { background: rgba(255, 255, 255, 0.08); color: #aaa; } .server-tabs-container { display: flex; gap: 6px; margin-bottom: 12px; overflow-x: auto; padding-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.15); -webkit-overflow-scrolling: touch; } .server-tab-item { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2); color: #ccc; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; white-space: nowrap; font-weight: bold; } .server-tab-item.active { background: #e50914; color: #fff; border-color: #e50914; } .ep-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; } .ep-item { background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); color: #fff; padding: 8px 2px; text-align: center; border-radius: 4px; cursor: pointer; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .ep-item.active { background: #e50914; font-weight: bold; border-color: #fff; } .nav-ep-btn { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.3); color: white; width: 44px; height: 44px; border-radius: 50%; cursor: pointer; font-size: 20px; display: flex; align-items: center; justify-content: center; z-index: 20; } .nav-prev { left: 15px; } .nav-next { right: 15px; } #v-loading-layer { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 10; pointer-events: none; } .spinner { width: 42px; height: 42px; border: 4px solid rgba(255,255,255,0.15); border-top-color: #e50914; border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 12px; } @keyframes spin { to { transform: rotate(360deg); } } #v-status-msg { position: absolute; top: 20px; left: 50%; transform: translateX(-50%); background: rgba(229, 9, 20, 0.95); color: #fff; padding: 8px 18px; border-radius: 20px; font-size: 13px; font-weight: bold; z-index: 22; display: none; box-shadow: 0 4px 15px rgba(0,0,0,0.6); text-align: center; max-width: 90%; }";
    
    var style = document.createElement("style"); 
    style.appendChild(document.createTextNode(css)); 
    document.head.appendChild(style);

    var iframe = document.createElement("iframe"); 
    iframe.id = "player-frame"; 
    iframe.setAttribute("allow", "autoplay; encrypted-media; fullscreen"); 
    iframe.setAttribute("allowfullscreen", "true");

    // Gán src cho iframe ngay từ đầu để load ngay lần chạy đầu tiên
    var startVidId = extractId(initVid) || extractId(fallbackUrlStr);
    if (startVidId && !startVidId.startsWith("http")) {
      iframe.src = ABYSS_BASE_URL + startVidId;
    } else {
      iframe.src = fallbackUrlStr;
    }
    
    var titleOverlay = document.createElement("div");
    titleOverlay.className = "v-title-overlay";
    
    var loadingOverlay = document.createElement("div"); 
    loadingOverlay.id = "v-loading-layer";
    loadingOverlay.innerHTML = '<div class="spinner"></div><div id="v-load-txt" style="font-size:13px; font-weight:bold;">Đang tải...</div>';
    
    var toastMsg = document.createElement("div"); 
    toastMsg.id = "v-status-msg";

    var epContainer = document.createElement("div"); 
    epContainer.className = "v-menu-wrap v-fade-ctrl";
    
    var epToggleBtn = document.createElement("button"); 
    epToggleBtn.className = "v-btn-toggle"; 
    epToggleBtn.innerText = "Danh sách tập"; 
    epToggleBtn.onclick = function () { 
      epPanel.classList.toggle("active"); 
      if (epPanel.classList.contains("active")) {
        triggerTitleDisplay();
      }
    };
    
    var epPanel = document.createElement("div"); 
    epPanel.className = "v-playlist-panel"; 
    
    var histBar = document.createElement("div"); 
    histBar.className = "v-history-bar";
    histBar.innerHTML = '<div class="v-hist-title" id="v-hist-txt">Lịch sử xem: Bạn đã xem tới tập trước đó</div>' +
      '<div class="v-hist-btns">' +
        '<button class="v-hbtn v-btn-main" id="v-btn-resume">Xem tiếp</button>' +
        '<button class="v-hbtn v-btn-sub" id="v-btn-next">Xem tập kế</button>' +
        '<button class="v-hbtn v-btn-close" id="v-btn-close">✕</button>' +
      '</div>';

    var serverTabs = document.createElement("div"); 
    serverTabs.className = "server-tabs-container";
    var epGrid = document.createElement("div"); 
    epGrid.className = "ep-grid"; 
    
    epPanel.appendChild(histBar);
    epPanel.appendChild(serverTabs); 
    epPanel.appendChild(epGrid); 
    epContainer.appendChild(epToggleBtn); 
    epContainer.appendChild(epPanel);

    var prevBtn = document.createElement("button"); 
    prevBtn.className = "nav-ep-btn nav-prev v-fade-ctrl"; 
    prevBtn.textContent = "❮"; 
    prevBtn.onclick = function () { navigateEp(-1); };
    
    var nextBtn = document.createElement("button"); 
    nextBtn.className = "nav-ep-btn nav-next v-fade-ctrl"; 
    nextBtn.textContent = "❯"; 
    nextBtn.onclick = function () { navigateEp(1); };

    document.body.appendChild(iframe); 
    document.body.appendChild(titleOverlay);
    document.body.appendChild(loadingOverlay); 
    document.body.appendChild(toastMsg); 
    document.body.appendChild(epContainer); 
    document.body.appendChild(prevBtn); 
    document.body.appendChild(nextBtn);

    function triggerTitleDisplay() {
      if (!serversList || serversList.length === 0) return;
      var curServer = serversList[currentServerIndex];
      if (!curServer || !curServer.episodes || !curServer.episodes[currentIndex]) return;
      
      var epObj = curServer.episodes[currentIndex];
      var epName = epObj.name || ("Tập " + (currentIndex + 1));
      var displayStr = (movieTitle ? movieTitle + " - " : "") + epName;
      
      titleOverlay.innerText = displayStr;
      titleOverlay.classList.add("show");

      if (titleDisplayTimeout) clearTimeout(titleDisplayTimeout);
      titleDisplayTimeout = setTimeout(function() {
        titleOverlay.classList.remove("show");
      }, 10000);
    }

    function showLoading(msg) {
      document.getElementById("v-load-txt").innerText = msg || "Đang tải video...";
      loadingOverlay.style.display = "flex";
      if (loadingTimeout) clearTimeout(loadingTimeout);
      loadingTimeout = setTimeout(function() { hideLoading(); }, 10000);
    }

    function hideLoading() {
      if (loadingTimeout) clearTimeout(loadingTimeout);
      loadingOverlay.style.display = "none";
    }

    iframe.onload = function() { hideLoading(); };

    function showToast(text) {
      toastMsg.innerHTML = text;
      toastMsg.style.display = "block";
      setTimeout(function() { toastMsg.style.display = "none"; }, 3000);
    }

    // 2. CHỈ NẠP DỮ LIỆU TỪ PARAM 'save=' (BASE64)
    try {
      var rawData = [];
      var saveParamMatch = fallbackUrlStr.match(/[?&]save=([^&]+)/);

      if (saveParamMatch && saveParamMatch[1]) {
        var decodedJson = decodeBase64Utf8(saveParamMatch[1]);
        if (decodedJson) {
          rawData = JSON.parse(decodedJson);
          bridgeLog("[CustomJS] Giải mã thành công danh sách phim từ param ?save=");
        }
      }

      if (Array.isArray(rawData) && rawData.length > 0) {
        rawData.forEach(function(server) {
          if (server && server.nameMV && !movieTitle) {
            movieTitle = server.nameMV;
          }
          if (server && server.episodes && Array.isArray(server.episodes) && server.episodes.length > 0) {
            var formattedEps = server.episodes.map(function(epItem, idx) {
              if (typeof epItem === 'object' && epItem !== null) {
                return epItem;
              }
              return {
                id: String(epItem),
                name: "Tập " + (idx + 1),
                slug: String(epItem)
              };
            });

            serversList.push({
              name: server.name || server.server_name || ("Server " + (serversList.length + 1)),
              episodes: formattedEps
            });
          }
        });
      }
      bridgeLog("[CustomJS] Nạp thành công " + serversList.length + " Server.");
    } catch (e) {
      bridgeLog("[CustomJS] Lỗi parse server từ base64: " + e.message);
    }

    function renderUI() {
      if (serversList.length === 0) return;
      serverTabs.innerHTML = "";
      serversList.forEach(function (server, sIndex) {
        var tab = document.createElement("div");
        tab.className = "server-tab-item" + (sIndex === currentServerIndex ? " active" : "");
        tab.innerText = server.name;
        tab.onclick = function () {
          if (sIndex !== currentServerIndex) {
            var targetEpIndex = Math.min(currentIndex, server.episodes.length - 1);
            selectEpisode(sIndex, targetEpIndex, true);
          }
        };
        serverTabs.appendChild(tab);
      });

      epGrid.innerHTML = "";
      var curEpisodes = serversList[currentServerIndex].episodes;
      curEpisodes.forEach(function (ep, epIndex) {
        var item = document.createElement("div");
        item.className = "ep-item" + (epIndex === currentIndex ? " active" : "");
        item.innerText = ep.name || ("Tập " + (epIndex + 1));
        item.onclick = function () { 
          epPanel.classList.remove("active"); 
          selectEpisode(currentServerIndex, epIndex, true); 
        };
        epGrid.appendChild(item);
      });
    }

    function selectEpisode(sIdx, epIdx, shouldChangeIframe) {
      if (serversList.length === 0) return;
      if (sIdx < 0 || sIdx >= serversList.length) return;
      var curServer = serversList[sIdx];
      if (!curServer || !curServer.episodes || epIdx < 0 || epIdx >= curServer.episodes.length) return;

      currentServerIndex = sIdx;
      currentIndex = epIdx;

      renderUI();
      triggerTitleDisplay();

      var epObj = curServer.episodes[epIdx];
      var rawId = epObj.id || epObj.slug || epObj.link || epObj.url || "";
      var cleanId = extractId(rawId);

      if (shouldChangeIframe) {
        var epName = epObj.name || ("Tập " + (epIdx + 1));
        showLoading("Đang tải " + epName + " (" + curServer.name + ")...");

        if (cleanId) {
          if (cleanId.indexOf("http://") === 0 || cleanId.indexOf("https://") === 0) {
            iframe.src = cleanId;
          } else {
            iframe.src = ABYSS_BASE_URL + cleanId;
          }
          bridgeLog("[CustomJS] [" + curServer.name + "] - Phát tập " + (epIdx + 1) + " (ID: " + cleanId + ")");
        }
      }

      // VẪN GIỮ CƠ CHẾ LƯU LỊCH SỬ VÀO LOCALSTORAGE
      if (activeMovieKey) {
        if (saveHistoryTimeout) clearTimeout(saveHistoryTimeout);
        saveHistoryTimeout = setTimeout(function() {
          try {
            var histObj = { server: currentServerIndex, ep: currentIndex };
            localStorage.setItem("PLAYER_HIST_" + activeMovieKey, JSON.stringify(histObj));
            bridgeLog("[CustomJS] Đã lưu lịch sử: " + curServer.name + " - Tập " + (currentIndex + 1));
          } catch(e) {}
        }, 5000); 
      }
    }

    function navigateEp(direction) { 
      selectEpisode(currentServerIndex, currentIndex + direction, true); 
    }

    // 3. ĐỒNG BỘ MÔI TRƯỜNG & KHỞI CHẠY TẬP HIỆN TẠI
    var selectedServerIdx = 0;
    var selectedEpIdx = 0;
    var targetId = extractId(initVid) || extractId(fallbackUrlStr);
    var isFound = false;

    if (targetId && serversList.length > 0) {
      for (var s = 0; s < serversList.length; s++) {
        var eps = serversList[s].episodes;
        for (var e = 0; e < eps.length; e++) {
          var currentEpId = extractId(eps[e].id || eps[e].slug || eps[e].link || eps[e].url || "");
          if (currentEpId && (currentEpId.toLowerCase() === targetId.toLowerCase())) {
            selectedServerIdx = s;
            selectedEpIdx = e;
            isFound = true;
            break;
          }
        }
        if (isFound) break;
      }
    }

    if (serversList.length > 0) {
      selectEpisode(selectedServerIdx, selectedEpIdx, false);
    }

    // 4. KIỂM TRA VÀ HIỂN THỊ LỊCH SỬ XEM TỪ LOCALSTORAGE
    var savedServerIdx = -1;
    var savedEpIdx = -1;

    if (activeMovieKey && serversList.length > 0) {
      try {
        var histVal = localStorage.getItem("PLAYER_HIST_" + activeMovieKey);
        if (histVal) {
          var parsedHist = JSON.parse(histVal);
          if (parsedHist && typeof parsedHist.server === 'number' && typeof parsedHist.ep === 'number') {
            if (parsedHist.server < serversList.length && parsedHist.ep < serversList[parsedHist.server].episodes.length) {
              savedServerIdx = parsedHist.server;
              savedEpIdx = parsedHist.ep;
            }
          }
        }
      } catch(e) {}
    }

    if (savedServerIdx !== -1 && savedEpIdx !== -1) {
      var isSameEp = (selectedServerIdx === savedServerIdx && selectedEpIdx === savedEpIdx);
      var isNextEp = (selectedServerIdx === savedServerIdx && selectedEpIdx === (savedEpIdx + 1));

      if (!isSameEp && !isNextEp) {
        var savedEpName = serversList[savedServerIdx].episodes[savedEpIdx].name || ("Tập " + (savedEpIdx + 1));
        document.getElementById("v-hist-txt").innerHTML = 'Lịch sử xem: Bạn từng xem đến <strong>' + savedEpName + '</strong> (' + serversList[savedServerIdx].name + ')';
        
        histBar.style.display = "block";
        epPanel.classList.add("active");
        triggerTitleDisplay();

        function closeHistBar() {
          if (histAutoCloseTimeout) clearTimeout(histAutoCloseTimeout);
          histBar.style.display = "none";
          epPanel.classList.remove("active"); 
        }

        if (histAutoCloseTimeout) clearTimeout(histAutoCloseTimeout);
        histAutoCloseTimeout = setTimeout(function() {
          closeHistBar();
        }, 15000);

        document.getElementById("v-btn-resume").onclick = function() {
          closeHistBar();
          selectEpisode(savedServerIdx, savedEpIdx, true);
        };

        document.getElementById("v-btn-next").onclick = function() {
          closeHistBar();
          var nextEpIndex = savedEpIdx + 1;
          if (nextEpIndex < serversList[savedServerIdx].episodes.length) {
            selectEpisode(savedServerIdx, nextEpIndex, true);
          } else {
            showToast("Đã là tập cuối của " + serversList[savedServerIdx].name);
          }
        };

        document.getElementById("v-btn-close").onclick = function() {
          closeHistBar();
        };
      }
    }
  }

  // Chạy ngay khi DOM sẵn sàng
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPlayer);
  } else {
    initPlayer();
  }
})();
  `;
}