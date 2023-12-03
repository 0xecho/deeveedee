import Phaser from "phaser";

const BOUNCES_PER_LEVEL = 9;
let UPDATE_THRESHOLD_MEMORY = 0;
const SPEED_INCREMENTS = 15;

const TINT_COLOR_CYCLE = [
  0xff8000, 0xffff00, 0x00ff00, 0x00ffff, 0x0000ff, 0x8000ff, 0xff0000,
];

function updateleaderboard(leaderboard) {
  const sortedLeaderboard = leaderboard.sort((a, b) => {
    if (a.max_credit === b.max_credit) {
      return a.time_survived > b.time_survived ? -1 : 1;
    }
    return a.max_credit > b.max_credit ? -1 : 1;
  });

  const leaderboardTable = document.getElementById("leaderboard-table-body");
  leaderboardTable.innerHTML = "";
  sortedLeaderboard.forEach((row) => {
    const tr = document.createElement("tr");
    const name = document.createElement("td");
    name.innerText = row.name;
    const time = document.createElement("td");
    time.innerText = row.time_survived;
    const credit = document.createElement("td");
    credit.innerText = row.max_credit;
    tr.appendChild(name);
    tr.appendChild(time);
    tr.appendChild(credit);
    leaderboardTable.appendChild(tr);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  fetch("https://deeveedee-leaderboard-dev-zgtq.2.us-1.fl0.io/leaderboard", {
    method: "GET",
  })
    .then((res) => res.json())
    .then((res) => {
      updateleaderboard(res.leaderboard);
    });
});

export default class HelloWorldScene extends Phaser.Scene {
  constructor() {
    super("hello-world");
  }

  _get_score_delta(x, y) {
    const GameWidth = parseInt(this.game.config.width.toString());
    const GameHeight = parseInt(this.game.config.height.toString());
    const badBorderLines = this.lines.filter(
      (line) => line.isBorder && line.name.length === 2
    );
    const goodBorderLines = this.lines.filter(
      (line) => line.isBorder && line.name.length === 3
    );

    const goodBorderLine = goodBorderLines.find((line) => {
      const endX = line.startX + line.length * Math.cos(line.angle);
      const endY = line.startY + line.length * Math.sin(line.angle);
      if (
        Math.abs(line.startX - endX) < 0.005 &&
        Math.abs(line.startX - x) < 0.005
      ) {
        const yInside =
          Math.min(line.startY, endY) < y && y < Math.max(line.startY, endY);
        return yInside;
      }
      if (
        Math.abs(line.startY - endY) < 0.005 &&
        Math.abs(line.startY - y) < 0.005
      ) {
        const xInside =
          Math.min(line.startX, endX) < x && x < Math.max(line.startX, endX);
        return xInside;
      }
    });
    if (goodBorderLine !== undefined) {
      const closestX = goodBorderLine.startX < GameWidth / 2 ? 0 : GameWidth;
      const closestY = goodBorderLine.startY < GameHeight / 2 ? 0 : GameHeight;

      // return a scaled 10-30, based on how close x,y is to closestX, closestY
      const diffX = Math.abs(closestX - x);
      const diffY = Math.abs(closestY - y);

      const scaleX = diffX / goodBorderLine.length;
      const scaleY = diffY / goodBorderLine.length;

      const scale = Math.max(scaleX, scaleY);

      const score = 10 + 20 * (1 - scale);
      return score;
    }

    const badBorderLine = badBorderLines.find((line) => {
      const endX = line.startX + line.length * Math.cos(line.angle);
      const endY = line.startY + line.length * Math.sin(line.angle);
      if (
        Math.abs(line.startX - endX) < 0.005 &&
        Math.abs(line.startX - x) < 0.005
      ) {
        const yInside =
          Math.min(line.startY, endY) < y && y < Math.max(line.startY, endY);
        return yInside;
      }
      if (
        Math.abs(line.startY - endY) < 0.005 &&
        Math.abs(line.startY - y) < 0.005
      ) {
        const xInside =
          Math.min(line.startX, endX) < x && x < Math.max(line.startX, endX);
        return xInside;
      }
    });
    if (badBorderLine !== undefined) {
      return -20;
    }

    return 0;
  }

  getBadBorderLines({ GameWidth, GameHeight, length = 0.4 }) {
    ["LU", "LD", "TL", "TR", "RU", "RD", "BL", "BR"].forEach((name, idx) => {
      this.lines.push({
        isBorder: true,
        name,
        startX: [
          0,
          0,
          GameWidth / 2,
          GameWidth / 2,
          GameWidth,
          GameWidth,
          GameWidth / 2,
          GameWidth / 2,
        ][idx],
        startY: [
          GameHeight / 2,
          GameHeight / 2,
          0,
          0,
          GameHeight / 2,
          GameHeight / 2,
          GameHeight,
          GameHeight,
        ][idx],
        length: [
          (GameHeight * length) / 2,
          (GameHeight * length) / 2,
          (GameWidth * length) / 2,
          (GameWidth * length) / 2,
          (GameHeight * length) / 2,
          (GameHeight * length) / 2,
          (GameWidth * length) / 2,
          (GameWidth * length) / 2,
        ][idx],
        angle: [
          -Math.PI / 2,
          Math.PI / 2,
          -Math.PI,
          0,
          -Math.PI / 2,
          Math.PI / 2,
          -Math.PI,
          0,
        ][idx],
        width: 10,
        color: 0xff0000,
      });
    });
  }

  getGoodBorderLines({ GameWidth, GameHeight, length = 0.3 }) {
    ["TLH", "TLV", "TRH", "TRV", "BLH", "BLV", "BRH", "BRV"].forEach(
      (name, idx) => {
        this.lines.push({
          isBorder: true,
          name,
          startX: [0, 0, GameWidth, GameWidth, 0, 0, GameWidth, GameWidth][idx],
          startY: [0, 0, 0, 0, GameHeight, GameHeight, GameHeight, GameHeight][
            idx
          ],
          length: [
            (GameWidth * length) / 2,
            (GameHeight * length) / 2,
            (GameWidth * length) / 2,
            (GameHeight * length) / 2,
            (GameWidth * length) / 2,
            (GameHeight * length) / 2,
            (GameWidth * length) / 2,
            (GameHeight * length) / 2,
          ][idx],
          angle: [
            0,
            Math.PI / 2,
            -Math.PI,
            Math.PI / 2,
            0,
            -Math.PI / 2,
            Math.PI,
            -Math.PI / 2,
          ][idx],
          width: 14,
          color: 0x00ff00,
        });
      }
    );
  }

  redrawLines(graphics, badBorderLength, goodBorderLength) {
    graphics.clear();

    this.lines = this.lines.filter((line) => !line.isBorder);

    this.getGoodBorderLines({
      GameWidth: parseInt(this.game.config.width.toString()),
      GameHeight: parseInt(this.game.config.height.toString()),
      length: goodBorderLength ?? 0.3,
    });

    this.getBadBorderLines({
      GameWidth: parseInt(this.game.config.width.toString()),
      GameHeight: parseInt(this.game.config.height.toString()),
      length: badBorderLength ?? 0.4,
    });

    this.lines.forEach((line) => {
      graphics.lineStyle(line.width, line.color, line?.alpha);
      const _line = new Phaser.Geom.Line();
      _line.setTo(
        line.startX,
        line.startY,
        line.startX + line.length * Math.cos(line.angle),
        line.startY + line.length * Math.sin(line.angle)
      );
      graphics.strokeLineShape(_line);
    });
  }

  _get_speed(baseSpeed, incrementCount, speedIncrements, credit) {
    const normalizedCredit = Math.log2(credit ? credit : 1);
    return Math.min(
      baseSpeed + incrementCount * speedIncrements + normalizedCredit * 10,
      1000
    );
  }

  _get_ready_threshold(incrementCount) {
    const new_ready_threshold = Math.min(
      Math.floor(incrementCount / BOUNCES_PER_LEVEL) + 1,
      4
    );
    if (new_ready_threshold !== UPDATE_THRESHOLD_MEMORY) {
      UPDATE_THRESHOLD_MEMORY = new_ready_threshold;
      this._show_level_up();
    }
    return new_ready_threshold;
  }

  /**
   *
   * @param {integer} incrementCount
   * @param {integer} recentCollisionCount
   * @returns
   */
  _get_ready_time(recentCollisionCount, incrementCount) {
    return Math.max(
      this._get_ready_threshold(incrementCount) - recentCollisionCount,
      0
    );
  }

  _show_level_up() {
    const GameWidth = parseInt(this.game.config.width.toString());
    const GameHeight = parseInt(this.game.config.height.toString());
    // const level_up = this.add.rectangle(
    //   GameWidth / 2,
    //   GameHeight / 2,
    //   GameWidth,
    //   GameHeight,
    //   0xffa500,
    //   0.2
    // );
    // level_up.setDepth(3);

    // setTimeout(() => {
    //   level_up.destroy();
    // }, 2000);
    this.graphics.lineStyle(10, 0xffa500, 0.2);
    this.graphics.strokeRect(0, 0, GameWidth, GameHeight);
  }

  preload() {
    this.load.image("sky", "assets/skincrementCounties/space3.png");
    this.load.image("logo", "assets/sprites/logo.png");
    this.load.image("red", "assets/particles/red.png");
    this.load.image("arrow", "assets/sprites/arrow.png");
    this.load.image("button", "assets/sprites/button.png");
    this.load.image("green_bar", "assets/sprites/green_bar.png");
    this.load.image("red_bar", "assets/sprites/red_bar.png");
    this.load.image("hit_marker", "assets/sprites/hitmarker.png");
  }

  create() {
    this.cameras.main.setBackgroundColor("#222222");

    let that = this;
    this.started = false;
    this.paused = false;
    this.gameOver = false;
    const graphics = this.add.graphics();
    this.graphics = graphics;

    this.credit = 100;
    this.max_credit = -1;
    this.start_time = null;

    const GameWidth = parseInt(this.game.config.width.toString());
    const GameHeight = parseInt(this.game.config.height.toString());

    this.goodBorderLength = 0.79;
    this.badBorderLength = 0.19;

    this.goodBorderThreshold = 0.25;
    this.badBorderThreshold = 0.7;
    this.desiredSteps = 75;
    this.goodUpdateRate =
      (this.goodBorderLength - this.goodBorderThreshold) / this.desiredSteps;
    this.badUpdateRate =
      (this.badBorderThreshold - this.badBorderLength) / this.desiredSteps;

    this.updateCredit = function (delta) {
      console.log("delta", delta);
      that.credit += delta;
      that.max_credit = Math.max(that.max_credit, that.credit);
      that.creditText.setText(
        `Credit: ${that.credit.toFixed(2)} (${delta >= 0 ? "+" : "-"}${Math.abs(
          delta
        ).toFixed(2)})`
      );
    };

    this.updateBorders = function () {
      this.goodBorderLength = Math.max(
        that.goodBorderLength - that.goodUpdateRate,
        that.goodBorderThreshold
      );
      that.badBorderLength = Math.min(
        that.badBorderLength + that.badUpdateRate,
        that.badBorderThreshold
      );
      that.redrawLines(graphics, that.badBorderLength, that.goodBorderLength);
    };

    this.lines = [];

    this.hit_marker = this.physics.add.image(-50, -50, "hit_marker");
    const logo = this.physics.add.image(400, 100, "logo");
    logo.setTintFill(
      TINT_COLOR_CYCLE[0],
      TINT_COLOR_CYCLE[0],
      TINT_COLOR_CYCLE[0],
      TINT_COLOR_CYCLE[0]
    );
    const line = new Phaser.Geom.Line();

    this.logo = logo;

    logo.setDepth(-1);
    logo.setBounce(1, 1);
    logo.body.setCollideWorldBounds(true, 1, 1);
    logo.body.onWorldBounds = true;

    const shooterLineLength = 120;

    const initialAngle = Phaser.Math.Angle.Between(logo.x, logo.y, 0, 0);
    Phaser.Geom.Line.SetToAngle(
      line,
      logo.x,
      logo.y,
      initialAngle,
      shooterLineLength
    );
    this.lines.push({
      name: "shooter",
      startX: logo.x,
      startY: logo.y,
      length: shooterLineLength,
      angle: initialAngle,
      width: 25,
      color: 0x00ee00,
      alpha: 0.2,
    });

    const arrow = this.add.image(line.x2, line.y2, "arrow");

    this.arrow = arrow;
    arrow.setRotation(initialAngle);
    arrow.setDepth(2);
    arrow.setInteractive();
    arrow.setAlpha(0.7, 0.7, 0.7, 0.7);

    this.redrawLines(graphics, this.badBorderLength, this.goodBorderLength);
    this.input.setDraggable(arrow);

    this.input.on(
      "drag",
      function (pointer, gameObject, dragX, dragY) {
        const angle = Phaser.Math.Angle.Between(logo.x, logo.y, dragX, dragY);
        arrow.setRotation(angle);
        arrow.x = logo.x + Math.cos(angle) * shooterLineLength;
        arrow.y = logo.y + Math.sin(angle) * shooterLineLength;
        this.lines = this.lines.map((line) => {
          if (line.name === "shooter") {
            return { ...line, angle, startX: logo.x, startY: logo.y };
          }
          return line;
        });
        this.redrawLines(graphics, that.badBorderLength, that.goodBorderLength);
      },
      this
    );

    const baseSpeed = 80;

    this.incrementCount = 0;
    this.mostRecentCollisionCount = 0;
    const readyIn = this._get_ready_time(
      this.mostRecentCollisionCount,
      this.incrementCount
    );
    const readyCounter = this.add.text(
      GameWidth * 0.8,
      GameHeight * 0.05,
      readyIn ? `Ready in ${readyIn} Bounce` : "Ready to Launch",
      {
        // @ts-ignore
        fill: "#f00",
      }
    );
    this.creditText = this.add.text(
      GameWidth * 0.8,
      GameHeight * 0.075,
      `Credit: ${this.credit}`,
      {
        // @ts-ignore
        fill: "#f00",
      }
    );
    this.timeSurvived = this.add.text(
      GameWidth * 0.8,
      GameHeight * 0.1,
      `Time: ${this._get_time(that._start_time)}`,
      {
        // @ts-ignore
        fill: "#f00",
      }
    );

    that.updateReadyCounter = function () {
      const readyIn = that._get_ready_time(
        that.mostRecentCollisionCount,
        that.incrementCount
      );
      readyCounter.setText(
        readyIn
          ? `Ready in ${readyIn} Bounce${readyIn > 1 ? "s" : ""}`
          : "Ready to Launch"
      );
    };
    this.updateIncrementCount = function () {
      that.incrementCount += 1;
      that.updateReadyCounter();
    };
    this.updateRecentCollisionCount = function (to) {
      if (to !== undefined) {
        that.mostRecentCollisionCount = to;
      } else {
        that.mostRecentCollisionCount += 1;
      }

      that.updateReadyCounter();
    };

    function launchInDirection(force = false) {
      if (!force) {
        if (
          that._get_ready_time(
            that.mostRecentCollisionCount,
            that.incrementCount
          ) > 0
        ) {
          that.cameras.main.shake(200, 0.005);
          return;
        }
      }
      that.updateRecentCollisionCount(0);
      const speed = that._get_speed(
        baseSpeed,
        that.incrementCount,
        SPEED_INCREMENTS
      );
      that.updateIncrementCount();

      const angle = arrow.rotation;
      const [x, y] = [Math.cos(angle) * speed, Math.sin(angle) * speed];
      logo.setVelocity(x, y);
    }

    this.startBtn = document.getElementById("start-btn");

    this.startBtn.addEventListener("click", function () {
      if (that.started === false) {
        that.started = true;
        that.start_time = new Date();
        launchInDirection(true);
        document.getElementById("start-btn").innerText = "Pause";
      } else {
        if (that.paused === false) {
          that.paused = true;
          that.game.scene.pause("hello-world");
          document.getElementById("start-btn").innerText = "Resume";
        } else {
          that.paused = false;
          that.game.scene.resume("hello-world");
          document.getElementById("start-btn").innerText = "Pause";
        }
      }
      document.getElementById("app").focus();
    });

    const spacebar = this.input.keyboard.addKey("SPACE");
    spacebar.on("down", () => {
      if (this.started) {
        launchInDirection(logo.body.speed === 0);
      } else {
        this.startBtn.click();
      }
    });

    const cursors = this.input.keyboard.createCursorKeys();
    cursors.left.onDown = function () {
      arrow.angle -= 5;
    };
    cursors.right.onDown = function () {
      arrow.angle += 5;
    };

    this.physics.world.on(
      "worldbounds",
      function (body) {
        if (Math.random() > 0.3) {
          that.updateIncrementCount();
        }

        const closestX = body.gameObject.x < GameWidth / 2 ? 0 : GameWidth;
        const closestY = body.gameObject.y < GameHeight / 2 ? 0 : GameHeight;

        const diffToClosestX = Math.abs(body.gameObject.x - closestX);
        const diffToClosestY = Math.abs(body.gameObject.y - closestY);

        let collisionX, collisionY;
        if (diffToClosestX < diffToClosestY) {
          collisionX = closestX;
          collisionY = body.gameObject.y;
        } else {
          collisionX = body.gameObject.x;
          collisionY = closestY;
        }

        this.hit_marker.x = collisionX ? collisionX - 5 : collisionX + 5;
        this.hit_marker.y = collisionY ? collisionY - 5 : collisionY + 5;

        const scoreDelta = that._get_score_delta(collisionX, collisionY);

        const normalizedDelta = (scoreDelta / 100) * that.credit;
        this.updateCredit(
          Math.abs(normalizedDelta) < 5
            ? Math.sign(normalizedDelta) * 5
            : normalizedDelta
        );

        if (Math.sign(normalizedDelta) < 0) {
          that.cameras.main.shake(50, 0.005);
        }

        that.logo.setTintFill(
          TINT_COLOR_CYCLE[that.incrementCount % TINT_COLOR_CYCLE.length],
          TINT_COLOR_CYCLE[that.incrementCount % TINT_COLOR_CYCLE.length],
          TINT_COLOR_CYCLE[that.incrementCount % TINT_COLOR_CYCLE.length],
          TINT_COLOR_CYCLE[that.incrementCount % TINT_COLOR_CYCLE.length]
        );
        that.updateRecentCollisionCount();
        that.updateReadyCounter();
        that.updateBorders();
      },
      this
    );
  }

  update() {
    const line = this.lines.find((line) => line.name === "shooter");
    const logo = this.logo;
    const arrow = this.arrow;
    const angle = arrow.rotation;
    Phaser.Geom.Line.SetToAngle(line, logo.x, logo.y, angle, 120);
    arrow.x = line.x2;
    arrow.y = line.y2;
    arrow.setRotation(angle);
    this.lines = this.lines.map((line) => {
      if (line.name === "shooter") {
        return { ...line, angle, startX: logo.x, startY: logo.y };
      }
      return line;
    });

    this.redrawLines(
      this.graphics,
      this.badBorderLength,
      this.goodBorderLength
    );

    this.timeSurvived.setText(`Time: ${this._get_time(this.start_time)}`);

    if (this.credit < 0) {
      this.gameOver = true;
      this.scene.pause();
      this._show_game_over();
    }
  }

  _get_time(start_time) {
    if (start_time === null) {
      return "0:00";
    }
    const now = new Date();
    const diff = now - start_time;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff - minutes * 60000) / 1000);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  }

  _show_game_over() {
    const GameWidth = parseInt(this.game.config.width.toString());
    const GameHeight = parseInt(this.game.config.height.toString());
    const level_up = this.add.rectangle(
      GameWidth / 2,
      GameHeight / 2,
      GameWidth,
      GameHeight,
      0xff0000,
      0.2
    );
    level_up.setDepth(3);
    const gameOverText = this.add.text(
      GameWidth / 2,
      GameHeight / 2,
      `
      Game Over

      You survived for ${this._get_time(this.start_time)}
      
      `,
      {
        // @ts-ignore
        fill: "#f00",
        fontSize: 50,
      }
    );
    gameOverText.setOrigin(0.5, 0.5);
    gameOverText.setDepth(4);
    this.startBtn.innerText = "Restart";
    this.startBtn.addEventListener("click", () => {
      window.location.reload();
    });
    // prompt name and submit score to POST /leaderboard {name, time_survived, max_credit}
    const playerName = prompt("Enter your name to submit your score");
    if (playerName) {
      fetch(
        "https://deeveedee-leaderboard-dev-zgtq.2.us-1.fl0.io/leaderboard",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: playerName,
            time_survived: this._get_time(this.start_time),
            max_credit: this.max_credit.toFixed(2),
          }),
        }
      )
        .then((res) => res.json())
        .then((res) => {
          updateleaderboard(res.leaderboard);
        });
    }
  }
}
