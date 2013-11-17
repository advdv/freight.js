var Freight = require('./../src/freight.js');
var Definition = require('./../src/definition.js');

var carsConfig = require('./examples/cars.json');
var invalidConfig = require('./examples/invalid.json');
var castleConfig = require('./examples/castle.json');

describe('Freight', function(){

  var f;
  beforeEach(function(){
    f = new Freight();
  });

  describe('#construct()', function(){

    it('should initialize members', function(){

      var def = new Definition('car', carsConfig.car, f);
      def.id.should.equal('car');
      def.shared.should.equal(false);
      (typeof def.fn).should.equal('function');

      var def2 = new Definition('engine', carsConfig.engine, f);
      def2.shared.should.equal(true);

      var def3 = new Definition('engine', {
          "shared": "false",
          "factoryFn": ":engine_factory"
      }, f);
      def3.shared.should.equal(false);

    });

    it('callable should create valid instances as constructor', function(){

      var Car = function(a, b){
        a.should.equal('a');
        b.should.equal('b');
      };

      f.setParameter('car_class', 'a');
      var def = new Definition('car', carsConfig.car, f);
      def.args = ['a', 'b'];
    
      (function(){
        var car = def.fn(); //parameter is a string instead of a function
      }).should.throw();
      
      f.setParameter('car_class', Car);
      var car = def.fn(); 

      car.should.be.an.instanceOf(Car);

    });


    it('callable should create valid instances as factory', function(){

      var Engine = function(){};

      f.setParameter('engine_factory', 'a');
      var def = new Definition('engine', carsConfig.engine, f);
    
      (function(){
        var engine = def.fn(); //parameter is a string instead of a function
      }).should.throw();
      
      f.setParameter('engine_factory', function(){ return new Engine(); });
      var engine = def.fn(); 

      engine.should.be.an.instanceOf(Engine);

    });

  });


  describe('#configure()', function(){

    it('Should throw on invalid configuration', function(){

      (function(){
        new Definition('invalid1', invalidConfig.invalid1, f); //no factory or constructor
      }).should.throw();

      (function(){
        new Definition('invalid2', invalidConfig.invalid2, f); //factory/cls must be a string
      }).should.throw();

      (function(){
        new Definition('invalid3', invalidConfig.invalid3, f); //factory/cls should not be both defined
      }).should.throw();

      (function(){
        new Definition('invalid4', invalidConfig.invalid4, f); //arguments not as array
      }).should.throw();

      (function(){
        new Definition('invalid5', invalidConfig.invalid5, f); //arguments not as array
      }).should.throw();

    });


    it('Should add arguments from configuration', function(){
      var def = new Definition('car', carsConfig.car, f);

      Array.isArray(def.args).should.equal(true);
      def.args.length.should.equal(2);
      def.args[0].should.equal(':engine');
      def.args[1].should.equal(':wheels');

    });

  });

  describe('#addArgument()', function(){

    it("should increase length and return definition", function(){
      var def = new Definition('engine', carsConfig.engine, f);

      var def2 = def.addArgument('arg1');

      def2.should.equal(def);
      def.args.length.should.equal(1);

      def.addArgument('arg2');
      def.args.length.should.equal(2);
      def.args[1].should.equal('arg2');

    });

  });


  describe('#resolveArguments()', function(){
     var Engine = function(){};
     var engineFactory = function(){
        this.should.equal(f);
        return new Engine();
      };
     var Car = function(){};
     var Wheels = function(){};


    var Castle = function(knight, towers) {
      this.knight = knight;
      this.towers = towers;
    };

    var Tower = function(height) {
      this.height = height;
      return {
        height: height,
      };
    };

    var Knight = function(name, sword, attributes) {
      this.name = name;
      this.sword = sword;
      this.attributes = attributes;
    };

    var Sword = function(name) {
      this.name = name;
      this.fastenGrip = function() {
        this.fastened = true;
      };

      this.sharpenBlade = function() {
        this.sharpened = true;
      };
    };

    it("should increase length and return definition", function(){

      var defs = f.registerAll(carsConfig);
      f.setParameter('engine_factory', engineFactory);
      f.setParameter('wheels_class', Wheels);

      var args = defs[0].resolveArguments();
      args[0].should.be.an.instanceOf(Engine);
      args[1].should.be.an.instanceOf(Wheels);

      args = defs[0].resolveArguments(); //doub resolve should not have any consequences
      args[0].should.be.an.instanceOf(Engine);
      args[1].should.be.an.instanceOf(Wheels);

    });

    it("should also resolve array arguments", function(){

      var defs = f.registerAll(castleConfig);
      f.setParameter('castle.class', Castle)
         .setParameter('tower.class', Tower)
         .setParameter('tower.height', 30)
         .setParameter('knight.class', Knight)
         .setParameter('knight.quest', 'The holy DI grail')
         .setParameter('sword.factory', function(){
            var sword = new Sword('Excalibur');

            sword.fastenGrip();
            sword.sharpenBlade();
            return sword;
         });


      var args = defs[0].resolveArguments();
      args[1].length.should.equal(3);
      args[1][0].height.should.equal(30);
      args[1][1].height.should.equal(30);
      args[1][2][1].height.should.equal(30); //test nested

    });

    it("should also resolve hash arguments", function(){
      
      var defs = f.registerAll(castleConfig);
      f.setParameter('castle.class', Castle)
         .setParameter('tower.class', Tower)
         .setParameter('tower.height', 30)
         .setParameter('knight.class', Knight)
         .setParameter('knight.quest', 'The holy DI grail')
         .setParameter('sword.factory', function(){
            var sword = new Sword('Excalibur');

            sword.fastenGrip();
            sword.sharpenBlade();
            return sword;
         });

         var args = defs[1].resolveArguments();
         args[2].quest.should.equal('The holy DI grail');
         args[2].tower.height.should.equal(30);

    });
 



  });



});