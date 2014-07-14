// Global Simulation object
//=============================================================
var simulation = {
  rate: 0,			// in ms
  simulation_time: 0,           // in ms since 1 January, 1970 UTC
  elapsed_time: 0,              // in minutes
};


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



// Date block
//==============================================================

Blockly.Blocks['simulation_get_date'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(60);
    this.appendDummyInput()
        .appendField("Get simulation ")
        .appendField(new Blockly.FieldDropdown([["year", "YEAR"], ["month", "MONTH"], ["day of month", "DAY_OF_MONTH"], ["day of year", "DAY_OF_YEAR"]), "CATEGORY");
    this.setOutput(true, "Number");
    this.setTooltip('');
  }
};

Blockly.JavaScript['simulation_get_date'] = function(block) {
  var category = block.getFieldValue('CATEGORY');

  switch(category) {
    case 'YEAR': 
      return ['get_simulation_year()', Blockly.JavaScript.ORDER_ATOMIC];
    case 'MONTH':
      return ['get_simulation_month()', Blockly.JavaScript.ORDER_ATOMIC];
    case 'DAY_OF_MONTH':
      return ['get_simulation_day_of_month()', Blockly.JavaScript.ORDER_ATOMIC];
    case 'DAY_OF_YEAR':
      return ['get_simulation_day_of_year()', Blockly.JavaScript.ORDER_ATOMIC];
  }
};
