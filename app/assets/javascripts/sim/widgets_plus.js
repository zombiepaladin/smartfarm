/*


    widgets.js
    additional GUI elements for morphic.js

    written by Jens Mönig
    jens@moenig.org

    Copyright (C) 2013 by Jens Mönig

    This file is part of Snap!.

    Snap! is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of
    the License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.


    prerequisites:
    --------------
    needs blocks.js and objects.js


    I. hierarchy
    -------------
    the following tree lists all constructors hierarchically,
    indentation indicating inheritance. Refer to this list to get a
    contextual overview:

    Morph*
		TabPanelMorph
	BoxMorph*
		ControlBarMorph
	TaggleButtonMorph*
		TabMorph

    * from Morphic.js


    II. toc
    -------
    the following list shows the order in which all constructors are
    defined. Use this list to locate code in this document:

    ControlBarMorph
*/

// Global settings /////////////////////////////////////////////////////

/*global TriggerMorph, modules, Color, Point, BoxMorph, radians,
newCanvas, StringMorph, Morph, TextMorph, nop, detect, StringFieldMorph,
HTMLCanvasElement, fontHeight, SymbolMorph, localize, SpeechBubbleMorph,
ArrowMorph, MenuMorph, isString, isNil, SliderMorph, MorphicPreferences,
ScrollFrameMorph*/

modules.widgets_plus = '2014-March-3';

var ControlBarMorph;
var TabMorph;
var TabPanelMorph;

// ControlBarMorph ///////////////////////////////////////

// I am a bar with rounded corners

// ControlBarMorph inherits from BoxMorph:

ControlBarMorph.prototype = new BoxMorph();
ControlBarMorph.prototype.constructor = ControlBarMorph;
ControlBarMorph.uber = BoxMorph.prototype;

// ControlBarMorph preference settings:

ControlBarMorph.corner = 5;

// ControlBarMorph instance creation:

function ControlBarMorph(edge, border, borderColor){
	this.init(edge, border, borderColor);
}

ControlBarMorph.prototype.init = function(edge, border, borderColor) {
	// initialize inherited properties
	ControlBarMorph.uber.init.call(this, edge, border, borderColor);
}

// ControlBarMorph drawing

ControlBarMorph.prototype.outlinePath = function (context, radius, inset) {
    var offset = radius + inset,
        w = this.width(),
        h = this.height();

    // top left:
    context.arc(
        offset,
        offset,
        radius,
        radians(-180),
        radians(-90),
        false
    );
    // top right:
    context.arc(
        w - offset,
        offset,
        radius,
        radians(-90),
        radians(-0),
        false
    );
    // bottom right:
    context.lineTo(
        w - inset,
        h - inset
    );
    // bottom left:
    context.lineTo(
        inset,
        h - inset
    );
};


// TabMorph ///////////////////////////////////////////////////////

// TabMorph inherits from ToggleButtonMorph:

TabMorph.prototype = new ToggleButtonMorph();
TabMorph.prototype.constructor = TabMorph;
TabMorph.uber = ToggleButtonMorph.prototype;

// TabMorph instance creation:

function TabMorph(
    colors, // color overrides, <array>: [normal, highlight, pressed]
    target,
    action, // a toggle function
    labelString,
    query, // predicate/selector
    environment,
    hint
) {
    this.init(
        colors,
        target,
        action,
        labelString,
        query,
        environment,
        hint
    );
}

// TabMorph layout:

TabMorph.prototype.fixLayout = function () {
    if (this.label !== null) {
        this.setExtent(new Point(
            this.label.width()
                + this.padding * 2
                + this.corner * 3
                + this.edge * 2,
            (this.label instanceof StringMorph ?
                        this.label.rawHeight() : this.label.height())
                + this.padding * 2
                + this.edge
        ));
        this.label.setCenter(this.center());
    }
};

// TabMorph action:

TabMorph.prototype.refresh = function () {
    if (this.state) { // bring to front
        if (this.parent) {
            this.parent.add(this);
        }
    }
    TabMorph.uber.refresh.call(this);
};

// TabMorph drawing:

TabMorph.prototype.drawBackground = function (context, color) {
    var w = this.width(),
        h = this.height(),
        c = this.corner;

    context.fillStyle = color.toString();
    context.beginPath();
    context.moveTo(0, h);
    context.bezierCurveTo(c, h, c, 0, c * 2, 0);
    context.lineTo(w - c * 2, 0);
    context.bezierCurveTo(w - c, 0, w - c, h, w, h);
    context.closePath();
    context.fill();
};

