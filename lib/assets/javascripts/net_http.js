Blockly.Blocks['net_http_request'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(60);
    this.appendDummyInput()
        .appendField("HTTP Get Request");
    this.appendValueInput("URL")
        .setCheck("String")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("URL");
    this.appendValueInput("HEADER")
        .setCheck("Array")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Header");
    this.appendValueInput("DATA")
        .setCheck("Array")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Body");
    this.setOutput(true);
    this.setTooltip('');
  }
};


Blockly.JavaScript['net_http_request'] = function(block) {
  var value_url = Blockly.JavaScript.valueToCode(block, 'URL', Blockly.JavaScript.ORDER_ATOMIC);
  var value_header = eval(Blockly.JavaScript.valueToCode(block, 'HEADER', Blockly.JavaScript.ORDER_ATOMIC));
  var value_data = Blockly.JavaScript.valueToCode(block, 'DATA', Blockly.JavaScript.ORDER_ATOMIC);
  console.log("get"); 
  console.log(value_url); 
  console.log(value_data); 
  console.log(typeof value_header);

  var header_pairs = {};
  value_header.forEach( function (pair) {
    header_pairs[pair[0]] = pair[1];
  });
  console.log(header_pairs);
/*
  var data_pairs = {};
  value_data.forEach( function (pair) {
    data_pairs[pair[0]] = pair[1];
  });
*/
  $.ajax({
    url: eval(value_url), 
    header: header_pairs, 
  //  data: data_pairs,
    success: function(dat) {
      console.log(data);
    }
  });
      
};
