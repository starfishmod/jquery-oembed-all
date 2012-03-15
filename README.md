Jquery-Oembed
============

This is a fork (with a lot of changes) of the jquery-oembed located at http://code.google.com/p/jquery-oembed/.

Instead of using oohembed or other such services it tries to embed the object natively without having to use some kind of local server.
This project will happily use native oembed services when it can, however it also use other types of embedding whenever oembed is not possible.

This project tries to use embedding techniques in the following order of preference:

* oEmbed - JSONP available - e.g.  flickr, meetup etc
* embedding (IFRAME/Object) based on URL information - e.g.  youtube
* oEmbed - JSONP not Available - use YQL to correct - e.g. Ustream, viddler
* JSONP Api lookups Source - With HTML and CSS built in this project - e.g. github, Myspace, Facebook
* YQL Screenscape to get embedding details - e.g. BandCamp
* YQL Screenscrape - e.g. pastie

to use...
````
<a href="https://github.com/starfishmod/jquery-oembed-all" class="oembed">https://github.com/starfishmod/jquery-oembed-all</a>
````

1. url 
2. options

````
$(".oembed").oembed(null,{
    embedMethod: 'auto',	// "auto", "append", "fill"	
    apikeys: {
      etsy : '<your etsy key>',
    }
});
````


Current 3rd party sources include:
---------------------------------
####Video

* Youtube - oembed - YQL
  http://www.youtube.com/watch?v=oHg5SJYRHA0
* Blip - oEmbed
  http://blip.tv/linuxconfau/lightning-talks-incl-html5-media-accessibility-update-4870511
* Hulu - oEmbed
  http://www.hulu.com/watch/337246/e-news-now-steven-tyler-picks-next-idol-winner
* Vimeo - oEmbed
  http://vimeo.com/36549221
* National film board of Canada - oEmbed
  http://www.nfb.ca/film/turning_tides/
* Qik - oEmbed
  http://qik.com/video/1331325
* Dotsub - oEmbed
  http://dotsub.com/view/6a7db231-4d64-407d-8026-a845eaf6c4a9
* Clikthrough - oEmbed
  http://www.clikthrough.com/theater/video/7
* Kino Map - oEmbed
  http://www.kinomap.com/#!kms-f2xsjx
* Funny Or Die - Embedded
  http://www.funnyordie.com/videos/0d46e70a1a/yo-no-se-performed-by-will-ferrell?playlist=featured_videos
* College Humour - Embedded
  http://www.collegehumor.com/video/6736895/the-fresh-prince-of-downton-abbey
* Metacafe - Embedded
  http://www.metacafe.com/watch/8202430/airmail_trailer/
* embedr - Embedded
  http://embedr.com/playlist/my-video-playlist_25683
* 5min - oEmbed is XML only - using YQL to translate it
  http://www.5min.com/Video/iPad-to-Embrace-New-Name-517297508
* ustream.tv - oEmbed is not JSONP enabled - using YQL to translate it
  http://www.ustream.tv/recorded/20144582
* viddler - oEmbed is not JSONP enabled - using YQL to translate it
  http://www.viddler.com/v/4a7e233c - reponse is broken need to investigate
* twitvid - Embedded
* bambuser - Embedded
* xtranormal - Embedded
* Gametrailers - Embedded
* Vzarr - Embedded
* VHX - oembed
* bambuser - oembed
* dailymotion.com - oembed
* animoto - oembed
* justin.tv - YQL JSON
* livestream - embedded
* scivee - embedded
* veoh - embedded
  http://www.veoh.com/watch/v21193116NBT83Enw?h1=Lady+GaGa+and+Kanye+West+Invest+in+Turntable.FM!+-+Diggnation
* minoto-video - oembed using YQL
  http://embed.minoto-video.com/90/ZfMaq5kow9ki

####Audio 

* Soundcloud - oEmbed
* HuffDuffer - oEmbed
* BandCamp - YQL and Embedded
* podomatic - Embedded
* rdio.com - oEmbed
* hark.com - Embedded - not working?
* chirb.it - YQL and oembed
* official.fm - YQL and oembed
* mixcloud - YQL and oembed
* shoudio - oembed
* audioboo.fm - embed 
  http://audioboo.fm/boos/710079-geofencing-and-the-future

