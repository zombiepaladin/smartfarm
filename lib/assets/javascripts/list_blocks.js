Blockly.Blocks['lists_create_from_file'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(260);
    this.appendDummyInput()
        .appendField("create list from file")
        .appendField(new Blockly.FieldTextInput("default"), "FILENAME");
    this.setOutput(true, "Array");
    this.setTooltip('');
  },
  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('list', this.list);
    return container;
  },
  domToMutation: function(xmlElement) {
    this.list = xmlElement.getAttribute('list');
  }
};


Blockly.JavaScript['lists_create_from_file'] = function(block) {
  return [this.list, Blockly.JavaScript.ORDER_NONE];
};
