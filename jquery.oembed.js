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
                resourceURL = url || container.attr("href"),
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
    function rand(length,current){ //Found on http://stackoverflow.com/questions/1349404/generate-a-string-of-5-random-characters-in-javascript
     current = current ? current : '';
     return length ? rand( --length , "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz".charAt( Math.floor( Math.random() * 60 ) ) + current ) : current;
    }
    
    function getRequestUrl(provider, externalUrl) {
        var url = provider.apiendpoint,
            qs = "",
            i;
        url += (url.indexOf("?") <= 0) ? "?" : "&";
        url = url.replace('#','%23');

        if (provider.maxWidth !== null && (typeof provider.params.maxwidth === 'undefined' || provider.params.maxwidth === null)) {
            provider.params.maxwidth = provider.maxWidth;
        }

        if (provider.maxHeight !== null && (typeof provider.params.maxheight === 'undefined' || provider.params.maxheight === null)) {
            provider.params.maxheight = provider.maxHeight;
        }

        for (i in provider.params) {
            // We don't want them to jack everything up by changing the callback parameter
            if (i == provider.callbackparameter) continue;

            // allows the options to be set to null, don't send null values to the server as parameters
            if (provider.params[i] !== null) qs += "&" + escape(i) + "=" + provider.params[i];
        }

        url += "format=" + provider.format + "&url=" + escape(externalUrl) + qs;
        if(provider.dataType!='json') url += "&" + provider.callbackparameter + "=?";

        return url;
    }
    function success(oembedData, externalUrl, container) {
        $('#jqoembeddata').data(externalUrl, oembedData.code);
        settings.beforeEmbed.call(container, oembedData);
        settings.onEmbed.call(container, oembedData);
        settings.afterEmbed.call(container, oembedData);
    }

    function embedCode(container, externalUrl, embedProvider) {
      if ($('#jqoembeddata').data(externalUrl)!=undefined && embedProvider.embedtag.tag!='iframe'){
        var oembedData = {code: $('#jqoembeddata').data(externalUrl)};
        success(oembedData, externalUrl, container);
      }else if (embedProvider.yql) {
        var urlq = embedProvider.yql.url ? embedProvider.yql.url(externalUrl) : externalUrl;
        var from = embedProvider.yql.from || 'htmlstring';
        var pathq = /html/.test(from) ? 'xpath' : 'itemPath';
        var query = 'SELECT * FROM ' + from + ' WHERE url="' + urlq + '"' + " and " + pathq + "='" + (embedProvider.yql.xpath || '/') + "'";
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
      }else if (embedProvider.templateRegex) {
        if(embedProvider.embedtag.tag!==''){
          var flashvars = embedProvider.embedtag.flashvars || '';
          var tag = embedProvider.embedtag.tag || 'embed';
          var width = embedProvider.embedtag.width || 'auto';
          var height = embedProvider.embedtag.height || 'auto';
          var src =externalUrl.replace(embedProvider.templateRegex,embedProvider.apiendpoint)+'&jqoemcache='+rand(5);
          if (embedProvider.apikey) src = src.replace('_APIKEY_', settings.apikeys[embedProvider.name]);
          
           
          var code = $('<'+tag+'/>')
            .attr('src',src)
            .attr('width',width)
            .attr('height',height)
            .attr('allowfullscreen',embedProvider.embedtag.allowfullscreen || 'true')
            .attr('allowscriptaccess',embedProvider.embedtag.allowfullscreen || 'always');
          if(tag=='embed')
            code
              .attr('type',embedProvider.embedtag.type || "application/x-shockwave-flash")
              .attr('flashvars',externalUrl.replace(embedProvider.templateRegex,flashvars));
          if(tag=='iframe')
            code
              .attr('scrolling',embedProvider.embedtag.scrolling || "no")
              .attr('frameborder',embedProvider.embedtag.frameborder || "0");
            
            
          var oembedData = {code: code};
          success(oembedData, externalUrl,container);
        }else if (embedProvider.apiendpoint) {
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
            
          $.ajax( ajaxopts );
        }else {
            var oembedData = {code: externalUrl.replace(embedProvider.templateRegex,embedProvider.template)};
            success(oembedData, externalUrl,container);
        }
      } else {

        var requestUrl = getRequestUrl(embedProvider, externalUrl),
            ajaxopts = $.extend({
                url: requestUrl,
                dataType: embedProvider.dataType || 'jsonp',
                success: function(data) {
                    var oembedData = $.extend({}, data);
                    switch (oembedData.type) {
                    case "file": //Deviant Art has this
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
    };

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
        
        if(extraSettings && extraSettings.useYQL){
          
          if(extraSettings.useYQL=='xml'){
            extraSettings.yql = {xpath:"//oembed/html", from:'xml'
            , apiendpoint: this.apiendpoint
            , url: function(externalurl){return this.apiendpoint+'?format=xml&url='+externalurl}
            , datareturn:function(results){return results.html.replace(/.*\[CDATA\[(.*)\]\]>$/,'$1') || ''}
            };
          }else{
            extraSettings.yql = {xpath:"json.html", from:'json'
              , apiendpoint: this.apiendpoint
              , url: function(externalurl){return this.apiendpoint+'?format=json&url='+externalurl}
              , datareturn:function(results){return results.html || ''}
            };
          }
          this.apiendpoint = null;
        }
        
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
        
        
        
        this.embedtag = this.embedtag || {tag:""};
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
    new $.fn.oembed.OEmbedProvider("livestream", "video", ["livestream\\.com/.+"], "http://cdn.livestream.com/embed/$1?layout=4&amp;height=340&amp;width=560&amp;autoplay=false", {
        templateRegex: /.*com\/(.*)/, embedtag: {tag: 'iframe', width: '560', height: '340' } }),
    new $.fn.oembed.OEmbedProvider("youtube", "video", ["youtube\\.com/watch.+v=[\\w-]+&?", "youtu\\.be/[\\w-]+"], 'http://www.youtube.com/oembed', {useYQL:'json'}), 
    new $.fn.oembed.OEmbedProvider("xtranormal", "video", ["xtranormal\\.com/watch/.+"], "http://www.xtranormal.com/xtraplayr/$1/$2", {
        templateRegex: /.*com\/watch\/([\w\-]+)\/([\w\-]+).*/,embedtag: {tag: 'iframe',width: '320',height: '269'}}), 
    new $.fn.oembed.OEmbedProvider("scivee", "video", ["scivee.tv/node/.+"], "http://www.scivee.tv/flash/embedCast.swf?", {
        templateRegex: /.*tv\/node\/(.+)/,embedtag: {width: '480',height: '400',flashvars:"id=$1&type=3"}}),
    new $.fn.oembed.OEmbedProvider("veoh", "video", ["veoh.com/watch/.+"], "http://www.veoh.com/swf/webplayer/WebPlayer.swf?version=AFrontend.5.7.0.1337&permalinkId=$1&player=videodetailsembedded&videoAutoPlay=0&id=anonymous", {
        templateRegex: /.*watch\/([^\?]+).*/,embedtag: {width: '410',height: '341'}}),
        
    new $.fn.oembed.OEmbedProvider("gametrailers", "video", ["gametrailers\\.com/video/.+"], "http://media.mtvnservices.com/mgid:moses:video:gametrailers.com:$2", {
        templateRegex: /.*com\/video\/([\w\-]+)\/([\w\-]+).*/,embedtag: {width: '512',height: '288' }}), 
    new $.fn.oembed.OEmbedProvider("funnyordie", "video", ["funnyordie\\.com/videos/.+"], "http://player.ordienetworks.com/flash/fodplayer.swf?", {
        templateRegex: /.*videos\/([^\/]+)\/([^\/]+)?/,embedtag: {width: 512,height: 328,flashvars: "key=$1"}}), 
    new $.fn.oembed.OEmbedProvider("colledgehumour", "video", ["collegehumor\\.com/video/.+"],"http://www.collegehumor.com/moogaloop/moogaloop.swf?clip_id=$1&use_node_id=true&fullscreen=1",
    {templateRegex:/.*video\/([^\/]+).*/ , embedtag : {width:600,height: 338}}), 
    new $.fn.oembed.OEmbedProvider("metacafe", "video", ["metacafe\\.com/watch/.+"],"http://www.metacafe.com/fplayer/$1/$2.swf",
      {templateRegex:/.*watch\/(\d+)\/(\w+)\/.*/ , embedtag : {width:400,height: 345}}), 
    new $.fn.oembed.OEmbedProvider("bambuser", "video", ["bambuser\\.com\/channel\/.*\/broadcast\/.*"],"http://static.bambuser.com/r/player.swf?vid=$1",
      {templateRegex:/.*bambuser\.com\/channel\/.*\/broadcast\/(\w+).*/ , embedtag : {width:512,height: 339 }}), 
    new $.fn.oembed.OEmbedProvider("twitvid", "video", ["twitvid\\.com/.+"],"http://www.twitvid.com/embed.php?guid=$1&autoplay=0",
      {templateRegex:/.*twitvid\.com\/(\w+).*/ , embedtag : {tag:'iframe',width:480,height: 360 }}),
      
    new $.fn.oembed.OEmbedProvider("vzaar", "video", ["vzaar\\.com/videos/.+","vzaar.tv/.+"],"http://view.vzaar.com/$1/player?",
      {templateRegex:/.*\/(\d+).*/, embedtag : {tag:'iframe',width:576,height: 324 }}), 
      
    new $.fn.oembed.OEmbedProvider("embedr", "video", ["embedr\\.com/playlist/.+"],"http://embedr.com/swf/slider/$1/425/520/default/false/std?",
      {templateRegex:/.*playlist\/([^\/]+).*/, embedtag : {width:425,height: 520}}), 
    new $.fn.oembed.OEmbedProvider("blip", "video", ["blip\\.tv/.+"], "http://blip.tv/oembed/"),
    new $.fn.oembed.OEmbedProvider("minoto-video", "video", ["http://api.minoto-video.com/publishers/.+/videos/.+","http://dashboard.minoto-video.com/main/video/details/.+","http://embed.minoto-video.com/.+"], "http://api.minoto-video.com/services/oembed.json",{useYQL:'json'}),
    new $.fn.oembed.OEmbedProvider("animoto", "video", ["animoto.com/play/.+"], "http://animoto.com/services/oembed"),
    new $.fn.oembed.OEmbedProvider("hulu", "video", ["hulu\\.com/watch/.*"], "http://www.hulu.com/api/oembed.json"),
    new $.fn.oembed.OEmbedProvider("ustream", "video", ["ustream\\.tv/recorded/.*"], "http://www.ustream.tv/oembed",{useYQL:'json'}),
		new $.fn.oembed.OEmbedProvider("vimeo", "video", ["http:\/\/www\.vimeo\.com\/groups\/.*\/videos\/.*", "http:\/\/www\.vimeo\.com\/.*", "http:\/\/vimeo\.com\/groups\/.*\/videos\/.*", "http:\/\/vimeo\.com\/.*"], "http://vimeo.com/api/oembed.json"),
		new $.fn.oembed.OEmbedProvider("dailymotion", "video", ["dailymotion\\.com/.+"],'http://www.dailymotion.com/services/oembed'), 
    new $.fn.oembed.OEmbedProvider("5min", "video", ["www\\.5min\\.com/.+"], 'http://api.5min.com/oembed.xml',{useYQL:'xml'}),
    
     new $.fn.oembed.OEmbedProvider("viddler", "video", ["viddler\\.com/.+"], "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22http%3A%2F%2Flab.viddler.com%2Fservices%2Foembed%2f%3Furl%3D$1%22%20and%20xpath%3D%22%2F%2F*%2Fobject%22&format=xml&callback=?",
      {templateRegex:/(.*)/,
      templateData : function(data){if(!data.results[0])return false;return  data.results[0];},
      }),
    new $.fn.oembed.OEmbedProvider("National Film Board of Canada", "video", ["nfb\\.ca/film/.+"],'http://www.nfb.ca/remote/services/oembed/',{useYQL:'json'}),
    new $.fn.oembed.OEmbedProvider("qik", "video", ["qik\\.com/\\w+"], 'http://qik.com/api/oembed.json',{useYQL:'json'}),
    new $.fn.oembed.OEmbedProvider("revision3", "video", ["revision3\\.com"], "http://revision3.com/api/oembed/"),
    new $.fn.oembed.OEmbedProvider("dotsub", "video", ["dotsub\\.com/view/.+"], "http://dotsub.com/services/oembed",{useYQL:'json'}),
    new $.fn.oembed.OEmbedProvider("clikthrough", "video", ["clikthrough\\.com/theater/video/\\d+"], "http://clikthrough.com/services/oembed"),
    new $.fn.oembed.OEmbedProvider("Kinomap", "video", ["kinomap\\.com/.+"], "http://www.kinomap.com/oembed"),
    new $.fn.oembed.OEmbedProvider("VHX", "video", ["vhx.tv/.+"], "http://vhx.tv/services/oembed.json"),
    new $.fn.oembed.OEmbedProvider("bambuser", "video", ["bambuser.com/.+"], "http://api.bambuser.com/oembed/iframe.json"),
    new $.fn.oembed.OEmbedProvider("justin.tv", "video", ["justin.tv/.+"], 'http://api.justin.tv/api/embed/from_url.json',{useYQL:'json'}),
    
    //Audio
    new $.fn.oembed.OEmbedProvider("audioboo", "rich", ["audioboo.fm/boos/.+"],"$1/embed?",
      {templateRegex:/(.*)/, embedtag : {tag:'iframe',width:400,height: 145 }}), 
    new $.fn.oembed.OEmbedProvider("official.fm", "rich", ["official.fm/.+"], 'http://official.fm/services/oembed',{useYQL:'json'}),
    new $.fn.oembed.OEmbedProvider("chirbit", "rich", ["chirb.it/.+"], 'http://chirb.it/oembed.json',{useYQL:'json'}),
    new $.fn.oembed.OEmbedProvider("Huffduffer", "rich", ["huffduffer.com/[-.\\w@]+/\\d+"], "http://huffduffer.com/oembed"),
    new $.fn.oembed.OEmbedProvider("shoudio", "rich", ["shoudio.com/.+","shoud.io/.+"], "http://shoudio.com/api/oembed"),
    new $.fn.oembed.OEmbedProvider("mixcloud", "rich", ["mixcloud.com/.+"],'http://www.mixcloud.com/oembed/',{useYQL:'json'}),
    new $.fn.oembed.OEmbedProvider("rdio.com", "rich", ["rd.io/.+","rdio.com"], "http://www.rdio.com/api/oembed/"),
    new $.fn.oembed.OEmbedProvider("Soundcloud", "rich", ["soundcloud.com/.+"], "http://soundcloud.com/oembed",{format:'js'}),
    new $.fn.oembed.OEmbedProvider("bandcamp", "rich", ["bandcamp\\.com/album/.+"], null,
      {yql:{xpath:"//meta[contains(@content, \\'EmbeddedPlayer\\')]", from:'html'
          , datareturn:function(results){
              return results.meta ?'<iframe width="400" height="100" src="'+results.meta.content+'" allowtransparency="true" frameborder="0"></iframe>':false;
              }
          }
      }),
    new $.fn.oembed.OEmbedProvider("podomatic", "audio", [".+\\.podomatic\\.com/"],"http://ecdn0.hark.com/swfs/player_fb.swf?pid=$1",
      {templateRegex:/http:\/\/([^\/]+).*/ 
      , embedtag : {width:480,height: 360,
        flashvars : "minicast=false&jsonLocation=http%3A%2F%2F$1%2Fembed%2Fmulti%2Fcomixclaptrap?%26color%3D43bee7%26autoPlay%3Dfalse%26width%3D480%26height%3D360"
        }        
      }), 
    new $.fn.oembed.OEmbedProvider("hark", "audio", ["hark\\.com/clips/.+"],"http://ecdn0.hark.com/swfs/player_fb.swf?pid=$1",
      {templateRegex:/.*clips\/([^-]+).*/ , embedtag : {width:300 ,height: 28} }), 
    
     //Photo
		new $.fn.oembed.OEmbedProvider("deviantart", "photo", ["deviantart.com/.+","fav.me/.+","deviantart.com/.+"], "http://backend.deviantart.com/oembed",{format:'jsonp'}),
		new $.fn.oembed.OEmbedProvider("skitch", "photo", ["skitch.com/.+"], null,
    {yql:{xpath:"json", from:'json'
          , url: function(externalurl){return 'http://skitch.com/oembed/?format=json&url='+externalurl}
          , datareturn:function(data){return $.fn.oembed.getPhotoCode( data.json.url, data.json);}
        }
    }),
		new $.fn.oembed.OEmbedProvider("mobypicture", "photo", ["mobypicture.com/user/.+/view/.+","moby.to/.+"], "http://api.mobypicture.com/oEmbed"),
		new $.fn.oembed.OEmbedProvider("graphicly", "photo", ["http://graphicly.com/.+/.+/.+"], "http://oembed.graphicly.com/1/oembed"),
		new $.fn.oembed.OEmbedProvider("propic", "photo", ["propic.com/.+"], "http://propic.com/api/oembed",{useYQL:'xml'}),
		new $.fn.oembed.OEmbedProvider("flickr", "photo", ["flickr\\.com/photos/[-.\\w@]+/\\d+/?"], "http://flickr.com/services/oembed",{callbackparameter:'jsoncallback'}),
		new $.fn.oembed.OEmbedProvider("photobucket", "photo", ["photobucket\\.com/(albums|groups)/.+"], "http://photobucket.com/oembed/"),
		new $.fn.oembed.OEmbedProvider("instagram", "photo", ["instagr\\.?am(\\.com)?/.+"], "http://api.instagram.com/oembed"),
		new $.fn.oembed.OEmbedProvider("yfrog", "photo", ["yfrog\\.(com|ru|com\\.tr|it|fr|co\\.il|co\\.uk|com\\.pl|pl|eu|us)/.+"], "http://www.yfrog.com/api/oembed",{useYQL:"json"}),
		new $.fn.oembed.OEmbedProvider("SmugMug", "photo", ["smugmug.com/[-.\\w@]+/.+"], "http://api.smugmug.com/services/oembed/"),
		new $.fn.oembed.OEmbedProvider("twitpic", "photo", ["twitpic.com/.+"], "http://api.twitpic.com/2/media/show.jsonp?callback=?&id=$1",
      { templateRegex:/.*\/([^\/]+).*/,
      templateData : function(data){if(!data.user)return false;
          return  '<div id="content"><div id="view-photo-user"><div id="photo-user-avatar"><img src="'+data.user.avatar_url+'"></div><div id="photo-info"><h3><a id="photo_username" class="nav-link" href="http://twitter.com/#!/'+data.user.username+'">@'+data.user.username+'</a></h3><p><span id="photo-info-name">'+data.user.name+'</span> '+data.user.timestamp+'</p></div></div><div id="photo-wrap" style="margin: auto;width:600px;height:450px;">'
            +'<img class="photo" id="photo-display" src="http://s3.amazonaws.com/twitpic/photos/large/'+data.id+'.jpg?AWSAccessKeyId=AKIAJF3XCCKACR3QDMOA&amp;Expires=1310509343&amp;Signature=gsukngCVqUE9qb%2FGHvyBqlQTjOo%3D" alt="'+data.message+'"></div><div id="view-photo-caption">'+data.message+'</div></div>';
        }
      }),
    new $.fn.oembed.OEmbedProvider("dribbble", "photo", ["dribbble.com/shots/.+"], "http://api.dribbble.com/shots/$1?callback=?",
      { templateRegex:/.*shots\/([\d]+).*/,
      templateData : function(data){if(!data.image_teaser_url)return false;
          return  '<img class="photo" id="photo-display" src="'+data.image_teaser_url+'"/>';
        }
      }),
    new $.fn.oembed.OEmbedProvider("500px", "photo", ["500px\\.com/photo/.+"],"http://photos.500px.com/$1/3?",
      {templateRegex:/.*photo\/([^\/]+).*/ , embedtag : {tag:'img'}}),
    new $.fn.oembed.OEmbedProvider("circuitlab", "photo", ["circuitlab.com/circuit/.+"],"https://www.circuitlab.com/circuit/$1/screenshot/540x405/?",
      {templateRegex:/.*circuit\/([^\/]+).*/ , embedtag : {tag:'img'}}),
    new $.fn.oembed.OEmbedProvider("23hq", "photo", ["23hq.com/[-.\\w@]+/photo/.+"],"http://www.23hq.com/23/oembed",{useYQL:"json"}),
    new $.fn.oembed.OEmbedProvider("img.ly", "photo", ["img\\.ly/.+"],"http://img.ly/show/thumb/$1?",
      {templateRegex:/.*com\/([^\/]+).*/ , embedtag : {tag:'img'}
      }), 
    new $.fn.oembed.OEmbedProvider("twitgoo.com", "photo", ["twitgoo\\.com/.+"],"http://twitgoo.com/show/thumb/$1?",
      {templateRegex:/.*com\/([^\/]+).*/ , embedtag : {tag:'img'}}), 
    new $.fn.oembed.OEmbedProvider("imgur.com", "photo", ["imgur\\.com/gallery/.+"],"http://imgur.com/$1l.jpg?",
      {templateRegex:/.*gallery\/([^\/]+).*/ , embedtag : {tag:'img'}}), 
    new $.fn.oembed.OEmbedProvider("visual.ly", "rich", ["visual\\.ly/.+"], null,
      {yql:{xpath:"//a[@id=\\'gc_article_graphic_image\\']/img", from:'htmlstring'}
      }),
		new $.fn.oembed.OEmbedProvider("gravtar", "photo", ["mailto:.+"],null,
      {templateRegex:/mailto:([^\/]+).*/ 
      , template : function(wm,email){
        return '<img src="http://gravatar.com/avatar/'+email.md5()+'.jpg" alt="on Gravtar" class="jqoaImg">';
        }
      }),
      new $.fn.oembed.OEmbedProvider("pintrest", "photo", ["pinterest.com/pin/.+"], null,
      {yql:{xpath:'//script[contains(.,"embed_code_html_1")]', from: 'html'
          , datareturn:function(results){
              if(!results.script) return false;
              return results.script.content.replace(/[\s\S]*embed_code_html_1 = "([\s\S]*)width='";[\s\S]*embed_code_html_2 = "([\s\S]*)<\/div>";[\s\S]*/,'$1$2</div>');
             
              }
          }
      }),
      
      
		//Rich
    new $.fn.oembed.OEmbedProvider("twitter", "rich", ["twitter.com/.+"], "https://api.twitter.com/1/statuses/oembed.json"),
    new $.fn.oembed.OEmbedProvider("urtak", "rich", ["urtak.com/(u|clr)   /.+"], "http://oembed.urtak.com/1/oembed"),
    new $.fn.oembed.OEmbedProvider("cacoo", "rich", ["cacoo.com/.+"], "http://cacoo.com/oembed.json"),
    new $.fn.oembed.OEmbedProvider("dailymile", "rich", ["dailymile.com/people/.*/entries/.*"], "http://api.dailymile.com/oembed"),
    new $.fn.oembed.OEmbedProvider("dipity", "rich", ["dipity.com/timeline/.+"],'http://www.dipity.com/oembed/timeline/',{useYQL:'json'}),
    new $.fn.oembed.OEmbedProvider("speakerdeck", "rich", ["speakerdeck.com/.+"],'http://speakerdeck.com/oembed.json',{useYQL:'json'}),
    
    new $.fn.oembed.OEmbedProvider("authorstream", "rich", ["authorstream.com/Presentation/.*"],"http://www.authorstream.com/player.swf?fb=0&nb=1&pl=as&ap=0&c=#dfdfdf&p=$1",
      {templateRegex:/.*Presentation\/([^\/]+).*/, embedtag : {width:425,height: 354}}),
    
    new $.fn.oembed.OEmbedProvider("popplet", "rich", ["popplet.com/app/.*"],"http://popplet.com/app/Popplet_Alpha.swf?page_id=$1&em=1",
      {templateRegex:/.*#\/([^\/]+).*/,embedtag : {width:460,height: 460} }), //Not perhaps Working -due to popplet
    
    new $.fn.oembed.OEmbedProvider("pearltrees", "rich", ["pearltrees.com/.*"],"http://cdn.pearltrees.com/s/embed/getApp?",
      {templateRegex:/.*N-f=1_(\d+).*N-p=(\d+).*/, //N-f=1_3201432&N-fa=3114380&N-p=23874509&N-play=0&N-s=1_3201432&N-u=1_335577
      embedtag : {width:460,height: 460,
         flashvars : "lang=en_US&amp;embedId=pt-embed-$1-693&amp;treeId=$1&amp;pearlId=$2&amp;treeTitle=Diagrams%2FVisualization&amp;site=www.pearltrees.com%2FF"} 
      }),
    
    new $.fn.oembed.OEmbedProvider("prezi", "rich", ["prezi.com/.*"],"http://prezi.com/bin/preziloader.swf?",
      {templateRegex:/.*com\/([^\/]+)\/.*/,
      embedtag : {width:550,height: 400,
        flashvars : "prezi_id=$1&amp;lock_to_path=0&amp;color=ffffff&amp;autoplay=no&amp;autohide_ctrls=0"
        } 
      }),
    
		new $.fn.oembed.OEmbedProvider("meetup", "rich", ["meetup\\.(com|ps)/.+"], "http://api.meetup.com/oembed"),
    new $.fn.oembed.OEmbedProvider("ebay", "rich", ["ebay\\.*"],"http://togo.ebay.com/togo/togo.swf?2008013100",
      {templateRegex:/.*\/([^\/]+)\/(\d{10,13}).*/,
      embedtag : {width:355,height: 300,
        flashvars : "base=http://togo.ebay.com/togo/&lang=en-us&mode=normal&itemid=$2&query=$1"
        } 
      }),
    new $.fn.oembed.OEmbedProvider("eventful_venue", "rich", ["eventful.com/.*/venues/.*"],"http://static.eventful.com/store/flash/widgets/eventWidget.swf?",
      {templateRegex:/.*venues\/([^\/]+)\/([^\/]+).*/,
      embedtag : {width:450,height: 407,
        flashvars : "&id=$2&interfaceFolder=eventView&theme=0&numberPerPage=5&displayTitle=1&location=0&venue=0&eventTitle=1&date=1&time=1&peopleCount=1&countDownClock=0&title=Event at $1"
        }
      }),
    new $.fn.oembed.OEmbedProvider("tumblr", "rich", ["tumblr.com/.+"], "http://$1.tumblr.com/api/read/json?callback=?&id=$2",
      {templateRegex:/.*\/\/([\w]+).*\/post\/([^\/]+).*/,
      templateData : function(data){if(!data.posts)return false;
          return  '<div id="content"><h3><a class="nav-link" href="'+data.posts[0]['url-with-slug']+'">'+data.posts[0]['regular-title']+'</a></h3>'+data.posts[0]['regular-body']+'</div>';
        }
      }),
    new $.fn.oembed.OEmbedProvider("wikipedia", "rich", ["wikipedia.org/wiki/.+"], "http://$1.wikipedia.org/w/api.php?action=parse&page=$2&format=json&section=0&callback=?",{
      templateRegex:/.*\/\/([\w]+).*\/wiki\/([^\/]+).*/,
      templateData : function(data){if(!data.parse)return false;
          var text = data.parse['text']['*'].replace('href="/wiki','href="http://en.wikipedia.org/wiki');
          return  '<div id="content"><h3><a class="nav-link" href="http://en.wikipedia.org/wiki/'+data.parse['displaytitle']+'">'+data.parse['displaytitle']+'</a></h3>'+text+'</div>';
        }
      }),
    new $.fn.oembed.OEmbedProvider("imdb", "rich", ["imdb.com/title/.+"], "http://www.imdbapi.com/?i=$1&callback=?",
      {templateRegex:/.*\/title\/([^\/]+).*/,
      templateData : function(data){if(!data.Title)return false;
          return  '<div id="content"><h3><a class="nav-link" href="http://imdb.com/title/'+data.ID+'/">'+data.Title+'</a> ('+data.Year+')</h3><p>Starring: '+data.Actors+'</p><div id="photo-wrap" style="margin: auto;width:600px;height:450px;"><img class="photo" id="photo-display" src="'+data.Poster+'" alt="'+data.Title+'"></div>  <div id="view-photo-caption">'+data.Plot+'</div></div>';
        }
      }),
    new $.fn.oembed.OEmbedProvider("livejournal", "rich", ["livejournal.com/"], "http://ljpic.seacrow.com/json/$2$4?jsonp=?"
    ,{templateRegex:/(http:\/\/(((?!users).)+)\.livejournal\.com|.*users\.livejournal\.com\/([^\/]+)).*/,
      templateData : function(data){if(!data.username)return false;
          return  '<div id="content"><img src="'+data.image+'" align="left" style="margin-right: 1em;" /><span class="ljuser"><a href="http://'+data.username+'.livejournal.com/profile"><img src="http://www.livejournal.com/img/userinfo.gif" alt="[info]" width="17" height="17" /></a><a href="http://'+data.username+'.livejournal.com/">'+data.username+'</a></span><br />'+data.name+'</div>';
        }
      }),  
    new $.fn.oembed.OEmbedProvider("circuitbee", "rich", ["circuitbee\\.com/circuit/view/.+"],"http://c.circuitbee.com/build/r/schematic-embed.html?id=$1",
      {templateRegex:/.*circuit\/view\/(\d+).*/ 
      ,embedtag : {tag: 'iframe', width:'500',height: '350'}
      }),
      
    new $.fn.oembed.OEmbedProvider("googlecalendar", "rich", ["www.google.com/calendar/embed?.+"],"$1",
      {templateRegex:/(.*)/ 
      ,embedtag : {tag: 'iframe', width:'800',height: '600' }
      }),
      
    new $.fn.oembed.OEmbedProvider("jotform", "rich", ["form.jotform.co/form/.+"],"$1",
      {templateRegex:/(.*)/ 
      ,embedtag : {tag: 'iframe', width:'100%',height: '507' }
      }),
    new $.fn.oembed.OEmbedProvider("reelapp", "rich", ["reelapp\\.com/.+"],"http://www.reelapp.com/$1/embed",
      {templateRegex:/.*com\/(\S{6}).*/ 
      ,embedtag : {tag: 'iframe', width:'400',height: '338'}
      }),
    new $.fn.oembed.OEmbedProvider("linkedin", "rich", ["linkedin.com/pub/.+"],"https://www.linkedin.com/cws/member/public_profile?public_profile_url=$1&format=inline&isFramed=true",
      {templateRegex:/(.*)/ 
      ,embedtag : {tag: 'iframe', width:'368px',height: 'auto'}
      }),
    new $.fn.oembed.OEmbedProvider("pastebin", "rich", ["pastebin\\.com/[\\S]{8}"],"http://pastebin.com/embed_iframe.php?i=$1",
      {templateRegex:/.*\/(\S{8}).*/ 
      ,embedtag : {tag: 'iframe', width:'100%',height: 'auto'}
      }),
    new $.fn.oembed.OEmbedProvider("pastie", "rich", ["pastie\\.org/pastes/.+"],null,
      {yql:{xpath:'//pre[@class="textmate-source"]'}
      }),
    new $.fn.oembed.OEmbedProvider("github", "rich", ["gist.github.com/.+"], "https://github.com/api/oembed"),
    new $.fn.oembed.OEmbedProvider("github", "rich", ["github.com/[-.\\w@]+/[-.\\w@]+"], "https://api.github.com/repos/$1/$2?callback=?"
    ,{templateRegex:/.*\/([^\/]+)\/([^\/]+).*/,
      templateData : function(data){ if(!data.data.html_url)return false;
          return  '<div class="githubrepos"><ul class="repo-stats"><li>'+data.data.language+'</li><li class="watchers"><a title="Watchers" href="'+data.data.html_url+'/watchers">'+data.data.watchers+'</a></li>'
            +'<li class="forks"><a title="Forks" href="'+data.data.html_url+'/network">'+data.data.forks+'</a></li></ul><h3><a href="'+data.data.html_url+'">'+data.data.name+'</a></h3><div class="body"><p class="description">'+data.data.description+'</p>'
            +'<p class="updated-at">Last updated: '+data.data.pushed_at+'</p></div></div>';
        }
      }),
    new $.fn.oembed.OEmbedProvider("myspace", "rich", ["myspace.com/[-.\\w@]+"], "http://api.myspace.com/opensearch/people?searchTerms=$1&callback=?&searchBy=displayname&count=1"
    ,{templateRegex:/.*\/([^\/]+).*/,
      templateData : function(data){ if(!data.entries)return false;
          return  '<div class="myspace1"><div class="myspace2"><a href="http://www.myspace.com/" class="MSIcon">Myspace&nbsp;&nbsp;&nbsp;</a> <a href="'+data.entries[0].profileUrl+'">'+data.entries[0].displayName+'</a></div><div class="myspaceBody"><div><img src="'+data.entries[0].thumbnailUrl+'" align="left"></div><div>Location  <strong>'+data.entries[0].location+'</strong><br/>Type:  <strong>'+data.entries[0].msUserType+'</strong><br/></div></div></div>';
        }
      }),
    new $.fn.oembed.OEmbedProvider("facebook", "rich", ["facebook.com/(people/[^\\/]+/\\d+|[^\\/]+$)"], "https://graph.facebook.com/$2$3/?callback=?"
    ,{templateRegex:/.*facebook.com\/(people\/[^\/]+\/(\d+).*|([^\/]+$))/,
      templateData : function(data){ if(!data.id)return false;
          var out =  '<div class="facebook1"><div class="facebook2"><a href="http://www.facebook.com/">facebook</a> <a href="'+data.link+'">'+data.name+'</a></div><div class="facebookBody"><div>';
          if(data.picture) out += '<img src="'+data.picture+'" align="left"></div><div>';
          if(data.category) out += 'Category  <strong>'+data.category+'</strong><br/>';
          if(data.website) out += 'Website  <strong>'+data.website+'</strong><br/>';
          if(data.gender) out += 'Gender  <strong>'+data.gender+'</strong><br/>';
          out += '</div></div></div>';
          return out;
        }
      }),
    new $.fn.oembed.OEmbedProvider("stackoverflow", "rich", ["stackoverflow.com/questions/[\\d]+"], "http://api.stackoverflow.com/1.1/questions/$1?body=true&jsonp=?"
    ,{templateRegex:/.*questions\/([\d]+).*/,
      templateData : function(data){ 
          if(!data.questions)return false;
          var q = data.questions[0];
          var body = $(q.body).text();
          var out = '<div class="stoqembed"><div class="statscontainer"><div class="statsarrow"></div><div class="stats"><div class="vote"><div class="votes">'
                +'<span class="vote-count-post"><strong>'+ (q.up_vote_count - q.down_vote_count)+ '</strong></span><div class="viewcount">vote(s)</div></div>'
                +'</div><div class="status"><strong>'+q.answer_count+'</strong>answer</div></div><div class="views">'+q.view_count+' view(s)</div></div>'
                +'<div class="summary"><h3><a class="question-hyperlink" href="http://stackoverflow.com/questions/'+q.question_id+'/">'+q.title+'</a></h3>'
                +'<div class="excerpt">'+ body.substring(0,100)+'...</div><div class="tags">';
          for(i in q.tags) 
            out += '<a title="" class="post-tag" href="http://stackoverflow.com/questions/tagged/'+q.tags[i]+'">'+q.tags[i]+'</a>';
          out += '</div><div class="fr"><div class="user-info"><div class="user-gravatar32"><a href="http://stackoverflow.com/users/'+q.owner.user_id+'/'+q.owner.display_name+'">'
            +'<img width="32" height="32" alt="" src="http://www.gravatar.com/avatar/'+q.owner.email_hash+'?s=32&amp;d=identicon&amp;r=PG"></a></div><div class="user-details">'
            +'<a href="http://stackoverflow.com/users/'+q.owner.user_id+'/'+q.owner.display_name+'">'+q.owner.display_name+'</a><br><span title="reputation score" class="reputation-score">'
            +q.owner.reputation+'</span></div></div></div></div></div>';
            return out;
        }
      }),
    new $.fn.oembed.OEmbedProvider("wordpress", "rich", ["wordpress\\.com/.+","blogs\\.cnn\\.com/.+","techcrunch\\.com/.+","wp\\.me/.+"]
      , "http://public-api.wordpress.com/oembed/1.0/?for=jquery-oembed-all"),
    new $.fn.oembed.OEmbedProvider("screenr", "rich", ["screenr\.com"], "http://www.screenr.com/embed/$1", 
      {templateRegex:/.*\/([^\/]+).*/ 
      ,embedtag : {tag: 'iframe', width:'650',height: 396}
      }) ,
		new $.fn.oembed.OEmbedProvider("gigpans", "rich", ["gigapan\\.org/[-.\\w@]+/\\d+"],"http://gigapan.org/gigapans/$1/options/nosnapshots/iframe/flash.html",
      {templateRegex:/.*\/(\d+)\/?.*/,
      embedtag : {tag: 'iframe', width:'100%',height: 400 }
      }), 
    new $.fn.oembed.OEmbedProvider("scribd", "rich", ["scribd\\.com/.+"],"http://www.scribd.com/embeds/$1/content?start_page=1&view_mode=list",
      {templateRegex:/.*doc\/([^\/]+).*/ ,
      embedtag : {tag: 'iframe', width:'100%',height: 600}      
      }),
    new $.fn.oembed.OEmbedProvider("kickstarter", "rich", ["kickstarter\\.com/projects/.+"], "$1/widget/card.html",
      {templateRegex:/([^\?]+).*/ ,
      embedtag : {tag: 'iframe', width:'220',height: 380}      
      }),
    new $.fn.oembed.OEmbedProvider("issuu", "rich", ["issuu\\.com/[-.\\w@]+/docs/.+"], null,
      {yql:{xpath:"//meta[contains(@content,\\'IssuuViewer.swf\\')]", from:'html'
          , datareturn:function(results){
              return results.meta ?'<embed type="application/x-shockwave-flash" allowfullscreen="true" menu="false" src="'+results.meta.content+'" allowtransparency="true" frameborder="0"></embed>':false;
              }
          }
      }),
    new $.fn.oembed.OEmbedProvider("amazon", "rich", ["amzn.com/B+","amazon.com.*/(B\\S+)($|\\/.*)"], "http://rcm.amazon.com/e/cm?t=_APIKEY_&o=1&p=8&l=as1&asins=$1&ref=qf_br_asin_til&fc1=000000&IS2=1&lt1=_blank&m=amazon&lc1=0000FF&bc1=000000&bg1=FFFFFF&f=ifr"
    ,{apikey: true,
      templateRegex:/.*\/(B[0-9A-Z]+)($|\/.*)/,
       embedtag : {tag: 'iframe', width:'120px',height: '240px'}      
      }),

    new $.fn.oembed.OEmbedProvider("slideshare", "rich", ["slideshare\.net"], "http://www.slideshare.net/api/oembed/2",{format:'jsonp'}),
    
    new $.fn.oembed.OEmbedProvider("lanyard", "rich", ["lanyrd.com/\\d+/.+"], null,
      {yql:{xpath:'(//div[@class="primary"])[1]', from: 'htmlstring'
          , datareturn:function(results){
              if(!results.result) return false;
              return '<div class="lanyard">'+results.result+'</div>';
             
              }
          }
      }),
    
    new $.fn.oembed.OEmbedProvider("etsy", "rich", ["etsy.com/listing/[\\d]+"], "http://openapi.etsy.com/v2/listings/$1.js?callback=?&api_key=_APIKEY_"
    ,{apikey: true,
      templateRegex:/.*listing\/([\d]+).*/,
      templateData : function(data){ 
          if(!data.results)return false;
          var q = data.results[0], ql;
          var image = $.ajax("http://openapi.etsy.com/v2/listings/"+q.listing_id+"/images.js",{
            async:false
            ,cache:false
            ,data : {api_key:settings.apikeys.etsy}
            ,success:function(data){
              if(!data.results)return false;
              var q = data.results[0];
              $('#etsy'+q.listing_id).prepend('<img align="left" src="'+q.url_75x75+'"/>');
              }
              ,dataType: 'jsonp'
            });
            var out = '<div class="etsyembed" id="etsy' + q.listing_id + '"><h3><a href="' + q.url + '">' + q.title + ' ' + q.price + q.currency_code + '</a></h3>' + data.results[0].description + '</div>';
            return out;
        }
    })

    ];
})(jQuery);

//This is needed for gravatar :(
String.prototype.md5=function(){var a=function(a,b){var c=(a&65535)+(b&65535);var d=(a>>16)+(b>>16)+(c>>16);return d<<16|c&65535};var b=function(a,b){return a<<b|a>>>32-b};var c=function(c,d,e,f,g,h){return a(b(a(a(d,c),a(f,h)),g),e)};var d=function(a,b,d,e,f,g,h){return c(b&d|~b&e,a,b,f,g,h)};var e=function(a,b,d,e,f,g,h){return c(b&e|d&~e,a,b,f,g,h)};var f=function(a,b,d,e,f,g,h){return c(b^d^e,a,b,f,g,h)};var g=function(a,b,d,e,f,g,h){return c(d^(b|~e),a,b,f,g,h)};var h=function(b){var c,h,i,j,k,l=b.length;var m=1732584193;var n=-271733879;var o=-1732584194;var p=271733878;for(k=0;k<l;k+=16){c=m;h=n;i=o;j=p;m=d(m,n,o,p,b[k+0],7,-680876936);p=d(p,m,n,o,b[k+1],12,-389564586);o=d(o,p,m,n,b[k+2],17,606105819);n=d(n,o,p,m,b[k+3],22,-1044525330);m=d(m,n,o,p,b[k+4],7,-176418897);p=d(p,m,n,o,b[k+5],12,1200080426);o=d(o,p,m,n,b[k+6],17,-1473231341);n=d(n,o,p,m,b[k+7],22,-45705983);m=d(m,n,o,p,b[k+8],7,1770035416);p=d(p,m,n,o,b[k+9],12,-1958414417);o=d(o,p,m,n,b[k+10],17,-42063);n=d(n,o,p,m,b[k+11],22,-1990404162);m=d(m,n,o,p,b[k+12],7,1804603682);p=d(p,m,n,o,b[k+13],12,-40341101);o=d(o,p,m,n,b[k+14],17,-1502002290);n=d(n,o,p,m,b[k+15],22,1236535329);m=e(m,n,o,p,b[k+1],5,-165796510);p=e(p,m,n,o,b[k+6],9,-1069501632);o=e(o,p,m,n,b[k+11],14,643717713);n=e(n,o,p,m,b[k+0],20,-373897302);m=e(m,n,o,p,b[k+5],5,-701558691);p=e(p,m,n,o,b[k+10],9,38016083);o=e(o,p,m,n,b[k+15],14,-660478335);n=e(n,o,p,m,b[k+4],20,-405537848);m=e(m,n,o,p,b[k+9],5,568446438);p=e(p,m,n,o,b[k+14],9,-1019803690);o=e(o,p,m,n,b[k+3],14,-187363961);n=e(n,o,p,m,b[k+8],20,1163531501);m=e(m,n,o,p,b[k+13],5,-1444681467);p=e(p,m,n,o,b[k+2],9,-51403784);o=e(o,p,m,n,b[k+7],14,1735328473);n=e(n,o,p,m,b[k+12],20,-1926607734);m=f(m,n,o,p,b[k+5],4,-378558);p=f(p,m,n,o,b[k+8],11,-2022574463);o=f(o,p,m,n,b[k+11],16,1839030562);n=f(n,o,p,m,b[k+14],23,-35309556);m=f(m,n,o,p,b[k+1],4,-1530992060);p=f(p,m,n,o,b[k+4],11,1272893353);o=f(o,p,m,n,b[k+7],16,-155497632);n=f(n,o,p,m,b[k+10],23,-1094730640);m=f(m,n,o,p,b[k+13],4,681279174);p=f(p,m,n,o,b[k+0],11,-358537222);o=f(o,p,m,n,b[k+3],16,-722521979);n=f(n,o,p,m,b[k+6],23,76029189);m=f(m,n,o,p,b[k+9],4,-640364487);p=f(p,m,n,o,b[k+12],11,-421815835);o=f(o,p,m,n,b[k+15],16,530742520);n=f(n,o,p,m,b[k+2],23,-995338651);m=g(m,n,o,p,b[k+0],6,-198630844);p=g(p,m,n,o,b[k+7],10,1126891415);o=g(o,p,m,n,b[k+14],15,-1416354905);n=g(n,o,p,m,b[k+5],21,-57434055);m=g(m,n,o,p,b[k+12],6,1700485571);p=g(p,m,n,o,b[k+3],10,-1894986606);o=g(o,p,m,n,b[k+10],15,-1051523);n=g(n,o,p,m,b[k+1],21,-2054922799);m=g(m,n,o,p,b[k+8],6,1873313359);p=g(p,m,n,o,b[k+15],10,-30611744);o=g(o,p,m,n,b[k+6],15,-1560198380);n=g(n,o,p,m,b[k+13],21,1309151649);m=g(m,n,o,p,b[k+4],6,-145523070);p=g(p,m,n,o,b[k+11],10,-1120210379);o=g(o,p,m,n,b[k+2],15,718787259);n=g(n,o,p,m,b[k+9],21,-343485551);m=a(m,c);n=a(n,h);o=a(o,i);p=a(p,j)}return[m,n,o,p]};var i=function(a){var b="0123456789abcdef",c="",d,e=a.length*4;for(d=0;d<e;d++){c+=b.charAt(a[d>>2]>>d%4*8+4&15)+b.charAt(a[d>>2]>>d%4*8&15)}return c};var j=function(a){var b=(a.length+8>>6)+1;var c=[],d,e=b*16,f,g=a.length;for(d=0;d<e;d++){c.push(0)}for(f=0;f<g;f++){c[f>>2]|=(a.charCodeAt(f)&255)<<f%4*8}c[f>>2]|=128<<f%4*8;c[b*16-2]=g*8;return c};return i(h(j(this)))}
