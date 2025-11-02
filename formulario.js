// formulario.js
import {
    calcularDefesa
} from "./calculos.js"; // Para garantir que os cálculos rodem após preencher

// Helpers
export const gv = (id) => (document.getElementById(id)?.value ?? "");
export const gvn = (id) => parseInt(document.getElementById(id)?.value) || 0;

// Importa as funções para criar elementos dinâmicos
import {
    criarItemInventario,
    criarMagia
} from "./util.js";


// Coleta todos os dados da tela
export function coletarFichaDoFormulario() {
    
// Perícias
const pericias = [];
document.querySelectorAll(".pericias div").forEach(div => {
  const nome = div.querySelector("span")?.innerText?.trim() ?? "";
  const valor = parseInt(div.querySelector("#pericia" + nome)?.value) || 0;
  const treinado = div.querySelector("#treino" + nome)?.checked || false;
  const bonus = gvn("bonus" + nome);
  const atributo = div.querySelector("#attr" + nome)?.value ?? "des"; // novo campo

  if (nome)
    pericias.push({ nome, valor, treinado, bonus, atributo });
});


    // Ataques
    const ataques = [];
    document.querySelectorAll("#ataquesContainer .ataque").forEach(div => {
        const inputs = div.querySelectorAll("input");
        ataques.push({
            nome: inputs[0]?.value ?? "",
            teste: inputs[1]?.value ?? "",
            dano: inputs[2]?.value ?? "",
            critico: inputs[3]?.value ?? "",
            alcance: inputs[4]?.value ?? "",
            tipo: inputs[5]?.value ?? ""
        });
    });

    // Magias 
    const magias = [];
    document.querySelectorAll("#magiasContainer .magia").forEach(div => {
        magias.push({
            nome: div.querySelector(".magiaNome")?.value ?? "",
            circulo: parseInt(div.querySelector(".magiaCirculo")?.value) || 0,
            tipo: div.querySelector(".magiaTipo")?.value ?? "arcana", // Select
            execucao: div.querySelector(".magiaExecucao")?.value ?? "",
            alcance: div.querySelector(".magiaAlcance")?.value ?? "",
            alvo: div.querySelector(".magiaAlvo")?.value ?? "",
            duracao: div.querySelector(".magiaDuracao")?.value ?? "",
            resistencia: div.querySelector(".magiaResistencia")?.value ?? "",
            descricao: div.querySelector(".magiaDesc textarea")?.value ?? ""
        });
    });

    return {
        nome: gv("nome"),
        jogador: gv("jogador"),
        raca: gv("raca"),
        origem: gv("origem"),
        classe: gv("classe"),
        nivel: gvn("nivel"),
        divindade: gv("divindade"),

        for: gvn("for"),
        des: gvn("des"),
        con: gvn("con"),
        int: gvn("int"),
        sab: gvn("sab"),
        car: gvn("car"),

        pv: gvn("pv-input"), 
        pvMax: gvn("pvMax-input"),
        pm: gvn("pm-input"),
        pmMax: gvn("pmMax-input"),

        deslocamentoM: parseFloat(document.getElementById("deslocamento-m")?.value) || 9,
        deslocamentoQ: gvn("deslocamento-q") || 6,

        rd: gv("rd-input"),

        defAtributo: gv("defAtributo"),
        armadura: gvn("armadura"),
        escudo: gvn("escudo"),
        defOutros: gvn("defOutros"),
        armaduraPenalidade: gvn("armaduraPenalidade"),

        pericias, // JÁ INCLUI O NOVO CAMPO 'bonus'
        ataques: ataques,
        magias: magias,        
        ataques,
        magias,

        proficiencias: document.querySelectorAll("textarea")[0]?.value ?? "",
        habilidades: document.getElementById("habilidades")?.value ?? "",
        inventario: Array.from(document.querySelectorAll("#inventarioContainer .itemInventario")).map(div => ({
            nome: div.querySelector(".itemNome")?.value ?? "",
            qtd: parseInt(div.querySelector(".itemQtd")?.value) || 0,
            peso: parseFloat(div.querySelector(".itemPeso")?.value) || 0,
            desc: div.querySelector(".itemDesc textarea")?.value ?? ""
        })),

        updatedAt: new Date().toISOString()
    };
}

