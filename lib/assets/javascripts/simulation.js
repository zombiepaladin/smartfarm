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



// Every Timestep Block
//===========================================================

Blockly.Blocks['simulation_every_timestep'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(120);
    this.appendDummyInput()
        .appendField("Every")
        .appendField(new Blockly.FieldDropdown([["day", "DAY"], ["hour", "HOUR"], ["15 minutes", "QUARTERHOUR"]]), "TIMESTEP");
    this.appendStatementInput("CODE");
    this.setInputsInline(true);
    this.setTooltip('');
  }
};


Blockly.JavaScript['simulation_every_timestep'] = function(block) {
  var statements_code = Blockly.JavaScript.statementToCode(block, 'CODE');
  var timestep = block.getFieldValue('TIMESTEP');

  system.addEventListener('TIMESTEP:' + timestep, function() {
    eval(statements_code);
  });
};


