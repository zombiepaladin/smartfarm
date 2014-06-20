var global_scope;

function initSimulationInterpreter(interpreter, scope) {
  var wrapper;


  // alert() function 
  //
  wrapper = function(text) {
    text = text ? text.toString() : '';
    return interpreter.createPrimitive(alert(text));
  };
  interpreter.setProperty(scope, 'alert', interpreter.createNativeFunction(wrapper));

  initWeatherSystem(interpreter, scope);

  global_scope = scope;

}
