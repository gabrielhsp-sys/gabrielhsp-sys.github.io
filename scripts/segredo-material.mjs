// Leitura do MATERIAL_SECRET para os geradores do /material/ (material:link e material:codigo).
// Com --producao, vem só de ~/.config/gabrielsys/material-secret (fora do repositório, o mesmo
// gravado no projeto Pages) e o arquivo é recusado se outros usuários puderem lê-lo. Sem
// --producao, vem de MATERIAL_SECRET no ambiente ou do .dev.vars (ignorado pelo Git).
// Nunca imprime o valor: só o caminho e o motivo da recusa.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const lerDevVars = () => {
  const arquivo = path.join(process.cwd(), ".dev.vars");
  if (!fs.existsSync(arquivo)) return undefined;
  const linha = fs.readFileSync(arquivo, "utf8").split(/\r?\n/).find((l) => l.startsWith("MATERIAL_SECRET="));
  return linha?.slice("MATERIAL_SECRET=".length).replace(/^"|"$/g, "");
};

/** Devolve o segredo, ou chama `sair(mensagem)` (que encerra o processo). */
export function lerSegredo({ producao, minimo, sair }) {
  let segredo;
  if (producao) {
    const arquivo = path.join(os.homedir(), ".config/gabrielsys/material-secret");
    if (!fs.existsSync(arquivo)) sair(`segredo de produção ausente em ${arquivo}`);
    if (fs.statSync(arquivo).mode & 0o077) sair(`${arquivo} legível por outros usuários: rode chmod 600`);
    segredo = fs.readFileSync(arquivo, "utf8").trim();
  } else {
    segredo = process.env.MATERIAL_SECRET ?? lerDevVars();
  }
  if (!segredo) sair("MATERIAL_SECRET ausente (no ambiente ou no .dev.vars)");
  if (segredo.length < minimo) sair(`MATERIAL_SECRET com menos de ${minimo} caracteres`);
  return segredo;
}
