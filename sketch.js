// Variáveis do jogo
let garden = [];
let inventory = {
  seeds: { basic: 3, rare: 0, epic: 0 },
  water: 10,

  flowers: { basic: 0, rare: 0, epic: 0, mutated: 0 },

  money: 10,

  upgrades: { waterCapacity: 1 }

};

let selectedTool = "basicSeed";

let selectedShopTab = "buy";

let gameTime = 0;

let shopOpen = false;

let day = 1;

let season = "Primavera";

const seasons = ["Primavera", "Verão", "Outono", "Inverno"];

let gameState = "intro";

let introIndex = 0;

let introFade = 0;

// Elementos de UI

let showMessage = false;

let message = "";

let messageTimer = 0;

let particles = [];

// Corvos

let crows = [];

let crowSpawnTimer = 0;

const CROW_SPAWN_RATE = 0.0001; // 0.01% de chance por frame

// Cores do céu por estação

const skyColors = {

  Primavera: [173, 216, 230], // Azul claro

  Verão: [135, 206, 235],    // Azul céu

  Outono: [252, 212, 164],   // Laranja claro

  Inverno: [224, 255, 255]   // Azul gelado

};

function setup() {

  createCanvas(800, 700);

  resetGarden();

  textSize(16);

  noStroke();

}

function draw() {

  // Fundo gradiente baseado na estação

  drawSkyGradient();

  

  if (gameState === "intro") {

    drawIntro();

  } else {

    updateGame();

    drawGame();

  }

}

function drawSkyGradient() {

  // Gradiente do céu

  const [r, g, b] = skyColors[season];

  for (let y = 0; y < height; y++) {

    const inter = map(y, 0, height, 0, 1);

    const c1 = color(r, g, b);

    const c2 = color(r * 0.7, g * 0.7, b * 0.7);

    const c = lerpColor(c1, c2, inter);

    fill(c);

    rect(0, y, width, 1);

  }

  

  // Sol/lua

  fill(season === "Inverno" ? color(240, 240, 255) : color(255, 255, 150));

  ellipse(100, 100, 80, 80);

  

  // Montanhas no horizonte

  fill(season === "Inverno" ? color(200, 230, 255) : color(50, 120, 50));

  beginShape();

  vertex(0, height - 100);

  for (let x = 0; x <= width; x += 50) {

    const y = height - 100 + sin(x * 0.01 + frameCount * 0.01) * 20;

    vertex(x, y);

  }

  vertex(width, height - 100);

  vertex(width, height);

  vertex(0, height);

  endShape(CLOSE);

}

function resetGarden() {

  garden = [];

  for (let i = 0; i < 5; i++) {

    garden[i] = [];

    for (let j = 0; j < 5; j++) {

      resetPlot(i, j);

    }

  }

}

function resetPlot(i, j) {

  garden[i][j] = {

    hasPlant: false,

    growth: 0,

    water: 0,

    color: [0, 0, 0],

    type: null,

    isMutated: false,

    harvestValue: 0,

    growthRate: 1

  };

}

function updateGame() {

  // Atualiza plantas

  for (let i = 0; i < 5; i++) {

    for (let j = 0; j < 5; j++) {

      const p = garden[i][j];

      if (p.hasPlant && p.growth < 100 && p.water > 0) {

        p.growth += 0.05 * p.growthRate;

        p.water -= 0.01;

        

        if (p.growth >= 100 && p.harvestValue === 0) {

          p.harvestValue = floor(p.type.value * (p.isMutated ? 3 : 1) * random(0.8, 1.2));

        }

      }

    }

  }

  

  // Atualiza corvos

  updateCrows();

  

  // Atualiza mensagens

  if (showMessage) {

    messageTimer--;

    if (messageTimer <= 0) showMessage = false;

  }

  

  // Atualiza partículas

  updateParticles();

  

  // Passagem do tempo

  gameTime++;

  if (gameTime % 1000 === 0) {

    day++;

    if (day % 30 === 0) {

      const currentSeasonIndex = seasons.indexOf(season);

      season = seasons[(currentSeasonIndex + 1) % seasons.length];

    }

  }

}

function updateCrows() {

  // Chance de spawnar um corvo (0.01%)

  if (random() < CROW_SPAWN_RATE && crows.length < 3) {

    spawnCrow();

  }

  

  // Atualiza posição dos corvos

  for (let crow of crows) {

    crow.x += crow.speed;

    if (crow.x > width - 50 || crow.x < 50) {

      crow.speed *= -1;

    }

  }

}

