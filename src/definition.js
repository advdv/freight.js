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
   * Indicate wether the service behaves like a singleton; returning the same instance on repeated requests
   * @type {Boolean}
   */
  self.shared = false;

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
      try {
        fn = container.getParameter(p.replace(container.idPrefix, ''));
      } catch(e) {
        throw new Error('Whene trying to instanciate service "'+self.id+'", the parameter specifying the '+((type == 'f') ? ('factory') : ('constructor'))+': "'+fnParam+'" did not exist.');
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

    if(conf.shared !== undefined) {
        if(String(conf.shared).toLowerCase() === 'true') {
          self.shared = true;
        } else if(String(conf.shared).toLowerCase() === 'false') {
          self.shared = false;
        } else {
          throw new Error('Configuration of "'+self.id+'" shared should be an boolean, received: "'+conf+'"');
        }
    }

    //get some way to construct
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

    if(container.isId(fnParam) === false) {
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

    return self;
  };

  //configure the definition with the provided argument
  self.configure(conf);

};

module.exports = Definition;