TabMorph.prototype.drawOutline = function () {
    nop();
};

TabMorph.prototype.drawEdges = function (
    context,
    color,
    topColor,
    bottomColor
) {
    if (MorphicPreferences.isFlat && !this.is3D) {return; }

    var w = this.width(),
        h = this.height(),
        c = this.corner,
        e = this.edge,
        eh = e / 2,
        gradient;

    nop(color); // argument not needed here

    gradient = context.createLinearGradient(0, 0, w, 0);
    gradient.addColorStop(0, topColor.toString());
    gradient.addColorStop(1, bottomColor.toString());

    context.strokeStyle = gradient;
    context.lineCap = 'round';
    context.lineWidth = e;

    context.beginPath();
    context.moveTo(0, h + eh);
    context.bezierCurveTo(c, h, c, 0, c * 2, eh);
    context.lineTo(w - c * 2, eh);
    context.bezierCurveTo(w - c, 0, w - c, h, w, h + eh);
    context.stroke();
};



// TabPanelMorph ///////////////////////////////////////

// I am a panel that allows you to tab through multiple morphs

// TabPanelMorph inherits from Morph:

TabPanelMorph.prototype = new Morph();
TabPanelMorph.prototype.constructor = TabPanelMorph;
TabPanelMorph.uber = Morph.prototype;

// TabPanelMorph instance creation:

function TabPanelMorph(tabColor){
	this.init(tabColor);
};

// The initialize function.
TabPanelMorph.prototype.init = function(tabColors) {
	var myself = this;
	
	// initialize inherited properties
	TabPanelMorph.uber.init.call(this);
	
	// add / modify properties
	this.currentTab = 'description';
	this.colors = tabColors;
	this.TabHeight = 30;
	
	// collections of tabs and panels.
	this.tabs = []
	this.panels = [];
	
	// display morphs.
	this.tabBar = null;
	this.displayPanel = null;
	
	
	// create layout
	this.createTabBar();
	this.createDisplayPanel();
};

// Create the tab bar.
TabPanelMorph.prototype.createTabBar = function() {
	
	// check if there is already a tab bar
	if (this.tabBar) {
		this.tabBar.destroy();
	}
	
	// create a new tab bar
	this.tabBar = new Morph();
	
	// assign color property to tab bar.
	this.tabBar.color = this.colors[0];
	
	// add the tab bar to the TabPanelMorph
	this.add(this.tabBar);
};

// Create the display panel
TabPanelMorph.prototype.createDisplayPanel = function() {
	
	// check if there is already a displayPanel
	if (this.displayPanel) {
		this.displayPanel.destroy();
	}
	
	// create a new morph for the panel area
	this.displayPanel = new Morph();

	// assign the color property
	this.displayPanel.color = this.colors[2];

	// add the display panel to the TabPanelMorph
	this.add(this.displayPanel);
};

// Arrange the layout.
TabPanelMorph.prototype.fixLayout = function() {
	var buttonHeight = this.TabHeight,
		border = 3,
		l = this.left(),
		t = 0,
		i = 0,
		myself = this;
		
	
	// tab bar layout
	this.tabBar.setWidth( this.width() );
	this.tabBar.setHeight( this.tabs[0].height() ) || 15; // 15 is pretty close. incase there arn't any tabs in this yet.
	this.tabBar.setPosition( this.position() );
	
	
	// display panel layout
	this.displayPanel.setWidth(this.width() );
	this.displayPanel.setHeight(this.height() - this.tabBar.height() );
	this.displayPanel.setPosition( this.tabBar.bottomLeft() );

	// tabs on the tab bar.
	this.tabs.forEach(function (tab) {
		i += 1;
		if(l + border + tab.width() > myself.tabBar.width()) {
			//t += tab.height() + 2 * border;
			l = myself.tabBar.left();
		}
		
		t = myself.tabBar.bottomLeft().asArray()[1] - tab.height();
		
		tab.setPosition( new Point( l + border, t) );
		console.log(t);
		l += myself.tabs[i-1].width() + 2 * border;
		
	});
	
	// the display panels
	this.tabs.forEach( function(tab) {
		myself.panels[tab.name].setPosition( myself.displayPanel.position().add( new Point(border, border) ) );
		myself.panels[tab.name].setExtent( myself.displayPanel.extent().subtract( new Point( 2*border, 2*border ) ) );
	});
	this.outlineTabPanel();

}

