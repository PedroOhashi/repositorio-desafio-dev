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