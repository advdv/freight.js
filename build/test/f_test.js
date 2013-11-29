;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Definition = function Definition(id, conf, container) {
  var self = this;

  /**
   * the id of the definition
   * @type {string}
   */
  self.id = id;

  /**
   * The callable that creates the service
   * @type {Function}
   */
  self.fn = false;

  /**
   * The arguments that will be send to the callable when called, order matters
   * @type {Array}
   */
  self.args = [];

  /**
   * The tags that the service will receive
   * @type {Array}
   */
  self.tags = [];

  /**
   * Contains the last created instance of the service, this is reused when the service is a shared service
   * @type {Boolean}
   */
  self.service = false;

  /**
   * Indicate wether the service behaves like a singleton; returning the same instance on repeated requests
   * @type {Boolean}
   */
  self.shared = false;

  /**
   * Create an instance from this definition
   * 
   * @method retrieve()
   * @return {mixed}
   */
  self.retrieve = function retrieve() {

    if(self.shared === true && self.service !== false) {
      return self.service;
    }

    var service = self.fn();
    if(service === undefined) {
      throw new Error('"'+id+'" service returned "'+undefined+'" on instantiation.');
    }

    self.service = service;
    return service;
  };

  /**
   * Add an argument (at the end) to the definition
   *
   * @method addArgument
   * @param {mixed} arg
   * @chainable
   */
  self.addArgument = function addArgument(arg) {
    self.args.push(arg);
    return self;
  };

  /**
   * Tag the service
   *
   * @method addTag()
   * @param {string} tag
   * @chainable
   */
  self.addTag = function addTag(tag) {
    if(self.tags.indexOf(tag) === -1)
      self.tags.push(tag);

    return self;
  };

  /**
   * Resolve arguments that are container ids
   * @return {Array} the resolved arguments
   */
  self.resolveArguments = function resolveArguments(arr) {
    arr = typeof arr !== 'undefined' ? arr : self.args;

    arr.forEach(function(arg, i){
      if(container.isId(arg)) {
        arr[i] = container.get(arg.replace(container.idPrefix, ''));
      } else if(Array.isArray(arg)) {
        arr[i] = self.resolveArguments(arg);
      } else if(arg.constructor == Object) {
        Object.keys(arg).forEach(function(k){
          if(container.isId(arg[k]))
            arg[k] = container.get(arg[k].replace(container.idPrefix, ''));
        });
      }

    });

    return arr;
  };

  /**
   * Create an callable that can creates instances for this definitions
   *
   * @method
   * @private
   * @param  {string} fnParam the container parameter that contains the constructor or factory function
   * @param  {string} type either 'c' for constructor or 'f' for factory
   * @return {Function}
   */
  self._createCallable = function(fnParam, type) {
    var res = false;

    var getCheckCallable = function(p) {
      var fn = false;
      if(typeof p === 'function') {
        fn = p;
      } else {
        try {
          fn = container.getParameter(p.replace(container.idPrefix, ''));
        } catch(e) {
          throw new Error('Whene trying to instanciate service "'+self.id+'", the parameter specifying the '+((type == 'f') ? ('factory') : ('constructor'))+': "'+fnParam+'" did not exist.');
        }
      }
      
      if(typeof fn !== 'function') {
        throw new Error('Whene trying to instanciate service "'+self.id+'", the parameter specifying the '+((type == 'f') ? ('factory') : ('constructor'))+': "'+fnParam+'" did not return a function, instead received: "'+fn+'"');
      }

      return fn;
    };

    function neu(constructor, args) {
        var instance = Object.create(constructor.prototype);
        var result = constructor.apply(instance, args);
        return typeof result === 'object' ? result : instance;
    }

    //constructor type use new
    if(type === 'c') {
      res = function() {      
        var _c = new getCheckCallable(fnParam);
        var _args = self.resolveArguments();
        return neu(_c, _args); 
      };

      return res;
    } 

    //factory type just call it
    return function() {      
        return getCheckCallable(fnParam).apply(container, self.resolveArguments()); //create using factory fn
    };
    
  };

  /**
   * Apply an defintion configuration
   * @param  {Object} conf
   * @return {Definition}
   * @chainable
   */
  self.configure = function(conf) {

    //shared
    if(conf.shared !== undefined) {
        if(String(conf.shared).toLowerCase() === 'true') {
          self.shared = true;
        } else if(String(conf.shared).toLowerCase() === 'false') {
          self.shared = false;
        } else {
          throw new Error('Configuration of "'+self.id+'" shared should be an boolean, received: "'+conf+'"');
        }
    }

    //constructing
    var fnParam = conf.constructorFn;
    var type = 'c';
    if(fnParam === undefined) {
      fnParam = conf.factoryFn;
      type = 'f';
    } else if(conf.factoryFn !== undefined) {
      throw new Error('Configuration of "'+self.id+'" should specify a constructor OR an factory function, not both - received: "'+conf+'"');
    }

    if(fnParam === undefined)
      throw new Error('Configuration of "'+self.id+'" must either specify an constructor or an factory function - received: "'+conf+'"');

    if(container.isId(fnParam) === false && typeof fnParam !== 'function') {
      throw new Error('Constructor or an factory function of "'+self.id+'" should be specified using a parameter id - received: "'+fnParam+'"');
    }

    self.fn = self._createCallable(fnParam, type);

    //arguments
    var args = conf.arguments;
    if(args !== undefined) {

      if(!Array.isArray(args))
        throw new Error('Instantiation arguments of "'+self.id+'" should be specified as an array - received: "'+args+'"');

      args.forEach(function(arg){
        self.addArgument(arg);
      });

    }

    //tags
    var tags = conf.tags;
    if(tags !== undefined) {

      if(!Array.isArray(tags))
        throw new Error('Service tags of "'+self.id+'" should be specified as an array - received: "'+tags+'"');

      tags.forEach(function(tag){
        self.addTag(tag);
      });

    }

    return self;
  };

  //configure the definition with the provided argument
  self.configure(conf);

};