// Add new tab to the collection.
TabPanelMorph.prototype.addTab = function(tabName, panelMorph) {
	var	myself = this;
	var tab;
	
	// TODO: check for duplicate tab. 
	
	// create new tab
	tab = new TabMorph(
		[															// color <array>: [normal, highlight, pressed]
			this.colors[1],
			this.colors[1].lighter(45),
			this.colors[2]
		],    											
		this.tabBar,    											// tab bar
		function () {											    // action
			myself.currentTab = tabName;
			myself.tabs.forEach( function (each) { each.refresh(); } );			
			myself.reactToTabSelect(tabName);
		}, 			 
		tabName[0].toUpperCase().concat(tabName.slice(1)),			// labelString
		function () { return myself.currentTab === tabName; },		// query		 			 
		null,            											// enviroment
		null             											// hint
	);
	
	// set up tab properties.
	tab.corner = 5;
	tab.edge = 1; // controls the edge line thickness.
	
	tab.drawEdges = function(
							context,    // context to the canvas
							color, 		// primary color
							topColor,   // top color
							bottomColor // bottom color
							) {
		if (MorphicPreferences.isFlat && !this.is3D) {return; }

		var w = this.width(),
			h = this.height(),
			c = this.corner,
			e = this.edge,
			eh = e / 2,
			gradient;

		nop(color); // argument not needed here

		context.lineCap = 'round';
		context.lineWidth = e;

		context.beginPath();
		context.moveTo(0, h + eh);
		context.bezierCurveTo(c, h, c, 0, c * 2, eh);
		context.lineTo(w - c * 2, eh);
		context.bezierCurveTo(w - c, 0, w - c, h, w, h + eh);
		context.stroke();
	};
		
	tab.fixLayout();
	tab.refresh();
	
	// add tab to the tabBar.
	this.tabBar.add(tab);
	
	this.displayPanel.add(panelMorph);
	if (this.currentTab !== tabName) {
		panelMorph.hide();
	}
	tab.name = tabName;
	this.tabs.push(tab);
	this.panels[tabName] = panelMorph;
	
	
	// set as current tab if this is the first one added
	if(this.tabs.length === 1) this.currentTab = tabName;
	
	this.fixLayout();
};

// this function is the response to a tab being selected.
TabPanelMorph.prototype.reactToTabSelect = function(tabName) {
	var myself = this;
	this.tabs.forEach( function(tab) {
		if(tab.name !== tabName) {
			myself.panels[tab.name].hide();
			tab.color = myself.colors[1] // the color of the unselected tab
		} else {
			myself.currentTab = tabName;
			tab.color = myself.colors[2]; // same as the selected panel
			myself.panels[tab.name].show();
			myself.outlineTabPanel();
		}
	});
}

TabPanelMorph.prototype.outlineTabPanel = function() {
	
	var myself = this;
	var curTab = null;
	var tabName = this.currentTab;
	
	this.tabs.forEach( function(tab) {
	
		if(tab.name === tabName) {
			curTab = tab;
		}
	});

	// get the top-most canvas to draw on.
	this.image = newCanvas(this.displayPanel.extent());  
	var context = this.displayPanel.image.getContext('2d');
	
	var x1 = 0;
	var	y1 = 0;
	var	x2 = curTab.bottomLeft().asArray()[0] - this.topLeft().asArray()[0];
	var	x3 = curTab.width()+x2;
	var	x4 = this.displayPanel.width();
	var	y2 = this.displayPanel.height();
	
	
	/*
	(x1,y1)--------(x2,y1)  "tab"   (x3,y1)------(x4,y1)
	|                                                  |
	|                                                  |
	|                                                  |
	|                                                  |
	(x1,y2)--------------------------------------(x4,y2)
	*/
	
	context.strokeStyle = ( new Color(0,0,0) ).toString();
	context.lineWidth = 1;
	
	context.beginPath();
	context.moveTo(x3,y1);
	context.lineTo(x4,y1);
	context.lineTo(x4,y2);
	context.lineTo(x1,y2);
	context.lineTo(x1,y1);
	context.lineTo(x2,y1);
	context.stroke();
	
	context.strokeStyle = this.displayPanel.color.toString();
	context.lineWidth = 5;
	context.beginPath();
	context.moveTo(x2,y1);
	context.lineTo(x3,y1);
	context.stroke();
	
};


TabPanelMorph.prototype.show = function() {

	TabPanelMorph.uber.show.call(this);
	
	this.reactToTabSelect(this.currentTab);
	
};


