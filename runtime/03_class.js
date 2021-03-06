$.define_class('BasicObject', null);

$.define_class('Object', $c.BasicObject);
$c.Object.constants = $.constants;

$.define_class('Module', $c.Object);

$.define_class('Class',  $c.Module);

$c.BasicObject.klass = $c.Object.klass = $c.Module.klass = $c.Class.klass = $c.Class;

$c.Symbol.klass = $c.Class;
$c.Symbol.superklass = $c.Object;

$.define_module('Kernel');
$.module_include($c.Object, $c.Kernel);

$.define_module('ColdRuby');

$.define_method($c.Class, 'allocate', 0, function(self) {
  return {
    klass: self,
    ivs:   {},
    toString: function() { return "#<" + $.class2name(this.klass) + ">"; }
  };
});

$.define_method($c.Class, 'new', -1, function(self, args) {
  var object = this.funcall(self, 'allocate');
  this.funcall2(object, 'initialize', args, this.context.sf.block);

  return object;
});

$.define_singleton_method($c.Class, 'new', -1, function(self, args) {
  var sf = this.context.sf;

  this.check_args(args, 0, 1);
  var superklass = args[0];

  if(superklass && superklass.type == 'singleton')
    this.raise(this.e.TypeError, "can't make subclass of singleton class");

  var klass = {
    klass:             this.internal_constants.Class,
    superklass:        superklass ? superklass : this.internal_constants.Object,
    singleton_klass:   null,
    constants:         {},
    class_variables:   {},
    instance_methods:  {},
    ivs:               {},
    toString:          function() { return "#<Class: " + $.class2name(this) + ">"; }
  };

  var cref = [ klass ];
  for(var i = 0; i < sf.block.stack_frame.cref.length; i++) {
    cref.push(sf.block.stack_frame.cref[i]);
  }

  var sf_opts = {
    self: klass,
    ddef: klass,
    cref: cref,

    outer: sf.block.stack_frame
  };

  this.execute(sf_opts, sf.block, [ klass ]);

  return klass;
});

$.define_method($c.Class, 'superclass', 0, function(self) {
  return self.superklass == null ? Qnil : self.superklass;
});

$.define_method($.c.Class, 'inherited', 1, function(self, subclass) {
  return Qnil;
});

$.define_method($.c.Module, 'module_exec', -1, function(self, args) {
  var sf = this.context.sf;

  var sf_opts = {
    self: self,
    ddef: self,
    cref: sf.block.stack_frame.cref,

    outer: sf.block.stack_frame
  };

  return this.execute(sf_opts, sf.block, args);
});

$.alias_method($c.Class, 'class_exec', 'module_exec');

$.define_method($c.BasicObject, 'equal?', 1, function(self, other) {
  return self == other ? Qtrue : Qfalse;
});
$.alias_method($c.BasicObject, '==', 'equal?');

$.define_method($c.BasicObject, '!=', 1, function(self, other) {
  return this.test(this.funcall(self, '==', other)) ? Qfalse : Qtrue;
});

$.define_method($c.BasicObject, '!', 0, function(self) {
  return this.test(self) ? Qfalse : Qtrue;
});

$.define_method($c.BasicObject, 'method_missing', -1, function(self, args) {
  if(args.length < 1)
    this.raise($e.ArgumentError, "no id given");

  var sym = args[0];
  var for_obj = " `" + this.id2text(sym.value) + "' for " +
        this.funcall(self, 'inspect').value + ':' + this.obj_classname(self);

  switch(this.context.last_call_type) {
    case 'method':
    this.raise2($e.NoMethodError,
        [ this.string_new("undefined method" + for_obj), sym, args], null, 1);
    break;

    case 'vcall':
    this.raise2($e.NameError,
        [ this.string_new("undefined local variable or method" + for_obj), sym], null, 1);
    break;

    case 'super':
    this.raise2($e.NoMethodError,
        [ this.string_new("super: no superclass method" + for_obj), sym, args], null, 1);
    break;

    default:
    this.raise($e.RuntimeError,
        [ this.string_new("method_missing: unknown call type " +
            this.context.last_call_type) ]);
  }
});

$.define_method($c.BasicObject, 'instance_exec', -1, function(self, args) {
  var sf = this.context.sf;

  var sf_opts = {
    self: self,
    ddef: null, /* will turn to singleton of self in getspecial(VM_SPECIAL_OBJECT_CBASE) */
    cref: sf.block.stack_frame.cref,

    outer: sf.block.stack_frame
  };

  return this.execute(sf_opts, sf.block, args);
});

$.define_method($c.BasicObject, 'instance_eval', -1, function(self) {
  return this.funcall2(self, 'instance_exec', [], this.context.sf.block);
});
