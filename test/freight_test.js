var Freight = require('./../src/freight.js');
var Definition = require('./../src/definition.js');

var carsConfig = require('./examples/cars.json');

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


  describe('#get()', function(){

    it("should parameter take priority of service", function(){
      f.registerAll(carsConfig);
      f.setParameter('car_class', function() {});
      f.setParameter('engine_factory', function(){return {};});
      f.setParameter('wheels_class', function(){});

      (typeof f.get('car')).should.equal('object');

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