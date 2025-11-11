// script.js (Modificado)

// Importa as configurações do Firebase e as funções de CRUD
import {
    firebaseConfig,
    db,
    COL,
    fichaAtualId,
    salvarFicha,
    listarFichas,
    carregarFichaSelecionada,
    setFichaAtualId,
    atualizarPVPM // <<< NOVO: Importa a função de atualização específica
} from "./firebase.js";

// Importa funções de I/O do formulário e helpers
import {
    coletarFichaDoFormulario,
    preencherFormularioComFicha,
    gvn // Usado aqui para os listeners de Realtime
} from "./formulario.js";

// Importa as funções de utilidade (elementos dinâmicos)
import {
    criarItemInventario,
    criarMagia
} from "./util.js";

// Importa as funções de cálculo de regras
import {
    calcularDefesa,
    calcularPericias,
    atualizarInventario,
    calcularCDMagia // < NOVA
} from "./calculos.js";


// ========================================================
// 1) Lógica de Status (PV/PM) e Realtime
// ========================================================

/**
 * Atualiza visualmente as barras de PV/PM e os campos de input.
 * Garante que PV <= PV Max e PM <= PM Max.
 */
function atualizarStatus() {
    // Lê os valores
    const pv = parseInt(gvn("pv-input") || 0);
    const pvMax = parseInt(gvn("pvMax-input") || 1);
    const pm = parseInt(gvn("pm-input") || 0);
    const pmMax = parseInt(gvn("pmMax-input") || 1);

    // Calcula porcentagem da barra
    const pvPercent = (pv / pvMax) * 100;
    const pmPercent = (pm / pmMax) * 100;

    // Atualiza barras visuais
    const pvBar = document.getElementById('pv-bar');
    const pmBar = document.getElementById('pm-bar');

    // Se passar do máximo, muda a cor para indicar excesso
    if (pv > pvMax) {
        pvBar.style.width = '100%';
        pvBar.style.backgroundColor = '#00b300'; // Verde para excesso
    } else {
        pvBar.style.width = pvPercent + '%';
        pvBar.style.backgroundColor = '#ff4d4d';
    }

    if (pm > pmMax) {
        pmBar.style.width = '100%';
        pmBar.style.backgroundColor = '#0066ff'; // Azul para excesso
    } else {
        pmBar.style.width = pmPercent + '%';
        pmBar.style.backgroundColor = '#3399ff';
    }

    // Ajusta cor do texto (mesma lógica de antes)
    const pvInput = document.getElementById('pv-input');
    const pmInput = document.getElementById('pm-input');

    pvInput.style.color = pvPercent < 45 ? '#5a0000' : '#fff';
    pmInput.style.color = pmPercent < 45 ? '#5a0000' : '#fff';
}


// Função de Realtime adaptada para ler dos inputs
async function atualizarCardsRealtime() {
    const data = {
        // Agora lê dos inputs do DOM
        pv: parseInt(gvn("pv-input") || 0),
        pvMax: parseInt(gvn("pvMax-input") || 0),
        pm: parseInt(gvn("pm-input") || 0),
        pmMax: parseInt(gvn("pmMax-input") || 0)
    };

    // Ação Principal: Atualiza o Firebase se uma ficha estiver aberta
    if (fichaAtualId) {
        // Chama a função do Firebase para persistir os PV/PM no documento atual
        await atualizarPVPM(data); 
    }
    
    // Envia valores para outras abas (Broadcast Channel - método secundário)
    // NOTE: 'channel' não está definido aqui, mas a lógica de broadcast é mantida.
    // channel.postMessage(data); 

    // Atualiza card na mesma aba (se houver)
    if (window.updateCardDisplay) {
        window.updateCardDisplay(data);
    }
}

// ========================================================
// NOVO: Lógica de Deslocamento
// ========================================================

/**
 * Recalcula o Deslocamento, mantendo a proporção 1 quadrado = 1.5 metros.
 */
function calcularDeslocamento() {
    const metrosInput = document.getElementById("deslocamento-m");
    const quadradosInput = document.getElementById("deslocamento-q");
    
    // Identifica qual campo foi alterado
    const targetId = event.target.id;
    const taxaConversao = 1.5; // 1 quadrado = 1.5 metros

    if (targetId === "deslocamento-m") {
        // Se o usuário mudou Metros, calcula Quadrados
        const metros = parseFloat(metrosInput.value) || 0;
        const quadrados = Math.round(metros / taxaConversao); // Arredonda para o número inteiro de quadrados
        quadradosInput.value = quadrados;
    } else if (targetId === "deslocamento-q") {
        // Se o usuário mudou Quadrados, calcula Metros
        const quadrados = parseFloat(quadradosInput.value) || 0;
        const metros = (quadrados * taxaConversao).toFixed(1); // Mantém 1 casa decimal para metros
        metrosInput.value = metros;
    }
}


// ========================================================
// 2) Listeners e Inicialização
// ========================================================

