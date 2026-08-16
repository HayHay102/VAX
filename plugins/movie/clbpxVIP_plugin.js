BASEURL = "https://clbpx.alokillgtv.workers.dev";
BASESOURCE = "";
var popup_html = "<div class='donate-container'><h2 class='donate-heading'>DONATE</h2><p class='donate-description'>Anh em yêu quý có thể mời bọn mình 2 ly cà phê nhé. Để có động lực duy trì App, cập nhật plugin và tìm thêm nhiều nguồn mới và hay cho anh em. Một chút lòng thành cũng làm bọn mình tiếp tục hoạt động tốt hơn, cám ơn anh em.</p><div class='donate-grid'><div class='donate-card'><div class='donate-title'>Donate Tác giả Plugin</div><div class='qr-wrapper'><img src='https://vaxplugin.alokillgtv.workers.dev/img/qrht.png' alt='Donate Tác giả Plugin' /></div></div><div class='donate-card'><div class='donate-title'>Donate Tác giả App</div><div class='qr-wrapper'><img src='https://vaxplugin.alokillgtv.workers.dev/img/qryb.png' alt='Donate Tác giả App' /></div></div></div></div><style>.donate-container{max-width:800px;margin:0 auto;padding:10px;box-sizing:border-box;font-family:Arial,sans-serif;text-align:center;color:#eee}.donate-heading{font-size:22px;font-weight:bold;margin:0 0 12px 0;color:#fff;text-transform:uppercase;letter-spacing:1px}.donate-description{font-size:14px;line-height:1.5;margin-bottom:18px;color:#ccc}.donate-grid{display:flex;flex-direction:row;justify-content:center;align-items:stretch;gap:16px}.donate-card{flex:1;min-width:0;background:#22252a;border-radius:12px;padding:14px;border:1px solid #33373e;display:flex;flex-direction:column;align-items:center}.donate-title{font-weight:bold;font-size:15px;margin-bottom:12px;color:#fff}.qr-wrapper{width:100%;max-width:240px;aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;background:#181a1d;border-radius:8px;padding:8px;box-sizing:border-box}.qr-wrapper img{width:100%;height:100%;object-fit:contain;border-radius:4px}@media(max-width:600px){.donate-grid{flex-direction:column}.donate-heading{font-size:18px;margin-bottom:8px}.donate-description{font-size:13px;margin-bottom:12px}.qr-wrapper{max-width:180px}}</style>"
function getManifest() {
    return JSON.stringify({
        "id": "clbpxVIP",
        "name": "CLB Phim Xưa VIP",
        "version": "1.6",
        "info": "",
        "BASEURL": "https://clbpx.alokillgtv.workers.dev",
        "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/clbpx.png",
        "isEnabled": true,
        "isAdult": false,
        "adblock": false,
        "type": "MOVIE",
        "playerType": "embed",
        "layoutType": "HORIZONTAL",
        popup_html: popup_html
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

        // ✅ Đã sửa: Chuẩn hóa URL bằng Regex cực kỳ an toàn, không lo lỗi crash
        function normalizeEpUrl(rawUrl) {
            if (!rawUrl) return "";
            // Loại bỏ domain cũ nếu có (http://domain.com hoặc https://domain.com)
            var pathAndQuery = rawUrl.replace(/^https?:\/\/[^\/]+/i, '');
            
            // Bắt buộc phải có dấu / ở đầu đường dẫn
            if (!pathAndQuery.startsWith('/')) {
                pathAndQuery = '/' + pathAndQuery;
            }

            return "https://example.com" + pathAndQuery;
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
                    if (videoId) saveEp.push(videoId);

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
            var fallbackSaveEp = [];
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
                "Custom-Js": checkraw,
                "Block-Ads": true
            }
        });
    } catch (error) {
        console.log("Lỗi parseDetail\n" + error);
        return JSON.stringify({ url: fallbackUrl || "", headers: {} });
    }
}