// Preenche a tela com os dados carregados
export function preencherFormularioComFicha(f) {
    const set = (id, v) => {
        const el = document.getElementById(id);
        if (el) el.value = v ?? "";
    };
    set("nome", f.nome);
    set("jogador", f.jogador);
    set("raca", f.raca);
    set("origem", f.origem);
    set("classe", f.classe);
    set("nivel", f.nivel);
    set("divindade", f.divindade);

    set("for", f.for);
    set("des", f.des);
    set("con", f.con);
    set("int", f.int);
    set("sab", f.sab);
    set("car", f.car);

    set("pv-input", f.pv);
    set("pvMax-input", f.pvMax);
    set("pm-input", f.pm);
    set("pmMax-input", f.pmMax);

    set("deslocamento-m", f.deslocamentoM || 9);
    set("deslocamento-q", f.deslocamentoQ || 6);

    set("rd-input", f.rd || "Nenhuma");

    set("defAtributo", f.defAtributo);
    set("armadura", f.armadura);
    set("escudo", f.escudo);
    set("defOutros", f.defOutros);
    set("armaduraPenalidade", f.armaduraPenalidade); // NOVO CAMPO CARREGADO

// Perícias
const mapaPericias = new Map((f.pericias ?? []).map(p => [p.nome, p]));
document.querySelectorAll(".pericias div").forEach(div => {
  const nome = div.querySelector("span")?.innerText?.trim() ?? "";
  const numInput = div.querySelector("#pericia" + nome);
  const check = div.querySelector("#treino" + nome);
  const bonusInput = document.getElementById("bonus" + nome);
  const attrSelect = div.querySelector("#attr" + nome);

  if (nome && mapaPericias.has(nome)) {
    const p = mapaPericias.get(nome);
    if (numInput) numInput.value = p.valor ?? 0;
    if (check) check.checked = !!p.treinado;
    if (bonusInput) bonusInput.value = p.bonus ?? 0;
    if (attrSelect) attrSelect.value = p.atributo ?? "des";
  }
});


    // Inventário
    const invContainer = document.getElementById("inventarioContainer");
    invContainer.innerHTML = "";
    (f.inventario ?? []).forEach(item => {
        criarItemInventario(item.nome, item.qtd, item.peso, item.desc);
    });

    // Ataques
    const container = document.getElementById("ataquesContainer");
    container.innerHTML = "";
    (f.ataques ?? []).forEach(atk => {
        const div = document.createElement("div");
        div.className = "ataque";
        div.innerHTML = `
      <input type="text" placeholder="Nome do ataque" value="${atk.nome ?? ""}">
      <input type="number" placeholder="Teste" value="${atk.teste ?? ""}">
      <input type="text" placeholder="Dano" value="${atk.dano ?? ""}">
      <input type="text" placeholder="Crítico" value="${atk.critico ?? ""}">
      <input type="text" placeholder="Alcance" value="${atk.alcance ?? ""}">
      <input type="text" placeholder="Tipo" value="${atk.tipo ?? ""}">
      <button class="removeAtaqueBtn" type="button">Excluir</button>
    `;
        div.querySelector(".removeAtaqueBtn").addEventListener("click", () => div.remove());
        container.appendChild(div);
    });
    
    // Magias 
    const magiasContainer = document.getElementById("magiasContainer");
    magiasContainer.innerHTML = "";
    (f.magias ?? []).forEach(m => {
        criarMagia(m);
    });

    // Textos longos
    const tas = document.querySelectorAll("textarea");
    if (tas[0]) tas[0].value = f.proficiencias ?? "";
    if (document.getElementById("habilidades")) document.getElementById("habilidades").value = f.habilidades ?? ""; 
    
    // Recalcula após carregar os dados
    calcularDefesa();
    // calcularPericias(); // É chamado na carga global, mas pode ser adicionado aqui
}