function spawnCrow() {

  crows.push({

    x: random(50, width - 50),

    y: random(50, 200),

    size: 40,

    speed: random(0.5, 1.5) * (random() > 0.5 ? 1 : -1),

    frame: 0

  });

}

function drawIntro() {

  // Fundo animado

  fill(0, 0, 0, 150 - introFade * 1.5);

  rect(0, 0, width, height);

  

  // Efeito de flores caindo

  if (random() < 0.05) {

    particles.push({

      x: random(width),

      y: -10,

      size: random(10, 20),

      life: random(100, 200),

      color: [random(150, 255), random(150, 255), random(150, 255)],

      type: "flower"

    });

  }

  

  updateParticles();

  

  // Texto introdutório

  fill(255, 255, 255, introFade);

  textSize(32);

  textAlign(CENTER, CENTER);

  

  const texts = [

    "Bem-vindo ao Grow a Garden!",

    "Plante, cultive e colha flores\npara criar um jardim encantador",

    "Clique para começar sua jornada"

  ];

  

  text(texts[introIndex], width/2, height/2 - 50);

  

  // Efeito de brilho no último texto

  if (introIndex === 2) {

    textSize(24);

    fill(255, 255, 255, 128 + 128 * sin(frameCount * 0.05) * (introFade/255));

    text("Clique para continuar", width/2, height/2 + 50);

  }

  

  // Animação de fade in/out

  if (frameCount % 2 === 0) {

    if (introFade < 255) introFade += 5;

  }

  

  textAlign(LEFT);

}

function drawGame() {

  // Desenhe partículas primeiro (para ficarem atrás dos outros elementos)

  for (let p of particles) {

    if (p.type === "flower") {

      fill(p.color[0], p.color[1], p.color[2], p.life * 255/200);

      push();

      translate(p.x, p.y);

      rotate(frameCount * 0.01);

      for (let i = 0; i < 5; i++) {

        const a = (i * TWO_PI / 5) + frameCount * 0.02;

        ellipse(cos(a) * p.size/2, sin(a) * p.size/2, p.size/3, p.size/2);

      }

      fill(255, 255, 0, p.life * 255/200);

      ellipse(0, 0, p.size/3);

      pop();

    } else {

      fill(p.color[0], p.color[1], p.color[2], p.life * 255/60);

      ellipse(p.x, p.y, p.size);

    }

  }

  

  drawGarden();

  drawCrows();

  drawUI();

  if (shopOpen) drawShop();

  if (showMessage) drawMessage();

}

function drawGarden() {

  for (let i = 0; i < 5; i++) {

    for (let j = 0; j < 5; j++) {

      const x = 200 + j * 80;

      const y = 100 + i * 80;

      

      // Terreno

      fill(season === "Inverno" ? color(200, 220, 240) : color(139, 69, 19));

      rect(x, y, 70, 70, 5);

      

      // Planta

      if (garden[i][j].hasPlant) {

        drawPlant(x, y, garden[i][j]);

      }

      

      // Destaque

      if (mouseX > x && mouseX < x + 70 && mouseY > y && mouseY < y + 70) {

        noFill();

        stroke(255, 255, 0);

        strokeWeight(2);

        rect(x, y, 70, 70, 5);

        noStroke();

      }

    }

  }

}

function drawCrows() {

  for (let crow of crows) {

    crow.frame++;

    

    // Corpo do corvo

    fill(0);

    ellipse(crow.x, crow.y, crow.size, crow.size/1.5);

    

    // Cabeça

    ellipse(crow.x - crow.size/3, crow.y - crow.size/4, crow.size/2);

    

    // Bico

    fill(100, 60, 0);

    triangle(

      crow.x - crow.size/2, crow.y - crow.size/4,

      crow.x - crow.size/2 - 15, crow.y - crow.size/4,

      crow.x - crow.size/2 - 10, crow.y - crow.size/4 + 5

    );

    

    // Asas (com animação)

    let wingY = crow.y + sin(crow.frame * 0.1) * 5;

    beginShape();

    vertex(crow.x + crow.size/4, crow.y);

    vertex(crow.x + crow.size/2, wingY);

    vertex(crow.x + crow.size/4, crow.y + crow.size/4);

    endShape(CLOSE);

    

    // Olho

    fill(255);

    ellipse(crow.x - crow.size/2.5, crow.y - crow.size/4, crow.size/8);

    fill(0);

    ellipse(crow.x - crow.size/2.5, crow.y - crow.size/4, crow.size/16);

  }

}

