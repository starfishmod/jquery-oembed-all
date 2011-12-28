/*!
 * jquery oembed plugin
 *
 * Copyright (c) 2009 Richard Chamorro
 * Licensed under the MIT license
 * 
 * Orignal Author: Richard Chamorro 
 * Forked by Andrew Mee to Provide a slightly diffent kind of embedding 
 * experience
 */

(function($) {
    $.fn.oembed = function(url, options, embedAction) {

        settings = $.extend(true, $.fn.oembed.defaults, options);
        if ($('#jqoembeddata').length === 0) $('<span id="jqoembeddata"></span>').appendTo('body');

        return this.each(function() {

            var container = $(this),
                resourceURL = (url !== null) ? url : container.attr("href"),
                provider;

            if (embedAction) {
                settings.onEmbed = embedAction;
            }
            else {
                settings.onEmbed = function(oembedData) {
                    $.fn.oembed.insertCode(this, settings.embedMethod, oembedData);
                };
            }

            if (resourceURL !== null) {
                provider = $.fn.oembed.getOEmbedProvider(resourceURL);

                if (provider !== null) {
                    provider.params = getNormalizedParams(settings[provider.name]) || {};
                    provider.maxWidth = settings.maxWidth;
                    provider.maxHeight = settings.maxHeight;
                    embedCode(container, resourceURL, provider);
                }
                else {
                    settings.onProviderNotFound.call(container, resourceURL);
                }
            }

            return container;
        });


    };

    var settings;

    // Plugin defaults
    $.fn.oembed.defaults = {
        maxWidth: null,
        maxHeight: null,
        embedMethod: 'auto',
        // "auto", "append", "fill"		
        onProviderNotFound: function() {},
        beforeEmbed: function() {},
        afterEmbed: function() {},
        onEmbed: function() {},
        onError: function() {},
        ajaxOptions: {}
    };

    /* Private functions */

    function getRequestUrl(provider, externalUrl) {
        var url = provider.apiendpoint,
            qs = "",
            i;
        url += (url.indexOf("?") <= 0) ? "?" : "&";

        if (provider.maxWidth !== null && provider.params.maxwidth === null) provider.params.maxwidth = provider.maxWidth;

        if (provider.maxHeight !== null && provider.params.maxheight === null) provider.params.maxheight = provider.maxHeight;

        for (i in provider.params) {
            // We don't want them to jack everything up by changing the callback parameter
            if (i == provider.callbackparameter) continue;

            // allows the options to be set to null, don't send null values to the server as parameters
            if (provider.params[i] !== null) qs += "&" + escape(i) + "=" + provider.params[i];
        }

        url += "format=" + provider.format + "&url=" + escape(externalUrl) + qs + "&" + provider.callbackparameter + "=?";

        return url;
    }

    function success(oembedData, externalUrl, container) {
        $('#jqoembeddata').data(externalUrl, oembedData.code);
        settings.beforeEmbed.call(container, oembedData);
        settings.onEmbed.call(container, oembedData);
        settings.afterEmbed.call(container, oembedData);
    }

    function embedCode(container, externalUrl, embedProvider) {
        if ($('#jqoembeddata').data(externalUrl) !== undefined) {
            var oembedData = {
                code: $('#jqoembeddata').data(externalUrl)
            };
            success(oembedData, externalUrl, container);
        }
        else if (embedProvider.yql) {
            var urlq = embedProvider.yql.url ? embedProvider.yql.url(externalUrl) : externalUrl;
            var from = embedProvider.yql.from || 'htmlstring';
            var pathq = /html/.test(from) ? 'xpath' : 'itemPath';
            var query = 'SELECT * FROM ' + from + ' WHERE url="' + urlq + '"' + "and " + pathq + "='" + (embedProvider.yql.xpath || '/') + "'";
            ajaxopts = $.extend({
                url: "http://query.yahooapis.com/v1/public/yql",
                dataType: 'jsonp',
                data: {
                    q: query,
                    format: "json",
                    env: 'store://datatables.org/alltableswithkeys',
                    callback: "?"
                },
                success: function(data) {
                    var result = embedProvider.yql.datareturn ? embedProvider.yql.datareturn(data.query.results) : data.query.results.result;
                    var oembedData = $.extend({}, result);
                    oembedData.code = result;
                    success(oembedData, externalUrl, container);
                },
                error: settings.onError.call(container, externalUrl, embedProvider)
            }, settings.ajaxOptions || {});

            $.ajax(ajaxopts);
        }
        else if (embedProvider.templateRegex) {
            if (embedProvider.apiendpoint) {
                //Add APIkey if true
                if (embedProvider.apikey) embedProvider.apiendpoint = embedProvider.apiendpoint.replace('_APIKEY_', settings.apikeys[embedProvider.name]);
                ajaxopts = $.extend({
                    url: externalUrl.replace(embedProvider.templateRegex, embedProvider.apiendpoint),
                    dataType: 'jsonp',
                    success: function(data) {
                        var oembedData = $.extend({}, data);
                        oembedData.code = embedProvider.templateData(data);
                        success(oembedData, externalUrl, container);
                    },
                    error: settings.onError.call(container, externalUrl, embedProvider)
                }, settings.ajaxOptions || {});

                $.ajax(ajaxopts);
            }
            else if (embedProvider.embedtag) {
                var flashvars = embedProvider.embedtag.flashvars || '';
                var tag = embedProvider.embedtag.tag || 'embed';

                var src = externalUrl.replace(embedProvider.templateRegex, embedProvider.embedtag.src);
                var params = "";
                if (embedProvider.params) {
                    params = [];
                    for (var param in embedProvider.params) {
                        params.push(param + "=" + embedProvider.params[param]);
                    }
                    params = "&" + params.join("&");
                }
                src += params;

                var code = $('<' + tag + '/>').attr('src', src).attr('width', embedProvider.maxWidth || embedProvider.embedtag.width).attr('height', embedProvider.maxHeight || embedProvider.embedtag.height).attr('allowfullscreen', embedProvider.embedtag.allowfullscreen || 'true').attr('allowscriptaccess', embedProvider.embedtag.allowfullscreen || 'always');
                if (tag == 'embed') code.attr('type', embedProvider.embedtag.type || "application/x-shockwave-flash").attr('flashvars', externalUrl.replace(embedProvider.templateRegex, flashvars));
                if (tag == 'iframe') code.attr('scrolling', embedProvider.embedtag.scrolling || "no").attr('frameborder', embedProvider.embedtag.frameborder || "0");


                var oembedData = {
                    code: code
                };
                success(oembedData, externalUrl, container);
            }
            else {
                var oembedData = {
                    code: externalUrl.replace(embedProvider.templateRegex, embedProvider.template)
                };
                success(oembedData, externalUrl, container);
            }

        }
        else {

            var requestUrl = getRequestUrl(embedProvider, externalUrl),
                ajaxopts = $.extend({
                    url: requestUrl,
                    dataType: 'jsonp',
                    success: function(data) {
                        var oembedData = $.extend({}, data);
                        switch (oembedData.type) {
                        case "photo":
                            oembedData.code = $.fn.oembed.getPhotoCode(externalUrl, oembedData);
                            break;
                        case "video":
                        case "rich":
                            oembedData.code = $.fn.oembed.getRichCode(externalUrl, oembedData);
                            break;
                        default:
                            oembedData.code = $.fn.oembed.getGenericCode(externalUrl, oembedData);
                            break;
                        }
                        success(oembedData, externalUrl, container);
                    },
                    error: settings.onError.call(container, externalUrl, embedProvider)
                }, settings.ajaxOptions || {});

            $.ajax(ajaxopts);
        }
    }

    function getNormalizedParams(params) {
        if (params === null) return null;
        var key, normalizedParams = {};
        for (key in params) {
            if (key !== null) normalizedParams[key.toLowerCase()] = params[key];
        }
        return normalizedParams;
    }

    function isNullOrEmpty(object) {
        if (typeof object == "undefined" || object === null || ($.isArray(object) && object.length === 0)) return true;
        return false;
    }

    /* Public functions */
    $.fn.oembed.insertCode = function(container, embedMethod, oembedData) {
        if (oembedData === null) return;

        switch (embedMethod) {
        case "auto":
            if (container.attr("href") !== null) {
                $.fn.oembed.insertCode(container, "append", oembedData);
            }
            else {
                $.fn.oembed.insertCode(container, "replace", oembedData);
            }
            break;
        case "replace":
            container.replaceWith(oembedData.code);
            break;
        case "fill":
            container.html(oembedData.code);
            break;
        case "append":
            container.wrap('<div class="oembed-container"></div>');
            var oembedContainer = container.parent();
            $('<span class="oembedclosehide">&darr;</span>').insertBefore(container).click(function() {
                var encodedString = encodeURIComponent($(this).text());
                $(this).html((encodedString == '%E2%86%91') ? '&darr;' : '&uarr;');
                $(this).parent().children().last().toggle();
            });
            oembedContainer.append('<br/>');
            oembedContainer.append(oembedData.code);
            break;
        }
    };

    $.fn.oembed.getPhotoCode = function(url, oembedData) {
        var code, alt = oembedData.title ? oembedData.title : '';
        alt += oembedData.author_name ? ' - ' + oembedData.author_name : '';
        alt += oembedData.provider_name ? ' - ' + oembedData.provider_name : '';
        code = '<div><a href="' + url + '" target=\'_blank\'><img src="' + oembedData.url + '" alt="' + alt + '"/></a></div>';
        if (oembedData.html) code += "<div>" + oembedData.html + "</div>";
        return code;
    };

    $.fn.oembed.getRichCode = function(url, oembedData) {
        var code = oembedData.html;
        return code;
    };

    $.fn.oembed.getGenericCode = function(url, oembedData) {
        var title = (oembedData.title !== null) ? oembedData.title : url,
            code = '<a href="' + url + '">' + title + '</a>';
        if (oembedData.html) code += "<div>" + oembedData.html + "</div>";
        return code;
    };

    $.fn.oembed.isProviderAvailable = function(url) {
        var provider = getOEmbedProvider(url);
        return (provider !== null);
    };

    $.fn.oembed.getOEmbedProvider = function(url) {
        for (var i = 0; i < this.providers.length; i++) {
            if (this.providers[i].matches(url)) return this.providers[i];
        }
        return null;
    };

    $.fn.oembed.OEmbedProvider = function(name, type, urlschemesarray, apiendpoint, extraSettings) {
        this.name = name;
        this.type = type; // "photo", "video", "link", "rich", null
        this.urlschemes = getUrlSchemes(urlschemesarray);
        this.apiendpoint = apiendpoint;
        this.maxWidth = 500;
        this.maxHeight = 400;

        this.fromJSON = function(json) {
            for (property in json) {
                if (property != "urlschemes") this[property] = json[property];
                else this[property] = getUrlSchemes(json[property]);
            }
            return true;
        };

        if (!isNullOrEmpty(extraSettings)) this.fromJSON(extraSettings);

        this.format = this.format || 'json';
        this.callbackparameter = this.callbackparameter || "callback";

        var i, property, regExp;

        this.matches = function(externalUrl) {
            for (i = 0; i < this.urlschemes.length; i++) {
                regExp = new RegExp(this.urlschemes[i], "i");
                if (externalUrl.match(regExp) !== null) return true;
            }
            return false;
        };

        function getUrlSchemes(urls) {
            if (isNullOrEmpty(urls)) return ["."];
            if ($.isArray(urls)) return urls;
            return urls.split(";");
        }
    };

    /* Native & common providers */
    $.fn.oembed.providers = [

    //Video
    new $.fn.oembed.OEmbedProvider("youtube", "video", ["youtube\\.com/watch.+v=[\\w-]+&?", "youtu\\.be/[\\w-]+"], null, {
        templateRegex: /.*(?:v\=|be\/)([\w\-]+)&?.*/,
        embedtag: {
            tag: 'iframe',
            width: '425',
            height: '349',
            src: "http://www.youtube.com/embed/$1?wmode=transparent"
        }
    }), new $.fn.oembed.OEmbedProvider("xtranormal", "video", ["xtranormal\\.com/watch/.+"], null, {
        templateRegex: /.*com\/watch\/([\w\-]+)\/([\w\-]+).*/,
        embedtag: {
            tag: 'iframe',
            width: '320',
            height: '269',
            src: "http://www.xtranormal.com/xtraplayr/$1/$2"
        }
    }), new $.fn.oembed.OEmbedProvider("gametrailers", "video", ["gametrailers\\.com/video/.+"], null, {
        templateRegex: /.*com\/video\/([\w\-]+)\/([\w\-]+).*/,
        embedtag: {
            width: '512',
            height: '288',
            src: "http://media.mtvnservices.com/mgid:moses:video:gametrailers.com:$2"
        }
    }), new $.fn.oembed.OEmbedProvider("funnyordie", "video", ["funnyordie\\.com/videos/.+"], null, {
        templateRegex: /.*videos\/([^\/]+)\/([^\/]+)?/,
        embedtag: {
            width: 512,
            height: 328,
            flashvars: "key=$1",
            src: "http://player.ordienetworks.com/flash/fodplayer.swf"
        }
    }), new $.fn.oembed.OEmbedProvider("justintv", "video", ["justin\\.tv/.+"], null, {
        templateRegex: /.*justin\.tv\/(\w+).*/,
        template: '<object type="application/x-shockwave-flash" height="295" width="353" id="live_embed_player_flash" data="http://www.justin.tv/widgets/live_embed_player.swf?channel=$1" bgcolor="#000000">' + '<param name="allowFullScreen" value="true" /><param name="allowscriptaccess" value="always" /><param name="allownetworking" value="all" /><param name="wmode" value="opaque">' + '<param name="movie" value="http://www.justin.tv/widgets/live_embed_player.swf" /><param name="flashvars" value="hostname=www.justin.tv&channel=$1&auto_play=false&start_volume=25" /></object>'
    }), new $.fn.oembed.OEmbedProvider("colledgehumour", "video", ["collegehumor\\.com/video/.+"], null, {
        templateRegex: /.*video\/([^\/]+).*/,
        embedtag: {
            width: 600,
            height: 338,
            src: "http://www.collegehumor.com/moogaloop/moogaloop.swf?clip_id=$1&use_node_id=true&fullscreen=1"
        }
    }), new $.fn.oembed.OEmbedProvider("metacafe", "video", ["metacafe\\.com/watch/.+"], null, {
        templateRegex: /.*watch\/(\d+)\/(\w+)\/.*/,
        embedtag: {
            width: 400,
            height: 345,
            src: "http://www.metacafe.com/fplayer/$1/$2.swf"
        }
    }), new $.fn.oembed.OEmbedProvider("bambuser", "video", ["bambuser\\.com\/channel\/.*\/broadcast\/.*"], null, {
        templateRegex: /.*bambuser\.com\/channel\/.*\/broadcast\/(\w+).*/,
        embedtag: {
            width: 512,
            height: 339,
            src: "http://static.bambuser.com/r/player.swf?vid=$1"
        }
    }), new $.fn.oembed.OEmbedProvider("twitvid", "video", ["twitvid\\.com/.+"], null, {
        templateRegex: /.*twitvid\.com\/(\w+).*/,
        embedtag: {
            tag: 'iframe',
            width: 480,
            height: 360,
            src: "http://www.twitvid.com/embed.php?guid=$1&autoplay=0"
        }
    }), new $.fn.oembed.OEmbedProvider("embedr", "video", ["embedr\\.com/playlist/.+"], null, {
        templateRegex: /.*playlist\/([^\/]+).*/,
        embedtag: {
            width: 425,
            height: 520,
            src: "http://embedr.com/swf/slider/$1/425/520/default/false/std"
        }
    }), new $.fn.oembed.OEmbedProvider("blip", "video", ["blip\\.tv/.+"], "http://blip.tv/oembed/"), new $.fn.oembed.OEmbedProvider("hulu", "video", ["hulu\\.com/watch/.*"], "http://www.hulu.com/api/oembed.json"), new $.fn.oembed.OEmbedProvider("ustream", "video", ["ustream\\.tv/recorded/.*"], null, {
        yql: {
            xpath: "json.html",
            from: 'json',
            url: function(externalurl) {
                return 'http://www.ustream.tv/oembed?format=json&url=' + externalurl;
            },
            datareturn: function(results) {
                return results.html || '';
            }
        }
    }), new $.fn.oembed.OEmbedProvider("vimeo", "video", ["http:\/\/www\\.vimeo\\.com\/groups\/.*\/videos\/.*", "http:\/\/www\\.vimeo\\.com\/.*", "http:\/\/vimeo\\.com\/groups\/.*\/videos\/.*", "http:\/\/vimeo\\.com\/.*"], "http://vimeo\\.com/api/oembed.json"), new $.fn.oembed.OEmbedProvider("dailymotion", "video", ["dailymotion\\.com/.+"], 'http://www.dailymotion.com/services/oembed'), new $.fn.oembed.OEmbedProvider("5min", "video", ["www\\.5min\\.com/.+"], null, {
        yql: {
            xpath: "//oembed/html",
            from: 'xml',
            url: function(externalurl) {
                return 'http://api.5min.com/oembed.xml?url=' + externalurl;
            },
            datareturn: function(results) {
                return results.html.replace(/.*\[CDATA\[(.*)\]\]>$/, '$1') || '';
            }
        }
    }), new $.fn.oembed.OEmbedProvider("viddler", "video", ["viddler\\.com/.+"], "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22http%3A%2F%2Flab.viddler.com%2Fservices%2Foembed%2f%3Furl%3D$1%22%20and%20xpath%3D%22%2F%2F*%2Fobject%22&format=xml&callback=?", {
        templateRegex: /(.*)/,
        templateData: function(data) {
            if (!data.results[0]) return false;
            return data.results[0];
        }
    }), new $.fn.oembed.OEmbedProvider("National Film Board of Canada", "video", ["nfb\\.ca/film/.+"], "http://www.nfb.ca/remote/services/oembed/"), new $.fn.oembed.OEmbedProvider("qik", "video", ["qik\\.com/\\w+"], "http://qik.com/api/oembed.json"), new $.fn.oembed.OEmbedProvider("revision3", "video", ["revision3\\.com"], "http://revision3.com/api/oembed/"), new $.fn.oembed.OEmbedProvider("dotsub", "video", ["dotsub\\.com/view/.+"], "http://dotsub.com/services/oembed"), new $.fn.oembed.OEmbedProvider("clickthrough", "video", ["clikthrough\\.com/theater/video/\\d+"], "http://clikthrough.com/services/oembed"), new $.fn.oembed.OEmbedProvider("Kinomap", "video", ["kinomap\\.com/.+"], "http://www.kinomap.com/oembed"),

    //Audio
    new $.fn.oembed.OEmbedProvider("Huffduffer", "rich", ["huffduffer.com/[-.\\w@]+/\\d+"], "http://huffduffer.com/oembed"), new $.fn.oembed.OEmbedProvider("rdio.com", "rich", ["rd.io/.+", "rdio.com"], "http://www.rdio.com/api/oembed/"), new $.fn.oembed.OEmbedProvider("Soundcloud", "rich", ["soundcloud.com/.+"], "http://soundcloud.com/oembed", {
        format: 'js'
    }), new $.fn.oembed.OEmbedProvider("bandcamp", "rich", ["bandcamp\\.com/album/.+"], null, {
        yql: {
            xpath: "//meta[contains(@content, \\'EmbeddedPlayer\\')]",
            from: 'html',
            datareturn: function(results) {
                return results.meta ? '<embed type="application/x-shockwave-flash" allowfullscreen="true" menu="false" src="' + results.meta.content + '" allowtransparency="true" width="400" height="100" frameborder="0"></embed>' : false;
            }
        }
    }), new $.fn.oembed.OEmbedProvider("podomatic", "audio", [".+\\.podomatic\\.com/"], null, {
        templateRegex: /http:\/\/([^\/]+).*/,
        embedtag: {
            width: 480,
            height: 360,
            src: "http://ecdn0.hark.com/swfs/player_fb.swf?pid=$1",
            flashvars: "minicast=false&jsonLocation=http%3A%2F%2F$1%2Fembed%2Fmulti%2Fcomixclaptrap?%26color%3D43bee7%26autoPlay%3Dfalse%26width%3D480%26height%3D360"
        }
    }), new $.fn.oembed.OEmbedProvider("hark", "audio", ["hark\\.com/clips/.+"], null, {
        templateRegex: /.*clips\/([^\-]+).*/,
        embedtag: {
            width: 300,
            height: 28,
            src: "http://ecdn0.hark.com/swfs/player_fb.swf?pid=$1"
        }
    }),

    //Photo
    new $.fn.oembed.OEmbedProvider("flickr", "photo", ["flickr\\.com/photos/[-.\\w@]+/\\d+/?"], "http://flickr.com/services/oembed", {
        callbackparameter: 'jsoncallback'
    }), new $.fn.oembed.OEmbedProvider("photobucket", "photo", ["photobucket\\.com/(albums|groups)/.+"], "http://photobucket.com/oembed/"), new $.fn.oembed.OEmbedProvider("instagram", "photo", ["instagr\\.?am(\\.com)?/.+"], "http://api.instagram.com/oembed"), new $.fn.oembed.OEmbedProvider("yfrog", "photo", ["yfrog\\.(com|ru|com\\.tr|it|fr|co\\.il|co\\.uk|com\\.pl|pl|eu|us)/.+"], null, {
        templateRegex: /(.*)/,
        template: '<a href="$1"><img src="$1:small" alt="on yfrog" class="jqoaImg"></a>'
    }), new $.fn.oembed.OEmbedProvider("SmugMug", "photo", ["smugmug.com/[-.\\w@]+/.+"], "http://api.smugmug.com/services/oembed/"), new $.fn.oembed.OEmbedProvider("twitpic", "photo", ["twitpic.com/.+"], "http://api.twitpic.com/2/media/show.jsonp?callback=?&id=$1", {
        templateRegex: /.*\/([^\/]+).*/,
        templateData: function(data) {
            if (!data.user) return false;
            return '<div id="content"><div id="view-photo-user"><div id="photo-user-avatar"><img src="' + data.user.avatar_url + '"></div><div id="photo-info"><h3><a id="photo_username" class="nav-link" href="http://twitter.com/#!/' + data.user.username + '">@' + data.user.username + '</a></h3><p><span id="photo-info-name">' + data.user.name + '</span> ' + data.user.timestamp + '</p></div></div><div id="photo-wrap" style="margin: auto;width:600px;height:450px;">' + '<img class="photo" id="photo-display" src="http://s3.amazonaws.com/twitpic/photos/large/' + data.id + '.jpg?AWSAccessKeyId=AKIAJF3XCCKACR3QDMOA&amp;Expires=1310509343&amp;Signature=gsukngCVqUE9qb%2FGHvyBqlQTjOo%3D" alt="' + data.message + '"></div><div id="view-photo-caption">' + data.message + '</div></div>';
        }
    }), new $.fn.oembed.OEmbedProvider("500px", "photo", ["500px\\.com/photo/.+"], null, {
        templateRegex: /.*photo\/([^\/]+).*/,
        template: '<a href="http://500px.com/photo/$1"><img src="http://photos.500px.com/$1/3" alt="on 500px.com"  class="jqoaImg"></a>'
    }), new $.fn.oembed.OEmbedProvider("23hq", "photo", ["23hq.com/[-.\\w@]+/photo/.+"], null, {
        templateRegex: /(.*)/,
        template: '<a href="$1"><img src="$1/thumb" alt="on img.ly"  class="jqoaImg"></a>'
    }), new $.fn.oembed.OEmbedProvider("img.ly", "photo", ["img\\.ly/.+"], null, {
        templateRegex: /.*com\/([^\/]+).*/,
        template: '<a href="http://img.ly/$1"><img src="http://img.ly/show/thumb/$1" alt="on img.ly"  class="jqoaImg"></a>'
    }), new $.fn.oembed.OEmbedProvider("twitgoo.com", "photo", ["twitgoo\\.com/.+"], null, {
        templateRegex: /.*com\/([^\/]+).*/,
        template: '<a href="http://twitgoo.com/$1"><img src="http://twitgoo.com/show/thumb/$1" alt="on twitgoo.com"  class="jqoaImg"></a>'
    }), new $.fn.oembed.OEmbedProvider("imgur.com", "photo", ["imgur\\.com/gallery/.+"], null, {
        templateRegex: /.*gallery\/([^\/]+).*/,
        template: '<a href="http://imgur.com/gallery/$1"><img src="http://imgur.com/$1l.jpg" alt="on imgur.com"  class="jqoaImg"></a>'
    }), new $.fn.oembed.OEmbedProvider("visual.ly", "rich", ["visual\\.ly/.+"], null, {
        yql: {
            xpath: "//a[@id=\\'gc_article_graphic_image\\']/img",
            from: 'htmlstring'
        }
    }),

    //Rich
    new $.fn.oembed.OEmbedProvider("meetup", "rich", ["meetup\\.(com|ps)/.+"], "http://api.meetup.com/oembed"), new $.fn.oembed.OEmbedProvider("ebay", "rich", ["ebay\\.*"], null, {
        templateRegex: /.*\/([^\/]+)\/(\d{10,13}).*/,
        embedtag: {
            width: 355,
            height: 300,
            src: "http://togo.ebay.com/togo/togo.swf?2008013100",
            flashvars: "base=http://togo.ebay.com/togo/&lang=en-us&mode=normal&itemid=$2&query=$1"
        }
    }), 
    
    new $.fn.oembed.OEmbedProvider("eventful_venue", "rich", ["eventful.com/.*/venues/.*"], null, {
        templateRegex: /.*venues\/([^\/]+)\/([^\/]+).*/,
        template: '<object type = "application/x-shockwave-flash" allowScriptAccess = "always" allowNetworking = "all" width = "450" height ="407" data = "http://static.eventful.com/store/flash/widgets/eventWidget.swf">' + '<param name ="flashVars" value="&id=$2&interfaceFolder=eventView&theme=0&numberPerPage=5&displayTitle=1&location=0&venue=0&eventTitle=1&date=1&time=1&peopleCount=1&countDownClock=0&title=Event at $1">' + '<param name="movie" value="http://static.eventful.com/store/flash/widgets/eventWidget.swf" /><param name="wmode" value="transparent" /></object>'
    }), 
    
    new $.fn.oembed.OEmbedProvider("tumblr", "rich", ["tumblr.com/.+"], "http://$1.tumblr.com/api/read/json?callback=?&id=$2", {
        templateRegex: /.*\/\/([\w]+).*\/post\/([^\/]+).*/,
        templateData: function(data) {
            if (!data.posts) return false;
            return '<div id="content"><h3><a class="nav-link" href="' + data.posts[0]['url-with-slug'] + '">' + data.posts[0]['regular-title'] + '</a></h3>' + data.posts[0]['regular-body'] + '</div>';
        }
    }), 
    
    new $.fn.oembed.OEmbedProvider("wikipedia", "rich", ["wikipedia.org/wiki/.+"], "http://$1.wikipedia.org/w/api.php?action=parse&page=$2&format=json&section=0&callback=?", {
        templateRegex: /.*\/\/([\w]+).*\/wiki\/([^\/]+).*/,
        templateData: function(data) {
            if (!data.parse) return false;
            var text = data.parse.text['*'].replace('href="/wiki', 'href="http://en.wikipedia.org/wiki');
            return '<div id="content"><h3><a class="nav-link" href="http://en.wikipedia.org/wiki/' + data.parse.displaytitle + '">' + data.parse.displaytitle + '</a></h3>' + text + '</div>';
        }
    }), 
    
    new $.fn.oembed.OEmbedProvider("imdb", "rich", ["imdb.com/title/.+"], "http://www.imdbapi.com/?i=$1&callback=?", {
        templateRegex: /.*\/title\/([^\/]+).*/,
        templateData: function(data) {
            if (!data.Title) return false;
            return '<div id="content"><h3><a class="nav-link" href="http://imdb.com/title/' + data.ID + '/">' + data.Title + '</a> (' + data.Year + ')</h3><p>Starring: ' + data.Actors + '</p><div id="photo-wrap" style="margin: auto;width:600px;height:450px;"><img class="photo" id="photo-display" src="' + data.Poster + '" alt="' + data.Title + '"></div>  <div id="view-photo-caption">' + data.Plot + '</div></div>';
        }
    }), 
    
    new $.fn.oembed.OEmbedProvider("livejournal", "rich", ["livejournal.com/"], "http://ljpic.seacrow.com/json/$2$4?jsonp=?", {
        templateRegex: /(http:\/\/(((?!users).)+)\.livejournal\.com|.*users\.livejournal\.com\/([^\/]+)).*/,
        templateData: function(data) {
            if (!data.username) return false;
            return '<div id="content"><img src="' + data.image + '" align="left" style="margin-right: 1em;" /><span class="ljuser"><a href="http://' + data.username + '.livejournal.com/profile"><img src="http://www.livejournal.com/img/userinfo.gif" alt="[info]" width="17" height="17" /></a><a href="http://' + data.username + '.livejournal.com/">' + data.username + '</a></span><br />' + data.name + '</div>';
        }
    }), 
    
    new $.fn.oembed.OEmbedProvider("circuitbee", "rich", ["circuitbee\\.com/circuit/view/.+"], null, {
        templateRegex: /.*circuit\/view\/(\d+).*/,
        embedtag: {
            tag: 'iframe',
            width: '500',
            height: '350',
            src: "http://c.circuitbee.com/build/r/schematic-embed.html?id=$1"
        }
    }),

    new $.fn.oembed.OEmbedProvider("reelapp", "rich", ["reelapp\\.com/.+"], null, {
        templateRegex: /.*com\/(\S{6}).*/,
        embedtag: {
            tag: 'iframe',
            width: '400',
            height: '338',
            src: "http://www.reelapp.com/$1/embed"
        }
    }),

    new $.fn.oembed.OEmbedProvider("pastebin", "rich", ["pastebin\\.com/[\\S]{8}"], null, {
        templateRegex: /.*\/(\S{8}).*/,
        embedtag: {
            tag: 'iframe',
            width: '100%',
            height: 'auto',
            src: "http://pastebin.com/embed_iframe.php?i=$1"
        }

    }),

    new $.fn.oembed.OEmbedProvider("pastie", "rich", ["pastie\\.org/pastes/.+"], null, {
        yql: {
            xpath: '//pre[@class="textmate-source"]'
        }
    }),

    new $.fn.oembed.OEmbedProvider("github", "rich", ["github.com/[-.\\w@]+/[-.\\w@]+"], "https://api.github.com/repos/$1/$2?callback=?", {
        templateRegex: /.*\/([^\/]+)\/([^\/]+).*/,
        templateData: function(data) {
            if (!data.data.html_url) return false;
            return '<div class="githubrepos"><ul class="repo-stats"><li>' + data.data.language + '</li><li class="watchers"><a title="Watchers" href="' + data.data.html_url + '/watchers">' + data.data.watchers + '</a></li>' + '<li class="forks"><a title="Forks" href="' + data.data.html_url + '/network">' + data.data.forks + '</a></li></ul><h3><a href="' + data.data.html_url + '">' + data.data.name + '</a></h3><div class="body"><p class="description">' + data.data.description + '</p>' + '<p class="updated-at">Last updated: ' + data.data.pushed_at + '</p></div></div>';
        }
    }),

    new $.fn.oembed.OEmbedProvider("myspace", "rich", ["myspace.com/[-.\\w@]+"], "http://api.myspace.com/opensearch/people?searchTerms=$1&callback=?&searchBy=displayname&count=1", {
        templateRegex: /.*\/([^\/]+).*/,
        templateData: function(data) {
            if (!data.entries) return false;
            return '<div class="myspace1"><div class="myspace2"><a href="http://www.myspace.com/" class="MSIcon">Myspace&nbsp;&nbsp;&nbsp;</a> <a href="' + data.entries[0].profileUrl + '">' + data.entries[0].displayName + '</a></div><div class="myspaceBody"><div><img src="' + data.entries[0].thumbnailUrl + '" align="left"></div><div>Location  <strong>' + data.entries[0].location + '</strong><br/>Type:  <strong>' + data.entries[0].msUserType + '</strong><br/></div></div></div>';
        }
    }),

    new $.fn.oembed.OEmbedProvider("facebook", "rich", ["facebook.com/(people/[^\\/]+/\\d+|[^\\/]+$)"], "https://graph.facebook.com/$2$3/?callback=?", {
        templateRegex: /.*facebook.com\/(people\/[^\/]+\/(\d+).*|([^\/]+$))/,
        templateData: function(data) {
            if (!data.id) return false;
            var out = '<div class="facebook1"><div class="facebook2"><a href="http://www.facebook.com/">facebook</a> <a href="' + data.link + '">' + data.name + '</a></div><div class="facebookBody"><div>';
            if (data.picture) out += '<img src="' + data.picture + '" align="left"></div><div>';
            if (data.category) out += 'Category  <strong>' + data.category + '</strong><br/>';
            if (data.website) out += 'Website  <strong>' + data.website + '</strong><br/>';
            if (data.gender) out += 'Gender  <strong>' + data.gender + '</strong><br/>';
            out += '</div></div></div>';
            return out;
        }
    }),

    new $.fn.oembed.OEmbedProvider("stackoverflow", "rich", ["stackoverflow.com/questions/[\\d]+"], "http://api.stackoverflow.com/1.1/questions/$1?body=true&jsonp=?", {
        templateRegex: /.*questions\/([\d]+).*/,
        templateData: function(data) {
            if (!data.questions) return false;
            var q = data.questions[0];
            var body = $(q.body).text();
            var out = '<div class="stoqembed"><div class="statscontainer"><div class="statsarrow"></div><div class="stats"><div class="vote"><div class="votes">' + '<span class="vote-count-post"><strong>' + (q.up_vote_count - q.down_vote_count) + '</strong></span><div class="viewcount">vote(s)</div></div>' + '</div><div class="status"><strong>' + q.answer_count + '</strong>answer</div></div><div class="views">' + q.view_count + ' view(s)</div></div>' + '<div class="summary"><h3><a class="question-hyperlink" href="http://stackoverflow.com/questions/' + q.question_id + '/">' + q.title + '</a></h3>' + '<div class="excerpt">' + body.substring(0, 100) + '...</div><div class="tags">';
            for (var i in q.tags)
            out += '<a title="" class="post-tag" href="http://stackoverflow.com/questions/tagged/' + q.tags[i] + '">' + q.tags[i] + '</a>' + '</div><div class="fr"><div class="user-info"><div class="user-gravatar32"><a href="http://stackoverflow.com/users/' + q.owner.user_id + '/' + q.owner.display_name + '">' + '<img width="32" height="32" alt="" src="http://www.gravatar.com/avatar/' + q.owner.email_hash + '?s=32&amp;d=identicon&amp;r=PG"></a></div><div class="user-details">' + '<a href="http://stackoverflow.com/users/' + q.owner.user_id + '/' + q.owner.display_name + '">' + q.owner.display_name + '</a><br><span title="reputation score" class="reputation-score">' + q.owner.reputation + '</span></div></div></div></div></div>';
            return out;
        }
    }),

    new $.fn.oembed.OEmbedProvider("wordpress", "rich", ["wordpress\\.com/.+", "blogs\\.cnn\\.com/.+", "techcrunch\\.com/.+", "wp\\.me/.+"], "http://public-api.wordpress.com/oembed/1.0/?for=jquery-oembed-all"), new $.fn.oembed.OEmbedProvider("screenr", "rich", ["screenr\\.com"], null, {
        templateRegex: /.*\/([^\/]+).*/,
        embedtag: {
            tag: 'iframe',
            width: '650',
            height: 396,
            src: "http://www.screenr.com/embed/$1"
        }
    }),

    new $.fn.oembed.OEmbedProvider("gigpans", "rich", ["gigapan\\.org/[-.\\w@]+/\\d+"], null, {
        templateRegex: /.*\/(\d+)\/?.*/,
        embedtag: {
            tag: 'iframe',
            width: '100%',
            height: 400,
            src: "http://gigapan.org/gigapans/$1/options/nosnapshots/iframe/flash.html"
        }
    }),

    new $.fn.oembed.OEmbedProvider("scribd", "rich", ["scribd\\.com/.+"], null, {
        templateRegex: /.*doc\/([^\/]+).*/,
        embedtag: {
            tag: 'iframe',
            width: '100%',
            height: 600,
            src: "http://www.scribd.com/embeds/$1/content?start_page=1&view_mode=list"
        }
    }),

    new $.fn.oembed.OEmbedProvider("kickstarter", "rich", ["kickstarter\\.com/projects/.+"], null, {
        templateRegex: /([^\?]+).*/,
        embedtag: {
            tag: 'iframe',
            width: '220',
            height: 380,
            src: "$1/widget/card.html"
        }
    }),

    new $.fn.oembed.OEmbedProvider("issuu", "rich", ["issuu\\.com/[-.\\w@]+/docs/.+"], null, {
        yql: {
            xpath: "//meta[contains(@content,\\'IssuuViewer.swf\\')]",
            from: 'html',
            datareturn: function(results) {
                return results.meta ? '<embed type="application/x-shockwave-flash" allowfullscreen="true" menu="false" src="' + results.meta.content + '" allowtransparency="true" frameborder="0"></embed>' : false;
            }
        }
    }),

    new $.fn.oembed.OEmbedProvider("slideshare", "rich", ["slideshare\\.net"], "http://www.slideshare.net/api/oembed/2", {
        format: 'jsonp'
    }),

    new $.fn.oembed.OEmbedProvider("etsy", "rich", ["etsy\\.com/listing/[\\d]+"], "http://openapi.etsy.com/v2/listings/$1.js?callback=?&api_key=_APIKEY_", {
        apikey: true,
        templateRegex: /.*listing\/([\d]+).*/,
        templateData: function(data) {
            if (!data.results) return false;
            var q = data.results[0];
            $.ajax("http://openapi.etsy.com/v2/listings/" + q.listing_id + "/images.js", {
                async: false,
                cache: false,
                data: {
                    api_key: settings.apikeys.etsy
                },
                success: function(data) {
                    if (!data.results) return false;
                    var q = data.results[0];
                    $('#etsy' + q.listing_id).prepend('<img align="left" src="' + q.url_75x75 + '"/>');
                },
                dataType: 'jsonp'
            });
            var out = '<div class="etsyembed" id="etsy' + q.listing_id + '"><h3><a href="' + q.url + '">' + q.title + ' ' + q.price + q.currency_code + '</a></h3>' + data.results[0].description + '</div>';
            return out;
        }
    })

    ];
})(jQuery);