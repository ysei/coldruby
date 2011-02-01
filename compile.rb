#!/usr/bin/env ruby

require 'pp'

$: << './lib/'
require 'coldruby'

CompilerOptions = {
  :peephole_optimization    => true,
  :inline_const_cache       => false,
  :specialized_instruction  => false,
  :operands_unification     => false,
  :instructions_unification => false,
  :stack_caching            => false,
}

ruby_iseq = RubyVM::InstructionSequence.compile_file ARGV[0], CompilerOptions

puts ">>>>>>>>>>>>> DISASSEMBLE"
puts ruby_iseq.disasm
puts

puts ">>>>>>>>>>>>> DUMP"
pp ruby_iseq.to_a
puts

puts ">>>>>>>>>>>>> COMPILE"
pool = ColdRuby::Pool.new
iseq = ColdRuby::ISeq.new(pool, ruby_iseq.to_a)

runtime = ""
Dir[File.join(File.dirname(__FILE__), 'runtime', '*')].sort.each do |runtime_part|
  runtime << "/* Runtime: #{runtime_part} */\n\n"
  runtime << File.read(runtime_part)
  runtime << "\n\n"
end

compiled = ""
compiled << "/* Compiled code */\n\n"
compiled << "var top_iseq = #{iseq.compile};\n"
compiled << "var new_symbols = #{pool.symbols};\n"
compiled << <<EOAS
for(var k in new_symbols) {
  $.symbols[k] = parseInt($.builtin.get_symbol(new_symbols[k]).value);
}
EOAS
compiled << "\n"
puts compiled

File.open("output.js", "w") do |f|
  f.write runtime
  f.write compiled
  f.write <<-EPILOGUE
var context = $.create_context();
var toplevel = $.create_toplevel();
pp($.execute(context, toplevel, toplevel, top_iseq, []));
  EPILOGUE
end
