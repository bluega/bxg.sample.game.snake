////////////////////////////////////////////////////////////////////////////////
// Sample - Basic
/*
	Objectives:
		To make a very simple code sample
		Understanding overall game structure of BXG
*/
"Copyright ⓒ 2009-2012 BLUEGA Inc.";
"This sample game source is licensed under the MIT license."

// Object manager for snake
ISnakeManger = {
	onActivate: function(/*Object*/obj, /*Number*/tickId)
	{
		obj.move(obj.data.pos.x*bxg.c.sizeSnake, obj.data.pos.y*bxg.c.sizeSnake);
 		obj.show();
	}
	,onTick: function(/*Object*/obj, /*Number*/tickId)
	{
		obj.move(obj.data.pos.x*bxg.c.sizeSnake, obj.data.pos.y*bxg.c.sizeSnake);
	}
	,onCollision: function(/*Object*/obj, /*Object*/hit)
	{
		if (!obj.data.collision) return;
		
		if (hit.type == 'obj.food'){
			bxg.g.soundEat.play();
			
			IGameManager.putFood(bxg.g.ctlGame);
			IGameManager.addBody(bxg.g.ctlGame);
		}
		else if (hit.type == 'obj.body'){
			IGameManager.restartGame();
		}
	}
	,onOutView: function(/*Object*/obj)
	{
		IGameManager.restartGame();
	}
}

// This control manager, this manager will control main game logic.
IGameManager = {
	onInputEvent: function(/*CControl*/control, /*Object*/evtMap)
	{
		if (evtMap.moveLeft && evtMap.moveLeft.fired && control.data.dX != 1){
			control.data.dX = -1;
			control.data.dY = 0;
		}
		else if (evtMap.moveRight && evtMap.moveRight.fired && control.data.dX != -1){
			control.data.dX = 1;
			control.data.dY = 0;
		}
		else if (evtMap.moveUp && evtMap.moveUp.fired && control.data.dY != 1){
			control.data.dX = 0;
			control.data.dY = -1;
		}
		else if (evtMap.moveDown && evtMap.moveDown.fired && control.data.dY != -1){
			control.data.dX = 0;
			control.data.dY = 1;
		}
	}
	,onTick: function(/*CControl*/control, /*Number*/tickId)
	{
		// Move snake by put the tail into the head position.
		// And, only the head will have collision detection function.
		control.data._pop = control.data.snake.pop();
		
		control.data._pop.data.pos.x = control.data.snake[0].data.pos.x + control.data.dX;
		control.data._pop.data.pos.y = control.data.snake[0].data.pos.y + control.data.dY;
		
		control.data.snake[0].data.collision = false;
		control.data._pop.data.collision = true;
		
		control.data.snake.unshift(control.data._pop);
	}
	,onReset: function(/*CControl*/control)
	{
		var i;
		
		// Cleanup data of previous run by destroying objects.
		// (This is just a simple way, it will be better to just remove from game control and add it again.)
		if(control.data.snake){
			for(i = 0; i < control.data.snake.length; i ++){
				control.data.snake[i].destroy();
			}
			delete control.data.snake;
		}
		
		// Init internal data
		control.data.snake = [];
		control.data.dX = -1; // To Left
		control.data.dY = 0;
		
		// Creating the snake body. Start with 17 nodes in body.
		for(i = 0; i < 17; i ++){
			this.addBody(control, {x:Math.floor(bxg.area.w/2/bxg.c.sizeSnake), y:Math.floor(bxg.area.h/2/bxg.c.sizeSnake)});
		}
		
		this.putFood(control);
	}
	,restartGame: function()
	{
		bxg.g.soundDie.play();
		bxg.game.end();
		bxg.game.run();
	}
	,putFood: function(/*CControl*/control) // Put 
	{
		// Put food in view screen and away 4-grids distance from any snake body.
		
		// Create Food object
		if (!control.data.objFood){
			control.data.objFood = bxg.ObjectFactory.build('obj.food');
			
			control.add(control.data.objFood);
		}
		
		control.data._setFood = false;
		control.data._posFood = control.data._posFood || {x:0, y:0};
		
		while(!control.data._setFood){
			control.data._posFood.x = Math.floor(Math.random()*bxg.area.w/bxg.c.sizeSnake);
			control.data._posFood.y = Math.floor(Math.random()*bxg.area.h/bxg.c.sizeSnake);
			
			if (bxg.Geometry.getDistance(control.data._posFood, control.data.snake[0].data.pos) > 4){
				control.data._setFood = true;
			
				control.data.objFood.move(control.data._posFood.x*bxg.c.sizeSnake, control.data._posFood.y*bxg.c.sizeSnake);

				if (!control.data.objFood.active){
					control.data.objFood.activate();
					control.data.objFood.show();
				}
			}
		}
	}
	,addBody: function(/*CControl*/control, /*Object|undefined*/pos) // Add snake body.
	{
		var obj;
		
		// Create snake body and add to tail.
		control.add(obj = bxg.ObjectFactory.build('obj.body'));
		
		if (pos){
			obj.data.pos = pos;
		}
		else{ // Add to tail
			obj.data.pos = {x:control.data.snake[control.data.snake.length-1].data.pos.x, y:control.data.snake[control.data.snake.length-1].data.pos.y};
		}
		
		obj.activate();
		
		control.data.snake.push(obj);
	}
}