module.exports = Definition;
},{}],2:[function(require,module,exports){
var Definition = require('./definition.js');

var Freight = function() {
  var self = this;

  /**
   * Determin how service id are distinques of normal string arguments in configuration
   * @type {String}
   */
  self.idPrefix = ':';

  /**
   * the array of definitions this container managers
   * @type {Array}
   * @private
   */
  self._definitions = [];

  /**
   * the hash with parameters this container holds
   * @type {Object}
   * @private
   */
  self._parameters = {};

  /**
   * Get and service of parameter from the container
   *
   * @method getService()
   * @param  {string} id
   * @return {mixed}
   */
  self.get = function get(id) {
    var res = false;
    try {
      res = self.getParameter(id);  
    } catch(e) {
      res = self.getService(id);
    }
    
    return res;
  };

  /**
   * Check wether the string an parameter id
   * @method isId()
   * @param  {string}  str
   * @return {Boolean}
   */
  self.isId = function isId(val) {
    if(typeof val !== 'string')
      return false;

    return ((val.indexOf(self.idPrefix) === 0) ? (true) : (false));
  };

  /**
   * Set a parameter on this container
   * 
   * @method setParameter()
   * @param {string} id
   * @param {mixed} val
   * @chainable
   */
  self.setParameter = function setParameter(id, val) {
    self._parameters[id] = val;
    return self;
  };

  /**
   * Retrieve a parameter from the container
   * @param  {string} id
   * @return {mixed}
   */
  self.getParameter = function getParameter(id) {
    var res = self._parameters[id];
    if(res === undefined)
      throw new Error('Parameter "'+id+'" not found.');

    return res;
  };

  /**
   * Return an array of service ids from services with the given tag
   *
   * @method findTaggedServiceIds()
   * @param  {string} tag
   * @return {Array}
   */
  self.findTaggedServiceIds = function findTaggedServiceIds(tag) {
    var res = [];
    self._definitions.forEach(function(d){
      if(d.tags.indexOf(tag) !== -1) {
        res.push(d.id);
      }
    });
    return res;
  };

  /**
   * Return a service definition from the container
   *
   * @method getDefinition()
   * @param  {string} id
   * @return {Definition}
   */
  self.getDefinition = function getDefinition(id) {
    var def = false;
    self._definitions.forEach(function(d){
      if(d.id == id) {
        def = d;
      }
    });

    return def;
  };

  /**
   * Return an service by its id
   *
   * @method getService()
   * @param  {string} id
   * @return {mixed}
   */
  self.getService = function getService(id) {  
    var def = self.getDefinition(id);

    if(def === false)
      throw new Error('Service "'+id+'" not found.');

    var service = def.retrieve();

    return service;
  };


  /**
   * Register a new service as the specified id
   * 
   * @method register()
   * @param  {string}   id
   * @param  {Object} conf the configuration hash for the individual service
   * @return {Definition}
   */
  self.register = function register(id, conf) {
    var def = new Definition(id, conf, self);

    self._definitions.push(def);
    return def;
  };

  /**
   * Register several definitions from an configuration hash (e.g. json)
   * 
   * @method  registerAll()
   * @param  {Object} conf the services
   * @return  {Array} a array of registered definitions
   */
  self.registerAll = function build(conf) {
    var res = [];
    Object.keys(conf).forEach(function(id){
      res.push(self.register(id, conf[id]));
    });
    return res;
  };

};

module.exports = Freight;
},{"./definition.js":1}],3:[function(require,module,exports){
module.exports={
	"car": {
		"constructorFn": ":car_class",
		"arguments": [":engine", ":wheels"]

	},
	"engine": {
		"shared": "true",
		"factoryFn": ":engine_factory",
		"tags": ["interior"]
	},
	"wheels": {
		"constructorFn": ":wheels_class",
		"tags": ["exterior"]
	}

}
},{}],4:[function(require,module,exports){
module.exports={
  "castle_fret": {
    "shared": true,
    "constructorFn": ":castle.class",
    "arguments": [":sir_freight", [":tower", ":tower", [":tower", ":tower"]]],
    "tags": ["inanimate", "building"]
  },

  "sir_freight": {
    "shared": true,
    "constructorFn": ":knight.class",
    "arguments": ["Sir Freight", ":sword", {
      "strength": 40,
      "dexterity": 100,
      "quest": ":knight.quest",
      "tower": ":tower"
    }]
  },

  "sword": {
    "factoryFn": ":sword.factory",
    "tags": ["inanimate"]
  },

  "tower": {
    "constructorFn": ":tower.class",
    "arguments": [":tower.height"],
    "tags": ["inanimate", "building"]
  }

}
},{}],5:[function(require,module,exports){
var Freight = require('./../src/freight.js');
var Definition = require('./../src/definition.js');

var carsConfig = require('./examples/cars.json');
var castleConfig = require('./examples/castle.json');

describe('Freight', function(){

  var f;
  beforeEach(function(){
    f = new Freight();
  });


  describe('#construct()', function(){

    it('should initialize members', function(){
      f.should.be.an.instanceOf(Freight);

    });

  });


  describe('#setParameter()', function(){

    it('should set parameters on the container', function(){
      var f2 = f.setParameter('car.class', function(){});
      f2.should.equal(f);
    });

  });


  describe('#getParameter()', function(){

    it('should get a parameter when its set', function(){
      var f2 = f.setParameter('car.class', 'hey');    
      f.getParameter('car.class').should.equal('hey');

      f.get('car.class').should.equal('hey');

    });

    it('should throw when not set', function(){
      var f2 = f.setParameter('car.class', 'hey');    
      
      (function(){
        f.getParameter('car.bogus');
      }).should.throw();
    
    });

  });



  describe('#isParameterId()', function(){

    it('should detect first char and type', function(){
      
      (f.isId(false)).should.equal(false);
      (f.isId('param')).should.equal(false);
      (f.isId(':param')).should.equal(true);

    });

  });



  describe('#register()', function(){

    it('should also work with registerAll', function(){

      var defs = f.registerAll(carsConfig);

      defs.length.should.equal(3);
      f._definitions.length.should.equal(3);      

    });

    it('should take correct arguments', function(){

      var def = f.register('car', carsConfig.car);
      
      f._definitions.length.should.equal(1);
      def.should.be.an.instanceOf(Definition);

    });

    it('should also work with functions as constructor/factory', function(){
      var obj = {};
      var factory = function() {
        arguments[0].should.equal("a");
        return obj;
      };
      var Bird = function() {
        arguments[0].should.equal("b");
        this.wings = '2 wings';
      };

      var def = f.register('truck', {
        factoryFn: factory,
        arguments: ["a"]
      });

      var res = f.get('truck');
      res.should.equal(obj);

      var def2 = f.register('bird', {
        constructorFn: Bird,
        arguments: ["b"]
      });

      var res2 = f.get('bird');
      res2.wings.should.equal('2 wings');

    });

  });


  describe('#getService()', function(){

    it('should get a service when its set', function(){

      var Engine = function() {};
      var Wheels = function() {return {weird: 'constructor'};};
      var Car = function(engine, wheels) {
        this.engine = engine;
        this.wheels = wheels;
      };

      var defs = f.registerAll(carsConfig);
      f.setParameter('car_class', Car);
      f.setParameter('engine_factory', function(){return new Engine();});
      f.setParameter('wheels_class', Wheels);

      var car = f.getService('car');
      car.engine.should.be.an.instanceOf(Engine);
      car.wheels.weird.should.equal('constructor');

    });

    it('should throw when not set', function(){
      var defs = f.registerAll(carsConfig);

      (function(){
        var car = f.getService('bogus');
      }).should.throw();

      (function(){
        var car = f.getService('car'); //constructor param is not set
      }).should.throw();

      (function(){
        var car = f.getService('engine'); //constructor param is not set as factory
      }).should.throw();

      f.setParameter('engine_factory', function(){ });
      (function(){
        f.get('engine'); //engine factory does not factor something
      }).should.throw();

    }); 

  });

  describe('#findTaggedServiceIds()', function(){
    
    it("Return tagged service ids", function(){
      f.registerAll(castleConfig);

      var ids = f.findTaggedServiceIds('inanimate');
      ids.length.should.equal(3);
      ids[0].should.equal('castle_fret');

      ids = f.findTaggedServiceIds('building');
      ids.length.should.equal(2);

    });

  });


  describe('#get()', function(){

    it("should parameter take priority of service", function(){
      f.registerAll(carsConfig);
      f.setParameter('car_class', function() {});
      f.setParameter('engine_factory', function(){return {};});
      f.setParameter('wheels_class', function(){});

      var car = f.get('car');
      (typeof car).should.equal('object');
      f.getDefinition('car').service.should.equal(car);

      f.setParameter('car', 'hey');    
      f.get('car').should.equal('hey');

    });


    it("gettign a shared service twice should return the same instance", function(){
      f.registerAll(carsConfig);
      f.setParameter('car_class', function() {});
      f.setParameter('engine_factory', function(){return {};});
      f.setParameter('wheels_class', function(){});

      var engine1 = f.get('engine'); 
      var engine2 = f.get('engine');

      engine1.should.equal(engine2);


    });

  });


});
},{"./../src/definition.js":1,"./../src/freight.js":2,"./examples/cars.json":3,"./examples/castle.json":4}]},{},[5])
;