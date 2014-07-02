// Global simulation soil object
//=============================================================
var soil = {
  water_content: 0,		// in mm
  wilting_point: 0,		// in mm
  perculation_travel_time: 0,	// in hr
  porosity: 0,			// in mm
  field_capacity: 0,		// in mm
  saturated_conductivity: 0,	// in mm/hr

  nitrate: 0,			// in kg/ha
  ammonium: 0,                  // in kg/ha
  fresh_organic_nitrogen: 0,	// in kg/ha
  active_organic_nitrogen: 0,   // in kg/ha
  stable_organic_nitrogen: 0,   // in kg/ha
  labile_phosphorus: 0,		// in kg/ha
  fresh_organic_phosphorus: 0,	// in kg/ha
  bound_organic_phosphorus: 0,	// in kg/ha
  active_mineral_phosphorus: 0,	// in kg/ha
  stable_mineral_phosphorus: 0,	// in kg/ha
  flat_residue_carbon: 0,	// in kg/ha
  humus_carbon: 0,		// in kg/ha
};

// BLOCKLY BLOCK DEFINITIONS
// The following defines the look and JavaScript code generated
// by soil-related blocks
//=============================================================

//
// Nitrogen Blocks
// nitrogen blocks are stored in gk/ha; the blocks convert
// other values.
//-------------------------------------------------------------
Blockly.Blocks['soil_set_nitrate'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(15);
    this.appendDummyInput()
        .appendField("Set nitrate to");
    this.appendValueInput("NITRATE")
        .setCheck("Number");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["kg/ha", "KG_PER_HECTACRE"]]), "UNIT");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.JavaScript['soil_set_nitrate'] = function(block) {
  var nitrate = Blockly.JavaScript.valueToCode(block, 'NITRATE', Blockly.JavaScript.ORDER_ATOMIC);
  var unit = block.getFieldValue('UNIT');
  
  // Convert units if necessary
  
  // Assign the value
  return 'set_nitrate(' + nitrate + ');\n';
};

Blockly.Blocks['soil_get_nitrate'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(15);
    this.appendDummyInput()
        .appendField("Nitrate in");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["kg/ha", "KG_PER_HECTACRE"]]), "UNIT");
    this.setInputsInline(true);
    this.setOutput(true);
    this.setTooltip('');
  }
};

Blockly.JavaScript['soil_get_nitrate'] = function(block) {
  var unit = block.getFieldValue('UNIT');
  var code = 'get_nitrate()';
  
  // Convert units if necessary

  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.Blocks['soil_set_ammonium'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(15);
    this.appendDummyInput()
        .appendField("Set ammonium to");
    this.appendValueInput("AMMONIUM")
        .setCheck("Number");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["kg/ha", "KG_PER_HECTACRE"]]), "UNIT");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.JavaScript['soil_set_ammonium'] = function(block) {
  var ammonium = Blockly.JavaScript.valueToCode(block, 'AMMONIUM', Blockly.JavaScript.ORDER_ATOMIC);
  var unit = block.getFieldValue('UNIT');

  // Convert units if necessary

  return 'set_ammonium(' + ammonium + ');\n';
};

Blockly.Blocks['soil_get_ammonium'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(15);
    this.appendDummyInput()
        .appendField("Ammonium in");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["kg/ha", "KG_PER_HECTACRE"]]), "UNIT");
    this.setInputsInline(true);
    this.setOutput(true);
    this.setTooltip('');
  }
};

Blockly.JavaScript['soil_get_ammonium'] = function(block) {
  var unit = block.getFieldValue('UNIT');
  var code = 'get_ammonium()';

  // Convert units if necessary
  
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.Blocks['soil_set_nitrogen'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(15);
    this.appendDummyInput()
        .appendField("Set");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["fresh", "FRESH"], ["active", "ACTIVE"], ["stable", "STABLE"]]), "CATEGORY");
    this.appendDummyInput()
        .appendField("organic nitrogen to");
    this.appendValueInput("NITROGEN")
        .setCheck("Number");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["kg/ha", "KG_PER_HECTACRE"]]), "UNIT");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.JavaScript['soil_set_nitrogen'] = function(block) {
  var nitrogen = Blockly.JavaScript.valueToCode(block, 'NITROGEN', Blockly.JavaScript.ORDER_ATOMIC);
  var unit = block.getFieldValue('UNIT');
  var category = block.getFieldValue('CATEGORY');
  
  // Convert units if necessary 

  // Assign to the correct category
  switch(category) {
    case 'FRESH':
      return 'set_fresh_organic_nitrogen(' + nitrogen + ');\n';
    case 'ACTIVE':
      return 'set_active_organic_nitrogen(' + nitrogen + ');\n';
    case 'STABLE':
      return 'set_stable_organic_nitrogen(' + nitrogen + ');\n';
  }

  return '';
}

Blockly.Blocks['soil_get_nitrogen'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(15);
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["fresh", "FRESH"], ["active", "ACTIVE"], ["stable", "STABLE"]]), "CATEGORY");
    this.appendDummyInput()
        .appendField("organic nitrogen in");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["kg/ha", "KG_PER_HECTACRE"]]), "UNITS");
    this.setInputsInline(true);
    this.setOutput(true, "Number");
    this.setTooltip('');
  }
};

