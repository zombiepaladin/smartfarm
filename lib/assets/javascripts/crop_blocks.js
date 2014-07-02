// Global simulation crop object
//=============================================================
var plant = {
  leaves_and_stems_biomass: 0,
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
// Nitrogen Blocks
// nitrogen blocks are stored in gk/ha; the blocks convert
// other values.
//-------------------------------------------------------------

Blockly.Blocks['set_plant_biomass'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(135);
    this.appendDummyInput()
        .appendField("Set");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["leaf and stem", "LEAF_AND_STEM"], ["reproductive organ", "REPRODUCTIVE"], ["storage organ", "STORAGE"], ["root", "ROOT"], ["standing residue", "RESIDUE"]]), "CATEGORY");
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

Blockly.JavaScript['set_plant_biomass'] = function(block) {
  var category = block.getFieldValue('CATEGORY');
  var biomass = Blockly.JavaScript.valueToCode(block, 'BIOMASS', Blockly.JavaScript.ORDER_ATOMIC);
  var unit = block.getFieldValue('UNIT');
  
  // convert units (if necessary)
  if(unit == 'POUND') {
      biomass = '(' + biomass + ' * 0.45359237)';
  }

  // store in appropriate category
  switch (category) {
    case 'LEAF_AND_STEM':
    case 'REPRODUCTIVE':
    case 'STORAGE':
    case 'ROOT':
    case 'RESIDUE':
  }
  return '';
};

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

