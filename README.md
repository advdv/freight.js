freight.js
==========

[![Build Status](https://travis-ci.org/advanderveer/freight.js.png)](https://travis-ci.org/advanderveer/freight.js)
[![Dependency Status](https://david-dm.org/advanderveer/freight.js.png)](https://david-dm.org/advanderveer/freight.js)

An simple CommonJS dependency injection container for both node.js and the browser (using browserify). Loosely based on [pimple](http://pimple.sensiolabs.org/) but with: JSON configuration, service tagging and a perculiar javascript sauce.

Goals
---------
+   It should be suited for the browser, a small file size and should browserify easily.
+   Be small and to the point keep to a small set of functions.
+   Does not handle the inclusion of libraries, should work independently of which module loader you use.
+   Reuse ideas from the many existing DI Containers (also in other languages): "build upon the shoulders of giants"