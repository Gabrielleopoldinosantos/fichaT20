// calculos.js
import { gvn } from "./formulario.js"; // Para obter valores do formulário

// ========================
// Defesa
// ========================

export function calcularDefesa() {
    const atributo = document.getElementById("defAtributo")?.value;
    const valorAtributo = gvn(atributo);
    // Nota: Em Tormenta 20, o bônus de atributo é o próprio valor, não o modificador (floor(valor/2)-5)
    // Se o cálculo da ficha é apenas o valor do atributo, a linha abaixo está correta:
    const bonusAtributo = valorAtributo; 
    
    const armadura = gvn("armadura");
    const escudo = gvn("escudo");
    const outros = gvn("defOutros");

    const total = 10 + bonusAtributo + armadura + escudo + outros;
    if (document.getElementById("defTotal")) {
        document.getElementById("defTotal").innerText = total;
    }
}


// ========================
// Perícias
// ========================
const bonusTreinamento = {
    1: 2, 2: 3, 3: 3, 4: 4, 5: 4,
    6: 5, 7: 7, 8: 8, 9: 8, 10: 9,
    11: 9, 12: 10, 13: 10, 14: 11, 15: 13,
    16: 14, 17: 14, 18: 15, 19: 15, 20: 16
};

const atributoPericia = {
    Acrobacia: "des", Adestramento: "car", Atletismo: "for", Atuacao: "car",
    Cavalgar: "des", Conhecimento: "int", Cura: "sab", Diplomacia: "car",
    Enganacao: "car", Fortitude: "con", Furtividade: "des", Guerra: "int",
    Iniciativa: "des", Intimidacao: "car", Intuicao: "sab", Investigacao: "int",
    Jogatina: "car", Ladinagem: "des", Luta: "for", Misticismo: "int",
    Nobreza: "int", Oficio: "int", Percepcao: "sab", Pilotagem: "des",
    Pontaria: "des", Reflexos: "des", Religiao: "sab", Sobrevivencia: "sab",
    Vontade: "sab"
};

export function calcularPericias() {
    const nivel = gvn("nivel") || 1;
    const metadeNivel = Math.floor(nivel / 2);

Object.keys(atributoPericia).forEach(nome => {
        const attr = atributoPericia[nome];
        const valorAtributo = gvn(attr) || 0;

        const treinado = document.getElementById("treino" + nome)?.checked;
        const bonusTreino = treinado ? (bonusTreinamento[nivel] || 0) : metadeNivel;
        
        // NOVO: Coleta o valor do bônus (que o usuário digita)
        const bonusOutros = gvn("bonus" + nome); 

        // SOMA TODOS OS BÔNUS
        const total = valorAtributo + bonusTreino + bonusOutros;
        
        const campo = document.getElementById("pericia" + nome);
        if (campo) campo.value = total;
    });
}


// ========================
// Inventário / Carga
// ========================

export function capacidadeCarga() {
    const forca = gvn("for");
    // Lógica de cálculo de carga de T20 (10 + Força * 2, mas simplificado aqui)
    let capacidade = 10 + (forca > 0 ? forca * 2 : 0); // Ajuste para a regra 5 + Força*2

    // Se estiver usando o cálculo original do seu código (que parece ser para Força negativa):
    // let capacidade = 10 + (forca > 0 ? forca * 2 : forca * -1 * -1); 
    // if (forca < 0) capacidade = 10 + (2 * 0) + (forca); 
    if (capacidade < 0) capacidade = 0;
    
    return {
        normal: capacidade,
        max: capacidade * 2 // Carga Máxima é o dobro
    };
}


export function atualizarInventario() {
    let ocupado = 0;

    document.querySelectorAll(".itemInventario").forEach(div => {
        const qtd = parseInt(div.querySelector(".itemQtd")?.value) || 0;
        const peso = parseFloat(div.querySelector(".itemPeso")?.value) || 0;
        ocupado += qtd * peso;
        const totalEl = div.querySelector(".itemTotal");
        if(totalEl) totalEl.innerText = (qtd * peso).toFixed(2); // Formata para 2 casas
    });

    const cap = capacidadeCarga();
    const status = document.getElementById("statusInventario");
    if (status) {
        status.innerText = `Espaço ocupado: ${ocupado.toFixed(2)} / ${cap.normal} (máx ${cap.max})`;
        if (ocupado > cap.normal && ocupado <= cap.max) {
            status.style.color = "orange";
        } else if (ocupado > cap.max) {
            status.style.color = "red";
        } else {
            status.style.color = "green";
        }
    }
}