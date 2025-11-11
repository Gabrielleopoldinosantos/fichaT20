import { gvn } from "./formulario.js";

// ========================================================
// DEFESA & CD MAGIA (Sem Alterações)
// ========================================================

// Defesa (Mantido com regra simplificada: Atributo = Bônus)
export function calcularDefesa() {
    const atributo = document.getElementById("defAtributo")?.value;
    const valorAtributo = gvn(atributo);
    const bonusAtributo = valorAtributo; 
    
    const armadura = parseInt(gvn("armadura") || 0);
    const escudo = parseInt(gvn("escudo") || 0);
    const outros = parseInt(gvn("defOutros") || 0);
    const penalidadeSobrecarga = parseInt(gvn("penalidadeSobrecarga") || 0); // NOVO: Captura penalidade

    // Total Defesa: 10 + Bônus de Atributo + Armadura + Escudo + Outros + Penalidade Sobrecarga (negativa)
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
// PERÍCIAS (Sem Alterações)
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
    // Note: penalidadeSobrecarga é um número negativo ou zero (-5, -10, ou 0)
    const penalidadeSobrecarga = parseInt(gvn("penalidadeSobrecarga") || 0); 

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
            // Penalidade de Armadura é positiva no input HTML, mas negativa na regra.
            penalidadeTotal -= penalidadeArmadura;
            
            // Penalidade de Sobrecarga é capturada como negativa (-5 ou -10)
            penalidadeTotal += penalidadeSobrecarga; 
        }

        let total = 0;

        // Se a perícia exige treino e não está treinada, o total é 0.
        if (periciasComExigenciaDeTreino.includes(nome) && !treinado) {
            total = 0;
        } else {
            // CÁLCULO PADRÃO (para perícias treinadas ou que não exigem treino)
            total = valorAtributo + bonusTreino + bonusOutros + penalidadeTotal;
        }

        const campo = document.getElementById("pericia" + nome);
        if (campo) campo.value = total;
    });
}


// ========================================================
// INVENTÁRIO / CARGA (MODIFICADO para customização)
// ========================================================

/**
 * Calcula a capacidade de carga (Espaços) de um personagem.
 * Inclui o valor customizável da Carga Máxima.
 */
export function capacidadeCarga() {
    const forca = parseInt(gvn("for") || 0);
    // NOVO: Valor customizado do input "Carga Máxima" (bônus manual)
    const bonusCarga = parseInt(gvn("cargaMaxima") || 0); 
    
    // Capacidade padrão T20 (Espaços): 10 + (2 * Força) + Bônus Manual (cargaMaxima)
    const capacidadeLivre = 10 + (2 * forca) + bonusCarga; 
    
    // Carga Máxima (Carga Pesada): O dobro da capacidade livre.
    const capacidadePesada = capacidadeLivre * 2; 

    // Correção de bug de valor negativo
    const capacidadeLivreCorrigida = Math.max(0, capacidadeLivre);
    // A capacidade pesada também é ajustada se a livre for 0
    const capacidadePesadaCorrigida = Math.max(0, capacidadePesada);


    return {
        capacidadeLivre: capacidadeLivreCorrigida, 
        capacidadePesada: capacidadePesadaCorrigida
    };
}


export function atualizarInventario() {
    const inventarioContainer = document.getElementById("inventarioContainer");
    const statusInventario = document.getElementById("statusInventario");
    const penalidadeSobrecargaInput = document.getElementById("penalidadeSobrecarga");
    const deslocamentoM = document.getElementById("deslocamento-m");
    const deslocamentoQ = document.getElementById("deslocamento-q");
    let pesoAtual = 0;
    let itensContagem = 0; // NOVO: Contador de itens

    // Captura o limite de itens customizado
    const limiteItens = parseInt(gvn("limiteItens") || 0);

    // 1. Recálculo do Peso Total (O Peso é o "Espaço" ocupado)
    inventarioContainer.querySelectorAll(".itemInventario").forEach(div => {
        const qtd = parseInt(div.querySelector(".itemQtd")?.value) || 0;
        const peso = parseFloat(div.querySelector(".itemPeso")?.value) || 0;
        const totalItem = (qtd * peso).toFixed(2);
        
        // Atualiza o total visual de cada item
        const totalElement = div.querySelector(".itemTotal");
        if(totalElement) totalElement.textContent = totalItem;
        
        pesoAtual += parseFloat(totalItem);
        itensContagem += 1; // Incrementa a contagem de itens
    });

    // 2. Determinação da Categoria de Carga e Aplicação de Penalidades
    const { 
        capacidadeLivre, 
        capacidadePesada 
    } = capacidadeCarga();

    let corCarga = "#00b300"; // Verde: Carga Leve
    let penalidadeAtiva = 0; 
    let reducaoDeslocamento = 0; 
    let statusTitle = `Carga Leve. Você não sofre penalidades.`;
    let avisoItens = "";

    if (pesoAtual > capacidadePesada) {
        corCarga = "#ff4d4d"; // Vermelho: Carga Pesada (Acima do máximo)
        penalidadeAtiva = 10; 
        reducaoDeslocamento = 6; 
        statusTitle = `Carga Pesada! Acima do limite máximo, penalidade de -10 em Acrobacia, Furtividade e Ladinagem e -6m no deslocamento.`;

    } else if (pesoAtual > capacidadeLivre) {
        corCarga = "#ffaa00"; // Amarelo: Carga Média/Sobrepeso
        penalidadeAtiva = 5; 
        reducaoDeslocamento = 3; 
        statusTitle = `Sobrecarga! Penalidade de -5 em Acrobacia, Furtividade e Ladinagem e -3m no deslocamento.`;
    }
    
    // NOVO: Checagem do limite de itens
    if (limiteItens > 0 && itensContagem > limiteItens) {
        // Alerta visual de limite de itens excedido
        avisoItens = ` (LIMITE DE ITENS EXCEDIDO: ${itensContagem}/${limiteItens})`;
        statusTitle += `\n*Atenção: Limite de itens excedido!*`;
        // Você pode optar por dar uma penalidade aqui se quiser
    }

    // 3. Atualização dos campos afetados

    // a) Penalidade de Sobrecarga (NEGATIVA para subtrair)
    penalidadeSobrecargaInput.value = penalidadeAtiva * -1;

    // b) Redução do Deslocamento Base
    const deslocamentoBaseMetros = 9; // Valor padrão de T20 (assumido)
    const novoDeslocamentoMetros = Math.max(0, deslocamentoBaseMetros - reducaoDeslocamento).toFixed(1);
    const novoDeslocamentoQuadrados = Math.round(parseFloat(novoDeslocamentoMetros) / 1.5);

    // Atualiza os inputs de deslocamento
    deslocamentoM.value = novoDeslocamentoMetros;
    deslocamentoQ.value = novoDeslocamentoQuadrados;


    // 4. Atualização Visual do Status (CORRIGIDA A ORDEM)
    // Formato: Peso Atual / Capacidade Livre (Capacidade Máxima) | Itens: Contagem / Limite
    statusInventario.innerHTML = `Espaço ocupado: <span style="color:${corCarga};">${pesoAtual.toFixed(2)}</span> / ${capacidadeLivre.toFixed(2)} (${capacidadePesada.toFixed(2)} máx.)${avisoItens}`;
    statusInventario.title = statusTitle;

    // 5. Recalcula as perícias (para aplicar a penalidade de sobrecarga)
    calcularPericias();
}