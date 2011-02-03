$.define_method($c.Object, 'initialize', 0, function(self) {
});

$.define_method($c.Object, 'nil?', 0, function(self) {
  return Qfalse;
});

$.define_method($c.Object, 'class', 0, function(self) {
  return self.klass;
});

// This complete method is an example of how _not_ to do
// hash-functions, but it's the best I can think of now.
$.define_method($c.Object, 'hash', 0, function(self) {
  return self.toString();
});

$.define_method($c.Object, 'to_s', 0, function(self) {
  return "#<" + self.klass.klass_name + ">";
});

$.define_method($c.Object, 'inspect', 0, function(self) {
  return this.funcall(self, 'to_s');
});
