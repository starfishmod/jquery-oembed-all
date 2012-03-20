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
* TrailerAddict - Embeded YQL
  http://www.traileraddict.com/trailer/abraham-lincoln-vampire-hunter/trailer-b
* vodpod - oembed YQL - broken as the oembed has absolute positioning which breaks the display
  http://vodpod.com/watch/16225320-blind-erhu-street-performer-in-hong-kong?u=brianjonestownmassacre&c=brianjonestownmassac
* fora.tv -OGP YQL
  http://fora.tv/2011/09/21/GENERATOR_Turntablefm_Discussion__Demonstration

####Audio 

* Soundcloud - oEmbed
* HuffDuffer - oEmbed
* BandCamp - YQL and Embedded
  http://clearsoulforces.bandcamp.com/album/detroit-revolution-s - Seems to be broken
* podomatic - Embedded
* rdio.com - oEmbed
* hark.com - Embedded - not working?
* chirb.it - YQL and oembed
* official.fm - YQL and oembed
* mixcloud - YQL and oembed
* shoudio - oembed
* audioboo.fm - embed 
  http://audioboo.fm/boos/710079-geofencing-and-the-future
* Spotify - OGP YQL
  http://open.spotify.com/album/1YwzJz7CrV9fd9Qeb6oo1d

#### Photo

* flickr - oEmbed
* photobucket - oEmbed
* instagram - oEmbed
* yfrog - oEmbed
* 23HQ - oEmbed
* Smugmug - oEmbed
* twitpic - OGP YQL
  http://twitpic.com/8wpcby
* 500px.com - Thumbnail view
  http://500px.com/photo/5926615
* visual.ly - YQL Lookup
* img.ly - Thumbnail view
* imgur.com - Thumbnail view
* twitgoo.com - Thumbnail view
* gravatar - Thumbnail view when using mailto:email@address.com
* pintrest - YQL - Embedded view of a sort.
  http://pinterest.com/pin/147422587771702052/
* circuitlab - image view
  https://www.circuitlab.com/circuit/z242cn/555-timer-as-pulse-width-modulation-pwm-generator/
* skitch - YQL oembed
  http://skitch.com/sethferreira/nmbr8/the-kings-new-toy
* graphic.ly  - oembed
  http://graphicly.com/eldritch/eldritch/2  - currenly broken due to bad iframe code returned.
* dribble - jsonp lookup
  http://dribbble.com/shots/464661-Rebounding-Station-Shot
* Lockerz - YQL lookup
  http://lockerz.com/d/5504214
* AsciiArtFarts - YQL Lookup
  http://www.asciiartfarts.com/20111016.html
* lego cusoo - OGP over YQL
  http://lego.cuusoo.com/ideas/view/96
* plannary - OGP over YQL
  http://svihackathon3.plannary.com/

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
  https://github.com/starfishmod/jquery-oembed-all
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
  http://issuu.com/2bemag/docs/issue__20
* reelapp.com - Embedded
* Etsy - OGP over YQL
  http://www.etsy.com/listing/88613710/1950s-mid-century-modern-chair?ref=fp_treasury_1
* Amazon - Embedded - Requires Affiliate code
* linkedin - Embedded IFRAME - found a link that works :)
* Lanyrd - YQL (CSS)
  http://lanyrd.com/2012/agile/
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
* Urban Dictionary - YQL lookup
  http://www.urbandictionary.com/define.php?term=qwerty%20nosedive&defid=6423917
* Ars Technica - YQL Lookup
  http://arstechnica.com/tech-policy/news/2012/03/op-ed-imminent-six-strikes-copyright-alert-system-needs-antitrust-scrutiny.ars
* Eventbrite - OGP YQL
  http://ynbrismarchconway-ehometext.eventbrite.com/
* last.fm OGP YQL
  http://www.last.fm/music/Doubting+Thomas
* Rotten Tomatoes - OGP YQL
  http://www.rottentomatoes.com/m/john_carter/
---
####TODO:

* iFixit - Uses a script oembed - does not work
* delicious
* digg?
* posterous.com
* picasa
* propic - http://www.propic.com/oembed/ - xml
* http://www.scoreexchange.com/scores/78287.html
* http://advanced.aviary.com/artists/jas7229/creations/glowing_orb
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
* http://cubbi.es/oembed ?Not sure how this one works
* Apple trailers
* XKCD
* TwitLonger
* TED
* Path

Plus a lot more :) Feel free to submit