#### Photo

* flickr - oEmbed
* photobucket - oEmbed
* instagram - oEmbed
* yfrog - oEmbed
* 23HQ - oEmbed
* Smugmug - oEmbed
* twitpic - JSONP lookup
* 500px.com - Thumbnail view
* visual.ly - YQL Lookup
* img.ly - Thumbnail view
* imgur.com - Thumbnail view
* twitgoo.com - Thumbnail view
* gravatar - Thumbnail view when using mailto:email@address.com
* pintrest - YQL - Embedded view of a sort.
* circuitlab - image view
  https://www.circuitlab.com/circuit/z242cn/555-timer-as-pulse-width-modulation-pwm-generator/
* skitch - YQL oembed
* graphic.ly  - oembed
  http://graphicly.com/eldritch/eldritch/2  - currenly broken due to bad iframe code returned.
* dribble - jsonp lookup
  http://dribbble.com/shots/464661-Rebounding-Station-Shot

####Rich

* Meetup - oEmbed
* gigapans - Embedded
* Slideshare - oEmbed
* ebay - Embedded
* scribd - Embedded
* screenr - Embedded
* tumblr- JSONP lookup
* imdb - JSONP lookup via imdbapi.com
* wikipedia- JSONP lookup
* github- JSONP lookup (CSS) 
* eventful (venues) - Embedded
* myspace - JSONP lookup (CSS) 
* live Journal - JSONP Lookup (CSS)
* wordpress - oEmbed (wordpress.com, wp.me, blogs.cnn.com, techcrunch.com). I can add other wordpress sites as well.
* circuitbee -Embedded
* stack overflow - JSONP Lookup (CSS)
* Facebook - JSONP Lookup (CSS)
* Pastebin - Embedded
* Pastie - YQL lookup
* kickstarter - Embedded
* issuu - YQL Embedded
* reelapp.com - Embedded
* Etsy - JSONP/APIKey Lookup
* Amazon - Embedded - Requires Affiliate code
* linkedin - Embedded IFRAME - found a link that works :)
* Lanyrd - YQL (CSS)
* twitter - Oembed - status only - but that is ok I think
* github gist - oembed
* speakerdeck - yql oembed
* dipity - yql oembed
* dailymile - oembed
* deviantart - oembed
* mobypictures - oembed
* prezi - embedded
* popplet - embedded
* authorstream - embedded
* googlecalendar - Iframe
* cacoo - oembed
* pearltrees - embedded
* urtak - oembed - is broken in iframe return atm -seems to be an embed.ly issue??
  https://urtak.com/u/6588
* jotform - embedded
  http://form.jotform.co/form/20740907897868
  
---
####TODO:

* iFixit - Uses a script oembed - may not work
* Rotten Tomatoes - JSONP available
* last.fm - JSONP Available - requires API Key
* delicious
* digg?
* Eventbrite
* posterous.com
* vodpod
* plannary
* picasa
* propic - http://www.propic.com/oembed/ - xml
* vodpod - http://vodpod.com/sharebutton
* http://www.scoreexchange.com/scores/78287.html
* http://advanced.aviary.com/artists/jas7229/creations/glowing_orb
* http://media.soundslides.com/embedtool/
* http://pdfobject.com/generator.php
* http://simpleviewer.net/simpleviewer/support/embedding.html
* http://www.qwiki.com/api
* http://tinychat.com/embedmaker.html
* http://blog.tourwrist.com/?p=271
* http://www.userplane.com/docs/embed
* http://www.surveygizmo.com/
* http://www.lomography.com/
* http://help.creator.zoho.com/Embed-Form-View-in-Website.html
* http://www.wiziq.com/
* http://www.4shared.com/
* fora.tv i.e. http://fora.tv/2011/09/21/GENERATOR_Turntablefm_Discussion__Demonstration



Plus a lot more :) Feel free to submit
