import Phaser from 'phaser'

export default class HelloWorldScene extends Phaser.Scene {
	constructor() {
		super('hello-world')
		this.lines = [];
	}

	redrawLines(graphics) {
		graphics.clear();
		this.lines.forEach(line => {
			graphics.lineStyle(line.width, line.color);
			graphics.strokeLineShape(line.line);
		});
	}	


	preload() {
		// this.load.setBaseURL('https://labs.phaser.io')

		this.load.image('sky', 'assets/skies/space3.png')
		this.load.image('logo', 'assets/sprites/phaser3-logo.png')
		this.load.image('red', 'assets/particles/red.png')
		this.load.image('arrow', 'assets/sprites/arrow.png')
		this.load.image('button', 'assets/sprites/button.png')
		this.load.image('green_bar', 'assets/sprites/green_bar.png')
		this.load.image('red_bar', 'assets/sprites/red_bar.png')
	}

	create() {
		this.add.image(400, 300, 'sky')

		// add a green Line, at corners, 2 per corner, 1 horizontal, 1 vertical, each single line lenght should be 30% of height or width
		const GameWidth = parseInt(this.game.config.width.toString())
		const GameHeight = parseInt(this.game.config.height.toString())

		const topLeftHorizontalLine = new Phaser.Geom.Line(0, 0, GameWidth * 0.3, 0);
		const topLeftVerticalLine = new Phaser.Geom.Line(0, 0, 0, GameHeight * 0.3);
		const topRightHorizontalLine = new Phaser.Geom.Line(GameWidth * 0.7, 0, GameWidth, 0);
		const topRightVerticalLine = new Phaser.Geom.Line(GameWidth, 0, GameWidth, GameHeight * 0.3);
		const bottomLeftHorizontalLine = new Phaser.Geom.Line(0, GameHeight * 0.7, GameWidth * 0.3, GameHeight * 0.7);
		const bottomLeftVerticalLine = new Phaser.Geom.Line(0, GameHeight * 0.7, 0, GameHeight);
		const bottomRightHorizontalLine = new Phaser.Geom.Line(GameWidth * 0.7, GameHeight, GameWidth, GameHeight);
		const bottomRightVerticalLine = new Phaser.Geom.Line(GameWidth, GameHeight * 0.7, GameWidth, GameHeight);

		const shooterLineLength = 120;
		const randomAngle = Phaser.Math.RND.angle();

		const line = new Phaser.Geom.Line();
		const logo = this.physics.add.image(400, 100, 'logo')
		logo.setBounce(1, 1)
		logo.body.setCollideWorldBounds(true, 1, 1,);
		logo.body.onWorldBounds = true;

		Phaser.Geom.Line.SetToAngle(line, logo.x, logo.y, randomAngle, shooterLineLength);

		

		// width of each line should be 10	
		const graphics = this.add.graphics();
		graphics.lineStyle(1500, 0x00ff00);
		graphics.strokeLineShape(topLeftHorizontalLine);

		const demoLine = new Phaser.Geom.Line(0, 0, 100, 100);
		graphics.lineStyle(200, 0xff0000);
		graphics.strokeLineShape(demoLine);








		const arrow = this.add.image(line.x2, line.y2, 'arrow');
		arrow.setRotation(randomAngle);

		// set stroke of line to red 2 pixels wide
		
		graphics.lineStyle(2, 0xff0000);
		graphics.strokeLineShape(line);

		arrow.setDepth(1);

		// set arrow as draggable
		arrow.setInteractive();
		this.input.setDraggable(arrow);

		// set arrow to be dragged
		this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
			// on drag, only allow arrow to be moved in a circle with the same distance from the logo, basically just rotate the arrow around the center of the line
			const angle = Phaser.Math.Angle.Between(logo.x, logo.y, dragX, dragY);
			Phaser.Geom.Line.SetToAngle(line, logo.x, logo.y, angle, lineLength);
			arrow.x = line.x2;
			arrow.y = line.y2;
			arrow.setRotation(angle);
			// graphics.clear();
			graphics.lineStyle(2, 0xff0000);
			graphics.strokeLineShape(line);
		});

		const baseSpeed = 150;
		const speedInc = 15;
		let incrementCount = 0;

		// add a fixed button, TEXT, x width - 50, y 0+50, text start, text next to it number
		const button = this.add.text(750, 50, 'Start', { fill: '#0f0' });
		button.setInteractive();
		const recentCounter = this.add.text(750, 100, 'Ready in 3', { fill: '#0f0' });

		// button.setInteractive();
		// on button click, set the velocity of the logo to 100, but in the direction of the arrow, and change the text of the button to stop
		// on button click again, set the velocity of the logo to 0, and change the text of the button to start

		this.recent = 0;

		function goInDirection() {
			console.log('this.recent', this.recent);
			// if (this.recent && this.recent < 3) {
			// 	return;
			// }

			if(this.recent && this.recent < (incrementCount / 5)) {
				return;
			}
			this.recent = 0;
			recentCounter.setText("Ready in 3");
			console.log('pointerdown');
			// if (logo.body.velocity.x === 0 && logo.body.velocity.y === 0) {
			const speed = baseSpeed + (incrementCount * speedInc);
			incrementCount += 1;
			const angle = arrow.rotation;
			const [x, y] = [Math.cos(angle) * speed, Math.sin(angle) * speed];
			console.log('angle', angle);
			console.log('x', x);
			console.log('y', y);
			logo.setVelocity(x, y);

			// button.setText('Stop');
			// } else {
			// 	logo.setVelocity(0, 0);
			// 	// button.setText('Start');
			// }
		}

		button.on('pointerdown', goInDirection.bind(this));

		// on press spacebar, also go in direction
		const spacebar = this.input.keyboard.addKey('SPACE');
		spacebar.on('down', goInDirection.bind(this));

		// add cursors and left right should rotate arrow clockwise and counter clockwise
		const cursors = this.input.keyboard.createCursorKeys();
		cursors.left.onDown = function () {
			arrow.angle -= 5;
		}
		cursors.right.onDown = function () {
			arrow.angle += 5;
		}


		const speed = 200;
		const angle = Phaser.Math.RND.angle();
		const [x, y] = [Math.cos(angle) * speed, Math.sin(angle) * speed];
		console.log('angle', angle);
		console.log('x', x);
		console.log('y', y);
		logo.setVelocity(x, y);

		this.graphics = graphics;
		this.logo = logo;
		this.line = line;
		this.arrow = arrow;

		// on logo collide to bound, call a function
		this.physics.world.on('worldbounds', function (body) {
			console.log('worldbounds');
			incrementCount += 1;
			this.recent += 1;
			recentCounter.setText(
				this.recent < 3 ? ("Ready in " + (3 - this.recent).toString()) : "Ready"
			)
		}, this);

	}

	update() {
		// Get the previous line
		// update the lines center X and Y to be the logos X and Y
		const previousLine = this.graphics;
		const logo = this.logo;
		const line = this.line;

		// console.log('line.x1', line.x1);
		// console.log('line.x2', line.x2);
		// console.log('line.y1', line.y1);
		// console.log('line.y2', line.y2);

		const arrow = this.arrow;
		const angle = arrow.rotation;
		Phaser.Geom.Line.SetToAngle(line, logo.x, logo.y, angle, 120);
		arrow.x = line.x2;
		arrow.y = line.y2;
		arrow.setRotation(angle);

		// previousLine.clear();
		previousLine.lineStyle(2, 0xff0000);
		previousLine.strokeLineShape(line);

	}




}
