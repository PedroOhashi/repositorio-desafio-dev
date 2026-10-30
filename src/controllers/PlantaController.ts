import { Request, Response } from "express";
import { Luminosidade } from "@prisma/client";
import * as PlantaRepository from "@repositories/PlantaRepository";

// Valida os campos de uma planta e devolve a mensagem do primeiro erro,
// ou null se estiver tudo certo.
// obrigatorios = true  -> cadastro (POST): todos os campos precisam ter sido enviados
// obrigatorios = false -> edição (PATCH): só valida os campos que vieram
const validarCampos = (dados: any, obrigatorios: boolean): string | null => {
  const { nome, especie, preco, estoque, luminosidade, petFriendly, regaACadaDias } = dados;

  if (obrigatorios) {
    const campos = { nome, especie, preco, estoque, luminosidade, petFriendly, regaACadaDias };
    for (const [chave, valor] of Object.entries(campos)) {
      if (valor === undefined) {
        return `O campo ${chave} é obrigatório.`;
      }
    }
  }

  if (nome !== undefined && (typeof nome !== "string" || nome.trim() === "")) {
    return "O campo nome deve ser um texto não vazio.";
  }

  if (especie !== undefined && (typeof especie !== "string" || especie.trim() === "")) {
    return "O campo especie deve ser um texto não vazio.";
  }

  if (preco !== undefined && !(Number.isInteger(preco) && preco > 0)) {
    return "O campo preco deve ser um número inteiro maior que zero (em centavos).";
  }

  if (estoque !== undefined && !(Number.isInteger(estoque) && estoque >= 0)) {
    return "O campo estoque deve ser um número inteiro maior ou igual a zero.";
  }

  if (luminosidade !== undefined && !Object.values(Luminosidade).includes(luminosidade)) {
    return "O campo luminosidade deve ser SOMBRA, MEIA_SOMBRA ou SOL_PLENO.";
  }

  if (petFriendly !== undefined && typeof petFriendly !== "boolean") {
    return "O campo petFriendly deve ser true ou false.";
  }

  if (regaACadaDias !== undefined && !(Number.isInteger(regaACadaDias) && regaACadaDias >= 1)) {
    return "O campo regaACadaDias deve ser um número inteiro maior ou igual a 1.";
  }

  return null;
};

export const createPlanta = async (req: Request, res: Response) => {
  try {
    const { nome, especie, preco, estoque, luminosidade, petFriendly, regaACadaDias } = req.body;

    const erro = validarCampos(req.body, true);

    if (erro) {
      return res.status(400).json({ message: erro });
    }

    const planta = await PlantaRepository.createPlanta({
      nome,
      especie,
      preco,
      estoque,
      luminosidade,
      petFriendly,
      regaACadaDias,
    });

    return res.status(201).json(planta);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao criar planta." });
  }
};

// Converte o :id da URL (que chega como texto) em número.
// Devolve null se não for um inteiro positivo que caiba no Int do banco.
const lerId = (valor: string): number | null => {
  const id = Number(valor);

  if (!Number.isInteger(id) || id <= 0 || id > 2147483647) {
    return null;
  }

  return id;
};

export const readAllPlantas = async (req: Request, res: Response) => {
  try {
    const { luminosidade, petFriendly, nome, ordem } = req.query;

    if (
      luminosidade !== undefined &&
      !Object.values(Luminosidade).includes(luminosidade as Luminosidade)
    ) {
      return res.status(400).json({
        message: "O filtro luminosidade deve ser SOMBRA, MEIA_SOMBRA ou SOL_PLENO.",
      });
    }

    if (petFriendly !== undefined && petFriendly !== "true" && petFriendly !== "false") {
      return res.status(400).json({
        message: "O filtro petFriendly deve ser true ou false.",
      });
    }

    if (nome !== undefined && (typeof nome !== "string" || nome.trim() === "")) {
      return res.status(400).json({
        message: "O filtro nome deve ser um texto não vazio.",
      });
    }

    if (ordem !== undefined && ordem !== "preco" && ordem !== "nome") {
      return res.status(400).json({
        message: "O parâmetro ordem deve ser preco ou nome.",
      });
    }

    const plantas = await PlantaRepository.findAllPlantas(
      {
        luminosidade: luminosidade as Luminosidade | undefined,
        // Se não foi enviado, continua undefined (e o Prisma ignora o filtro)
        petFriendly: petFriendly === undefined ? undefined : petFriendly === "true",
        nome:
          nome === undefined
            ? undefined
            : { contains: (nome as string).trim(), mode: "insensitive" },
      },
      ordem as "preco" | "nome" | undefined,
    );

    return res.status(200).json(plantas);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao buscar plantas." });
  }
};

