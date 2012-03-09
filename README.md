Jquery-Oembed
============

This is a fork (with a lot of changes) of the jquery-oembed located at http://code.google.com/p/jquery-oembed/.

Instead of using oohembed or other such services it tries to embed the object natively without having to use some kind of local server.
This project will happily use native oembed services when it can, however it also use other types of embedding whenever oembed is not possible.

This project tries to use embedding techniques in the following order of preference:

* oEmbed - JSONP available - i.e. flickr, meetup etc
* embedding (IFRAME/Object) based on URL information - i.e. youtube
* oEmbed - JSONP not Available - use YQL to correct - Ustream, viddler
* JSONP Api lookups Source - With HTML and CSS built in this project - github, Myspace, Facebook
* YQL Screenscape to get embedding details - BandCamp
* YQL Screenscrape - pastie

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

* Youtube - Embedded
* Blip - oEmbed
* Hulu - oEmbed
* Vimeo - oEmbed
* National film board of Canada - oEmbed
* Qik - oEmbed
* Dotsub - oEmbed
* Clickthrough - oEmbed
* Kino Map - oEmbed
* Funny Or Die - Embedded
* Colledge Humour - Embedded
* Metacafe - Embedded
* embedr - Embedded
* 5min - oEmbed is XML only - using YQL to translate it
* ustream.tv - oEmbed is not JSONP enabled - using YQL to translate it
* viddler - oEmbed is not JSONP enabled - using YQL to translate it
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

---
####TODO:

* iFixit - Uses a script embed - may not work
* Rotten Tomatoes - JSONP available
* last.fm - JSONP Available - requires API Key
* delicious
* digg?
* Eventbrite
* posterous.com
* vodpod
* plannary
* graphic.ly  - http://oembed.graphicly.com/
* picasa
* propic - http://www.propic.com/oembed/ - xml
* vodpod - http://vodpod.com/sharebutton
* http://skitch.com/oembed/
* http://docs.minoto-video.com/api/oembed.html
* http://oembed.urtak.com/
* https://cacoo.com/api_oembed
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
* http://www.jotform.com/
* http://www.lomography.com/
* http://help.creator.zoho.com/Embed-Form-View-in-Website.html
* http://www.wiziq.com/
* http://www.4shared.com/

http://www.google.com/calendar/embed?src=en.australian%23holiday%40group.v.calendar.google.com&ctz=Australia/Brisbane 
<iframe src="https://www.google.com/calendar/b/0/embed?height=600&amp;wkst=1&amp;bgcolor=%23FFFFFF&amp;src=en.australian%23holiday%40group.v.calendar.google.com&amp;color=%230F4B38&amp;ctz=Australia%2FBrisbane" style=" border-width:0 " width="800" height="600" frameborder="0" scrolling="no"></iframe>

A lot more :) Feel free to submit
