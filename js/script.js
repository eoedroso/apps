	window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame  ||
        window.mozRequestAnimationFrame     ||
        window.oRequestAnimationFrame       ||
        window.msRequestAnimationFrame      ||
        function ( /* function */ callback, /* DOMElement */ element) {
            window.setTimeout(callback, 1000 / 60);
        };
})();
arrayRemove = function (array, from) {
    var rest = array.slice((from) + 1 || array.length);
    array.length = from < 0 ? array.length + from : from;
    return array.push.apply(array, rest);
};
var game = (function () {

    // Global vars
    var canvas, ctx, buffer, bufferctx, gameloop, fps = 34,
        bgMain, bgMain2, bgSpeed = 2,
        shots = [],      //Array of shots
        keyPressed = {}, // No es necesario iniciar todas las posiblidades a false.
        nextShootTime = 0,
        shotDelay = 100,
        currentTime = 0;

    function loop() {
        update();
        draw();
    }

    function extend(destination, source) {
        for (var property in source)
            destination[property] = source[property];
        return destination;
    }

    function init() {

  
        //Obtenemos el elemento con el que vamos a trabajar
        canvas = document.getElementById('canvas');
        ctx = canvas.getContext("2d");

        // Buffering
        buffer = document.createElement('canvas');
        buffer.width = canvas.width;
        buffer.height = canvas.height;
        bufferctx = buffer.getContext('2d');
        // Load resources
        // Background pattern
        bgMain = new Image();
        bgMain.src = 'images/landscape.png';
        bgMain.posX = canvas.width;

        bgMain2 = new Image();
        bgMain2.src = 'images/landscape.png';
        bgMain2.posX = 0;
		
		iniciaHammer();
        
		player = new Player
        enemy = new Enemy
	
        // Gameloop
        var anim = function () {
            loop();
            requestAnimFrame(anim);
        };
        anim();
    }

    function iniciaHammer () {
		var zona = document.getElementById('canvas');
		var hammertime = new Hammer(zona);

		hammertime.on('doubletap', function(ev) {
			playerAction(ev);
		});

		hammertime.on('press', function(ev) {
		//mirar si press es hacia abajo o hacia arriba
		if(ev.press){
			alert("ev. press ");
		}
		if (ev.pressup){
			alert("ev. press up");
		}
			playerAction(ev);
		});
		
		hammertime.on('swipe', function(ev) {
			playerAction(ev);
		});
	}


    function Player(player) {
        player = new Image();
        player.src = 'images/ship.png';
        player.posX = 30; // Dedault X position
        player.posY = (canvas.height / 2) - (player.height / 2); // Default Y posiion
        player.speed = 5;

        player.fire = function () {
            if (nextShootTime < currentTime || currentTime == 0) {
                shot = new Shot(this, player.posX + 45, player.posY + 23, 5);
                shot.add();
                currentTime += shotDelay;
                nextShootTime = currentTime + shotDelay;
            } else {
                currentTime = new Date().getTime();
            }
        }
        return player;
    }

    function Shot(shot, _x, _y, _speed) {
        shot = new Image();
        shot.src = 'images/shot.png'; //12x12
        shot.posX = _x;
        shot.posY = _y;
        shot.speed = _speed;
        shot.id = 0;
        shot.time = new Date().getTime();
        shot.add = function () {
            shots.push(shot);
        }
        shot.del = function (id) {
            arrayRemove(shots, id);
        }
        return shot;
    }

    function Enemy(enemy, _x, _y) {
        enemy = new Image();
        enemy.src = 'images/enemy.png'; //128x128
        enemy.posX = canvas.width - enemy.width;
        enemy.posY = canvas.height / 2 - enemy.width / 2;
        enemy.life = 5; //5 hits
        enemy.backToLife = function () {
            this.life = 5;
            this.posY = Math.floor(Math.random() * (canvas.height - this.height));
            this.posX = Math.floor(Math.random() * (canvas.width - this.width - player.width)) + player.width;
        }
        return enemy;
    }

    function checkCollisions(shot) {
        if (shot.posX >= enemy.posX && shot.posX <= (enemy.posX + enemy.width)) {
            if (shot.posY >= enemy.posY && shot.posY <= (enemy.posY + enemy.height)) {
                (enemy.life > 1) ? enemy.life-- : enemy.backToLife();
                shot.del(parseInt(shot.id, 10));
                return false;
            }
        }
        return true;
    }

    /**
     * Scroll Background
     * @param {obj} layers An oject with the backgounds to slide and the speed.
     * @returns none
     */
    var scrollBackground = function (layers) {
        var settings = {
            speed: bgSpeed,
            source: []
        };
        extend(settings, layers);

        for (var x = 0, i = settings.source.length; x < i; x++) {
            settings.source[x].posX -= settings.speed;
            if (settings.source[x].posX > -(settings.source[x].width)) {
               bufferctx.drawImage(settings.source[x], settings.source[x].posX, 0);

            } else {
                settings.source[x].posX = settings.source[x].width - (canvas.width / 380) - 600;
            }
        }
    }

    function playerAction(ev) {
		if (ev != null){
			if(ev.type=='press'){
				if (ev.deltaY > player.posY && player.posY > 5){
					//subir
					player.posY -= player.speed;
				}
				if (ev.deltaY < player.posY  && player.posY < (canvas.height - player.height - 5)){
					//bajar
					player.posY += player.speed;
				}		
			}
			//retroceso
			if (ev.direction==2 && player.posX > 5)
				player.posX -= player.speed;
			//avance
			if (ev.direction==4 && player.posX < (canvas.width - player.width - 5))
				player.posX += player.speed;
			//disparo
			if (ev.type=='doubletap')
				player.fire();
			//mas velicidad
			if (keyPressed.speedUp && bgSpeed < 10) {
				bgSpeed += 1;
				console.log(bgSpeed);
			}
			//menos velocidad
			if (keyPressed.speedDown && bgSpeed >= 2) {
				bgSpeed -= 1;
				console.log(bgSpeed);
			}
		}
	}

    /**
     * CrossBrowser implementation for a Event Listener
     */
    function addListener(element, type, expression, bubbling) {
        bubbling = bubbling || false;

        if (window.addEventListener) { // Standard
            element.addEventListener(type, expression, bubbling);
        } else if (window.attachEvent) { // IE
            element.attachEvent('on' + type, expression);
        } else return false;
    }

    
    function keyUp(e) {
       // var key = (window.event ? e.keyCode : e.which);
	   		
        for (var inkey in keyMap) {
            if (e === keyMap[inkey]) {
                e.preventDefault();
                keyPressed[inkey] = false;
            }
        }
    }

    function draw() {
        ctx.drawImage(buffer, 0, 0);
    }

    function update() {
        scrollBackground({
            source: [bgMain, bgMain2]
        });

        bufferctx.drawImage(player, player.posX, player.posY);
        bufferctx.drawImage(enemy, enemy.posX, enemy.posY);

        for (var x = 0, y = shots.length; x < y; x++) {
            var shot = shots[x];
            if (shot) {
                shot.id = x;
                if (checkCollisions(shot)) {
                    if (shot.posX <= canvas.width) {
                        shot.posX += shot.speed;
                        bufferctx.drawImage(shot, shot.posX, shot.posY);
                    } else {
                        shot.del(parseInt(shot.id, 10));
                    }
                }
            }
        }
        playerAction();
    }

    // Public Methods
    return {
        init: init
    }
	
})();
