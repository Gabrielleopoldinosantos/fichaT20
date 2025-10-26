// script.js

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
    atualizarInventario
} from "./calculos.js";


// ========================================================
// 1) Lógica de Realtime (PV/PM)
// ========================================================

// Canal para comunicação entre abas
async function atualizarCardsRealtime() { // Transforma em async
    const data = {
        pv: gvn("pv"),
        pvMax: gvn("pvMax"),
        pm: gvn("pm"),
        pmMax: gvn("pmMax")
    };

    // Ação Principal: Atualiza o Firebase se uma ficha estiver aberta
    if (fichaAtualId) {
        // Chama a função do Firebase para persistir os PV/PM no documento atual
        await atualizarPVPM(data); 
    }
    
    // Envia valores para outras abas (Broadcast Channel - método secundário)
    channel.postMessage(data);

    // Atualiza card na mesma aba (se houver)
    if (window.updateCardDisplay) {
        window.updateCardDisplay(data);
    }
}


// ========================================================
// 2) Listeners e Inicialização
// ========================================================

// Garante que as funções globais estejam disponíveis no HTML
window.salvarFicha = salvarFicha;
window.carregarFichaSelecionada = carregarFichaSelecionada;

// Listeners de PV/PM (Realtime)
["pv", "pvMax", "pm", "pmMax"].forEach(id => {
    // Agora este evento irá disparar a persistência imediata
    document.getElementById(id)?.addEventListener("input", atualizarCardsRealtime);
});

// Listeners de Defesa
["defAtributo", "for", "des", "con", "int", "sab", "car", "armadura", "escudo", "defOutros"]
    .forEach(id => {
        document.getElementById(id)?.addEventListener("input", calcularDefesa);
    });

// Listeners de Perícias
["nivel", "for", "des", "con", "int", "sab", "car"].forEach(id => {
    document.getElementById(id)?.addEventListener("input", calcularPericias);
});
document.querySelectorAll(".pericias input[type=checkbox]").forEach(cb => {
    cb.addEventListener("change", calcularPericias);
});

// Listeners de Inventário
document.getElementById("addItemBtn")?.addEventListener("click", () => criarItemInventario());
document.getElementById("for")?.addEventListener("input", atualizarInventario);

// Listener de Magias
document.getElementById("addMagiaBtn")?.addEventListener("click", () => criarMagia());

// Inicialização ao carregar a página
window.addEventListener("load", () => {
    listarFichas();
    calcularDefesa();
    calcularPericias();
    atualizarInventario();
    atualizarCardsRealtime();
});