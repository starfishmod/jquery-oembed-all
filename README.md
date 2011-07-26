Jquery-Oembed
============

This is a fork of the jquery-oembed located at http://code.google.com/p/jquery-oembed/.

Instead of using oohembed or other such services it tries to embed the object natively without using a third-party server.
This project will happily use native oembed services when it can, however it also use other types of embedding whenever oembed is not possible.


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

####Audio 

* Soundcloud - oEmbed
* HuffDuffer - oEmbed

#### Photo

* flickr - oEmbed
* photobucket - oEmbed
* instagram - oEmbed
* yfrog - oEmbed
* 23HQ - oEmbed
* Smugmug - oEmbed
* twitpic - JSONP lookup

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
* live Journal - JSONP Lookup

---
####TODO:

* Disqus
* gravatar - JSONP available
* stack overflow - JSONP available
* tal.ki - Uses a script embed - may not work
* Amazon - Wants a key to do lookups
* iFixit - Uses a script embed - may not work
* vis.ly - Uses different URL to it's embed link - may not work
* twitter - JSONP available
* Rotten Tomatoes - JSONP available
* Facebook - JSONP available e.g (https://graph.facebook.com/132326176778287/?callback=MyCallBack)
* last.fm - JSONP Available - requires API Key
* delicious
* 5min - oEmbed is XML only :(

* A lot more :) Feel free to submit
