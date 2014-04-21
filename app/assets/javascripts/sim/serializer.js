SpriteMorph.prototype.toJSON = function () {
    var code = {}
        myself = this;

    code.name = this.name;

    // process variables
    code.variables = [];
    for (var key in this.variables.vars) {
        code.variables.push({
          "name": key,
          "value": myself.variables.vars[key],
          "isPersistent": false
        });
    };

    // script helper functions
    function parseBlock(block) {
        var temp,
            acc = [];

        // Short-circuit parsing for ArgMorphs, as they have a limited implementation        
        if (block instanceof CommandSlotMorph) return parseBlock(block.nestedBlock());
        // TODO: Parse numbers?
        if (block instanceof ArgMorph) return block.contents().text;
        

        // Process regular blocks
        do {
            temp = [block.selector];
            
            // Process block inputs
            block.inputs().forEach( function(input) {
              temp.push( parseBlock(input) );
            });

            acc.push(temp);

            // Move to next block
            if(block.nextBlock)
                block = block.nextBlock();
            else
                block = null;

        } while (block);

        return acc;
    }

    // process scripts
    code.scripts = this.scripts.children.reduce(function(acc, child) {
      var position;
      if (child instanceof BlockMorph) {
        position = child.topLeft().subtract(child.parent.topLeft());
        acc.push( [position.x, position.y, parseBlock(child)] );
        return acc;
      }
    }, []);

    return JSON.stringify(code);
};

