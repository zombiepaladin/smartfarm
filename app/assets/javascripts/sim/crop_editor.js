// Declarations

var CropSpriteMorph;
var CropEditorMorph;


// CropSpriteMorph /////////////////////////////////////////////////////////

// I am a scriptable model of a crop

// CropSpriteMorph inherits from SpriteMorph:

CropSpriteMorph.prototype = new SpriteMorph();
CropSpriteMorph.prototype.constructor = CropSpriteMorph;
CropSpriteMorph.uber = SpriteMorph.prototype;

// CropSpriteMorph instance creation

function CropSpriteMorph(globals, cropData) {
    this.init(globals, cropData);
}

CropSpriteMorph.prototype.init = function (globals, cropData) {
  var myself = this;

  CropSpriteMorph.uber.init.call(this, globals);
	
  this.name = localize('Crop');
	
  if (cropData) {
      this.id = cropData.id;

      // metadata
      this.name = cropData.name;
      this.author = cropData.author;
      this.updated_at = cropData.updated_at;
      this.created_at = cropData.created_at;

      // variables
      cropData.variables.forEach( function(variable) {
          myself.variables.addVar(variable.name, variable.value);
      });

      // helper method for loading blocks
      function loadBlocks(blocks) {
          var inputBlock = null,
              blockData = blocks.shift(),
              block = SpriteMorph.prototype.blockForSelector(blockData[0]);

          // set block metadata
          block.isDraggable = true;

          // load block inputs
          for(i = 1; i < blockData.length; i++) {
              console.log("INPUT: " + blockData[i]);
              inputBlock = block.inputs()[i-1];
              if (inputBlock instanceof InputSlotMorph) {
                  inputBlock.setContents(blockData[i]);
              }
              else if (inputBlock instanceof CSlotMorph) {
                  inputBlock.nestedBlock(loadBlocks(blockData[i]))
              }
          }

          // load next blocks
          if(blocks.length > 0) {
              block.nextBlock(loadBlocks(blocks));
          }

          return block;      
      }

      // scripts
      cropData.scripts.forEach( function(script) {
          block = loadBlocks(script[2]);
          block.setLeft(script[0]);
          block.setTop(script[1]);
          block.isDraggable = true;
          myself.scripts.add(block);
      });
  } 

};


// CropEditorMorph /////////////////////////////////////////////////////////

// I am FarmSim's crop system editor panel

// CropEditorMorph inherits from SpriteEditorMorph:

CropEditorMorph.prototype = new Morph();
CropEditorMorph.prototype.constructor = CropEditorMorph;
CropEditorMorph.uber = Morph.prototype;

// CropEditorMorph API

CropEditorMorph.prototype.openIn = function(world) {
	var myself = this;
	
	world.add(this);
	world.userMenu = this.userMenu;
	
	// TODO: get persistent data, if any
	
	// prevent non-DialogBoxMorphs from being 
	// dropped onto the World in user-mode
	world.reactToDropOf = function(morph) {
		if(!(morph instanceof DialogBoxMorph)) {
			if (world.hand.grabOrigin) {
				morph.slideBackTo(world.hand.grabOrigin);
			} else {
				world.hand.grab(morph);
			}
		}
	};
	
	// add support for full-screening to the world morph
	world.isFullScreen = false;
	world.fullScreen = function (fillPage) {
		var pos = getDocumentPositionOf(this.worldCanvas),
			clientHeight = window.innerHeight,
			clientWidth = window.innerWidth,
			myself = this;
			
		if( this.isFullScreen === fillPage)
			return; // nothing to do
			
		if( fillPage ) { // Switch to fullscreen mode
		
			this.isFullScreen = true;
		
			// Store old values
			this.windowedWidth = this.worldCanvas.width;
			this.windowedHeight = this.worldCanvas.height;
			
			this.useFillPage = true;
			this.fillPage();

                        document.dispatchEvent(new Event('smartfarm:fullscreen'));
			
		} else { // Switch to windowed mode
		
			this.isFullScreen = false;
			
			this.useFillPage = false;
		
			this.worldCanvas.width = this.windowedWidth;
			this.setWidth(this.windowedWidth);
			
			this.worldCanvas.height = this.windowedHeight;
			this.setHeight(this.windowedHeight);
			
			this.worldCanvas.style.position = "relative";
			
			this.children.forEach(function (child) {
				if (child.reactToWorldResize) {
					child.reactToWorldResize(myself.bounds.copy());
				}
			});

                        document.dispatchEvent(new Event('smartfarm:windowed'));
		}
	}
	
	this.fullScreen = function (fillPage) {
		world.fullScreen(fillPage);
	}
	
	this.reactToWorldResize(world.bounds);
};

