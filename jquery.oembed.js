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
 
(function ($) {
    $.fn.oembed = function (url, options, embedAction) {

        settings = $.extend(true, $.fn.oembed.defaults, options);

        return this.each(function () {

            var container = $(this),
              resourceURL = (url != null) ? url : container.attr("href"),
              provider;

            if (embedAction) {
                settings.onEmbed = embedAction;
            } else {
                settings.onEmbed = function (oembedData) {
                    $.fn.oembed.insertCode(this, settings.embedMethod, oembedData);
                };
            }

            if (resourceURL != null) {
                provider = $.fn.oembed.getOEmbedProvider(resourceURL);

                if (provider != null) {
                    provider.params = getNormalizedParams(settings[provider.name]) || {};
                    provider.maxWidth = settings.maxWidth;
                    provider.maxHeight = settings.maxHeight;
                    embedCode(container, resourceURL, provider);
                } else {
                    settings.onProviderNotFound.call(container, resourceURL);
                }
            }

            return container;
        });


    };

    var settings, activeProviders = [];

    // Plugin defaults
    $.fn.oembed.defaults = {
        maxWidth: null,
        maxHeight: null,
        embedMethod: "replace",  	// "auto", "append", "fill"		
        onProviderNotFound: function () { },
        beforeEmbed: function () { },
        afterEmbed: function () { },
        onEmbed: function () { },
        onError: function() {},
        ajaxOptions: {}
    };

    /* Private functions */
    function getRequestUrl(provider, externalUrl) {
        var url = provider.apiendpoint, qs = "",  i;
        url += (url.indexOf("?") <= 0)?"?":"&";

        if (provider.maxWidth != null && provider.params["maxwidth"] == null)
            provider.params["maxwidth"] = provider.maxWidth;

        if (provider.maxHeight != null && provider.params["maxheight"] == null)
            provider.params["maxheight"] = provider.maxHeight;

        for (i in provider.params) {
            // We don't want them to jack everything up by changing the callback parameter
            if (i == provider.callbackparameter)
                continue;

            // allows the options to be set to null, don't send null values to the server as parameters
            if (provider.params[i] != null)
                qs += "&" + escape(i) + "=" + provider.params[i];
        }

        url += "format="+provider.format+"&url=" + escape(externalUrl) +
					qs +"&" + provider.callbackparameter + "=?";

        return url;
    };

    function embedCode(container, externalUrl, embedProvider) {
      if(embedProvider.templateRegex){
        
        if(embedProvider.apiendpoint){
          ajaxopts = $.extend({
            url: externalUrl.replace(embedProvider.templateRegex,embedProvider.apiendpoint),
            type: 'get',
            dataType: 'json',
            success:  function (data) {
              var oembedData = $.extend({}, data);
              oembedData.code = embedProvider.templateData(data);
             
              settings.beforeEmbed.call(container, oembedData);
              settings.onEmbed.call(container, oembedData);
              settings.afterEmbed.call(container, oembedData);
            },
            error: settings.onError.call(container, externalUrl, embedProvider)
          }, settings.ajaxOptions || { } );
          
          $.ajax( ajaxopts );
        }else{
        
          var oembedData = {code: externalUrl.replace(embedProvider.templateRegex,embedProvider.template)};
          settings.beforeEmbed.call(container, oembedData);
          settings.onEmbed.call(container, oembedData);
          settings.afterEmbed.call(container, oembedData);
        }
        
      }else{

        var requestUrl = getRequestUrl(embedProvider, externalUrl), 		
        ajaxopts = $.extend({
          url: requestUrl,
          type: 'get',
          dataType: 'json',
          // error: jsonp request doesnt' support error handling
          success:  function (data) {
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
            settings.beforeEmbed.call(container, oembedData);
            settings.onEmbed.call(container, oembedData);
            settings.afterEmbed.call(container, oembedData);
          },
          error: settings.onError.call(container, externalUrl, embedProvider)
        }, settings.ajaxOptions || { } );
        
        $.ajax( ajaxopts );  
      }      
    };

    function getNormalizedParams(params) {
        if (params == null)
            return null;
        var key, normalizedParams = {};
        for (key in params) {
            if (key != null)
                normalizedParams[key.toLowerCase()] = params[key];
        }
        return normalizedParams;
    }

    function isNullOrEmpty(object) {
        if (typeof object == "undefined" || object == null || ($.isArray(object) && object.length == 0))
            return true;
        return false;
    }

    /* Public functions */
    $.fn.oembed.insertCode = function (container, embedMethod, oembedData) {
        if (oembedData == null)
            return;

        switch (embedMethod) {
            case "auto":
                if (container.attr("href") != null) {
                    $.fn.oembed.insertCode(container, "append", oembedData);
                }
                else {
                    $.fn.oembed.insertCode(container, "replace", oembedData);
                };
                break;
            case "replace":
                container.replaceWith(oembedData.code);
                break;
            case "fill":
                container.html(oembedData.code);
                break;
            case "append":
                var oembedContainer = container.next();
                if (oembedContainer == null || !oembedContainer.hasClass("oembed-container")) {
                    oembedContainer = container
                      .after('<div class="oembed-container"></div>')
                      .next(".oembed-container");
                    if (oembedData != null && oembedData.provider_name != null)
                        oembedContainer.toggleClass("oembed-container-" + oembedData.provider_name);
                }
                oembedContainer.html(oembedData.code);
                break;
        }
    };

    $.fn.oembed.getPhotoCode = function (url, oembedData) {
        var code, alt = oembedData.title ? oembedData.title : '';
        alt += oembedData.author_name ? ' - ' + oembedData.author_name : '';
        alt += oembedData.provider_name ? ' - ' + oembedData.provider_name : '';
        code = '<div><a href="' + url + '" target=\'_blank\'><img src="' + oembedData.url + '" alt="' + alt + '"/></a></div>';
        if (oembedData.html)
            code += "<div>" + oembedData.html + "</div>";
        return code;
    };

    $.fn.oembed.getRichCode = function (url, oembedData) {
        var code = oembedData.html;
        return code;
    };

    $.fn.oembed.getGenericCode = function (url, oembedData) {
        var title = (oembedData.title != null) ? oembedData.title : url,
			code = '<a href="' + url + '">' + title + '</a>';
        if (oembedData.html)
            code += "<div>" + oembedData.html + "</div>";
        return code;
    };

    $.fn.oembed.isProviderAvailable = function (url) {
        var provider = getOEmbedProvider(url);
        return (provider != null);
    };

    $.fn.oembed.getOEmbedProvider = function (url) {
        for (var i = 0; i < this.providers.length; i++) {
            if (this.providers[i].matches(url))
                return this.providers[i];
        }
        return null;
    };

    $.fn.oembed.OEmbedProvider = function (name, type, urlschemesarray, apiendpoint, extraSettings){//callbackparameter,format) {
        this.name = name;
        this.type = type; // "photo", "video", "link", "rich", null
        this.urlschemes = getUrlSchemes(urlschemesarray);
        this.apiendpoint = apiendpoint ;
        this.maxWidth = 500;
        this.maxHeight = 400;
        
        this.fromJSON = function (json) {
            for (property in json) {
                if (property != "urlschemes")
                    this[property] = json[property];
                else
                    this[property] = getUrlSchemes(json[property]);
            }
            return true;
        };
        
        if(!isNullOrEmpty(extraSettings))this.fromJSON(extraSettings);
        
        this.format = this.format || 'json';
        this.callbackparameter = this.callbackparameter ||  "callback";
        
        var i, property, regExp;

        this.matches = function (externalUrl) {
            for (i = 0; i < this.urlschemes.length; i++) {
                regExp = new RegExp(this.urlschemes[i], "i");
                if (externalUrl.match(regExp) != null)
                    return true;
            }
            return false;
        };

        

        function getUrlSchemes(urls) {
            if (isNullOrEmpty(urls))
                return ["."];
            if ($.isArray(urls))
                return urls;
            return urls.split(";");
        }
    };

    /* Native & common providers */
    $.fn.oembed.providers = [
    
    //Video
		new $.fn.oembed.OEmbedProvider("youtube", "video", ["youtube\\.com/watch.+v=[\\w-]+&?"],null,{templateRegex:/.*v\=([\w-]+)&?.*/ 
      , template : '<iframe width="425" height="349" src="http://www.youtube.com/embed/$1" frameborder="0" allowfullscreen></iframe>'}), 
		new $.fn.oembed.OEmbedProvider("funnyordie", "video", ["funnyordie\\.com/videos/.+"],null,{templateRegex:/.*videos\/([^\/]+)\/([^\/]+)?/ 
      , template : '<object width="512" height="328" classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" id="ordie_player_$1"><param name="movie" value="http://player.ordienetworks.com/flash/fodplayer.swf" /><param name="flashvars" value="key=$1" /><param name="allowfullscreen" value="true" /><param name="allowscriptaccess" value="always"></param>'
          +'<embed width="512" height="328" flashvars="key=$1" allowfullscreen="true" allowscriptaccess="always" quality="high" src="http://player.ordienetworks.com/flash/fodplayer.swf" name="ordie_player_$1" type="application/x-shockwave-flash"></embed></object>'}), 
    new $.fn.oembed.OEmbedProvider("colledgehumour", "video", ["collegehumor\\.com/video/.+"],null,{templateRegex:/.*video\/([^\/]+).*/ 
      , template : '<object id="ch6560683" type="application/x-shockwave-flash" data="http://www.collegehumor.com/moogaloop/moogaloop.swf?clip_id=$1&use_node_id=true&fullscreen=1" width="600" height="338">'
          +'<param name="allowfullscreen" value="true"/><param name="wmode" value="transparent"/><param name="allowScriptAccess" value="always"/><param name="movie" quality="best" value="http://www.collegehumor.com/moogaloop/moogaloop.swf?clip_id=$1&use_node_id=true&fullscreen=1"/>'
          +'<embed src="http://www.collegehumor.com/moogaloop/moogaloop.swf?clip_id=$1&use_node_id=true&fullscreen=1" type="application/x-shockwave-flash" wmode="transparent" width="600" height="338" allowScriptAccess="always"></embed></object>'}), 
    new $.fn.oembed.OEmbedProvider("metacafe", "video", ["metacafe\\.com/watch/.+"],null,{templateRegex:/.*watch\/(\d+)\/(\w+)\/.*/ 
      , template : '<embed src="http://www.metacafe.com/fplayer/$1/$2.swf" width="400" height="345" wmode="transparent" pluginspage="http://www.macromedia.com/go/getflashplayer" type="application/x-shockwave-flash" allowFullScreen="true"> </embed>'}), 
    new $.fn.oembed.OEmbedProvider("embedr", "video", ["embedr\\.com/playlist/.+"],null,{templateRegex:/.*playlist\/([^\/]+).*/ 
      , template : '<div style="width:425px;height:520px;"><object width="425" height="520"><param name="movie" value="http://embedr.com/swf/slider/$1/425/520/default/false/std"></param><param name="allowFullScreen" value="true"></param><param name="wmode" value="transparent"><embed src="http://embedr.com/swf/slider/$1/425/520/default/false/std" type="application/x-shockwave-flash" allowFullScreen="true" width="425" height="520" wmode="transparent"></embed></object>'}), 
    new $.fn.oembed.OEmbedProvider("blip", "video", ["blip\\.tv/.+"], "http://blip.tv/oembed/"),
    new $.fn.oembed.OEmbedProvider("hulu", "video", ["hulu\\.com/watch/.*"], "http://www.hulu.com/api/oembed.json"),
		new $.fn.oembed.OEmbedProvider("vimeo", "video", ["http:\/\/www\.vimeo\.com\/groups\/.*\/videos\/.*", "http:\/\/www\.vimeo\.com\/.*", "http:\/\/vimeo\.com\/groups\/.*\/videos\/.*", "http:\/\/vimeo\.com\/.*"], "http://vimeo.com/api/oembed.json"),
		new $.fn.oembed.OEmbedProvider("dailymotion", "video", ["dailymotion\\.com/.+"],'http://www.dailymotion.com/services/oembed'), 
    new $.fn.oembed.OEmbedProvider("5min", "video", ["www\\.5min\\.com/.+"], "http://api.5min.com/oembed.json"),
    new $.fn.oembed.OEmbedProvider("National Film Board of Canada", "video", ["nfb\\.ca/film/.+"], "http://www.nfb.ca/remote/services/oembed/"),
    new $.fn.oembed.OEmbedProvider("qik", "video", ["qik\\.com/\\w+"], "http://qik.com/api/oembed.json"),
    new $.fn.oembed.OEmbedProvider("revision3", "video", ["revision3\\.com"], "http://revision3.com/api/oembed/"),
    new $.fn.oembed.OEmbedProvider("dotsub", "video", ["dotsub\\.com/view/.+"], "http://dotsub.com/services/oembed"),
    new $.fn.oembed.OEmbedProvider("clickthrough", "video", ["clikthrough\\.com/theater/video/\\d+"], "http://clikthrough.com/services/oembed"),
    new $.fn.oembed.OEmbedProvider("Kinomap", "video", ["kinomap\\.com/.+"], "http://www.kinomap.com/oembed"),
    
    //Audio
    new $.fn.oembed.OEmbedProvider("Huffduffer", "rich", ["huffduffer.com/[-.\\w@]+/\\d+"], "http://huffduffer.com/oembed"),
    new $.fn.oembed.OEmbedProvider("Soundcloud", "rich", ["soundcloud.com/.+"], "http://soundcloud.com/oembed",{format:'js'}),
    
     //Photo
		new $.fn.oembed.OEmbedProvider("flickr", "photo", ["flickr\\.com/photos/[-.\\w@]+/\\d+/?"], "http://flickr.com/services/oembed"),
		new $.fn.oembed.OEmbedProvider("photobucket", "photo", ["photobucket\\.com/(albums|groups)/.+"], "http://photobucket.com/oembed/"),
		new $.fn.oembed.OEmbedProvider("instagram", "photo", ["instagr\\.?am(\\.com)?/.+"], "http://api.instagram.com/oembed"),
		new $.fn.oembed.OEmbedProvider("yfrog", "photo", ["yfrog\\.(com|ru|com\\.tr|it|fr|co\\.il|co\\.uk|com\\.pl|pl|eu|us)/.+"], "http://www.yfrog.com/api/oembed"),
		new $.fn.oembed.OEmbedProvider("23hq", "photo", ["23hq.com/[-.\\w@]/photo/.+"], "http://www.23hq.com/23/oembed"),
		new $.fn.oembed.OEmbedProvider("SmugMug", "photo", ["smugmug.com/[-.\\w@]/.+"], "http://api.smugmug.com/services/oembed/"),
		new $.fn.oembed.OEmbedProvider("twitpic", "photo", ["twitpic.com/.+"], "http://api.twitpic.com/2/media/show.jsonp?callback=?&id=$1",{
      templateRegex:/.*\/([^\/]+).*/,
      templateData : function(data){if(!data.user)return false;
          return  '<div id="content"><div id="view-photo-user"><div id="photo-user-avatar"><img src="'+data.user.avatar_url+'"></div><div id="photo-info"><h3><a id="photo_username" class="nav-link" href="http://twitter.com/#!/'+data.user.username+'">@'+data.user.username+'</a></h3><p><span id="photo-info-name">'+data.user.name+'</span> '+data.user.timestamp+'</p></div></div><div id="photo-wrap" style="margin: auto;width:600px;height:450px;">'
            +'<img class="photo" id="photo-display" src="http://s3.amazonaws.com/twitpic/photos/large/'+data.id+'.jpg?AWSAccessKeyId=AKIAJF3XCCKACR3QDMOA&amp;Expires=1310509343&amp;Signature=gsukngCVqUE9qb%2FGHvyBqlQTjOo%3D" alt="'+data.message+'"></div><div id="view-photo-caption">'+data.message+'</div></div>';
        },
      }),
    
		//Rich
		new $.fn.oembed.OEmbedProvider("meetup", "rich", ["meetup\\.(com|ps)/.+"], "http://api.meetup.com/oembed"),
    new $.fn.oembed.OEmbedProvider("ebay", "rich", ["ebay\\.*"],null,{templateRegex:/.*\/([^\/]+)\/(\d{10,13}).*/ 
      , template : '<object width="355" height="300"><param name="movie" value="http://togo.ebay.com/togo/togo.swf?2008013100" /><param name="flashvars" value="base=http://togo.ebay.com/togo/&lang=en-us&mode=normal&itemid=$2&query=$1" />'
	    + '<embed src="http://togo.ebay.com/togo/togo.swf?2008013100" type="application/x-shockwave-flash" width="355" height="300" flashvars="base=http://togo.ebay.com/togo/&lang=en-us&mode=normal&itemid=$2&query=$1"></embed></object>'}),
    new $.fn.oembed.OEmbedProvider("tumblr", "rich", ["tumblr.com/.+"], "http://$1.tumblr.com/api/read/json?callback=?&id=$2",{templateRegex:/.*\/\/([\w]+).*\/post\/([^\/]+).*/,
      templateData : function(data){if(!data.posts)return false;
          return  '<div id="content"><h3><a class="nav-link" href="'+data.posts[0]['url-with-slug']+'">'+data.posts[0]['regular-title']+'</a></h3>'+data.posts[0]['regular-body']+'</div>';
        },
      }),
    new $.fn.oembed.OEmbedProvider("wikipedia", "rich", ["wikipedia.org/wiki/.+"], "http://$1.wikipedia.org/w/api.php?action=parse&page=$2&format=json&section=0&callback=?",{
      templateRegex:/.*\/\/([\w]+).*\/wiki\/([^\/]+).*/,
      templateData : function(data){if(!data.parse)return false;
          return  '<div id="content"><h3><a class="nav-link" href="http://en.wikipedia.org/wiki/'+data.parse['displaytitle']+'">'+data.parse['displaytitle']+'</a></h3>'+data.parse['text']+'</div>';
        },
      }),
    new $.fn.oembed.OEmbedProvider("imdb", "rich", ["imdb.com/title/.+"], "http://www.imdbapi.com/?i=$1&callback=?",{templateRegex:/.*\/title\/([^\/]+).*/,
      templateData : function(data){if(!data.Title)return false;
          return  '<div id="content"><h3><a class="nav-link" href="http://imdb.com/title/'+data.ID+'/">'+data.Title+'</a> ('+data.Year+')</h3><p>Starring: '+data.Actors+'</p><div id="photo-wrap" style="margin: auto;width:600px;height:450px;"><img class="photo" id="photo-display" src="'+data.Poster+'" alt="'+data.Title+'"></div>  <div id="view-photo-caption">'+data.Plot+'</div></div>';
        },
      }),
    new $.fn.oembed.OEmbedProvider("github", "rich", ["github.com/[-.\\w@]+/[-.\\w@]+"], "https://api.github.com/repos/$1/$2?callback=?"
    ,{templateRegex:/.*\/([^\/]+)\/([^\/]+).*/,
      templateData : function(data){ if(!data.data.html_url)return false;
          return  '<div class="githubrepos"><ul class="repo-stats"><li>'+data.data.language+'</li><li class="watchers"><a title="Watchers" href="'+data.data.html_url+'/watchers">'+data.data.watchers+'</a></li>'
      +'<li class="forks"><a title="Forks" href="'+data.data.html_url+'/network">'+data.data.forks+'</a></li></ul><h3><a href="'+data.data.html_url+'">'+data.data.name+'</a></h3><div class="body"><p class="description">'+data.data.description+'</p>'
      +'<p class="updated-at">Last updated: '+data.data.pushed_at+'</p></div></div>';
        },
      }),
    new $.fn.oembed.OEmbedProvider("screenr", "rich", ["screenr\.com"], null, {templateRegex:/.*\/([^\/]+).*/ 
      , template : '<iframe src="http://www.screenr.com/embed/$1" width="650" height="396" frameborder="0"></iframe>'}) ,
		new $.fn.oembed.OEmbedProvider("gigpans", "rich", ["gigapan\\.org/[-.\\w@]+/\\d+"],null,{templateRegex:/.*\/(\d+)\/?.*/ 
      , template : '<iframe src="http://gigapan.org/gigapans/$1/options/nosnapshots/iframe/flash.html" frameborder="0" height="400" scrolling="no" width="100%"></iframe>'}), 
    new $.fn.oembed.OEmbedProvider("scribd", "rich", ["scribd\\.com/.+"],null,{templateRegex:/.*doc\/([^\/]+).*/ 
      , template : '<iframe class="scribd_iframe_embed" src="http://www.scribd.com/embeds/$1/content?start_page=1&view_mode=list" data-auto-height="true" data-aspect-ratio="" scrolling="no" width="100%" height="600" frameborder="0"></iframe>'}), 
		new $.fn.oembed.OEmbedProvider("slideshare", "rich", ["slideshare\.net"], "http://www.slideshare.net/api/oembed/2",{format:'jsonp'})

	];
})(jQuery);
