// script.js (Modificado com Sistema de Penalidades)

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
    atualizarPVPM
} from "./firebase.js";

// Importa funções de I/O do formulário e helpers
import {
    coletarFichaDoFormulario,
    preencherFormularioComFicha,
    gvn
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
    calcularCDMagia,
    resetarDeslocamentoBase // NOVA FUNÇÃO
} from "./calculos.js";


// ========================================================
// 1) Lógica de Status (PV/PM) e Realtime
// ========================================================

function atualizarStatus() {
    const pv = parseInt(gvn("pv-input") || 0);
    const pvMax = parseInt(gvn("pvMax-input") || 1);
    const pm = parseInt(gvn("pm-input") || 0);
    const pmMax = parseInt(gvn("pmMax-input") || 1);

    const pvPercent = (pv / pvMax) * 100;
    const pmPercent = (pm / pmMax) * 100;

    const pvBar = document.getElementById('pv-bar');
    const pmBar = document.getElementById('pm-bar');

    if (pv > pvMax) {
        pvBar.style.width = '100%';
        pvBar.style.backgroundColor = '#00b300';
    } else {
        pvBar.style.width = pvPercent + '%';
        pvBar.style.backgroundColor = '#ff4d4d';
    }

    if (pm > pmMax) {
        pmBar.style.width = '100%';
        pmBar.style.backgroundColor = '#0066ff';
    } else {
        pmBar.style.width = pmPercent + '%';
        pmBar.style.backgroundColor = '#3399ff';
    }

    const pvInput = document.getElementById('pv-input');
    const pmInput = document.getElementById('pm-input');

    pvInput.style.color = pvPercent < 45 ? '#5a0000' : '#fff';
    pmInput.style.color = pmPercent < 45 ? '#5a0000' : '#fff';
}

async function atualizarCardsRealtime() {
    const data = {
        pv: parseInt(gvn("pv-input") || 0),
        pvMax: parseInt(gvn("pvMax-input") || 0),
        pm: parseInt(gvn("pm-input") || 0),
        pmMax: parseInt(gvn("pmMax-input") || 0)
    };

    if (fichaAtualId) {
        await atualizarPVPM(data); 
    }

    if (window.updateCardDisplay) {
        window.updateCardDisplay(data);
    }
}

// ========================================================
// NOVO: Lógica de Deslocamento (Atualizada)
// ========================================================

/**
 * Recalcula o Deslocamento quando o usuário edita manualmente
 * e reseta o valor base para evitar conflitos com penalidades
 */
function calcularDeslocamento() {
    const metrosInput = document.getElementById("deslocamento-m");
    const quadradosInput = document.getElementById("deslocamento-q");
    
    const targetId = event.target.id;
    const taxaConversao = 1.5;

    if (targetId === "deslocamento-m") {
        const metros = parseFloat(metrosInput.value) || 0;
        const quadrados = Math.round(metros / taxaConversao);
        quadradosInput.value = quadrados;
        
        // Reseta o valor base quando o usuário edita manualmente
        resetarDeslocamentoBase();
    } else if (targetId === "deslocamento-q") {
        const quadrados = parseFloat(quadradosInput.value) || 0;
        const metros = (quadrados * taxaConversao).toFixed(1);
        metrosInput.value = metros;
        
        // Reseta o valor base quando o usuário edita manualmente
        resetarDeslocamentoBase();
    }
}


// ========================================================
// 2) Listeners e Inicialização
// ========================================================

window.salvarFicha = salvarFicha;
window.carregarFichaSelecionada = carregarFichaSelecionada;

// Listeners de PV/PM
["pv-input", "pvMax-input", "pm-input", "pmMax-input"].forEach(id => {
    const inputElement = document.getElementById(id);
    if (inputElement) {
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
const pericias = ["Acrobacia", "Adestramento", "Atletismo", "Atuacao", "Cavalgar", "Conhecimento", "Cura", "Diplomacia", "Enganacao", "Fortitude", "Furtividade", "Guerra", "Iniciativa", "Intimidacao", "Intuicao","Investigacao", "Jogatina", "Ladinagem", "Luta", "Misticismo", "Nobreza", "Oficio", "Percepcao", "Pilotagem", "Pontaria", "Reflexos", "Religiao", "Sobrevivencia", "Vontade"];

// Listeners de Deslocamento (com change também para capturar edições manuais)
["deslocamento-m", "deslocamento-q"].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener("input", calcularDeslocamento);
        el.addEventListener("change", calcularDeslocamento);
    }
});

pericias.forEach(nome => {
    document.getElementById("attr" + nome)?.addEventListener("change", calcularPericias);
});

pericias.forEach(nome => {
    document.getElementById("bonus" + nome)?.addEventListener("input", calcularPericias);
});

["nivel", "for", "des", "con", "int", "sab", "car"].forEach(id => {
    document.getElementById(id)?.addEventListener("input", calcularPericias);
});

["nivel", "for", "des", "con", "int", "sab", "car"].forEach(id => {
    document.getElementById(id)?.addEventListener("input", calcularCDMagia);
});

// IMPORTANTE: Listener para Força também atualiza inventário (penalidades)
["for", "cargaMaxima"].forEach(id => {
    document.getElementById(id)?.addEventListener("input", atualizarInventario);
});

document.getElementById("attrCD")?.addEventListener("change", calcularCDMagia);
document.getElementById("bonusCD")?.addEventListener("input", calcularCDMagia);

document.querySelectorAll(".pericias input[type=checkbox]").forEach(cb => {
    cb.addEventListener("change", calcularPericias);
});

document.getElementById("addItemBtn")?.addEventListener("click", () => criarItemInventario());
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

function initDarkMode() {
    if (localStorage.getItem(DARK_MODE_KEY) === 'true') {
        enableDarkMode();
    } else {
        disableDarkMode();
    }
}

toggleDarkModeBtn?.addEventListener('click', toggleDarkMode);


// ========================================================
// 4) Inicialização ao carregar a página
// ========================================================

window.addEventListener("load", () => {
    listarFichas();
    initDarkMode();
    calcularDefesa();   
    calcularPericias();
    atualizarInventario();
    atualizarStatus();
    calcularCDMagia();
});