export const readPlantaById = async (req: Request, res: Response) => {
  try {
    const id = lerId(req.params.id);

    if (id === null) {
      return res.status(400).json({ message: "O id deve ser um número inteiro maior que zero." });
    }

    const planta = await PlantaRepository.findPlantaById(id);

    if (!planta) {
      return res.status(404).json({ message: "Planta não encontrada." });
    }

    return res.status(200).json(planta);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao buscar planta." });
  }
};

export const updatePlanta = async (req: Request, res: Response) => {
  try {
    const id = lerId(req.params.id);

    if (id === null) {
      return res.status(400).json({ message: "O id deve ser um número inteiro maior que zero." });
    }

    const erro = validarCampos(req.body, false);

    if (erro) {
      return res.status(400).json({ message: erro });
    }

    const planta = await PlantaRepository.findPlantaById(id);

    if (!planta) {
      return res.status(404).json({ message: "Planta não encontrada." });
    }

    const { nome, especie, preco, estoque, luminosidade, petFriendly, regaACadaDias } = req.body;

    // Campos não enviados chegam como undefined e o Prisma os ignora
    const plantaAtualizada = await PlantaRepository.updatePlanta(id, {
      nome,
      especie,
      preco,
      estoque,
      luminosidade,
      petFriendly,
      regaACadaDias,
    });

    return res.status(200).json(plantaAtualizada);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao atualizar planta." });
  }
};

export const deletePlanta = async (req: Request, res: Response) => {
  try {
    const id = lerId(req.params.id);

    if (id === null) {
      return res.status(400).json({ message: "O id deve ser um número inteiro maior que zero." });
    }

    const planta = await PlantaRepository.findPlantaById(id);

    if (!planta) {
      return res.status(404).json({ message: "Planta não encontrada." });
    }

    await PlantaRepository.deletePlanta(id);

    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao deletar planta." });
  }
};

export const venderPlanta = async (req: Request, res: Response) => {
  try {
    const id = lerId(req.params.id);

    if (id === null) {
      return res.status(400).json({ message: "O id deve ser um número inteiro maior que zero." });
    }

    const { quantidade } = req.body;

    if (!Number.isInteger(quantidade) || quantidade <= 0) {
      return res.status(400).json({
        message: "A quantidade deve ser um número inteiro maior que zero.",
      });
    }

    const planta = await PlantaRepository.findPlantaById(id);

    if (!planta) {
      return res.status(404).json({ message: "Planta não encontrada." });
    }

    if (planta.estoque < quantidade) {
      return res.status(400).json({
        message: `Estoque insuficiente: temos só ${planta.estoque} vasos de ${planta.nome}.`,
      });
    }

    const alteradas = await PlantaRepository.decrementEstoqueSeHouver(id, quantidade);

    // Se ninguém foi alterado, outra venda levou os vasos entre a conferência e agora
    if (alteradas === 0) {
      return res.status(400).json({
        message: "Estoque insuficiente: outra venda acabou de reduzir o estoque.",
      });
    }

    const plantaAtualizada = await PlantaRepository.findPlantaById(id);

    return res.status(200).json(plantaAtualizada);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao vender planta." });
  }
};

export const readValorTotalEstoque = async (req: Request, res: Response) => {
  try {
    const plantas = await PlantaRepository.findPrecoEEstoque();

    let valorTotalEmCentavos = 0;
    let totalDeVasos = 0;

    for (const planta of plantas) {
      valorTotalEmCentavos += planta.preco * planta.estoque;
      totalDeVasos += planta.estoque;
    }

    // Com a loja vazia, o laço não roda e os dois valores ficam em 0
    return res.status(200).json({ valorTotalEmCentavos, totalDeVasos });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao calcular o valor do estoque." });
  }
};

export const readPlantasEsgotadas = async (req: Request, res: Response) => {
  try {
    const plantas = await PlantaRepository.findPlantasEsgotadas();

    return res.status(200).json(plantas);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao buscar plantas esgotadas." });
  }
};
