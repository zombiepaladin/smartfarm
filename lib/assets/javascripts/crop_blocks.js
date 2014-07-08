// Global simulation crop object
//=============================================================
var plant = {
  heat_units: 0, 		// 
  heat_unit_index: 0,
  leaf_area_index: 0,
  height: 0,                    // in m
  root_depth: 0,                // in m

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
// Biomass Blocks
// nitrogen blocks are stored in gk/ha; the blocks convert
// other values.
//-------------------------------------------------------------

Blockly.Blocks['set_crop_biomass'] = {
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

Blockly.JavaScript['set_crop_biomass'] = function(block) {
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
