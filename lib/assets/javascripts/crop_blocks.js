// Global simulation crop object
//=============================================================
var plant = {
  heat_units: 0, 		// 
  heat_unit_index: 0,
  leaf_area_index: 0,
  height: 0,                    // in m
  root_depth: 0,                // in m

  leaf_biomass: 0,
  stem_biomass: 0,
  reproductive_biomass: 0,
  storage_organ_biomass: 0,
  root_biomass: 0,
  standing_residue: 0,
};

// BLOCKLY BLOCK DEFINITIONS
// The following defines the look and JavaScript code generated
// by plant-related blocks
//=============================================================

//
// Planting Blocks
//-------------------------------------------------------------

Blockly.Blocks['crop_when_planted'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(135);
    this.appendDummyInput()
        .appendField("when planted");
    this.appendStatementInput("DO")
        .appendField("do");
    this.setTooltip('');
  }
};

Blockly.JavaScript['crop_when_planted'] = function(block) {
  var block = Blockly.JavaScript.statementToCode(block, 'DO');
  return 'function plant() {\n' + block + '}\n';
};

//
// Biomass Blocks
// nitrogen blocks are stored in gk/ha; the blocks convert
// other values.
//-------------------------------------------------------------

Blockly.Blocks['crop_set_biomass'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(135);
    this.appendDummyInput()
        .appendField("Set");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["leaf", "LEAF"], ["stem", "STEM"], ["reproductive organ", "REPRODUCTIVE"], ["storage organ", "STORAGE"], ["root", "ROOT"], ["standing residue", "RESIDUE"]]), "CATEGORY");
    this.appendDummyInput()
        .appendField("biomass to");
    this.appendValueInput("BIOMASS")
        .setCheck("Number");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["kg", "KILOGRAM"], ["lb", "POUND"]]), "UNIT");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.JavaScript['crop_set_biomass'] = function(block) {
  var category = block.getFieldValue('CATEGORY');
  var biomass = Blockly.JavaScript.valueToCode(block, 'BIOMASS', Blockly.JavaScript.ORDER_ATOMIC);
  var unit = block.getFieldValue('UNIT');
  // convert units (if necessary)
  if(unit == 'POUND') {
      biomass = '((' + biomass + ') * 0.45359237)';
  }
  // store in appropriate category
  switch (category) {
    case 'LEAF':
      return 'set_leaf_biomass(' + biomass + ');\n';
    case 'STEM':
      return 'set_stem_biomass(' + biomass + ');\n';
    case 'REPRODUCTIVE':
      return 'set_reproductive_organ_biomass(' + biomass + ');\n';
    case 'STORAGE':
      return 'set_storage_organ_biomass(' + biomass + ');\n';
    case 'ROOT':
      return 'set_root_biomass(' + biomass + ');\n';
    case 'RESIDUE':
      return 'set_standing_residue_biomass(' + biomass + ');\n';
  }
  return '';
};

Blockly.Blocks['crop_get_biomass'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(135);
    this.appendDummyInput()
        .appendField("Crop");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["leaf", "LEAF"], ["stem", "STEM"], ["reproductive organ", "REPRODUCTIVE_ORGAN"], ["storage organ", "STORAGE_ORGAN"], ["root", "ROOT"], ["standing residue", "RESIDUE"]]), "CATEGORY");
    this.appendDummyInput()
        .appendField("biomass in");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["kg", "KILOGRAM"], ["lb", "POUND"]]), "UNIT");
    this.setInputsInline(true);
    this.setOutput(true);
    this.setTooltip('');
  }
};

Blockly.JavaScript['crop_get_biomass'] = function(block) {
  var unit = block.getFieldValue('UNIT');
  var category = block.getFieldValue('CATEGORY');
  var code = '0';
  // retrieve from appropriate category
  switch(category) {
    case 'LEAF':
      code = 'get_leaf_biomass()';
      break;
    case 'STEM':
      code = 'get_stem_biomass()';
      break;
    case 'REPRODUCTIVE_ORGAN':
      code = 'get_reproductive_organ_biomass()';
      break;
    case 'STORAGE_ORGAN':
      code = 'get_reproductive_organ_biomass()';
      break;
    case 'ROOT':
      code = 'get_root_biomass()';
      break;
    case 'RESIDUE':
      code = 'get_standing_residue_biomass()';
      break;
  }
  // Convert units, if necessary
  if(unit == 'POUND') {
      code = '((' + code + ') / 0.45359237)';
  }
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

