import { gvn } from "./formulario.js";

// ========================================================
// DEFESA (COM PENALIDADE DE CARGA PESADA)
// ========================================================

export function calcularDefesa() {
    const atributo = document.getElementById("defAtributo")?.value;
    const valorAtributo = gvn(atributo);
    const bonusAtributo = valorAtributo; 
    
    const armadura = parseInt(gvn("armadura") || 0);
    const escudo = parseInt(gvn("escudo") || 0);
    const outros = parseInt(gvn("defOutros") || 0);
    const penalidadeSobrecarga = parseInt(gvn("penalidadeSobrecarga") || 0);

    // Total Defesa: 10 + Bônus de Atributo + Armadura + Escudo + Outros + Penalidade Sobrecarga
    const total = 10 + bonusAtributo + armadura + escudo + outros + penalidadeSobrecarga;
    if (document.getElementById("defTotal")) {
        document.getElementById("defTotal").innerText = total;
    }
}

export function calcularCDMagia() {
    const nivel = parseInt(gvn("nivel") || 1);
    const metadeNivel = Math.floor(nivel / 2);
    
    const attrCD = document.getElementById("attrCD")?.value;
    const bonusAtributo = parseInt(gvn(attrCD) || 0); 
    const bonusOutros = parseInt(gvn("bonusCD") || 0); 
    
    const cd = 10 + metadeNivel + bonusAtributo + bonusOutros;
    
    const campoCD = document.getElementById("cdTotal");
    if (campoCD) {
        campoCD.innerText = cd;
    }
}

// ========================================================
// PERÍCIAS (COM PENALIDADE DE CARGA PESADA E OFÍCIOS)
// ========================================================

const bonusTreinamento = {
    1: 2, 2: 3, 3: 3, 4: 4, 5: 4,
    6: 5, 7: 7, 8: 8, 9: 8, 10: 9,
    11: 9, 12: 10, 13: 10, 14: 11, 15: 13,
    16: 14, 17: 14, 18: 15, 19: 15, 20: 16
};

const periciasComPenalidade = ["Acrobacia", "Furtividade", "Ladinagem"];
const periciasComExigenciaDeTreino = [
    "Adestramento", "Atuacao", "Conhecimento", "Guerra", "Jogatina", "Ladinagem", 
    "Misticismo", "Nobreza", "Oficio", "Pilotagem", "Religiao"
];

const listaPericias = [
    "Acrobacia", "Adestramento", "Atletismo", "Atuacao", "Cavalgar", "Conhecimento", 
    "Cura", "Diplomacia", "Enganacao", "Fortitude", "Furtividade", "Guerra", 
    "Iniciativa", "Intimidacao", "Intuicao","Investigacao", "Jogatina", "Ladinagem", "Luta", 
    "Misticismo", "Nobreza", "Oficio", "Percepcao", "Pilotagem", "Pontaria", 
    "Reflexos", "Religiao", "Sobrevivencia", "Vontade"
];

