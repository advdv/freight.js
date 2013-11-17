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