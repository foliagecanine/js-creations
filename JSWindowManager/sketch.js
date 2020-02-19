function setup() {
	createCanvas(windowWidth, windowHeight-4);
	//windowMaze();
}

class tab {
	constructor(x,y,w,h,text,fun,canGrow) {
		this.x = x;
		this.y = y;
		this.window = new tabWindow(x,y,w,h,fun,canGrow);
		this.title = text;
		this.tabNum = 0;
		this.tabEnabled = true;
		this.parentTab = null;
		this.numChildrenTabs = 0;
		this.childrenTabs = [];
		this.tabID = tabs.length;
		drawOrder.unshift(tabs.length);
		tabs.push(this);
	}
	move(x,y) {
		this.x = x;
		this.y = y;
		this.window.move(x,y);
		this.childrenTabs.forEach(function(el) {
			el.move(x,y);
		});
	}
	setText(text) {
		this.title = text;
	}
	setTabNum(num) {
		this.tabNum = num;
	}
	draw() {
		stroke(0, 0, 0);
		if (this.tabEnabled) {
			fill(145, 140, 140);
		} else {
			fill(200,200,200);
		}
		rect(this.x+(100 * this.tabNum), this.y, 100, 20);
		textSize(20);
 		fill(0, 0, 0);
		text(this.title, this.x + 4 + (100 * this.tabNum), this.y + 19);
		if (this.window&&this.tabEnabled) {
			this.window.draw();
			this.window.renderWindow(this.window.x,this.window.y+30,this.window.w,this.window.h);
		}
	}
	isClicked() {
		return (mouseX>this.x+(this.tabNum*100))&&(mouseX<this.x+100+(this.tabNum*100))&&(mouseY>this.y)&&(mouseY<this.y+20);
	}
	becomeChild(parentTab) {
		this.x = parentTab.x;
		this.y = parentTab.y;
		this.parentTab = parentTab;
		parentTab.tabEnabled = false;
		this.tabNum = parentTab.numChildrenTabs+1;
		parentTab.numChildrenTabs++;
		parentTab.childrenTabs.push(this);
	}
	enableTab() {
		this.tabEnabled = true;
		this.childrenTabs.forEach(function(el) {
			el.tabEnabled = false;
		});
		if (this.parentTab)
			this.parentTab.tabEnabled = false;
	}
	findTopTab() {
		if (this.parentTab === null)
			return this;
		else
			return this.parentTab;
	}
}

class tabWindow {
	constructor(x,y,w,h,fun,canGrow) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.canGrow = canGrow;
		this.renderWindow = fun;
	}
	draw() {
		stroke(0, 0, 0);
		fill(145, 140, 140);
		rect(this.x, this.y + 20, this.w, this.h);
	}
	move(x,y) {
		this.x = x;
		this.y = y;
	}
	isClicked() {
		return (mouseX>this.x)&&(mouseX<this.x+this.w)&&(mouseY>this.y+20)&&(mouseY<this.y+20+this.h);
	}
	isOnHorizontalEdgeOfWindow() {
		if (!this.canGrow)
			return false;
		return (mouseX<this.x+this.w+5)&&(mouseX>this.x+this.w-5)&&(mouseY<this.y+this.h+25)&&(mouseY>this.y+15);
	}
	isOnVerticalEdgeOfWindow() {
		if (!this.canGrow)
			return false;
		return (mouseX<this.x+this.w+5)&&(mouseX>this.x-5)&&(mouseY<this.y+this.h+25)&&(mouseY>this.y+this.h+15);
	}
}

var windowTemplates = {};
windowTemplates.blank = function() {}
windowTemplates.test = function(x,y,w,h) {
	textSize(12);
	noStroke();
	fill(0,0,0);
	text("Test window",x+2,y+2);
}
windowTemplates.square = function(x,y,w,h) {
	fill("red");
	rect(x+20,y+10,350,350);
}

var drawOrder = [];
var tabs = []
new tab(100,100,400,400,"Test",windowTemplates.square,false);
new tab(500,100,200,200,"Test2",windowTemplates.blank,true);
new tab(500,100,200,200,"Test3",windowTemplates.test,true);
tabs[2].becomeChild(tabs[1]);

moveToFront = function(tabID) {
	var tempOrder = [drawOrder.splice(tabID,1)[0]];
	tabs[tempOrder[0]].findTopTab().childrenTabs.forEach(function(el){
		tempOrder.push(drawOrder.splice(drawOrder.indexOf(el.tabID),1)[0]);
	});
	tempOrder.reverse();
	tempOrder.forEach(function(el){
		drawOrder.unshift(el);
	});
}

