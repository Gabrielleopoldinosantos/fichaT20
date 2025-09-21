// Imports via CDN (funciona direto em HTML, sem bundler)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, getDoc, doc, setDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// 1) Cole seu firebaseConfig aqui
const firebaseConfig = {
  apiKey: "AIzaSyBLYyVAn1lY6cvHHEun9MxMsCPNPum6eps",
  authDomain: "solo-2299a.firebaseapp.com",
  projectId: "solo-2299a",
  storageBucket: "solo-2299a.firebasestorage.app",
  messagingSenderId: "678083370622",
  appId: "1:678083370622:web:43a1a34b825340c81bc22f"
};

// Inicializa
const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// Controla a ficha atualmente aberta
let fichaAtualId = null;

// Helpers
const gv  = (id) => (document.getElementById(id)?.value ?? "");
const gvn = (id) => parseInt(document.getElementById(id)?.value) || 0;

// Coleta todos os dados da tela
function coletarFichaDoFormulario() {
  // Perícias
  const pericias = [];
  document.querySelectorAll(".pericias div").forEach(div => {
    const nome  = div.querySelector("span")?.innerText?.trim() ?? "";
    const valor = parseInt(div.querySelector("input[type=number]")?.value) || 0;
    const treinado = div.querySelector("input[type=checkbox]")?.checked || false;
    if (nome) pericias.push({ nome, valor, treinado });
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

  return {
    nome: gv("nome"), jogador: gv("jogador"), raca: gv("raca"),
    origem: gv("origem"), classe: gv("classe"), nivel: gvn("nivel"),
    divindade: gv("divindade"),

    for: gvn("for"), des: gvn("des"), con: gvn("con"),
    int: gvn("int"), sab: gvn("sab"), car: gvn("car"),

    pv: gvn("pv"), pvMax: gvn("pvMax"),
    pm: gvn("pm"), pmMax: gvn("pmMax"),

    defAtributo: gv("defAtributo"),
    armadura: gvn("armadura"), escudo: gvn("escudo"),
    defOutros: gvn("defOutros"),

    pericias, ataques,

    proficiencias: document.querySelectorAll("textarea")[0]?.value ?? "",
    magias:        document.querySelectorAll("textarea")[1]?.value ?? "",
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
function preencherFormularioComFicha(f) {
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v ?? ""; };
  set("nome", f.nome); set("jogador", f.jogador); set("raca", f.raca);
  set("origem", f.origem); set("classe", f.classe); set("nivel", f.nivel);
  set("divindade", f.divindade);

  set("for", f.for); set("des", f.des); set("con", f.con);
  set("int", f.int); set("sab", f.sab); set("car", f.car);

  set("pv", f.pv); set("pvMax", f.pvMax);
  set("pm", f.pm); set("pmMax", f.pmMax);

  set("defAtributo", f.defAtributo);
  set("armadura", f.armadura); set("escudo", f.escudo);
  set("defOutros", f.defOutros);

  // Perícias
  const mapaPericias = new Map((f.pericias ?? []).map(p => [p.nome, p]));
  document.querySelectorAll(".pericias div").forEach(div => {
    const nome = div.querySelector("span")?.innerText?.trim() ?? "";
    const numInput = div.querySelector("input[type=number]");
    const check = div.querySelector("input[type=checkbox]");
    if (nome && mapaPericias.has(nome)) {
      const p = mapaPericias.get(nome);
      if (numInput) numInput.value = p.valor ?? 0;
      if (check) check.checked = !!p.treinado;
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

  // Textos longos
  const tas = document.querySelectorAll("textarea");
  if (tas[0]) tas[0].value = f.proficiencias ?? "";
  if (tas[1]) tas[1].value = f.magias ?? "";
  if (tas[2]) tas[2].value = f.equipamentos ?? "";

  calcularDefesa();
  calcularPericias();
}

// ========================
// 2) Salvar, listar e carregar
// ========================
const COL = "fichasTormenta20";

async function salvarFicha() {
  const ficha = coletarFichaDoFormulario();

  try {
    if (fichaAtualId) {
      // Atualiza ficha existente
      await setDoc(doc(db, COL, fichaAtualId), ficha);
      alert("Ficha atualizada com sucesso!");
    } else {
      // Cria ficha nova
      const ref = await addDoc(collection(db, COL), ficha);
      fichaAtualId = ref.id;
      alert(`Ficha criada! ID: ${ref.id}`);
    }
    listarFichas();
  } catch (e) {
    console.error("Erro ao salvar ficha:", e);
    alert("Erro ao salvar ficha. Veja o console.");
  }
}

async function listarFichas() {
  const sel = document.getElementById("listaFichas");
  if (!sel) return;
  sel.innerHTML = `<option value="">— selecione uma ficha para carregar —</option>`;
  const snap = await getDocs(collection(db, COL));
  snap.forEach(d => {
    const data = d.data();
    const nome = data?.nome || "(sem nome)";
    const opt = document.createElement("option");
    opt.value = d.id;
    opt.textContent = `${nome} — ${d.id}`;
    sel.appendChild(opt);
  });
}

async function carregarFichaSelecionada() {
  const sel = document.getElementById("listaFichas");
  const id = sel?.value || "";
  if (!id) { alert("Selecione uma ficha."); return; }

  const dref = doc(db, COL, id);
  const dsnap = await getDoc(dref);
  if (!dsnap.exists()) { alert("Ficha não encontrada."); return; }

  preencherFormularioComFicha(dsnap.data());
  fichaAtualId = id;
  alert("Ficha carregada!");
}

// Disponibiliza no escopo global
window.salvarFicha = salvarFicha;
window.carregarFichaSelecionada = carregarFichaSelecionada;
window.addEventListener("load", listarFichas);

// ========================
// 3) Cálculos
// ========================
function calcularDefesa() {
  const atributo = document.getElementById("defAtributo").value;
  const valorAtributo = gvn(atributo);
  const bonusAtributo = Math.floor(valorAtributo);
  const armadura = gvn("armadura");
  const escudo = gvn("escudo");
  const outros = gvn("defOutros");

  const total = 10 + bonusAtributo + armadura + escudo + outros;
  document.getElementById("defTotal").innerText = total;
}

["defAtributo","for","des","con","int","sab","car","armadura","escudo","defOutros"]
  .forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", calcularDefesa);
  });

window.addEventListener("load", calcularDefesa);

// Adicionar ataques
document.getElementById("addAtaqueBtn").addEventListener("click", () => {
  const container = document.getElementById("ataquesContainer");
  const div = document.createElement("div");
  div.className = "ataque";
  div.innerHTML = `
    <input type="text" placeholder="Nome do ataque">
    <input type="number" placeholder="Teste">
    <input type="text" placeholder="Dano">
    <input type="text" placeholder="Crítico">
    <input type="text" placeholder="Alcance">
    <input type="text" placeholder="Tipo">
    <button class="removeAtaqueBtn" type="button">Excluir</button>
  `;
  div.querySelector(".removeAtaqueBtn").addEventListener("click", () => div.remove());
  container.appendChild(div);
});

// ========================
// 4) Perícias
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

function calcularPericias() {
  const nivel = parseInt(document.getElementById("nivel").value) || 1;
  const metadeNivel = Math.floor(nivel / 2);

  Object.keys(atributoPericia).forEach(nome => {
    const attr = atributoPericia[nome];
    const valorAtributo = parseInt(document.getElementById(attr)?.value) || 0;

    const treinado = document.getElementById("treino" + nome)?.checked;
    const bonus = treinado ? (bonusTreinamento[nivel] || 0) : metadeNivel;

    const total = valorAtributo + bonus;
    const campo = document.getElementById("pericia" + nome);
    if (campo) campo.value = total;
  });
}

["nivel","for","des","con","int","sab","car"].forEach(id => {
  document.getElementById(id)?.addEventListener("input", calcularPericias);
});
document.querySelectorAll(".pericias input[type=checkbox]").forEach(cb => {
  cb.addEventListener("change", calcularPericias);
});
window.addEventListener("load", calcularPericias);

// ========================
// 5) Inventário
// ========================
function capacidadeCarga() {
  const forca = gvn("for");
  let capacidade = 10 + (forca > 0 ? forca * 2 : forca * -1 * -1); 
  if (forca < 0) capacidade = 10 + (2 * 0) + (forca); 
  if (capacidade < 0) capacidade = 0;
  return {
    normal: capacidade,
    max: capacidade * 2
  };
}

function atualizarInventario() {
  let ocupado = 0;

  document.querySelectorAll(".itemInventario").forEach(div => {
    const qtd = parseInt(div.querySelector(".itemQtd")?.value) || 0;
    const peso = parseFloat(div.querySelector(".itemPeso")?.value) || 0;
    ocupado += qtd * peso;
    div.querySelector(".itemTotal").innerText = qtd * peso;
  });

  const cap = capacidadeCarga();
  const status = document.getElementById("statusInventario");
  if (status) {
    status.innerText = `Espaço ocupado: ${ocupado} / ${cap.normal} (máx ${cap.max})`;
    if (ocupado > cap.normal && ocupado <= cap.max) {
      status.style.color = "orange";
    } else if (ocupado > cap.max) {
      status.style.color = "red";
    } else {
      status.style.color = "green";
    }
  }
}

function criarItemInventario(nome = "", qtd = null, peso = null, desc = "") {
  const div = document.createElement("div");
  div.className = "itemInventario";

  div.innerHTML = `
    <input type="text" class="itemNome" placeholder="Nome do item" value="${nome}">
    <input type="number" class="itemQtd" placeholder="Quantidade" value="${qtd !== null ? qtd : ''}" min="1">
    <input type="number" class="itemPeso" placeholder="Peso" value="${peso !== null ? peso : ''}" min="0">
    <span class="itemTotal">0</span>
    <button type="button" class="toggleDesc">Descrição</button>
    <button type="button" class="removeItem">Remover</button>
    <div class="itemDesc" style="display:none;">
      <textarea placeholder="Descrição do item">${desc}</textarea>
    </div>
  `;

  div.querySelector(".itemQtd").addEventListener("input", atualizarInventario);
  div.querySelector(".itemPeso").addEventListener("input", atualizarInventario);
  div.querySelector(".removeItem").addEventListener("click", () => {
    div.remove();
    atualizarInventario();
  });
  div.querySelector(".toggleDesc").addEventListener("click", () => {
    const d = div.querySelector(".itemDesc");
    d.style.display = d.style.display === "none" ? "block" : "none";
  });

  document.getElementById("inventarioContainer").appendChild(div);
  atualizarInventario();
}

// Canal para comunicação entre abas
const channel = new BroadcastChannel('fichaRealtime');

function atualizarCardsRealtime() {
  const pv = gvn("pv");
  const pvMax = gvn("pvMax");
  const pm = gvn("pm");
  const pmMax = gvn("pmMax");

  // Envia os valores para outras abas
  channel.postMessage({ pv, pvMax, pm, pmMax });

  // Atualiza card na mesma aba
  if (window.updateCardDisplay) {
    window.updateCardDisplay({ pv, pvMax, pm, pmMax });
  }
}

// Escuta mudanças nos inputs de PV/PM
["pv", "pvMax", "pm", "pmMax"].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener("input", atualizarCardsRealtime);
});

// Inicializa no carregamento
window.addEventListener("load", atualizarCardsRealtime);


document.getElementById("addItemBtn").addEventListener("click", () => criarItemInventario());
document.getElementById("for").addEventListener("input", atualizarInventario);
window.addEventListener("load", atualizarInventario);