CropEditorMorph.prototype.saveCrop = function() {
    var event;
	
    console.log("Saving crop id=" + this.currentSprite.id + ", rev=" + this.currentSprite.rev);
    event = new CustomEvent('smartfarm:savecrop', { "detail": this.currentSprite.toJSON()});
    console.log(this.currentSprite.toJSON());
    console.log(event);
    document.dispatchEvent(event);
};

// CropEditorMorph initialization

function CropEditorMorph(cropData) {
    this.init(cropData);
}

CropEditorMorph.prototype.init = function (cropData) {
	var cropSprite;
	
	this.globalVariables = new VariableFrame();
	this.globalVariables.addVar("H2O", 20);
	this.globalVariables.addVar("NO2", 200);

	this.currentSprite = new CropSpriteMorph(this.globalVariables, cropData);
	this.currentSprite.variables.addVar("foo", "bar");
	this.currentSprite.variables.addVar("glumph", "daa");
	
	
	// initialize inherited properties
	CropEditorMorph.uber.init.call(this);
	
	this.titleBar = null;
	this.visualState = null;
	this.variableState = null;
	this.tabs = null;
	this.scriptsPanel = null;
	this.costumePanel = null;
	this.categories = null;
	this.palatte = null;
	this.buttons = null;
	this.spriteEditor = null;
	
	// create layout
	this.createTitleBar();
	this.createVisualState();
	this.createVariableState();
	this.createTabs();
	this.createCategories();
	this.createPalette();
	this.createSpriteEditor();
	this.createButtons();
	// costumes pane
	
};

CropEditorMorph.prototype.createTitleBar = function() {
	var width = 200,
		height = 20,
		padding = 5,
		bounds,
		titleBar,
		title,
		author,
		expand,
		shrink,
		myself = this;
		
	if (this.titleBar) {
		this.titleBar.destroy();
	}
	
	titleBar = new ControlBarMorph();
	titleBar.setExtent(new Point(width, height));
	
	title = new InputFieldMorph(this.currentSprite.name, false, null, false);
	title.setPosition(new Point(padding, padding));
	titleBar.add(title);
console.log("title " + this.currentSprite.name);

	author = new TextMorph("By " + this.currentSprite.author);
	author.setPosition(title.bottomLeft());
	titleBar.add(author);
	
	expand = new PushButtonMorph(
		null,
		function() {
			expand.hide();
			shrink.show();
			myself.fullScreen(true);
		},
		"Full Screen",
		null,
		null
	);
	expand.setPosition( new Point(width - 2*padding - expand.width(), padding) );
	titleBar.add(expand);
	
	shrink = new PushButtonMorph(
		null,
		function() {
			shrink.hide();
			expand.show();
			myself.fullScreen(false);
		},
		"Windowed",
		null,
		null
	);
	shrink.setPosition( new Point(width - 2*padding - shrink.width(), padding) );
	shrink.hide();
	titleBar.add(shrink);
		
	titleBar.setHeight(author.bottom() + padding);
	this.add(titleBar);
	this.titleBar = titleBar;
}

CropEditorMorph.prototype.createVisualState = function() {
	var width = 200,
		height = 200,
		visualState,
		variableState,
		myself = this;
	
	visualState = new Morph();
	visualState.setPosition(this.titleBar.bottomLeft());
	visualState.setExtent(new Point(width, height));
	visualState.color = new Color(244, 244, 200);
	
	this.currentSprite.setPosition(
		visualState.center().subtract(
			this.currentSprite.extent().divideBy(2)
		)
	);
	visualState.add(this.currentSprite);
	
	this.add(visualState);
	this.visualState = visualState;
};

