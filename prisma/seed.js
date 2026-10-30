const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const plantas = [
  { nome: "Costela-de-adão", especie: "Monstera deliciosa", preco: 8990, estoque: 12, luminosidade: "MEIA_SOMBRA", petFriendly: false, regaACadaDias: 3 },
  { nome: "Samambaia", especie: "Nephrolepis exaltata", preco: 4500, estoque: 0, luminosidade: "SOMBRA", petFriendly: true, regaACadaDias: 2 },
  { nome: "Jiboia", especie: "Epipremnum aureum", preco: 3500, estoque: 8, luminosidade: "SOL_PLENO", petFriendly: false, regaACadaDias: 5 },
  { nome: "Espada-de-são-jorge", especie: "Dracaena trifasciata", preco: 6000, estoque: 4, luminosidade: "SOMBRA", petFriendly: false, regaACadaDias: 14 },
  { nome: "Palmeira-areca", especie: "Dypsis lutescens", preco: 12000, estoque: 3, luminosidade: "MEIA_SOMBRA", petFriendly: true, regaACadaDias: 4 },
  { nome: "Pacová", especie: "Philodendron martianum", preco: 7500, estoque: 6, luminosidade: "SOMBRA", petFriendly: false, regaACadaDias: 5 },
];

async function main() {
  const total = await prisma.planta.count();

  if (total > 0) {
    console.log(`O banco já tem ${total} plantas. Seed ignorado.`);
    return;
  }

  const resultado = await prisma.planta.createMany({ data: plantas });
  console.log(`${resultado.count} plantas criadas.`);
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());