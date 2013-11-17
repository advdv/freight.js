freight.js
==========

[![Build Status](https://travis-ci.org/advanderveer/freight.js.png)](https://travis-ci.org/advanderveer/freight.js)
[![Dependency Status](https://david-dm.org/advanderveer/freight.js.png)](https://david-dm.org/advanderveer/freight.js)
[![NPM version](https://badge.fury.io/js/freight.js.png)](http://badge.fury.io/js/freight.js)

An simple CommonJS dependency injection container for both node.js and the browser (using browserify). Loosely based on the [Symfony2 DependencyInjection component](https://github.com/symfony/DependencyInjection) but more minimal. Features include: JSON configuration, service tagging and a perculiar javascript sauce.

Goals
---------
+   It should be suited for the browser, a small file size and should browserify easily.
+   Be small and to the point keep to a small set of functions.
+   Does not handle the inclusion of libraries, should work independently of which module loader you use.
+   Reuse ideas from the many existing DI Containers (also in other languages): "build upon the shoulders of giants"

Installation
--------
In node you can install this using npm: 

`npm install freight.js`

Then you can simply require it in your application:
 
 ```javascript
 var Freight = require('freight.js');
 ```

Basic Usage
-----------
In the most basic senario services are configured using a configuration object (possibly from a json file) which is parsed in order to create the container and 'wire' your application together. The following example considers the scenario in wich we want to use javascript to build a castle called 'castle_fret'. 

We can consider the following domain model for this task: 

(Note: you could seperate this in different files of course. freight.js doesn't not make any assumptions about how you include you files or how you declare your components):
```javascript

  // A castle depends on one knight and several towers
  var Castle = function(knight, towers) {
    this.knight = knight;
    this.towers = towers;
  };

  // A tower has a height property
  var Tower = function(height) {
    this.height = height;
  };

  // A knight has a name, receives a sword and has an attribute hash
  var Knight = function(name, sword, attributes) {
    this.name = name;
    this.sword = sword;
    this.attributes = attributes;
  };

  // the sword can be enhanced after construction
  var Sword = function(name) {
    this.name = name;
    this.fastenGrip = function() {
      this.fastened = true;
    };

    this.sharpenBlade = function() {
      this.sharpened = true;
    };
  };

```


We use the following to configure our services:
```javascript
{

  // the hash keys will the identifier, should be unique
  "castle_fret": {   

    // indicates whether it behaves like a singleton (optional)
    "shared": true, 

    // this should be a reference to another parameter or service
    // you can recognize references by the ":" prefix
    "constructorFn": ":castle.class",   

    //the arguments passed to the constructor when the service is initialized 
    "arguments": [":sir_freight", [":tower", ":tower", [":tower", ":tower"]]]
  },

  "sir_freight": {
    "shared": true,
    "constructorFn": ":knight.class",

    //arguments can also include option hashes, ids will be resolved on level deep
    "arguments": ["Sir Freight", ":sword", {
      "strength": 40,
      "dexterity": 100,
      "quest": ":knight.quest",
      "tower": ":tower"
    }]
  },

  "sword": {

    //instead of the constructor you can also specify an factory function
    "factoryFn": ":sword.factory"
  },

  //notice that the tower is not shared (so is the sword) which means ne instances are
  //created on every retrieval from the container
  "tower": {
    "constructorFn": ":tower.class",
    "arguments": [":tower.height"]
  }
}
```

Our castle is now only a few lines of code away:
```javascript
    var Freight = require('./../../src/freight.js');
      
    var Castle = ...
    var Tower = ...
    //insert your model here..

    var services = {
      ... // the configuration above or require it as an json file
    }

    var container = new Freight();      

    //parse the configuration
    container.registerAll(services);

    //before we can initiate the castle (or one of the other services) we'll need to define
    //the required parameters (the setParameter() method is chainable):

    container.setParameter('castle.class', Castle)
             .setParameter('tower.class', Tower)
             .setParameter('tower.height', 30)
             .setParameter('knight.class', Knight)
             .setParameter('knight.quest', 'Define all the dependencies!')
             .setParameter('sword.factory', function(){

                //notice how we use an factory method to add some extra
                //logic after instantiation
                var sword = new Sword('Excalibur');

                sword.fastenGrip();
                sword.sharpenBlade();
                return sword;
             });

    // alas we can now safely request our castle instance
    var castle = container.get('castle_fret');

    //as proof that the objects are full initialized:
    console.log( castle.knight.name) // -> 'Sir Freight'
    console.log( castle.knight.attributes.dexterity) // -> 100
    console.log( castle.knight.sword.name) // -> 'Excalibur'
    console.log( castle.knight.sword.sharpened) // -> true
    console.log( castle.towers[1].height) // -> '30'

```




Further Documentation
--------------
We currently have the following documentation:

+ [API - Generated using Groc](http://advanderveer.github.io/freight.js/)
+ [Examples - Generated using Groc](http://advanderveer.github.io/freight.js/examples/)
+ [Code Coverage](http://advanderveer.github.io/freight.js/coverage/lcov-report/)