CropEditorMorph.prototype.createVariableState = function() {
	var variableState,
		myself = this;
	
	variableState = new ScrollFrameMorph(null, null, SpriteMorph.prototype.sliderColor);
	variableState.setPosition(this.visualState.bottomLeft());
	variableState.setWidth(this.visualState.width());
	variableState.color = new Color(100, 200, 140);
	
	// Global Variables
	variableState.addContents(new TextMorph("Simulation Variables"));
	this.globalVariables.names().forEach( function(variableName) {
		var watcher = new WatcherMorph(
			variableName,
			SpriteMorph.prototype.blockColor.variables,
			myself.globalVariables,
			variableName
		);
		variableState.addContents(watcher);
		watcher.fixLayout();
		watcher.keepWithin(variableState);
	});
	
	// Local Variables
	variableState.addContents(new TextMorph("Crop Variables"));
	this.currentSprite.variables.names().forEach( function(variableName) {
		var watcher = new WatcherMorph(
			variableName,
			SpriteMorph.prototype.blockColor.variables,
			myself.currentSprite.variables,
			variableName
		);
		variableState.addContents(watcher);
		watcher.fixLayout();
		watcher.keepWithin(variableState);
	});
	
	variableState.fixLayout = function() {
		var padding = 2,
			x = padding,
			y = padding;
		this.contents.children.forEach(function (child) {
				child.setPosition(new Point(x, y));
				y += child.height() + padding;
		});
	}
	
	this.add(variableState);
	this.variableState = variableState;
};

CropEditorMorph.prototype.createTabs = function() {
	var tabs,
		scriptsPanel,
		costumePanel,
		remixButton,
		projectButton,
		myself = this;
	
	tabs = new TabPanelMorph([new Color(200,100,100), new Color(100,200,100), new Color(100,100,200)]);
	tabs.setPosition(this.titleBar.topRight());
	tabs.setExtent(new Point(800,480));
	
	scriptsPanel = new Morph();
	tabs.addTab("Scripts", scriptsPanel);
	this.scriptsPanel = scriptsPanel;
	
	costumePanel = new Morph();
	tabs.addTab("Costumes", costumePanel);
	this.costumePanel = costumePanel;
	
	this.add(tabs);
	this.tabs = tabs;
}

CropEditorMorph.prototype.createCategories = function () {
	var myself = this;
	
	if (this.categories) {
		this.categories.destroy();
	}
	
	this.categories = new Morph();
	this.categories.color = new Color(100,100,100);//this.groupColor;
	this.categories.silentSetWidth(200);
	this.categories.setPosition(this.scriptsPanel.topLeft());
	
	function addCategoryButton(category) {
        var labelWidth = 75,
            colors = [
                new Color(100,100,100), //myself.frameColor,
                new Color(200, 200, 200), //myself.frameColor.darker(50),
                SpriteMorph.prototype.blockColor[category]
            ],
            button;

        button = new ToggleButtonMorph(
            colors,
            myself, // the IDE is the target
            function () {
                myself.currentCategory = category;
                myself.categories.children.forEach(function (each) {
                    each.refresh();
                });
                myself.refreshPalette(true);
            },
            category[0].toUpperCase().concat(category.slice(1)), // label
            function () {  // query
                return myself.currentCategory === category;
            },
            null, // env
            null, // hint
            null, // template cache
            labelWidth, // minWidth
            true // has preview
        );

        button.corner = 8;
        button.padding = 0;
        button.labelShadowOffset = new Point(-1, -1);
        button.labelShadowColor = colors[1];
        button.labelColor = myself.buttonLabelColor;
        button.fixLayout();
        button.refresh();
        myself.categories.add(button);
        return button;
    }
	
	function fixCategoriesLayout() {
        var buttonWidth = myself.categories.children[0].width(),
            buttonHeight = myself.categories.children[0].height(),
            border = 3,
            rows =  Math.ceil((myself.categories.children.length) / 2),
            xPadding = (myself.categories.width()
                - border
                - buttonWidth * 2) / 3,
            yPadding = 2,
            l = myself.categories.left(),
            t = myself.categories.top(),
            i = 0,
            row,
            col;

        myself.categories.children.forEach(function (button) {
            i += 1;
            row = Math.ceil(i / 2);
            col = 2 - (i % 2);
            button.setPosition(new Point(
                l + (col * xPadding + ((col - 1) * buttonWidth)),
                t + (row * yPadding + ((row - 1) * buttonHeight) + border)
            ));
        });

        myself.categories.setHeight(
            (rows + 1) * yPadding
                + rows * buttonHeight
                + 2 * border
        );
    }
		
	SpriteMorph.prototype.categories.forEach(function (cat) {
		if(!contains(['pen', 'motion', 'lists', 'other', 'sound', 'sensing'], cat)) {
			addCategoryButton(cat);
		}
	});
	fixCategoriesLayout();
	this.scriptsPanel.add(this.categories);
};