export function calcularPericias() {
    const nivel = parseInt(gvn("nivel") || 1);
    const penalidadeArmadura = parseInt(gvn("armaduraPenalidade") || 0);
    const penalidadeSobrecarga = parseInt(gvn("penalidadeSobrecarga") || 0); 

    // Calcula perícias normais
    listaPericias.forEach(nome => {
        const selectElement = document.getElementById("attr" + nome);
        if (!selectElement) return; 

        const attr = selectElement.value;
        const valorAtributo = parseInt(gvn(attr) || 0);

        const treinado = document.getElementById("treino" + nome)?.checked;
        const bonusTreino = treinado ? (bonusTreinamento[nivel] || 0) : Math.floor(nivel / 2);

        const bonusOutros = parseInt(gvn("bonus" + nome) || 0); 

        let penalidadeTotal = 0;

        if (periciasComPenalidade.includes(nome)) {
            penalidadeTotal -= penalidadeArmadura;
            penalidadeTotal += penalidadeSobrecarga; 
        }

        let total = 0;

        if (periciasComExigenciaDeTreino.includes(nome) && !treinado) {
            total = 0;
        } else {
            total = valorAtributo + bonusTreino + bonusOutros + penalidadeTotal;
        }

        const campo = document.getElementById("pericia" + nome);
        if (campo) campo.value = total;
    });

    // Calcula Ofícios (mesma lógica das outras perícias)
    document.querySelectorAll(".oficio-item").forEach(oficioDiv => {
        const oficioId = oficioDiv.dataset.oficioId;
        const selectElement = oficioDiv.querySelector(".oficioAttr");
        
        if (!selectElement) return;

        const attr = selectElement.value;
        const valorAtributo = parseInt(gvn(attr) || 0);

        const treinado = oficioDiv.querySelector(".oficioTreino")?.checked;
        const bonusTreino = treinado ? (bonusTreinamento[nivel] || 0) : Math.floor(nivel / 2);

        const bonusInput = oficioDiv.querySelector(".oficioBonus");
        const bonusOutros = parseInt(bonusInput?.value || 0);

        let penalidadeTotal = 0;

        // Ofício não sofre penalidade de armadura, mas pode sofrer de sobrecarga se necessário
        // (Comentado por padrão, mas pode ser ativado se necessário)
        // penalidadeTotal += penalidadeSobrecarga;

        let total = 0;

        // Ofício exige treinamento (assim como as outras perícias que exigem treino)
        if (!treinado) {
            total = 0;
        } else {
            total = valorAtributo + bonusTreino + bonusOutros + penalidadeTotal;
        }

        const campoValor = oficioDiv.querySelector(".oficioValor");
        if (campoValor) campoValor.value = total;
    });
}

// ========================================================
// INVENTÁRIO COM SISTEMA DE PENALIDADES
// ========================================================

/**
 * Atualiza o inventário e aplica penalidades de carga pesada/sobrecarga
 * - Carga Pesada (laranja): -5 Defesa, -3m deslocamento
 * - Sobrecarga (vermelho): -10 Defesa, -6m deslocamento
 */
export function atualizarInventario() {
    const forcaBase = parseInt(document.getElementById("for")?.value || 10);
    const cargaAdicional = parseInt(document.getElementById("cargaMaxima")?.value || 0);
    
    const cargaNormal = 10 + (2 * forcaBase) + cargaAdicional;
    const cargaMaxima = cargaNormal * 2;
    
    let espacoOcupado = 0;
    
    // Atualiza o total de cada item
    document.querySelectorAll(".itemInventario").forEach(item => {
        const qtdInput = item.querySelector(".itemQtd");
        const pesoInput = item.querySelector(".itemPeso");
        const totalSpan = item.querySelector(".itemTotal");
        
        const qtd = parseFloat(qtdInput?.value || 0);
        const peso = parseFloat(pesoInput?.value || 0);
        const total = qtd * peso;
        
        if (totalSpan) {
            totalSpan.textContent = total.toFixed(1);
        }
        
        espacoOcupado += total;
    });
    
    // Determina o nível de carga e aplica penalidades
    let penalidadeDefesa = 0;
    let penalidadeDeslocamento = 0;
    let statusCarga = "normal";
    
    if (espacoOcupado > cargaMaxima) {
        // SOBRECARGA (vermelho)
        statusCarga = "sobrecarga";
        penalidadeDefesa = -10;
        penalidadeDeslocamento = -6;
    } else if (espacoOcupado > cargaNormal) {
        // CARGA PESADA (laranja)
        statusCarga = "pesada";
        penalidadeDefesa = -5;
        penalidadeDeslocamento = -3;
    }
    
    // Atualiza o campo hidden com a penalidade de defesa
    const campoPenalidadeSobrecarga = document.getElementById("penalidadeSobrecarga");
    if (campoPenalidadeSobrecarga) {
        campoPenalidadeSobrecarga.value = penalidadeDefesa;
    }
    
    // Aplica penalidade ao deslocamento
    aplicarPenalidadeDeslocamento(penalidadeDeslocamento);
    
    // Atualiza o status no rodapé
    const statusElement = document.getElementById("statusInventario");
    if (statusElement) {
        const valorSpan = statusElement.querySelector(".status-valor");
        const maxSpan = statusElement.querySelector(".status-max");
        const avisoSpan = statusElement.querySelector(".status-aviso");
        
        if (valorSpan) valorSpan.textContent = espacoOcupado.toFixed(1);
        if (maxSpan) maxSpan.textContent = cargaNormal.toFixed(1);
        
        if (avisoSpan) {
            if (statusCarga === "sobrecarga") {
                valorSpan.style.color = "#d32f2f";
                avisoSpan.textContent = `(${cargaMaxima.toFixed(1)} máx. - SOBRECARGA! -10 Def, -6m)`;
                avisoSpan.style.color = "#d32f2f";
            } else if (statusCarga === "pesada") {
                valorSpan.style.color = "#ff9800";
                avisoSpan.textContent = `(${cargaMaxima.toFixed(1)} máx. - sobrecarga: -5 Def, -3m)`;
                avisoSpan.style.color = "#ff9800";
            } else {
                valorSpan.style.color = "#2d8c2d";
                avisoSpan.textContent = "";
            }
        }
    }
    
    // Recalcula defesa e perícias após aplicar penalidades
    calcularDefesa();
    calcularPericias();
}