function rawJS(initialVideoId, fallbackUrl, movieKey) {
    return `


(function initDomInspector() {
  if (window === window.top) {
    if (typeof window.bridgeLog !== 'function') {
      window.bridgeLog = function(msg) {
        try {
          if (window.SnifferBridge && typeof window.SnifferBridge.log === 'function') {
            window.SnifferBridge.log(msg);
          } else if (typeof console !== 'undefined' && console.log) {
            console.log(msg);
          }
        } catch(e) {}
      };
    }

    window.addEventListener('message', function(e) {
      if (e.data && e.data.type === 'INSPECT_ELEMENT_RESULT') {
        window.bridgeLog("=== PHẦN TỬ ĐƯỢC CLICK ===");
        window.bridgeLog("Host: " + e.data.host);
        window.bridgeLog("Target: " + e.data.target);
        window.bridgeLog("Hierarchy: " + e.data.hierarchy);
      }
    });
  }

  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    e.stopPropagation();

    var el = e.target;
    var chain = [];

    while (el && el !== document) {
      var tag = el.tagName ? el.tagName.toLowerCase() : "";
      var id = el.id ? "#" + el.id : "";
      var cls = (el.className && typeof el.className === 'string') ? 
        "." + el.className.trim().split(/\\s+/).join(".") : "";
      
      chain.push(tag + id + cls);
      el = el.parentElement;
    }

    try {
      window.top.postMessage({
        type: 'INSPECT_ELEMENT_RESULT',
        host: window.location.hostname || 'iframe',
        target: chain[0] || 'unknown',
        hierarchy: chain.join(" -> ")
      }, '*');
    } catch(err) {}
  }, true);
})();

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

  const isTop = (window === window.top);
  const isLevel1 = (!isTop && window.parent === window.top);
  const isLevel2 = (!isTop && !isLevel1);

  var KILL_OVERLAY_CSS = "#playback, #overlay, .mask, .blocker, [id*='overlay'], [class*='overlay'], [id*='playback'], [class*='playback'], .jw-controls-backdrop, .jw-display-icon-container { pointer-events: none !important; opacity: 0 !important; z-index: -9999 !important; }";

  window.addEventListener("keydown", function(e) {
    var activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : "";
    var isUIButton = (activeTag === "button" || (document.activeElement && document.activeElement.classList.contains("ep-item")));

    var isEnter = (e.key === "Enter" || e.code === "Enter" || e.keyCode === 13 || e.keyCode === 66 || e.keyCode === 23);
    var isPlayPauseMedia = (e.key === "MediaPlayPause" || e.key === "MediaPlay" || e.key === "MediaPause" || e.keyCode === 179 || e.keyCode === 228);

    if (isEnter || isPlayPauseMedia) {
      if (!isUIButton) {
        e.preventDefault();
        e.stopPropagation();
        if (isTop) {
          var iframe1 = document.getElementById("player-frame");
          if (iframe1 && iframe1.contentWindow) {
            iframe1.contentWindow.postMessage({ type: "TOGGLE_PLAY" }, "*");
          }
        } else {
          window.top.postMessage({ type: "CMD_TOGGLE_PLAY" }, "*");
        }
      }
      return;
    }

    if (e.key === "ArrowLeft" || e.keyCode === 37) {
      e.preventDefault();
      e.stopPropagation();
      if (document.activeElement && document.activeElement.blur && !isUIButton) {
        document.activeElement.blur();
      }
      if (isTop) {
        var iframe1 = document.getElementById("player-frame");
        if (iframe1 && iframe1.contentWindow) iframe1.contentWindow.postMessage({ type: "SEEK", seconds: -10 }, "*");
      } else {
        window.top.postMessage({ type: "CMD_SEEK", seconds: -10 }, "*");
      }
    } else if (e.key === "ArrowRight" || e.keyCode === 39) {
      e.preventDefault();
      e.stopPropagation();
      if (document.activeElement && document.activeElement.blur && !isUIButton) {
        document.activeElement.blur();
      }
      if (isTop) {
        var iframe1 = document.getElementById("player-frame");
        if (iframe1 && iframe1.contentWindow) iframe1.contentWindow.postMessage({ type: "SEEK", seconds: 10 }, "*");
      } else {
        window.top.postMessage({ type: "CMD_SEEK", seconds: 10 }, "*");
      }
    } else if (e.key === "PageUp" || e.keyCode === 33) {
      e.preventDefault();
      if (isTop) { navigateEp(-1); } else { window.top.postMessage({ type: "EP_NAV", direction: -1 }, "*"); }
    } else if (e.key === "PageDown" || e.keyCode === 34) {
      e.preventDefault();
      if (isTop) { navigateEp(1); } else { window.top.postMessage({ type: "EP_NAV", direction: 1 }, "*"); }
    }
  }, true);

  // =========================================================================
  // LỚP 1: TOP WINDOW
  // =========================================================================
  if (isTop) {
    function initPlayer() {
      var ABYSS_BASE_URL = "https://abysscdn.com/?v=";
      var serversList = [];
      var currentServerIndex = 0;
      var currentIndex = 0;
      var activeMovieKey = "${movieKey}";
      var fallbackUrlStr = "${fallbackUrl}";
      var initVid = "${initialVideoId}";
      var globalMovieTitle = ""; 
      var loadingTimeout = null;
      var titleDisplayTimeout = null;
      var toastTimeout = null;

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
          var cleanBase64 = str.replace(/-/g, '+').replace(/_/g, '/');
          while (cleanBase64.length % 4 !== 0) { cleanBase64 += '='; }
          
          var binary = atob(cleanBase64);
          var bytes = new Uint8Array(binary.length);
          for (var i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }
          
          if (typeof TextDecoder !== "undefined") {
            return new TextDecoder("utf-8").decode(bytes);
          }
          
          return decodeURIComponent(escape(binary));
        } catch (e) {
          try {
            return decodeURIComponent(str);
          } catch(err) {
            return null;
          }
        }
      }

      if (document.body) document.body.innerHTML = "";
      
      var css = KILL_OVERLAY_CSS + " " +
        "html, body { width: 100vw !important; height: 100vh !important; margin: 0 !important; padding: 0 !important; overflow: hidden !important; background: #000 !important; position: fixed !important; top: 0 !important; left: 0 !important; } " +
        "#player-frame { width: 100vw !important; height: 100vh !important; border: 0 !important; display: block !important; position: absolute !important; top: 0 !important; left: 0 !important; z-index: 1 !important; margin: 0 !important; padding: 0 !important; } " +
        ".v-fade-ctrl { opacity: 0.2; transition: opacity 0.3s ease; z-index: 999999999 !important; } .v-fade-ctrl:hover, body:active .v-fade-ctrl { opacity: 1; } " +
        ".v-menu-wrap { position: absolute; top: 15px; right: 15px; z-index: 999999999 !important; display: flex; gap: 8px; } .v-btn-toggle { background: rgba(0, 0, 0, 0.85); color: #fff; border: 1px solid rgba(255,255,255,0.4); padding: 8px 14px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 14px; } .v-btn-toggle:focus { outline: 2px solid #e50914; opacity: 1; } " +
        ".v-title-overlay { position: absolute; top: 15px; left: 15px; z-index: 999999999 !important; background: rgba(0,0,0,0.85); border: 1px solid rgba(255,255,255,0.4); padding: 8px 14px; border-radius: 6px; font-size: 14px; font-weight: bold; color: #fff; max-width: calc(100vw - 320px); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; pointer-events: none; transition: opacity 0.4s ease; opacity: 1 !important; } " +
        ".v-playlist-panel { display: none; position: absolute; top: 45px; right: 0; width: calc(100vw - 30px); max-width: 340px; max-height: calc(80vh - 70px); background: rgba(15, 15, 15, 0.98); border: 1px solid rgba(255,255,255,0.3); border-radius: 8px; padding: 12px; overflow-y: auto; -webkit-overflow-scrolling: touch; box-shadow: 0 4px 25px rgba(0,0,0,0.9); z-index: 999999999 !important; } .v-playlist-panel.active { display: block; } " +
        ".server-tabs-container { display: flex; gap: 6px; margin-bottom: 12px; overflow-x: auto; padding-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.15); -webkit-overflow-scrolling: touch; } .server-tab-item { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.25); color: #ccc; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; white-space: nowrap; font-weight: bold; } .server-tab-item:focus { outline: 2px solid #fff; } .server-tab-item.active { background: #e50914; color: #fff; border-color: #e50914; } " +
        ".ep-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; } .ep-item { background: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.25); color: #fff; padding: 8px 2px; text-align: center; border-radius: 4px; cursor: pointer; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .ep-item:focus { outline: 2px solid #e50914; background: rgba(229, 9, 20, 0.5); } .ep-item.active { background: #e50914; font-weight: bold; border-color: #fff; } " +
        ".nav-ep-btn { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.7); border: 1px solid rgba(255,255,255,0.4); color: white; width: 44px; height: 44px; border-radius: 50%; cursor: pointer; font-size: 20px; display: flex; align-items: center; justify-content: center; z-index: 999999999 !important; } .nav-ep-btn:focus { outline: 2px solid #e50914; } .nav-prev { left: 15px; } .nav-next { right: 15px; } " +
        ".v-load-txt{color:white!important; z-index: 9999999999 !important;}#v-loading-layer { position: absolute; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.85); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 9999999999 !important; pointer-events: none; } .spinner { width: 42px; height: 42px; border: 4px solid rgba(255,255,255,0.15); border-top-color: #e50914; border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 12px; } @keyframes spin { to { transform: rotate(360deg); } " +
        ".mini-toast { position: absolute; top: 65%; left: 50%; transform: translate(-50%, -50%) scale(0.8); background: rgba(0, 0, 0, 0.95); border: 2px solid #e50914; color: #fff; padding: 12px 24px; border-radius: 30px; font-size: 14px; font-weight: bold; z-index: 999999999 !important; display: flex; align-items: center; gap: 8px; box-shadow: 0 0 20px rgba(229, 9, 20, 0.6); pointer-events: none; opacity: 0; transition: opacity 0.1s ease, transform 0.1s ease; text-align: center;z-index: 99999999999 !important } .mini-toast.show { opacity: 1; transform: translate(-50%, -50%) scale(1);  z-index: 99999999999 !important}";
      
      var style = document.createElement("style"); 
      style.appendChild(document.createTextNode(css)); 
      (document.head || document.documentElement).appendChild(style);

      var iframe = document.createElement("iframe"); 
      iframe.id = "player-frame"; 
      iframe.setAttribute("allow", "autoplay; encrypted-media; fullscreen"); 
      iframe.setAttribute("allowfullscreen", "true");
      iframe.setAttribute("tabindex", "0");

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
      loadingOverlay.innerHTML = '<div class="spinner"></div><div id="v-load-txt" style="font-size:13px; font-weight:bold;color:white!important;z-index:214748364723 !important">Đang tải...</div>';
      
      var miniToast = document.createElement("div"); 
      miniToast.className = "mini-toast";
      miniToast.id = "v-mini-toast";

      // CUỘC HỘI TỤ MENU GÓC PHẢI
      var epContainer = document.createElement("div"); 
      epContainer.className = "v-menu-wrap v-fade-ctrl";

      // NÚT CHỈNH SCALE
      var scaleToggleBtn = document.createElement("button");
      scaleToggleBtn.className = "v-btn-toggle";
      scaleToggleBtn.innerText = "Scale: Vừa khung";
      scaleToggleBtn.setAttribute("tabindex", "0");

      var scaleModes = [
        { name: "Vừa khung", fit: "contain" },
        { name: "Lấp đầy", fit: "cover" },
        { name: "Đãn khung", fit: "fill" }
      ];
      var currentScaleIdx = 0;

      scaleToggleBtn.onclick = function (e) {
        e.stopPropagation();
        currentScaleIdx = (currentScaleIdx + 1) % scaleModes.length;
        var selectedMode = scaleModes[currentScaleIdx];
        scaleToggleBtn.innerText = "Scale: " + selectedMode.name;

        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage({ 
            type: "CHANGE_SCALE", 
            fit: selectedMode.fit,
            name: selectedMode.name 
          }, "*");
        }
      };

      // NÚT DANH SÁCH TẬP
      var epToggleBtn = document.createElement("button"); 
      epToggleBtn.className = "v-btn-toggle"; 
      epToggleBtn.innerText = "Danh sách tập";
      epToggleBtn.setAttribute("tabindex", "0");
      epToggleBtn.onclick = function (e) {
        e.stopPropagation();
        epPanel.classList.toggle("active"); 
      };
      
      var epPanel = document.createElement("div"); 
      epPanel.className = "v-playlist-panel"; 

      var serverTabs = document.createElement("div"); 
      serverTabs.className = "server-tabs-container";
      var epGrid = document.createElement("div"); 
      epGrid.className = "ep-grid"; 
      
      epPanel.appendChild(serverTabs); 
      epPanel.appendChild(epGrid); 
      epContainer.appendChild(scaleToggleBtn);
      epContainer.appendChild(epToggleBtn); 
      epContainer.appendChild(epPanel);

      var prevBtn = document.createElement("button"); 
      prevBtn.className = "nav-ep-btn nav-prev v-fade-ctrl"; 
      prevBtn.textContent = "❮";
      prevBtn.setAttribute("tabindex", "0");
      prevBtn.onclick = function (e) { e.stopPropagation(); navigateEp(-1); };
      
      var nextBtn = document.createElement("button"); 
      nextBtn.className = "nav-ep-btn nav-next v-fade-ctrl"; 
      nextBtn.textContent = "❯"; 
      nextBtn.setAttribute("tabindex", "0");
      nextBtn.onclick = function (e) { e.stopPropagation(); navigateEp(1); };

      document.body.appendChild(iframe); 
      document.body.appendChild(titleOverlay);
      document.body.appendChild(loadingOverlay); 
      document.body.appendChild(miniToast); 
      document.body.appendChild(epContainer); 
      document.body.appendChild(prevBtn); 
      document.body.appendChild(nextBtn);

      function focusPlayerIframe() {
        try {
          if (iframe) {
            iframe.focus();
            if (iframe.contentWindow) {
              iframe.contentWindow.focus();
              iframe.contentWindow.postMessage({ type: "FOCUS_LEVEL2" }, "*");
            }
          }
        } catch(e) {}
      }

      window.showMiniToast = function(msg) {
        miniToast.innerHTML = '⚡ <span>' + msg + '</span>';
        miniToast.classList.add("show");
        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(function() {
          miniToast.classList.remove("show");
        }, 2000);
      };

      function triggerTitleDisplay() {
        if (!serversList || serversList.length === 0) return;
        var curServer = serversList[currentServerIndex];
        if (!curServer || !curServer.episodes || !curServer.episodes[currentIndex]) return;
        
        var epObj = curServer.episodes[currentIndex];
        var epName = epObj.name || ("Tập " + (currentIndex + 1));
        var movieName = curServer.nameMV || globalMovieTitle || "";
        
        var displayStr = movieName ? (movieName + " - " + epName) : epName;
        
        titleOverlay.innerText = displayStr;
        document.title = displayStr; 
      }

      function showLoading(msg) {
        var el = document.getElementById("v-load-txt");
        if (el) el.innerText = msg || "Đang tải video...";
        loadingOverlay.style.display = "flex";
        el.style.color = "white!important";
        loadingOverlay.style.color = "white!important";
        if (loadingTimeout) clearTimeout(loadingTimeout);
        loadingTimeout = setTimeout(function() { hideLoading(); }, 10000);
      }

      function hideLoading() {
        if (loadingTimeout) clearTimeout(loadingTimeout);
        loadingOverlay.style.display = "none";
        focusPlayerIframe();
      }

      iframe.onload = function() {
        hideLoading();
        focusPlayerIframe();
      };

      try {
        var rawData = [];
        var saveParamMatch = fallbackUrlStr.match(/[?&]save=([^&]+)/);

        if (saveParamMatch && saveParamMatch[1]) {
          var decodedJson = decodeBase64Utf8(saveParamMatch[1]);
          if (decodedJson) {
            try {
              rawData = JSON.parse(decodedJson);
            } catch(jsonErr) {
              bridgeLog("Lỗi JSON Parse: " + jsonErr.message);
            }
          }
        }

        if (Array.isArray(rawData) && rawData.length > 0) {
          rawData.forEach(function(server) {
            if (server && server.nameMV && !globalMovieTitle) {
              globalMovieTitle = server.nameMV;
            }
            
            if (server && server.episodes && Array.isArray(server.episodes)) {
              var formattedEps = server.episodes.map(function(epItem, idx) {
                var epId = (typeof epItem === 'object' && epItem !== null) ? (epItem.id || epItem.slug) : String(epItem);
                var epName = (typeof epItem === 'object' && epItem !== null && epItem.name) ? epItem.name : ("Tập " + (idx + 1));
                
                return {
                  id: String(epId),
                  name: epName,
                  slug: String(epId)
                };
              });

              serversList.push({
                name: server.name || server.server_name || ("Server " + (serversList.length + 1)),
                nameMV: server.nameMV || globalMovieTitle || "",
                episodes: formattedEps
              });
            }
          });
        }
      } catch (e) {
        bridgeLog("Lỗi tổng trong quá trình parse data: " + e.message);
      }

      function renderUI() {
        if (serversList.length === 0) return;
        serverTabs.innerHTML = "";
        serversList.forEach(function (server, sIndex) {
          var tab = document.createElement("div");
          tab.className = "server-tab-item" + (sIndex === currentServerIndex ? " active" : "");
          tab.innerText = server.name;
          tab.setAttribute("tabindex", "0");
          tab.onclick = function (e) {
            e.stopPropagation();
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
          item.setAttribute("tabindex", "0");
          item.onclick = function (e) { 
            e.stopPropagation();
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
        var rawId = epObj.id || epObj.slug || "";
        var cleanId = extractId(rawId);

        if (shouldChangeIframe) {
          var epName = epObj.name || ("Tập " + (epIdx + 1));
          var movieName = curServer.nameMV || globalMovieTitle || "";
          
          showLoading("Đang tải " + (movieName ? movieName + " - " : "") + epName + "...");
          window.showMiniToast("Đang chuyển tới " + epName);

          var targetUrl = cleanId;
          if (cleanId && !cleanId.startsWith("http://") && !cleanId.startsWith("https://")) {
            targetUrl = ABYSS_BASE_URL + cleanId;
          }
          
          iframe.src = targetUrl;
          focusPlayerIframe();
        }
      }

      function navigateEp(direction) { 
        selectEpisode(currentServerIndex, currentIndex + direction, true); 
      }

      var selectedServerIdx = 0;
      var selectedEpIdx = 0;
      var targetId = extractId(initVid) || extractId(fallbackUrlStr);
      var isFound = false;

      if (targetId && serversList.length > 0) {
        for (var s = 0; s < serversList.length; s++) {
          var eps = serversList[s].episodes;
          for (var e = 0; e < eps.length; e++) {
            var currentEpId = extractId(eps[e].id || eps[e].slug || "");
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

      window.addEventListener("message", function(event) {
        if (event.data) {
          if (event.data.type === "EP_NAV") {
            navigateEp(event.data.direction);
          } else if (event.data.type === "TOAST_MSG") {
            window.showMiniToast(event.data.msg);
          } else if (event.data.type === "CMD_TOGGLE_PLAY") {
            if (iframe && iframe.contentWindow) {
              iframe.contentWindow.postMessage({ type: "TOGGLE_PLAY" }, "*");
            }
          } else if (event.data.type === "CMD_SEEK") {
            if (iframe && iframe.contentWindow) {
              iframe.contentWindow.postMessage({ type: "SEEK", seconds: event.data.seconds }, "*");
            }
          }
        }
      });
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initPlayer);
    } else {
      initPlayer();
    }
    return;
  }

  // =========================================================================
  // LỚP 2: IFRAME TRUNG GIAN
  // =========================================================================
  if (isLevel1) {
    function initL2() {
      try {
        var overlayStyle = document.createElement("style");
        overlayStyle.innerHTML = "html, body { margin:0 !important; padding:0 !important; width:100vw !important; height:100vh !important; overflow:hidden !important; background:#000 !important; position:fixed !important; top:0 !important; left:0 !important; }";
        (document.head || document.documentElement).appendChild(overlayStyle);
      } catch(e) {}

      document.documentElement.innerHTML = "<html><head></head><body style='margin:0;padding:0;background:#000;width:100vw;height:100vh;overflow:hidden;'></body></html>";

      const newChildFrame = document.createElement("iframe");
      newChildFrame.src = window.location.href;
      newChildFrame.style.cssText = "width:100vw !important; height:100vh !important; border:none !important; position:absolute !important; top:0 !important; left:0 !important; margin:0 !important; padding:0 !important;";
      newChildFrame.id = "core_player_frame";
      newChildFrame.setAttribute("allow", "autoplay; encrypted-media; fullscreen");
      newChildFrame.setAttribute("allowfullscreen", "true");
      newChildFrame.setAttribute("tabindex", "0");

      document.body.appendChild(newChildFrame);

      function focusLevel3() {
        try {
          if (newChildFrame) {
            newChildFrame.focus();
            if (newChildFrame.contentWindow) {
              newChildFrame.contentWindow.focus();
              newChildFrame.contentWindow.postMessage({ type: "FOCUS_CORE" }, "*");
            }
          }
        } catch(e) {}
      }

      newChildFrame.onload = function() { focusLevel3(); };

      window.addEventListener("message", function(e) {
        if (e.data) {
          if (e.data.type === "TOGGLE_PLAY" || e.data.type === "SEEK" || e.data.type === "CHANGE_SCALE") {
            if (newChildFrame && newChildFrame.contentWindow) {
              newChildFrame.contentWindow.postMessage(e.data, "*");
            }
          } else if (e.data.type === "FOCUS_LEVEL2") {
            focusLevel3();
          }
        }
      });
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initL2);
    } else {
      initL2();
    }
    return;
  }

    // =========================================================================
  // LỚP 3: CORE PLAYER (MODULE TỰ ĐỘNG PLAY & GIÁM SÁT 1 PHÚT)
  // =========================================================================
    // =========================================================================
  // LỚP 3: CORE PLAYER (AUTO HIGH QUALITY + LOCAL TOAST BOTTOM RIGHT + MONITOR)
  // =========================================================================
  if (isLevel2) {
    var hasSetQuality = false;

    // 1. TẠO TOAST TRỰC TIẾP TRONG LỚP 3 (GÓC DƯỚI BÊN PHẢI - NÂNG CAO LÊN TRÁNH THANH PROGRESS BAR)
    var localToast = document.createElement("div");
    localToast.id = "l3-custom-toast";
    localToast.style.cssText = "position:fixed; bottom:70px; right:20px; background:rgba(0,0,0,0.85); color:#fff; border:1px solid #e50914; padding:8px 16px; border-radius:6px; font-size:13px; font-weight:bold; font-family:sans-serif; z-index:2147483647; opacity:0; transition:opacity 0.2s ease, transform 0.2s ease; transform:translateY(10px); pointer-events:none; box-shadow:0 4px 12px rgba(0,0,0,0.5);";
    (document.body || document.documentElement).appendChild(localToast);

    var toastTimer = null;
    function showL3Toast(msg) {
      // Gửi ra Top Frame (nếu top hỗ trợ hiển thị)
      try { window.top.postMessage({ type: "TOAST_MSG", msg: msg }, "*"); } catch(e) {}
      
      // Hiển thị trực tiếp tại Lớp 3
      localToast.innerText = "⚡ " + msg;
      localToast.style.opacity = "1";
      localToast.style.transform = "translateY(0)";
      
      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(function() {
        localToast.style.opacity = "0";
        localToast.style.transform = "translateY(10px)";
      }, 2500);
    }

    var customScaleStyle = document.createElement("style");
    customScaleStyle.id = "custom-jw-scale-style";
    (document.head || document.documentElement).appendChild(customScaleStyle);

    function applyScaleMode(fitMode) {
      customScaleStyle.innerHTML = 
        "video, .jw-video, .jw-media, video.jw-video { " +
        "  object-fit: " + fitMode + " !important; " +
        "  width: 100% !important; " +
        "  height: 100% !important; " +
        "}";
    }
    applyScaleMode("contain");

    // 2. HÀM TỰ ĐỘNG CHỌN QUALITY CAO NHẤT (CÓ RETRY VÀ KIỂM TRA ĐỘ PHÂN GIẢI SỐ)
    function autoSetBestQuality() {
      if (hasSetQuality) return;
      try {
        if (typeof jwplayer === 'function') {
          var p = jwplayer();
          if (p && typeof p.getQualityLevels === 'function' && typeof p.setCurrentQuality === 'function') {
            var levels = p.getQualityLevels();
            
            // Nếu danh sách chưa sẵn sàng hoặc chỉ có 1 mức (Auto), bỏ qua chờ lần lặp sau
            if (!levels || levels.length <= 1) return;

            var bestIndex = -1;
            
            // Tìm theo Label chuẩn: 4k / 2160p -> 1080p -> 720p
            var targets = ["2160", "4k", "1080", "720"];
            for (var t = 0; t < targets.length; t++) {
              for (var i = 0; i < levels.length; i++) {
                var lbl = String(levels[i].label || "").toLowerCase();
                if (lbl.indexOf(targets[t]) !== -1) {
                  bestIndex = i;
                  break;
                }
              }
              if (bestIndex !== -1) break;
            }

            // Nếu không khớp chuỗi text, lọc theo giá trị width/height thực tế nếu có
            if (bestIndex === -1) {
              var maxRes = 0;
              for (var j = 0; j < levels.length; j++) {
                var res = levels[j].height || levels[j].width || 0;
                if (res > maxRes) {
                  maxRes = res;
                  bestIndex = j;
                }
              }
            }

            // Mặc định cuối cùng: Lấy phần tử có Index lớn nhất
            if (bestIndex === -1) {
              bestIndex = levels.length - 1;
            }

            if (bestIndex !== -1) {
              p.setCurrentQuality(bestIndex);
              var qLabel = levels[bestIndex].label || (levels[bestIndex].height ? levels[bestIndex].height + "p" : "Cao nhất");
              
              showL3Toast("Chất lượng: " + qLabel);
              hasSetQuality = true; // Khóa lại khi đã áp dụng thành công

              // Ép play lại nếu việc chuyển Quality khiến video bị Pause
              setTimeout(function() {
                if (p.getState && p.getState() !== 'playing') {
                  if (typeof p.play === 'function') p.play(true);
                }
              }, 300);
            }
          }
        }
      } catch(e) {}
    }

    function executeAutoplay() {
      try {
        if (typeof jwplayer === 'function') {
          var p = jwplayer();
          if (p && typeof p.getState === 'function') {
            if (p.getState() === 'playing') {
              autoSetBestQuality();
              return true;
            }
            if (typeof p.play === 'function') p.play(true);
          }
        }

        var videoEl = document.querySelector("video");
        if (videoEl) {
          if (!videoEl.paused && videoEl.currentTime > 0) {
            autoSetBestQuality();
            return true;
          }
          videoEl.muted = false;
          var promise = videoEl.play();
          if (promise !== undefined) {
            promise.catch(function() { 
              videoEl.muted = true; 
              videoEl.play(); 
            });
          }
        }
      } catch(e) {}
      return false;
    }

    function focusCorePlayer() {
      try {
        window.focus();
        var v = document.querySelector("video");
        if (v) v.focus();
      } catch(e) {}
    }

    function togglePlayCore() {
      try {
        if (typeof jwplayer === 'function') {
          var p = jwplayer();
          if (p && typeof p.getState === 'function') {
            if (p.getState() === "playing") { p.pause(true); showL3Toast("Tạm dừng"); } 
            else { p.play(true); showL3Toast("Đang phát"); }
            return;
          }
        }
        var videoEl = document.querySelector("video");
        if (videoEl) {
          if (videoEl.paused) { videoEl.play(); showL3Toast("Đang phát"); } 
          else { videoEl.pause(); showL3Toast("Tạm dừng"); }
          return;
        }
        executeAutoplay();
      } catch(e) {}
    }

    function seekCore(seconds) {
      try {
        if (typeof jwplayer === 'function') {
          var p = jwplayer();
          if (p && typeof p.getPosition === 'function' && typeof p.seek === 'function') {
            p.seek(p.getPosition() + seconds);
            showL3Toast((seconds > 0 ? "Tua tới +" : "Tua lùi ") + seconds + "s");
            return;
          }
        }
        var videoEl = document.querySelector("video");
        if (videoEl) {
          videoEl.currentTime += seconds;
          showL3Toast((seconds > 0 ? "Tua tới +" : "Tua lùi ") + seconds + "s");
        }
      } catch(e) {}
    }
    
    // 3. GIÁM SÁT TRONG 1 PHÚT (EVALUATE CHẤT LƯỢNG KHI NÀO SẴN SÀNG)
    (function monitorAndForcePlay() {
      var elapsedTime = 0;
      var intervalTime = 500;

      var monitorInterval = setInterval(function() {
        elapsedTime += intervalTime;
        
        if (elapsedTime >= 60000) {
          clearInterval(monitorInterval);
          return;
        }

        try {
          // Auto Click Continue Button
          var notifyBtn = document.querySelector(".jwpl-notify-custom-continue, #overlay");
          if (notifyBtn) {
            var isVisible = (notifyBtn.offsetWidth > 0 || notifyBtn.offsetHeight > 0 || getComputedStyle(notifyBtn).display !== 'none');
            if (isVisible) {
              notifyBtn.click();
              showL3Toast("Đã tự động tiếp tục phát");
            }
          }

          // Kiểm tra và ép phát nếu bị dừng + Thử đổi Quality liên tục cho đến khi thành công
          var isPaused = false;
          if (typeof jwplayer === 'function') {
            try {
              var p = jwplayer();
              if (p && typeof p.getState === 'function') {
                if (p.getState() !== 'playing') {
                  isPaused = true;
                } else {
                  autoSetBestQuality(); // Chạy liên tục mỗi 0.5s nếu chưa set thành công
                }
              }
            } catch(e) {}
          }

          var videoEl = document.querySelector("video");
          if (videoEl && videoEl.paused) {
            isPaused = true;
          }

          if (isPaused) {
            executeAutoplay();
          }
        } catch (e) {}
      }, intervalTime);
    })();

    if (document.readyState === "complete") {
      focusCorePlayer();
    } else {
      window.addEventListener("load", function() { 
        focusCorePlayer(); 
      });
    }

    window.addEventListener("message", function(e) {
      if (e.data) {
        if (e.data.type === "TOGGLE_PLAY") togglePlayCore();
        else if (e.data.type === "SEEK") seekCore(e.data.seconds || 10);
        else if (e.data.type === "FOCUS_CORE") focusCorePlayer();
        else if (e.data.type === "CHANGE_SCALE") {
          applyScaleMode(e.data.fit);
          showL3Toast("Tỷ lệ khung hình: " + e.data.name);
        }
      }
    });
  }


})();
  `;
}