CropEditorMorph.prototype.createPalette = function () {
	// assumes the categories have already been created
	var myself = this;
	
	if (this.palette) {
		this.palette.destroy();
	}
	
	this.palette = this.currentSprite.palette(this.currentCategory);
	this.palette.isDraggable = false;
	this.palette.acceptsDrops = true;
	this.palette.contents.acceptsDrops = false;
	
	this.palette.reactToDropOf = function (droppedMorph) {
		if (droppedMorph instanceof DialogBoxMorph) {
			myself.world().add(droppedMorph);
		} else if (droppedMorph instanceof SpriteMorph) {
			myself.removeSprite(droppedMorph);
		} else if (droppedMorph instanceof SpriteIconMorph) {
			droppedMorph.destroy();
			myself.removeSprite(droppedMorph.object);
		} else if (droppedMorph instanceof CostumeIconMorph) {
			myself.currentSprite.wearCustume(null);
			droppedMorph.destroy();
		} else {
			droppedMorph.destroy();
		}
	};
	
	this.palette.setPosition(this.categories.bottomLeft());
	this.palette.setWidth(this.categories.width());
	this.scriptsPanel.add(this.palette);
	this.palette.scrollX(this.palette.padding);
	this.palette.scrollY(this.palette.padding);
};

CropEditorMorph.prototype.createSpriteEditor = function () {
	var scripts = this.currentSprite.scripts,
		myself = this;
		
	scripts.isDraggable = false;
	
	this.spriteEditor = new ScrollFrameMorph(
		scripts,
		null,
		SpriteMorph.prototype.sliderColor
	);
	this.spriteEditor.padding = 10;
	this.spriteEditor.growth = 50;
	this.spriteEditor.isDraggable = false;
	this.spriteEditor.acceptsDrops = false;
	this.spriteEditor.contents.acceptsDrops = true;
	
	scripts.scrollFrame = this.spriteEditor;
	this.spriteEditor.scrollX(this.spriteEditor.padding);
	this.spriteEditor.scrollY(this.spriteEditor.padding);
	
	this.scriptsPanel.add(this.spriteEditor);
}

CropEditorMorph.prototype.createButtons = function() {
	var myself = this,
		buttons,
		saveButton,
		remixButton,
		projectButton;
		
	buttons = new Morph();
	saveButton = new PushButtonMorph(
		null,
		function() {
			console.log("calling myself.saveCrop();");
			myself.saveCrop();
		},
		"Save",
		null,
		null
	);
	remixButton = new PushButtonMorph(
		null,
		function() {
			alert("REMIX");
		},
		"Remix Crop",
		null,
		null
	);
	projectButton = new PushButtonMorph(
		null,
		function() {
			window.location.hash = "/crops/" + myself.currentSprite.id
			console.log("DONE");
			//window.location = baseUrl + "#/crops/" + myself.currentSprite.id;
		},
		"See Crop Page",
		null,
		null
	);
	
	buttons.setWidth(saveButton.width() + remixButton.width() + projectButton.width());
	buttons.setHeight(remixButton.height());
	buttons.add(remixButton);
	buttons.add(projectButton);
	buttons.add(saveButton);
	saveButton.setPosition(new Point(buttons.left(), 0));
	remixButton.setPosition(new Point(buttons.left() + saveButton.width(), 0));
	projectButton.setPosition(new Point(buttons.left() + saveButton.width() + remixButton.width(), 0));
	
	this.add(buttons);
	this.buttons = buttons;
}

CropEditorMorph.prototype.refreshPalette = function (shouldIgnorePosition) {
    var oldTop = this.palette.contents.top();

    this.createPalette();
    this.fixLayout('refreshPalette');
    if (!shouldIgnorePosition) {
        this.palette.contents.setTop(oldTop);
    }
};

CropEditorMorph.prototype.fixLayout = function() {
	console.log("Fixing layout with height " + this.height());
	// variableState
	this.variableState.setHeight(this.height() - this.visualState.height());
	this.variableState.fixLayout();
	
	// tabs
	this.tabs.setExtent( new Point(this.width() - this.titleBar.width(), this.height() ));
	this.tabs.fixLayout();
	
	// buttons
	this.buttons.setPosition(new Point(
		this.width() - this.buttons.width(),
		0
	));
	
	// palette
	this.palette.setHeight(this.scriptsPanel.height() - this.categories.height());
	this.palette.setPosition(this.categories.bottomLeft());
	
	// editor
	this.spriteEditor.setPosition(this.categories.topRight());
	this.spriteEditor.setWidth(this.scriptsPanel.width()-this.categories.right());
	this.spriteEditor.setHeight(this.scriptsPanel.height());
}

CropEditorMorph.prototype.reactToWorldResize = function(rect) {
	this.setPosition(rect.origin);
	this.setExtent(rect.extent());
	this.fixLayout();
};