var clickLock = false;
var growLockX = false;
var growLockY = false;
var origX;
var origY;
var origTabX;
var origTabY;
mousePressFunctions = []
mousePressed = function() {
	var tabID;
	var tabFound = false;
	for (tabID = 0; tabID < drawOrder.length; tabID++) {
		if (tabs[drawOrder[tabID]].isClicked()) {
			tabFound = true;
			break;
		}
	}
	if (tabFound) {
		origX = mouseX;
		origY = mouseY;
		moveToFront(tabID);
		baseTab().enableTab();
		if (baseTab().parentTab === null) {
			origTabX = baseTab().x;
			origTabY = baseTab().y;
		} else {
			origTabX = baseTab().parentTab.x;
			origTabY = baseTab().parentTab.y;
		}
		clickLock = true;
	} else {
		for (tabID = 0; tabID < drawOrder.length; tabID++) {
			if (tabs[drawOrder[tabID]].window.isOnHorizontalEdgeOfWindow()) {
				moveToFront(tabID);
				origX = mouseX;
				origTabX = baseTab().window.w;
				growLockX = true;
			}
			if (tabs[drawOrder[tabID]].window.isOnVerticalEdgeOfWindow()) {
				moveToFront(tabID);
				origY = mouseY;
				origTabY = baseTab().window.h;
				growLockY = true;
			}
			if (growLockX||growLockY) {
				break;
			}
			if (tabs[drawOrder[tabID]].window.isClicked()) {
				moveToFront(tabID);
				break;
			}
		}
	}
	mousePressFunctions.forEach(function(fun) {
		fun();
	});
	mousePressFunctions = [];
}

baseTab = function() {
	return tabs[drawOrder[0]];
}

mouseReleased = function() {
	clickLock = false;
	growLockX = false;
	growLockY = false;
}

function draw() {
	background(255,255,255);
	if (clickLock) {
		if (baseTab().parentTab === null)
			baseTab().move(Math.max(Math.min(origTabX+(mouseX-origX),windowWidth-(baseTab().findTopTab().window.w)),0),Math.max(Math.min(origTabY+(mouseY-origY),windowHeight-24),0));
		else {
			baseTab().parentTab.move(Math.max(Math.min(origTabX+(mouseX-origX),windowWidth-(baseTab().findTopTab().window.w)),0),Math.max(Math.min(origTabY+(mouseY-origY),windowHeight-24),0));
		}
	}
	if (growLockX) {
		if (baseTab().parentTab === null) {
			baseTab().window.w = Math.max(origTabX+(mouseX-origX),((baseTab().numChildrenTabs+1)*100));
			
			baseTab().childrenTabs.forEach(function(el) {
				el.window.w = Math.max(origTabX+(mouseX-origX),((baseTab().numChildrenTabs+1)*100));
			});
		} else {
			baseTab().window.w = Math.max(origTabX+(mouseX-origX),((baseTab().parentTab.numChildrenTabs+1)*100));
			
			baseTab().parentTab.window.w = Math.max(origTabX+(mouseX-origX),((baseTab().parentTab.numChildrenTabs+1)*100));
			
			baseTab().parentTab.childrenTabs.forEach(function(el) {
				el.window.w = Math.max(origTabX+(mouseX-origX),((baseTab().parentTab.numChildrenTabs+1)*100));
			});
		}
	}
	if (growLockY) {
		baseTab().window.h = origTabY+(mouseY-origY);
		if (!(baseTab().parentTab === null)) {
			baseTab().parentTab.window.h = origTabY+(mouseY-origY);
			baseTab().parentTab.childrenTabs.forEach(function(el) {
				el.window.h = origTabY+(mouseY-origY);
			});
		} else {
			baseTab().childrenTabs.forEach(function(el) {
				el.window.h = origTabY+(mouseY-origY);
			});
		}
	}
	
	for (var i = drawOrder.length-1; i > -1; i--) {
		tabs[drawOrder[i]].draw();
		var differentCursor = false;
		if (tabs[drawOrder[i]].window.isOnHorizontalEdgeOfWindow()) {
			fill(0, 0, 0);
      noStroke();
      triangle(mouseX - 10 - 4, mouseY, mouseX - 10, mouseY + 4, mouseX - 10, mouseY - 4);
      triangle(mouseX - 10 + 20 + 4, mouseY, mouseX - 10 + 20, mouseY + 4, mouseX - 10 + 20, mouseY - 4);
      rect(mouseX - 10, mouseY - 2, 20, 4);
			differentCursor = true;
		}
		if (tabs[drawOrder[i]].window.isOnVerticalEdgeOfWindow()) {
			fill(0, 0, 0);
      noStroke();
      triangle(mouseX, mouseY - 10 - 4, mouseX + 4, mouseY - 10, mouseX - 4, mouseY - 10);
      triangle(mouseX, mouseY - 10 + 20 + 4, mouseX + 4, mouseY - 10 + 20, mouseX - 4, mouseY - 10 + 20);
      rect(mouseX - 2, mouseY - 10, 4, 20);
			differentCursor = true;
		}
		if (!differentCursor) {
			cursor(ARROW);
		} else {
			noCursor();
		}
	}
}