function drawPlant(x, y, plant) {

  // Caule

  fill(plant.isMutated ? color(150, 0, 150) : color(0, 100, 0));

  const h = 30 * (plant.growth / 100);

  rect(x + 30, y + 40, 10, -h);

  

  // Folhas

  fill(0, 150, 0);

  ellipse(x + 25, y + 40 - h/2, 20, 10);

  ellipse(x + 45, y + 35 - h/2, 20, 10);

  

  // Flor

  if (plant.growth >= 100) {

    drawFlower(x + 35, y + 40 - h, plant);

  } else if (plant.growth > 50) {

    fill(plant.color[0], plant.color[1], plant.color[2]);

    ellipse(x + 35, y + 45 - h, 10, 10);

  }

  

  // Barra de crescimento

  if (plant.growth < 100) {

    fill(0);

    rect(x, y + 65, 70, 5);

    fill(0, 200, 0);

    rect(x, y + 65, 70 * (plant.growth/100), 5);

  }

  

  // Sinal de falta de água

  if (plant.water < 5 && plant.hasPlant && plant.growth < 100) {

    fill(100, 100, 255, 150);

    textSize(20);

    text("💧", x + 10, y + 30);

  }

}

function drawFlower(x, y, plant) {

  if (plant.isMutated) {

    fill(random(150, 255), random(150, 255), random(150, 255));

  } else {

    fill(plant.color[0], plant.color[1], plant.color[2]);

  }

  

  // Centro

  ellipse(x, y, 15, 15);

  

  // Pétalas

  for (let i = 0; i < 6; i++) {

    const a = (i * PI / 3) + frameCount / 50;

    ellipse(x + cos(a) * 20, y + sin(a) * 20, 20, 15);

  }

  

  // Efeito especial para mutadas

  if (plant.isMutated) {

    fill(255, 255, 255, 100);
    ellipse(x, y, 25 + 5 * sin(frameCount * 0.05), 25 + 5 * sin(frameCount * 0.05));
    if (random() < 0.1) {
      particles.push({
        x: x + random(-15, 15),
        y: y + random(-15, 15),
        size: random(2, 5),
        life: 60,
        color: [random(200, 255), random(200, 255), random(200, 255)]
      });
    }
  }
}
function drawUI() {
  // Painel lateral
  fill(100, 100, 100, 200);
  rect(10, 10, 180, 680, 10);
  fill(255);
  // Informações
  textSize(20);
  text("Grow a Garden", 20, 40);
  textSize(16);
  text(`Dia ${day} (${season})`, 20, 70);
  
  // Recursos
  text(`Sementes: ${inventory.seeds.basic}C ${inventory.seeds.rare}R ${inventory.seeds.epic}E`, 20, 110);
  text(`Água: ${floor(inventory.water)}`, 20, 140);
  text(`Flores: ${inventory.flowers.basic}C ${inventory.flowers.rare}R ${inventory.flowers.epic}E ${inventory.flowers.mutated}M`, 20, 170);
  text(`$${inventory.money}`, 20, 200);
  
  // Ferramentas
  text("Ferramentas:", 20, 240);
  drawButton(20, 270, 80, 30, "basicSeed", "Comum", selectedTool === "basicSeed");
  drawButton(110, 270, 80, 30, "rareSeed", "Rara", selectedTool === "rareSeed");
  drawButton(20, 310, 80, 30, "epicSeed", "Épica", selectedTool === "epicSeed");
  drawButton(110, 310, 80, 30, "water", "Regar", selectedTool === "water");
  drawButton(20, 350, 80, 30, "harvest", "Colher", selectedTool === "harvest");
  drawButton(110, 350, 80, 30, "shop", "Loja", false);
}
function drawButton(x, y, w, h, id, label, isSelected) {
  fill(isSelected ? color(0, 150, 0) : color(50));
  rect(x, y, w, h, 5);
  fill(255);
  textAlign(CENTER, CENTER);
  text(label, x + w/2, y + h/2);
  textAlign(LEFT);
}
function drawShop() {
  fill(70, 70, 100, 220);
  rect(150, 100, 500, 400, 20);
  fill(255);
  textSize(24);
  textAlign(CENTER);
  text("Loja", 400, 140);
  textAlign(LEFT);
  // Abas
  drawShopTab(180, 170, "buy", "Comprar");
  drawShopTab(330, 170, "sell", "Vender");
  
  // Conteúdo
  if (selectedShopTab === "buy") {
    drawShopItem(180, 220, "buyBasic", "Semente Comum", 5);
    drawShopItem(330, 220, "buyRare", "Semente Rara", 20);
    drawShopItem(480, 220, "buyEpic", "Semente Épica", 50);
    drawShopItem(180, 320, "buyWater", "Água (+10)", 3);
  } else {
    if (inventory.flowers.basic > 0) drawShopItem(180, 220, "sellBasic", "Flor Comum", 5);
    if (inventory.flowers.rare > 0) drawShopItem(330, 220, "sellRare", "Flor Rara", 15);
    if (inventory.flowers.epic > 0) drawShopItem(480, 220, "sellEpic", "Flor Épica", 30);
    if (inventory.flowers.mutated > 0) drawShopItem(330, 320, "sellMutated", "Flor Mutada", 50);
  }
  // Botão fechar
  drawButton(350, 450, 100, 40, "closeShop", "Fechar", false);
}
function drawShopTab(x, y, id, label) {
  fill(selectedShopTab === id ? color(0, 100, 0) : color(50));
  rect(x, y, 120, 40, 5);
  fill(255);
  textAlign(CENTER, CENTER);
  text(label, x + 60, y + 20);
  textAlign(LEFT);
}
function drawShopItem(x, y, id, label, price) {
  fill(80);
  rect(x, y, 120, 80, 5);
  fill(255);
  text(label, x + 10, y + 25);
  text(`$${price}`, x + 10, y + 50);
  const canAfford = id.startsWith("buy") ? inventory.money >= price : true;
  fill(canAfford ? 0 : 100);
  rect(x + 10, y + 55, 100, 20, 3);
  fill(255);
  textAlign(CENTER, CENTER);
  text(id.startsWith("buy") ? "Comprar" : "Vender", x + 60, y + 65);
  textAlign(LEFT);
}
function drawMessage() {
  fill(0, 150, 0, 200);
  rect(width/2 - 200, 50, 400, 60, 10);
  fill(255);
  textSize(20);
  textAlign(CENTER, CENTER);
  text(message, width/2, 80);
  textAlign(LEFT);
}
function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    if (p.type === "flower") {
      p.y += 1;
      p.x += sin(frameCount * 0.1 + p.y * 0.05) * 0.5;
    } else {
      p.y -= 1;
    }
    p.life--;
    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
}
function mousePressed() {
  if (gameState === "intro") {
    introIndex++;
    introFade = 0;
    if (introIndex >= 3) {
      gameState = "playing";
      particles = [];
    }
    return;
  }
  // Verifica clique em corvos
  for (let i = crows.length - 1; i >= 0; i--) {
    const crow = crows[i];
    const distance = dist(mouseX, mouseY, crow.x, crow.y);
    if (distance < crow.size) {
      crows.splice(i, 1);
      inventory.seeds.epic++;
      for (let j = 0; j < 20; j++) {
        particles.push({
          x: crow.x + random(-20, 20),
          y: crow.y + random(-20, 20),
          size: random(3, 8),
          life: random(30, 90),
          color: [100, 100, 255]
        });
      }
      showMessage = true;
      message = "Corvo espantado! +1 Semente Épica";
      messageTimer = 120;
      return;
    }
  }
  if (shopOpen) {
    handleShopClick();
    return;
  }
  // Ferramentas
  if (mouseY > 270 && mouseY < 390) {
    if (mouseX > 20 && mouseX < 100) {
      if (mouseY > 270 && mouseY < 300) selectedTool = "basicSeed";
      if (mouseY > 310 && mouseY < 340) selectedTool = "epicSeed";
      if (mouseY > 350 && mouseY < 380) selectedTool = "harvest";
    }
    if (mouseX > 110 && mouseX < 190) {
      if (mouseY > 270 && mouseY < 300) selectedTool = "rareSeed";
      if (mouseY > 310 && mouseY < 340) selectedTool = "water";
      if (mouseY > 350 && mouseY < 380) {
        shopOpen = true;
        selectedShopTab = "buy";
      }
    }
    return;
  }
  // Jardim
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      const x = 200 + j * 80;
      const y = 100 + i * 80;
      if (mouseX > x && mouseX < x + 70 && mouseY > y && mouseY < y + 70) {
        handleGardenClick(i, j);
        return;
      }
    }
  }
}
function handleGardenClick(i, j) {
  const plot = garden[i][j];
  const x = 200 + j * 80;
  const y = 100 + i * 80;
  switch (selectedTool) {
    case "basicSeed":
      if (!plot.hasPlant && inventory.seeds.basic > 0) {
        plantSeed(i, j, {
          name: "Comum",
          value: 5,
          mutationChance: 0.1,
          color: [255, 100, 100]
        });
        inventory.seeds.basic--;
        showMessage = true;
        message = "Semente comum plantada!";
        messageTimer = 120;
    }
      break;
    case "rareSeed":
      if (!plot.hasPlant && inventory.seeds.rare > 0) {
        plantSeed(i, j, {
          name: "Rara",
          value: 15,
          mutationChance: 0.2,
          color: [100, 255, 100]
        });
        inventory.seeds.rare--;
        showMessage = true;
        message = "Semente rara plantada!";
        messageTimer = 120;
    }
      break;
    case "epicSeed":
      if (!plot.hasPlant && inventory.seeds.epic > 0) {
        plantSeed(i, j, {
          name: "Épica",
          value: 30,
          mutationChance: 0.3,
          color: [100, 100, 255]
        });
        inventory.seeds.epic--;
        showMessage = true;
        message = "Semente épica plantada!";
        messageTimer = 120;
      }
      break;
    case "water":
      if (plot.hasPlant && inventory.water > 0) {
        plot.water += 10;
        inventory.water--;
        showMessage = true;
        message = "Planta regada!";
        messageTimer = 60;
      }
      break;
    case "harvest":
      if (plot.hasPlant && plot.growth >= 100) {
        harvestPlant(i, j);
      }
      break;
  }
}
function plantSeed(i, j, type) {
  const plot = garden[i][j];
  plot.hasPlant = true;
  plot.type = type;
  plot.isMutated = random() < type.mutationChance;
  plot.growthRate = plot.isMutated ? 1.5 : 1;
  // Cor baseada na estação
  const colors = {
    Primavera: [255, 100, 100],
    Verão: [255, 150, 50],
    Outono: [255, 150, 0],
    Inverno: [200, 200, 255]
  };
  plot.color = colors[season];
  // Efeito visual
  for (let k = 0; k < 10; k++) {
    particles.push({
      x: 200 + j * 80 + 35 + random(-20, 20),
      y: 100 + i * 80 + 70,
      size: random(3, 6),
      life: random(30, 60),
      color: [139, 69, 19]
    });
  }
}
function harvestPlant(i, j) {
  const plot = garden[i][j];
  const type = plot.type.name.toLowerCase();
  inventory.flowers[type]++;
  if (plot.isMutated) inventory.flowers.mutated++;
  const value = floor(plot.harvestValue);
  inventory.money += value;
  // Efeito visual
  for (let k = 0; k < 20; k++) {
    particles.push({
      x: 200 + j * 80 + 35 + random(-20, 20),
      y: 100 + i * 80 + 40 - (30 * (plot.growth / 100)) + random(-20, 20),
      size: random(3, 8),
      life: random(30, 90),
      color: plot.isMutated ? [random(255), random(255), random(255)] : plot.color
    });
  }
  showMessage = true;
  message = `Colhido: $${value}${plot.isMutated ? " (Mutada!)" : ""}`;
  messageTimer = 120;
  resetPlot(i, j);
}
function handleShopClick() {
  // Fechar loja
  if (mouseX > 350 && mouseX < 450 && mouseY > 450 && mouseY < 490) {
    shopOpen = false;
    return;
  }
  // Abas
  if (mouseY > 170 && mouseY < 210) {
    if (mouseX > 180 && mouseX < 300) selectedShopTab = "buy";
    if (mouseX > 330 && mouseX < 450) selectedShopTab = "sell";
    return;
  }
  // Itens
  if (selectedShopTab === "buy") {
    if (mouseY > 220 && mouseY < 300) {
      if (mouseX > 180 && mouseX < 300 && inventory.money >= 5) {
        inventory.seeds.basic++;
        inventory.money -= 5;
      }
      if (mouseX > 330 && mouseX < 450 && inventory.money >= 20) {
        inventory.seeds.rare++;
        inventory.money -= 20;
      }
      if (mouseX > 480 && mouseX < 600 && inventory.money >= 50) {
        inventory.seeds.epic++;
        inventory.money -= 50;
      }
    }
    if (mouseY > 320 && mouseY < 400 && mouseX > 180 && mouseX < 300 && inventory.money >= 3) {
      inventory.water += 10;
      inventory.money -= 3;
    }
  } else {
    if (mouseY > 220 && mouseY < 300) {
      if (mouseX > 180 && mouseX < 300 && inventory.flowers.basic > 0) {
        inventory.flowers.basic--;
        inventory.money += 5;
      }
      if (mouseX > 330 && mouseX < 450 && inventory.flowers.rare > 0) {
        inventory.flowers.rare--;
        inventory.money += 15;
      }
      if (mouseX > 480 && mouseX < 600 && inventory.flowers.epic > 0) {
        inventory.flowers.epic--;
        inventory.money += 30;
      }
    }
    if (mouseY > 320 && mouseY < 400 && mouseX > 330 && mouseX < 450 && inventory.flowers.mutated > 0) {
      inventory.flowers.mutated--;
      inventory.money += 50;
    }
  }
}