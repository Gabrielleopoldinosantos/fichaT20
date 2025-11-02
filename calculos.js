// calculos.js (Versão Final e Corrigida)

import { gvn } from "./formulario.js";

// Defesa (Mantido com regra simplificada: Atributo = Bônus)
export function calcularDefesa() {
const atributo = document.getElementById("defAtributo")?.value;
const valorAtributo = gvn(atributo);
const bonusAtributo = valorAtributo; 

const armadura = gvn("armadura");
const escudo = gvn("escudo");
const outros = gvn("defOutros");

const total = 10 + bonusAtributo + armadura + escudo + outros;
if (document.getElementById("defTotal")) {
 document.getElementById("defTotal").innerText = total;
}
}


// Perícias (Sobrecarga e Penalidade de Armadura afetam APENAS 3 perícias)
const bonusTreinamento = {
1: 2, 2: 3, 3: 3, 4: 4, 5: 4,
6: 5, 7: 7, 8: 8, 9: 8, 10: 9,
11: 9, 12: 10, 13: 10, 14: 11, 15: 13,
16: 14, 17: 14, 18: 15, 19: 15, 20: 16
};

// Perícias afetadas por Penalidade de Armadura E Sobrecarga
const periciasComPenalidade = ["Acrobacia", "Furtividade", "Ladinagem"];

const listaPericias = [
"Acrobacia", "Adestramento", "Atletismo", "Atuacao", "Cavalgar", "Conhecimento", 
"Cura", "Diplomacia", "Enganacao", "Fortitude", "Furtividade", "Guerra", 
"Iniciativa", "Intimidacao", "Intuicao", "Jogatina", "Ladinagem", "Luta", 
"Misticismo", "Nobreza", "Oficio", "Percepcao", "Pilotagem", "Pontaria", 
"Reflexos", "Religiao", "Sobrevivencia", "Vontade"
];

export function calcularPericias() {
const nivel = gvn("nivel") || 1;
const metadeNivel = Math.floor(nivel / 2);

const penalidadeArmadura = gvn("armaduraPenalidade");
const penalidadeSobrecarga = gvn("penalidadeSobrecarga"); 

listaPericias.forEach(nome => {
 const selectElement = document.getElementById("attr" + nome);
 if (!selectElement) return; 

 const attr = selectElement.value;
 const valorAtributo = gvn(attr) || 0;

 const treinado = document.getElementById("treino" + nome)?.checked;
 const bonusTreino = treinado ? (bonusTreinamento[nivel] || 0) : metadeNivel;
 
 const bonusOutros = gvn("bonus" + nome); 

 let penalidadeTotal = 0;

 if (periciasComPenalidade.includes(nome)) {
  // 1. Aplica Penalidade de Armadura
  penalidadeTotal += penalidadeArmadura * -1;
  
  // 2. Aplica Penalidade de Sobrecarga (que já está negativa: -5 ou -10)
  penalidadeTotal += penalidadeSobrecarga; 
 }

 const total = valorAtributo + bonusTreino + bonusOutros + penalidadeTotal;
 
 const campo = document.getElementById("pericia" + nome);
 if (campo) campo.value = total;
});
}


// Inventario / Carga (CÁLCULO DE ESPAÇOS T20: 10 + 2 x Força)

export function capacidadeCarga() {
const forca = gvn("for");
// Capacidade padrão T20 (Espaços): 10 + 2 por ponto de Força.
const capacidadeLivre = 10 + (2 * forca); 

// Carga Máxima (Carga Pesada): O dobro da capacidade livre.
const capacidadePesada = capacidadeLivre * 2; 

if (capacidadeLivre < 0) capacidadeLivre = 0;

return {
 capacidadeLivre: capacidadeLivre, 
 capacidadePesada: capacidadePesada
};
}


export function atualizarInventario() {
const inventarioContainer = document.getElementById("inventarioContainer");
const statusInventario = document.getElementById("statusInventario");
const penalidadeSobrecargaInput = document.getElementById("penalidadeSobrecarga");
const deslocamentoM = document.getElementById("deslocamento-m");
const deslocamentoQ = document.getElementById("deslocamento-q");
let pesoAtual = 0;

// 1. Recálculo do Peso Total (O Peso é o "Espaço" ocupado)
inventarioContainer.querySelectorAll(".itemInventario").forEach(div => {
 const qtd = parseInt(div.querySelector(".itemQtd")?.value) || 0;
 const peso = parseFloat(div.querySelector(".itemPeso")?.value) || 0;
 const totalItem = (qtd * peso).toFixed(2);
 div.querySelector(".itemTotal").textContent = totalItem;
 pesoAtual += parseFloat(totalItem);
});

 // 2. Determinação da Categoria de Carga e Aplicação de Penalidades
const { 
 capacidadeLivre, 
 capacidadePesada 
} = capacidadeCarga();

let corCarga = "#2c1b10"; 
let penalidadeAtiva = 0; 
let reducaoDeslocamento = 0; 

if (pesoAtual > capacidadePesada) {
 corCarga = "#ff4d4d"; // Vermelho: Carga Pesada (Acima do máximo)
 penalidadeAtiva = 10; 
 reducaoDeslocamento = 6; 
 statusInventario.title = `Carga Pesada! Acima do limite máximo, penalidade de -10 em Acrobacia, Furtividade e Ladinagem.`;

} else if (pesoAtual > capacidadeLivre) {
 corCarga = "#ffaa00"; // Amarelo: Carga Média/Sobrepeso
 penalidadeAtiva = 5; 
 reducaoDeslocamento = 3; 
statusInventario.title = `Sobrecarga! Penalidade de -5 em Acrobacia, Furtividade e Ladinagem e -3m no deslocamento.`;

} else {
 corCarga = "#00b300"; // Verde: Carga Leve
 statusInventario.title = `Carga Leve. Você não sofre penalidades.`;
}

 // 3. Atualização dos campos afetados

// a) Penalidade de Armadura por Sobrecarga (NEGATIVA para subtrair)
penalidadeSobrecargaInput.value = penalidadeAtiva * -1;

// b) Redução do Deslocamento Base
const deslocamentoBaseMetros = 9; // Valor padrão de T20 (assumido)
const novoDeslocamentoMetros = (deslocamentoBaseMetros - reducaoDeslocamento).toFixed(1);
const novoDeslocamentoQuadrados = Math.round(novoDeslocamentoMetros / 1.5);

deslocamentoM.value = novoDeslocamentoMetros;
deslocamentoQ.value = novoDeslocamentoQuadrados;


// 4. Atualização Visual do Status (CORRIGIDA A ORDEM)
// NOVO FORMATO: Peso Atual / Capacidade Livre (Capacidade Máxima)
statusInventario.innerHTML = `Espaço ocupado: <span style="color:${corCarga};">${pesoAtual.toFixed(2)}</span> / ${capacidadeLivre.toFixed(2)} (${capacidadePesada.toFixed(2)} máximo)`;

// 5. Recalcula as perícias
calcularPericias();
}

document.getElementById("penalidadeSobrecarga")?.addEventListener("input", calcularPericias);