/**
 * Aplica a penalidade de deslocamento ao valor base armazenado
 */
function aplicarPenalidadeDeslocamento(penalidade) {
    const deslocamentoMInput = document.getElementById("deslocamento-m");
    const deslocamentoQInput = document.getElementById("deslocamento-q");
    
    if (!deslocamentoMInput || !deslocamentoQInput) return;
    
    // Pega o valor base armazenado (sem penalidades)
    let deslocamentoBase = parseFloat(deslocamentoMInput.dataset.valorBase);
    
    // Se não existe valor base armazenado, usa o valor atual como base
    if (!deslocamentoBase) {
        deslocamentoBase = parseFloat(deslocamentoMInput.value) || 9;
        deslocamentoMInput.dataset.valorBase = deslocamentoBase;
    }
    
    // Aplica a penalidade ao valor base
    const novoDeslocamentoM = Math.max(0, deslocamentoBase + penalidade);
    const novoDeslocamentoQ = Math.round(novoDeslocamentoM / 1.5);
    
    // Atualiza os campos
    deslocamentoMInput.value = novoDeslocamentoM.toFixed(1);
    deslocamentoQInput.value = novoDeslocamentoQ;
}

/**
 * Função auxiliar para resetar o valor base do deslocamento
 * Deve ser chamada quando o usuário manualmente edita o deslocamento
 */
export function resetarDeslocamentoBase() {
    const deslocamentoMInput = document.getElementById("deslocamento-m");
    if (deslocamentoMInput) {
        deslocamentoMInput.dataset.valorBase = deslocamentoMInput.value;
    }
}

// ========================================================
// CAPACIDADE DE CARGA (Função auxiliar mantida)
// ========================================================

export function capacidadeCarga() {
    const forca = parseInt(gvn("for") || 0);
    const bonusCarga = parseInt(gvn("cargaMaxima") || 0); 
    
    const capacidadeLivre = 10 + (2 * forca) + bonusCarga; 
    const capacidadePesada = capacidadeLivre * 2; 

    const capacidadeLivreCorrigida = Math.max(0, capacidadeLivre);
    const capacidadePesadaCorrigida = Math.max(0, capacidadePesada);

    return {
        capacidadeLivre: capacidadeLivreCorrigida, 
        capacidadePesada: capacidadePesadaCorrigida
    };
}