// Main game logic. This will be called after loading of BXG.
/*
	zIndex band of this game
		0: food object
		1: snake object
*/
bxg.onGame = function()
{
	// Configurations
	bxg.c.tick = 280; // in msec
	bxg.c.scrSize = {w:480, h:320}; // game screen size
	bxg.c.sizeSnake = 10; // dimension size of each circle that comprise the snake body
	
	// Initialize BXG engine, aligning in page center
	bxg.init({x:0, y:0, w:bxg.c.scrSize.w, h:bxg.c.scrSize.h},
			 {renderer:'canvas', align:{x:'center', y:'center'}});

 	// Set background color of game world by HTML CSS (This is very simple way to change it)
	// (or it can be done by CImage)
	bxg.playGround.style.backgroundColor = '#aacc99';

	// This game is only for keyboard device
	bxg.game.addInputDevice(new bxg.CKeyDevice(
		{
			moveUp:{key:'keyUp', type:'event'}, moveDown:{key:'keyDown', type:'event'}
			,moveLeft:{key:'keyLeft', type:'event'}, moveRight:{key:'keyRight', type:'event'} 
		}
	));
	
	// Create and register sound effect.(not buffered yet)
	bxg.g.soundEat = new bxg.CSound('sound/beep_eat.mp3', 0, 'sound', 1);
	bxg.g.soundDie = new bxg.CSound('sound/beep_die.mp3', 0, 'sound', 1);

	// Object template to be created by ObjectFactory
	bxg.g.objs = [
		{
			type:'obj.body'
			,imagePath:'imgs/snake'
			,images:{
				snake:{url:'body.png'}
			}
			,info:{
				body:{sprite:['snake']}
			}
			,options:{
				manager:ISnakeManger
				,cdShape:[{rect:{x:0, y:0, w:bxg.c.sizeSnake, h:bxg.c.sizeSnake}}]
				,zIndex:1
			}
		}
		,{
			type:'obj.food'
			,imagePath:'imgs/snake'
			,images:{
				food:{url:'prey.png', sprite:{size:{w:10, h:12}, cols:4, count:4}}
			}
			,info:{
				ready:{sprite:['food1', 'food2', 'food3', 'food4']}
			}
			,options:{
				cdShape:[{rect:{x:0, y:0, w:bxg.c.sizeSnake, h:bxg.c.sizeSnake}}]
				,zIndex:0
			}
		}
	];
	
	// Register object templates to the object factory
	for(var obj = 0; obj < bxg.g.objs.length; obj ++){
		bxg.ObjectFactory.register(bxg.g.objs[obj]);
	}
	
	// Load image resource of ObjectFactory-managed game objects
	bxg.ObjectFactory.load(['obj.body', 'obj.food'], onLoadObjects);
}

function onLoadObjects(/*Number*/loaded, /*Number*/failed)
{
	bxg.g.ctlGame = new bxg.CControl(IGameManager).create();

	// Game start
	bxg.game.init({tick:bxg.c.tick});
	bxg.game.addControl(bxg.g.ctlGame);
	bxg.game.run();
}