Blockly.JavaScript['soil_get_nitrogen'] = function(block) {
  var units = block.getFieldValue('UNITS');
  var category = block.getFieldValue('CATEGORY');
  var code = '0';

  // retrieve value from the appropriate category
  switch(category) {
    case 'FRESH':
      code = 'get_fresh_organic_nitrogen()';
      break;
    case 'ACTIVE':
      code = 'get_active_organic_nitrogen()';
      break;
    case 'STABLE':
      code = 'get_stable_organic_nitrogen()';
      break;
  }

  // Convert units if necessary

  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

//
// Phosphorous Blocks
// phosphorous blocks are stored in gk/ha; the blocks convert
// other values.
//-------------------------------------------------------------

Blockly.Blocks['soil_set_phosphorus'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(15);
    this.appendDummyInput()
        .appendField("Set");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["labile", "LABILE"], ["fresh organic", "FRESH_ORGANIC"], ["bound organic", "BOUND_ORGANIC"], ["active mineral", "ACTIVE_MINERAL"], ["stable mineral", "STABLE_MINERAL"]]), "CATEGORY");
    this.appendDummyInput()
        .appendField("phosphorus to");
    this.appendValueInput("PHOSPHORUS")
        .setCheck("Number");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["kg/ha", "KG_PER_HECTACRE"]]), "UNIT");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.JavaScript['soil_set_phosphorus'] = function(block) {
  var category = block.getFieldValue('CATEGORY');
  var phosphorus = Blockly.JavaScript.valueToCode(block, 'PHOSPHORUS', Blockly.JavaScript.ORDER_ATOMIC);
  var unit = block.getFieldValue('UNIT');
  
  // Convert units (if neccessary)

  // Store value in appropriate variable
  switch(category) {
    case 'LABILE':
      return 'set_labile_phosphorus(' + phosphorus + ');\n';
    case 'FRESH_ORGANIC':
      return 'set_fresh_organic_phosphorus(' + phosphorus + ');\n';
    case 'BOUND_ORGANIC':
      return 'set_bound_organic_phosphorus(' + phosphorus + ');\n';
    case 'ACTIVE_MINERAL':
      return 'set_active_mineral_phosphorus(' + phosphorus + ');\n';
    case 'STABLE_MINERAL':
      return 'set_stable_mineral_phosphorus(' + phosphorus + ');\n';
  }

  return '';
};


Blockly.Blocks['soil_get_phosphorus'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(15);
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["labile", "LABILE"], ["fresh organic", "FRESH_ORGANIC"], ["bound organic", "BOUND_ORGANIC"], ["active mineral", "ACTIVE_MINERAL"], ["stable mineral", "STABLE_MINERAL"]]), "CATEGORY");
    this.appendDummyInput()
        .appendField("phosphorus in");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["kg/ha", "KG_PER_HECTACRE"]]), "UNIT");
    this.setInputsInline(true);
    this.setOutput(true);
    this.setTooltip('');
  }
};

Blockly.JavaScript['soil_get_phosphorus'] = function(block) {
  var category = block.getFieldValue('CATEGORY');
  var unit = block.getFieldValue('UNIT');
  var code = '0';

  // Pull value from appropriate variable
  switch(category) {
    case 'LABILE':
      code = 'get_labile_phosphorus()';
      break;
    case 'FRESH_ORGANIC':
      code = 'get_fresh_organic_phosphorus()';
      break;
    case 'BOUND_ORGANIC':
      code = 'get_bound_organic_phosphorus()';
      break;
    case 'ACTIVE_MINERAL':
      code = 'get_active_mineral_phosphorus()';
      break;
    case 'STABLE_MINERAL':
      code = 'get_stable_mineral_phosphorus()';
      break;
  }

  // Convert units (if necessary)  // TODO: Assemble JavaScript into code variable.

  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};


//
// Carbon Blocks
// carbon blocks are stored in gk/ha; the blocks convert
// other values.
//-------------------------------------------------------------

Blockly.Blocks['soil_set_carbon'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(15);
    this.appendDummyInput()
        .appendField("Set carbon in");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["flat residue", "FLAT_RESIDUE"], ["humus", "HUMUS"]]), "CATEGORY");
    this.appendDummyInput()
        .appendField("to");
    this.appendValueInput("CARBON")
        .setCheck("Number");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["kg/ha", "KG_PER_HECTACRE"]]), "UNIT");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.JavaScript['soil_set_carbon'] = function(block) {
  var carbon = Blockly.JavaScript.valueToCode(block, 'CARBON', Blockly.JavaScript.ORDER_ATOMIC);
  var unit = block.getFieldValue('UNIT');
  var category = block.getFieldValue('CATEGORY');

  // convert units (if necessary)

  // store in appropriate variable
  switch(category) {
    case 'FLAT_RESIDUE':
      return 'set_flat_residue_carbon(' + carbon + ');\n';
    case 'HUMUS':
      return 'set_humus_carbon(' + carbon + ');\n'; 
  }

  return '';
};

Blockly.Blocks['soil_get_carbon'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(15);
    this.appendDummyInput()
        .appendField("Carbon in");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["flat residue", "FLAT_RESIDUE"], ["humus", "HUMUS"]]), "CATEGORY");
    this.appendDummyInput()
        .appendField("in");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["kg/ha", "KG_PER_HECTACRE"]]), "UNIT");
    this.setInputsInline(true);
    this.setOutput(true, "Number");
    this.setTooltip('');
  }
};

Blockly.JavaScript['soil_get_carbon'] = function(block) {
  var unit = block.getFieldValue('UNIT');
  var category = block.getFieldValue('CATEGORY');
  var code = '0';

  // pull from appropriate category
  switch(category) {
    case 'FLAT_RESIDUE': 
      code = 'get_flat_residue_carbon()';
      break;
    case 'HUMUS':
      code = 'get_humus_carbon()';
      break;
  }
	
  // convert units (if necessary)

  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};
