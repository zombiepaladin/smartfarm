function System(){
  this._listeners = {};
}

System.prototype = {

  constructor: System,

  include: function(module){
    eval(module);
  },

  addEventListener: function(type, listener){
    if (typeof this._listeners[type] == "undefined")
      this._listeners[type] = [];
    this._listeners[type].push(listener);
    console.log("PUSHED " + type);
  },

  fire: function(event){
    var myself = this;

    if(typeof event == "string") 
      event = { type: event };
        
    if(!event.target) 
      event.target = this;
        
    if(!event.type) 
      throw new Error("Event object missing 'type' property.");
        
    if(myself._listeners[event.type] instanceof Array) {
      myself._listeners[event.type].forEach( function(listener) {
         listener.call(myself, event);
      });
    }
  },

  removeEventListener: function(type, listener) {
    if(this._listeners[type] instanceof Array) {
      this._listeners[event.type].forEach(function(alistener, index, listeners){
        if (listener === alistener) 
           listeners.splice(index, 1);
      });
    }
  }
};


// Global Simulation object
//=============================================================
var simulation = {
  rate: 0,			// in ms
  elapsed_time: 1420,           // in minutes
};


function initializeRegion(weatherModelID, weatherState) {
  var region = {
    weather: {}, 
    worker: new WebWorker('/weather/' + weatherModelId + '.js')
  };
  region.worker.onerror = function(err) {
    console.log(err);
    alert("An error occured");
  };
  region.worker.onmessage = function(event) {
    region.weather = event.data;
  };
}

simulationStep = function() {

  // add a minute to the simulation's elapsed time
  simulation.elapsed_time += 1

  // update the weather
  
  // update the soils
  // 
  
};


//
// INTERPRETER DEFINITIONS
// The following function sets up the interpreter environment
// with the variables associated with the simulation
// as part of a custom API supplied to the interpreter
//============================================================
function initSimulationSystem(interpreter, scope) {

  // Time values (stored in minutes) 
  interpreter.setProperty(scope, 'elapsed_time', interpreter.createPrimitive(simulation.elapsed_time));

}


// Elapsed Time Block
//===========================================================
Blockly.Blocks['simulation_elapsed_time'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(60);
    this.appendDummyInput()
        .appendField("Simulated");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["day(s)", "DAY"], ["hour(s)", "HOUR"], ["minute(s)", "MINUTE"]]), "MEASURE");
    this.appendDummyInput()
        .appendField("elapsed");
    this.setInputsInline(true);
    this.setOutput(true, "Number");
    this.setTooltip('');
  }
};

Blockly.JavaScript['simulation_elapsed_time'] = function(block) {
  var measure = block.getFieldValue('MEASURE');
  var code = '0';

  switch(measure) {
    case 'DAY':
      code = 'Math.floor(get_elapsed_time() / 1440)';
      break;
    case 'HOUR':
      code = 'Math.floor(get_elapsed_time() / 60)';
      break;
    case 'MINUTE':
      code = 'get_elapsed_time()';
      break;
  }

  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};


// Every Timestep Block
//===========================================================

Blockly.Blocks['simulation_every_timestep'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(60);
    this.appendDummyInput()
        .appendField("Every");
    this.appendValueInput("TIMESTEP")
        .setCheck("Number");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["day(s)", "DAY"], ["hour(s)", "HOUR"], ["minute(s)", "MINUTE"]]), "MEASURE");
    this.appendStatementInput("BODY");
    this.setInputsInline(true);
    this.setTooltip('');
  }
}

Blockly.JavaScript['simulation_every_timestep'] = function(block) {
  var timestep = Blockly.JavaScript.valueToCode(block, 'TIMESTEP', Blockly.JavaScript.ORDER_ATOMIC);
  var measure = block.getFieldValue('MEASURE');
  var body = Blockly.JavaScript.statementToCode(block, 'BODY');

  // convert timestep into minutes
  switch(measure){
    case 'HOUR':
      timestep = '(' + timestep + ' * 60)';
      break;
    case 'DAY':
      timestep = '(' + timestep + ' * 1440)';
      break;
  }

  return 'if(get_elapsed_time() % ' + timestep + ' == 0) {\n' + body + '\n}';
};

