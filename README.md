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

####Audio 

* Soundcloud - oEmbed
* HuffDuffer - oEmbed
* BandCamp - YQL and Embedded
* podomatic - Embedded
* rdio.com - oEmbed
* hark.com - Embedded - not working?

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
* imgur.com - Thubnail view
* twitgoo.com - Thubnail view

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

---
####TODO:

* Disqus
* gravatar - JSONP available
* tal.ki - Uses a script embed - may not work
* Amazon - Wants a key to do lookups
* iFixit - Uses a script embed - may not work
* twitter - JSONP available
* Rotten Tomatoes - JSONP available
* last.fm - JSONP Available - requires API Key
* delicious
* linkedin - Uses a script embed - may not work
* digg?
* justin.tv
* Eventbrite
* Lanyrd
* github gist
* pinboard.in
* dailymotion.com
* posterous.com
* vodpod
* plannary
* graphic.ly  - JSONP Available - requires API Key

A lot more :) Feel free to submit
