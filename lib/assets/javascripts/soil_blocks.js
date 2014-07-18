// Global simulation soil object
//=============================================================
var soil = {
  snow_cover: 0,                // in mm
  water_content: 0,		// in mm
  wilting_point: 0,		// in mm
  percolation_travel_time: 0,	// in hr
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
// Snow cover blocks
// Snow cover blocks are stored in mm; the blocks convert other values
//-------------------------------------------------------------

Blockly.Blocks['soil_set_snow_cover'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(15);
    this.appendDummyInput()
        .appendField("Set snow cover to ");
    this.appendValueInput("SNOW_COVER")
        .setCheck("Number");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["mm", "MILLIMETER"], ["inches", "INCHES"]]), "UNIT");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.JavaScript['soil_set_snow_cover'] = function(block) {
  var snow_cover = Blockly.JavaScript.valueToCode(block, 'SNOW_COVER', Blockly.JavaScript.ORDER_ATOMIC);
  var unit = block.getFieldValue('UNIT');
  // convert units, if necessary
  if(unit == 'INCHES') {
    snow_cover = '((' + snow_cover + ') * 25.4)';
  }
  return 'set_snow_cover(' + snow_cover + ');\n';
};

Blockly.Blocks['soil_get_snow_cover'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(15);
    this.appendDummyInput()
        .appendField("Snow cover in");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["mm", "MILLIMETER"], ["inches", "INCHES"]]), "UNIT");
    this.setInputsInline(true);
    this.setOutput(true);
    this.setTooltip('');
  }
};

Blockly.JavaScript['soil_get_snow_cover'] = function(block) {
  var unit = block.getFieldValue('UNIT');
  var code = 'get_snow_cover()';
  // convert units, if necessary
  if(unit == 'INCHES') {
    code = '(' + code + ' / 25.4)';
  }
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};


//
// Water content blocks
// Water blocks are stored in mm; the blocks convert other values
//-------------------------------------------------------------

Blockly.Blocks['soil_set_water_content'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(15);
    this.appendDummyInput()
        .appendField("Set water content to");
    this.appendValueInput("WATER")
        .setCheck("Number");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["mm", "MILLIMETER"], ["in", "INCHES"]]), "UNIT");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
}

Blockly.JavaScript['soil_set_water_content'] = function(block) {
  var water = Blockly.JavaScript.valueToCode(block, 'WATER', Blockly.JavaScript.ORDER_ATOMIC);
  var unit = block.getFieldValue('UNIT');

  // convert units if necessary
  if(unit == 'INCHES') {
    water = '((' + water + ') * 25.4)';
  }

  return 'set_water_content(' + water + ');\n';
};

Blockly.Blocks['soil_get_water_content'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(15);
    this.appendDummyInput()
        .appendField("water content in");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["mm", "MILLIMETER"], ["in", "INCHES"]]), "UNIT");
    this.setInputsInline(true);
    this.setOutput(true);
    this.setTooltip('');
  }
};

Blockly.JavaScript['soil_get_water_content'] = function(block) {
  var unit = block.getFieldValue('UNIT');
  var code = 'get_water_content()';
  
  // convert units if necessary
  if(unit == 'INCHES') {
    return ['((' + code + ') / 25.4 )', Blockly.JavaScript.ORDER_ATOMIC];
  }  

  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};


//
// Wilting point blocks
// wilting point values are stored in mm; the blocks convert
// other values
//-------------------------------------------------------------

Blockly.Blocks['soil_set_wilting_point'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(15);
    this.appendDummyInput()
        .appendField("Set wilting point to ");
    this.appendValueInput("WILTING_POINT")
        .setCheck("Number");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["mm", "MM"], ["inches", "INCHES"]]), "UNIT");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.JavaScript['soil_set_wilting_point'] = function(block) {
  var wilting_point = Blockly.JavaScript.valueToCode(block, 'WILTING_POINT', Blockly.JavaScript.ORDER_ATOMIC);
  var unit = block.getFieldValue('UNIT');
  // Convert units if necessary
  if(unit == 'INCHES') {
    wilting_point = '((' + wilting_point + ') * 25.4)';
  }
  return 'set_wilting_point(' + wilting_point + ');\n';
};

Blockly.Blocks['soil_get_wilting_point'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(15);
    this.appendDummyInput()
        .appendField("Wilting point in");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["mm", "MM"], ["inches", "INCHES"]]), "UNIT");
    this.setInputsInline(true);
    this.setOutput(true, "Number");
    this.setTooltip('');
  }
}

Blockly.JavaScript['soil_get_wilting_point'] = function(block) {
  var unit = block.getFieldValue('UNIT');
  var code = 'get_wilting_point()';
  // Convert units, if necessary
  if(unit == 'INCHES') {
    code = '((' + code + ') / 25.4)';
  }
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
}

//
// Percolation Travel Time blocks
// percolation travel times are stored in hours
//-------------------------------------------------------------

Blockly.Blocks['soil_set_percolation_travel_time'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(15);
    this.appendDummyInput()
        .appendField("Set percolation travel time to ");
    this.appendValueInput("PERCOLATION_TRAVEL_TIME")
        .setCheck("Number");
    this.appendDummyInput()
        .appendField("hours");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.JavaScript['soil_set_percolation_travel_time'] = function(block) {
  var time = Blockly.JavaScript.valueToCode(block, 'PERCOLATION_TRAVEL_TIME', Blockly.JavaScript.ORDER_ATOMIC);
  return 'set_percolation_travel_time(' + time + ');\n';
};

Blockly.Blocks['soil_get_percolation_travel_time'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(15);
    this.appendDummyInput()
        .appendField("Percolation travel time in hours ");
    this.setInputsInline(true);
    this.setOutput(true, "Number");
    this.setTooltip('');
  }
};

Blockly.JavaScript['soil_get_percolation_travel_time'] = function(block) {
  return ['get_percolation_travel_time()', Blockly.JavaScript.ORDER_NONE];
};


//
// Porosity Blocks
// porosity is stored as a percentage.
//-------------------------------------------------------------

Blockly.Blocks['soil_set_porosity'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(15);
    this.appendDummyInput()
        .appendField("Set porosity to");
    this.appendValueInput("POROSITY")
        .setCheck("Number");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["mm", "MM"], ["inches", "INCHES"]]), "UNIT");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.JavaScript['soil_set_porosity'] = function(block) {
  var porosity = Blockly.JavaScript.valueToCode(block, 'POROSITY', Blockly.JavaScript.ORDER_ATOMIC);
  var unit = block.getFieldValue('UNIT');
  // Convert units if necessary
  if(unit == 'INCHES') {
    porosity = '((' + porosity + ') * 25.4)';
  }
  return 'set_porosity(' + porosity + ');\n';
};

Blockly.Blocks['soil_get_porosity'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(15);
    this.appendDummyInput()
        .appendField("Porosity in");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["mm", "MM"], ["inches", "INCHES"]]), "UNIT");
    this.setInputsInline(true);
    this.setOutput(true, "Number");
    this.setTooltip('');
  }
};

Blockly.JavaScript['soil_get_porosity'] = function(block) {
  var unit = block.getFieldValue('UNIT');
  var code = 'get_porosity()';
  // convert units, if necessary
  if(unit == 'INCHES') {
    code = '((' + code + ') / 25.4)';
  }
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};


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
// phosphorous blocks are stored in kg/ha; the blocks convert
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

  // Convert units (if necessary)  

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