// Garante que as funções globais estejam disponíveis no HTML
window.salvarFicha = salvarFicha;
window.carregarFichaSelecionada = carregarFichaSelecionada;

// Listeners de PV/PM (Realtime) - Adaptado para os novos IDs de INPUT
["pv-input", "pvMax-input", "pm-input", "pmMax-input"].forEach(id => {
    const inputElement = document.getElementById(id);
    if (inputElement) {
        // Dispara a atualização visual e de persistência
        inputElement.addEventListener("input", atualizarStatus); 
    }
});

// Listeners de Defesa
["defAtributo", "for", "des", "con", "int", "sab", "car", "armadura", "escudo", "defOutros"]
    .forEach(id => {
        document.getElementById(id)?.addEventListener("input", calcularDefesa);
    });

    document.getElementById("armaduraPenalidade")?.addEventListener("input", calcularPericias);

// Listeners de Perícias
// Lista de IDs das perícias para adicionar o listener de alteração de atributo
const pericias = ["Acrobacia", "Adestramento", "Atletismo", "Atuacao", "Cavalgar", "Conhecimento", "Cura", "Diplomacia", "Enganacao", "Fortitude", "Furtividade", "Guerra", "Iniciativa", "Intimidacao", "Intuicao","Investigacao", "Jogatina", "Ladinagem", "Luta", "Misticismo", "Nobreza", "Oficio", "Percepcao", "Pilotagem", "Pontaria", "Reflexos", "Religiao", "Sobrevivencia", "Vontade"];

// NOVO: Listeners de Deslocamento
["deslocamento-m", "deslocamento-q"].forEach(id => {
    document.getElementById(id)?.addEventListener("input", calcularDeslocamento);
});

// Listener para a alteração do atributo base da perícia (o novo ponto)
pericias.forEach(nome => {
    document.getElementById("attr" + nome)?.addEventListener("change", calcularPericias);
});

// Listener para a alteração do bônus de outros na perícia
pericias.forEach(nome => {
    document.getElementById("bonus" + nome)?.addEventListener("input", calcularPericias);
});

// Listener para a alteração dos atributos principais e do nível
["nivel", "for", "des", "con", "int", "sab", "car"].forEach(id => {
    document.getElementById(id)?.addEventListener("input", calcularPericias);
});

// Listeners de CD da Magia
["nivel", "for", "des", "con", "int", "sab", "car"].forEach(id => {
    document.getElementById(id)?.addEventListener("input", calcularCDMagia);
});

["for", "cargaMaxima", "limiteItens"].forEach(id => {
    document.getElementById(id)?.addEventListener("input", atualizarInventario);
});

// Listener para o atributo base e o bônus manual da CD
document.getElementById("attrCD")?.addEventListener("change", calcularCDMagia);
document.getElementById("bonusCD")?.addEventListener("input", calcularCDMagia);

document.querySelectorAll(".pericias input[type=checkbox]").forEach(cb => {
    cb.addEventListener("change", calcularPericias);
});

// Listeners de Inventário
document.getElementById("addItemBtn")?.addEventListener("click", () => criarItemInventario());
document.getElementById("for")?.addEventListener("input", atualizarInventario);


// Listener de Magias
document.getElementById("addMagiaBtn")?.addEventListener("click", () => criarMagia());


// ========================================================
// 3) Lógica de Modo Escuro
// ========================================================

const DARK_MODE_KEY = 'darkModeEnabled';
const toggleDarkModeBtn = document.getElementById('toggleDarkModeBtn');

function enableDarkMode() {
    document.body.classList.add('dark-mode');
    toggleDarkModeBtn.textContent = '☀️ Modo Claro';
    localStorage.setItem(DARK_MODE_KEY, 'true');
}

function disableDarkMode() {
    document.body.classList.remove('dark-mode');
    toggleDarkModeBtn.textContent = '🌓 Modo Escuro';
    localStorage.removeItem(DARK_MODE_KEY);
}

function toggleDarkMode() {
    if (document.body.classList.contains('dark-mode')) {
        disableDarkMode();
    } else {
        enableDarkMode();
    }
}

// Inicializa o modo escuro com base na preferência salva
function initDarkMode() {
    if (localStorage.getItem(DARK_MODE_KEY) === 'true') {
        enableDarkMode();
    } else {
        // Se a chave não existir ou for falsa, garante que esteja em modo claro
        disableDarkMode();
    }
}

// Adiciona o listener ao botão
toggleDarkModeBtn?.addEventListener('click', toggleDarkMode);


// ========================================================
// 4) Inicialização ao carregar a página
// ========================================================

window.addEventListener("load", () => {
    listarFichas();
    initDarkMode(); // Inicializa o modo escuro
    calcularDefesa();   
    calcularPericias();
    atualizarInventario();
    atualizarStatus(); // Chama a atualização de status (PV/PM) na inicialização
    calcularCDMagia();
});

// Manter a função gvn se ela for usada em outros lugares no script.
// A função gvn é tipicamente definida no 'formulario.js', mas mantendo o uso aqui.