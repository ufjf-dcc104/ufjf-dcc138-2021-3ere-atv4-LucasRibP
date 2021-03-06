import AssetManager from "./AssetManager.js";
import Cena from "./Cena.js";
import Mapa from "./Mapa.js";
import Sprite from "./Sprite.js";
import modeloMapa from "../maps/mapa1.js";
import Mixer from "./Mixer.js";
import InputManager from "./InputManager.js";

const input = new InputManager();
const mixer = new Mixer(10);
const assets = new AssetManager(mixer);

assets.carregaImagem("parede", "assets/crystal_wall04.png");
assets.carregaImagem("chao", "assets/marble_floor4.png");

assets.carregaAudio("boom", "assets/boom.wav");
assets.carregaAudio("lose", "assets/lose.wav");

const canvas = document.querySelector("canvas");
const configMapa = {
  linhas: modeloMapa.length,
  colunas: modeloMapa[0].length,
  tamanho: 32,
};

canvas.width = configMapa.colunas * configMapa.tamanho;
canvas.height = configMapa.linhas * configMapa.tamanho;

input.configurarTeclado({
  ArrowLeft: "MOVE_ESQUERDA",
  ArrowRight: "MOVE_DIREITA",
  ArrowUp: "MOVE_CIMA",
  ArrowDown: "MOVE_BAIXO",
});

const cena1 = new Cena(canvas, assets);
const mapa1 = new Mapa(
  configMapa.linhas,
  configMapa.colunas,
  configMapa.tamanho,
  cena1
);

const tileIdToTile = {
  0: assets.img("chao"),
  1: assets.img("parede"),
};

mapa1.carregaMapa(modeloMapa, tileIdToTile);
cena1.configuraMapa(mapa1);

const pc = new Sprite({
  x: (configMapa.colunas * configMapa.tamanho) / 2,
  y: (configMapa.linhas * configMapa.tamanho) / 2,
  deathSound: "lose",
  soundPriority: Infinity,
});

pc.controlar = function (dt) {
  if (input.comandos.get("MOVE_ESQUERDA")) {
    this.vx = -50;
  } else if (input.comandos.get("MOVE_DIREITA")) {
    this.vx = +50;
  } else {
    this.vx = 0;
  }

  if (input.comandos.get("MOVE_CIMA")) {
    this.vy = -50;
  } else if (input.comandos.get("MOVE_BAIXO")) {
    this.vy = +50;
  } else {
    this.vy = 0;
  }
};
cena1.adicionar(pc);

function perseguePC(dt) {
  this.vx = 25 * Math.sign(pc.x - this.x);
  this.vy = 25 * Math.sign(pc.y - this.y);
}

function geraInimigo(cena) {
  cena.adicionar(
    new Sprite({
      ...cena.mapa.geraPosicaoValidaAleatoria(),
      color: "red",
      controlar: perseguePC,
      deathSound: "boom",
      soundPriority: 0,
    })
  );
}

for (let i = 0; i < 3; i++) {
  geraInimigo(cena1);
}

const geradorDeInimigos = setInterval(() => geraInimigo(cena1), 10000);

cena1.iniciar();

document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "s":
      cena1.iniciar();
      break;
    case "p":
      cena1.parar();
      break;
  }
});
