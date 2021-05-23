const fieldHeight = 400;
const fieldWidth = 500;
const numberOfRows = 4;
const tilesInRow = 14;
const sizeOfGap = 3;

const requestAnimationFrame = window.requestAnimationFrame;

class Tile {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.isAlive = true;
  }

  draw(ctx) {
    if (!this.isAlive) return;
    ctx.fillStyle = Tile.color;
    ctx.fillRect(this.x, this.y, Tile.width, Tile.height);
    ctx.strokeStyle = "#ffffff";
    ctx.strokeRect(this.x, this.y, Tile.width, Tile.height);
  }
}

Tile.color = "rgba(125, 125, 125, 0.5)";
Tile.width = fieldWidth / tilesInRow - 2 * sizeOfGap;
Tile.height = 25;

const generateTiles = () => {
  const tiles = [];
  for (let i = 0; i < numberOfRows; i++) {
    tiles[i] = [];
    for (let j = 0; j < tilesInRow; j++) {
      const x = (2 * j + 1) * sizeOfGap + j * Tile.width;
      const y = (2 * i + 1) * sizeOfGap + i * Tile.height;
      tiles[i][j] = new Tile(x, y);
    }
  }
  return tiles;
};

const drawTiles = (tiles, ctx) => {
  for (let i = 0; i < numberOfRows; i++) {
    for (let j = 0; j < tilesInRow; j++) {
      tiles[i][j].draw(ctx);
    }
  }
};

class Platform {
  constructor() {
    this.x = (fieldWidth - Platform.width) / 2;
    this.y = fieldHeight - Platform.height;
  }

  draw(ctx) {
    ctx.fillStyle = Platform.color;
    ctx.fillRect(this.x, this.y, Platform.width, Platform.height);
  }

  movePlatformByEvent(e) {
    const modifier = 1;
    switch (e.keyCode) {
      case 37: {
        if (this.x > 0) {
          this.x -= Platform.speed * modifier;
        }
        break;
      }
      case 39: {
        if (this.x < fieldWidth - Platform.width) {
          this.x += Platform.speed * modifier;
        }
        break;
      }
    }
  }
}

Platform.width = 100;
Platform.height = 10;
Platform.color = "#666666";
Platform.speed = 40;

class Boll {
  constructor() {
    this.x = fieldWidth / 2;
    this.y = fieldHeight - Boll.radius - Platform.height;
    this.angle = -(Math.random() * (Math.PI / 2) + Math.PI / 4);
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, Boll.radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = Boll.color;
    ctx.fill();
  }
}

Boll.color = "#666666";
Boll.radius = 8;
Boll.speed = 4;

const core = (arkanoid) => {
  const { boll, platform, tiles } = arkanoid;

  if (boll.y <= Boll.radius) {
    Boll.speed = -Boll.speed;
    return;
  }

  if (boll.y >= fieldHeight - Platform.height - Boll.radius) {
    if (
      boll.x + Boll.radius * 2 >= platform.x &&
      boll.x - Boll.radius * 2 <= platform.x + Platform.width
    ) {
      //boll.angle *= -1
      const shift =
        (platform.x + Platform.width / 2 - boll.x) / (Platform.width / 2);
      const shiftCoef = shift / 2 + 0.5;
      boll.angle = -(shiftCoef * (Math.PI / 2) + Math.PI / 4);
      return;
    } else if (boll.y >= fieldHeight - Boll.radius) {
      arkanoid.status = "finish";
      arkanoid.finish();
      return;
    }
  }

  if (boll.x <= Boll.radius || boll.x >= fieldWidth - Boll.radius) {
    boll.angle = Math.PI - boll.angle;
    return;
  }

  for (let tilesRow of tiles) {
    for (let tile of tilesRow) {
      if (!tile.isAlive) continue;
      if (
        boll.x - Boll.radius <= tile.x + Tile.width &&
        boll.x + Boll.radius >= tile.x &&
        boll.y - Boll.radius <= tile.y + Tile.height &&
        boll.y + Boll.radius >= tile.y
      ) {
        tile.isAlive = false;
        boll.angle *= -1;
        return;
      }
    }
  }
};

const render = (ctx, arkanoid) => {
  const { tiles, platform, boll } = arkanoid;

  boll.y += Boll.speed * Math.sin(boll.angle);
  boll.x += Boll.speed * Math.cos(boll.angle);

  ctx.clearRect(0, 0, fieldWidth, fieldHeight);
  drawTiles(tiles, ctx);
  platform.draw(ctx);
  boll.draw(ctx);

  core(arkanoid);

  if (arkanoid.status === "play") {
    requestAnimationFrame(() => render(ctx, arkanoid));
  }
};

window.onload = () => {
  const canvas = document.getElementById("arkanoid");
  const ctx = canvas.getContext("2d");

  const arkanoid = {
    tiles: generateTiles(),
    platform: new Platform(),
    boll: new Boll(),
    status: "play",
    finish: () => {
      ctx.font =
        '50px system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';
      ctx.fillStyle = "#666666";
      ctx.textAlign = "center";
      ctx.fillText("Game Over", fieldWidth / 2, fieldHeight / 2);
    },
  };

  addEventListener(
    "keydown",
    arkanoid.platform.movePlatformByEvent.bind(arkanoid.platform)
  );
  render(ctx, arkanoid);
};
