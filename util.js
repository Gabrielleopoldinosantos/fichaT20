// util.js
import { atualizarInventario, calcularPericias } from "./calculos.js";

// Funções de Ataques, Inventário e Magias

// Adicionar ataques (movido de script.js)
document.getElementById("addAtaqueBtn")?.addEventListener("click", () => {
    const container = document.getElementById("ataquesContainer");
    const div = document.createElement("div");
    div.className = "ataque";
    div.innerHTML = `
      <input type="text" placeholder="Nome do ataque">
      <input type="text" placeholder="Teste">
      <input type="text" placeholder="Dano">
      <input type="text" placeholder="Crítico">
      <input type="text" placeholder="Alcance">
      <input type="text" placeholder="Tipo">
      <button class="removeAtaqueBtn" type="button">Excluir</button>
    `;
    div.querySelector(".removeAtaqueBtn").addEventListener("click", () => div.remove());
    container.appendChild(div);
});

// ========================================
// NOVA FUNÇÃO: Criar Ofício
// ========================================
let contadorOficios = 0;

export function criarOficio(nome = "", atributo = "int", treinado = false, bonus = 0, valor = 0) {
    const container = document.getElementById("oficiosContainer");
    const id = `oficio_${contadorOficios++}`;
    
    const div = document.createElement("div");
    div.className = "oficio-item";
    div.dataset.oficioId = id;
    
    div.innerHTML = `
      <div style="display: flex; gap: 6px; align-items: center; padding: 3px; border-bottom: 1px dashed #8b0000;">
        <input type="text" class="oficioNome" placeholder="Nome do Ofício" value="${nome}" style="flex: 1; min-width: 120px;">
        <select class="oficioAttr" id="attrOficio_${id}">
          <option value="for" ${atributo === 'for' ? 'selected' : ''}>For</option>
          <option value="des" ${atributo === 'des' ? 'selected' : ''}>Des</option>
          <option value="con" ${atributo === 'con' ? 'selected' : ''}>Con</option>
          <option value="int" ${atributo === 'int' ? 'selected' : ''}>Int</option>
          <option value="sab" ${atributo === 'sab' ? 'selected' : ''}>Sab</option>
          <option value="car" ${atributo === 'car' ? 'selected' : ''}>Car</option>
        </select>
        <input type="checkbox" class="oficioTreino" id="treinoOficio_${id}" ${treinado ? 'checked' : ''}>
        <input type="number" class="oficioBonus" id="bonusOficio_${id}" placeholder="Bônus" value="${bonus}" style="width: 60px;">
        <input type="number" class="oficioValor" id="periciaOficio_${id}" readonly value="${valor}" style="width: 60px;">
        <button type="button" class="removeOficioBtn" style="background: #b22222; color: #fff; border: 2px solid #700000; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 0.8em;">Excluir</button>
      </div>
    `;
    
    // Adiciona listeners
    div.querySelector(".oficioAttr")?.addEventListener("change", calcularPericias);
    div.querySelector(".oficioTreino")?.addEventListener("change", calcularPericias);
    div.querySelector(".oficioBonus")?.addEventListener("input", calcularPericias);
    
    div.querySelector(".removeOficioBtn")?.addEventListener("click", () => {
        div.remove();
        calcularPericias();
    });
    
    container.appendChild(div);
    calcularPericias();
}

// Listener para o botão de adicionar ofício
document.getElementById("addOficioBtn")?.addEventListener("click", () => {
    criarOficio();
});

// ========================================
// FUNÇÃO ATUALIZADA: Criar Item de Inventário
// ========================================
export function criarItemInventario(nome = "", qtd = 1, peso = 1, desc = "") {
  const div = document.createElement("div");
  div.className = "itemInventario";

  // Novo layout: Nome | Qtd | Espaços | Total | Ações (grid de 5 colunas)
  div.innerHTML = `
    <input type="text" class="itemNome" placeholder="Nome do Item" value="${nome}">
    <input type="number" class="itemQtd" placeholder="1" value="${qtd}" min="1">
    <input type="number" class="itemPeso" placeholder="1" value="${peso}" min="0" step="0.1">
    <span class="itemTotal">0</span>
    
    <div class="item-acoes">
        <button type="button" class="toggleDesc">Descrição</button>
        <button type="button" class="removeItem">Excluir</button>
    </div>

    <div class="itemDesc" style="display:none;">
      <textarea placeholder="Descrição (Efeitos, propriedades...)">${desc}</textarea>
    </div>
  `;

  // Listeners
  div.querySelector(".itemQtd")?.addEventListener("input", atualizarInventario);
  div.querySelector(".itemPeso")?.addEventListener("input", atualizarInventario);
  
  div.querySelector(".removeItem")?.addEventListener("click", () => {
    div.remove();
    atualizarInventario();
  });
  
  div.querySelector(".toggleDesc")?.addEventListener("click", () => {
    const descDiv = div.querySelector(".itemDesc");
    descDiv.style.display = descDiv.style.display === "none" ? "block" : "none";
  });

  document.getElementById("inventarioContainer").appendChild(div);
  atualizarInventario();
}

// ========================================
// FUNÇÃO ATUALIZADA: Criar Magia (com Escola)
// ========================================
export function criarMagia(magia = {}) {
    const container = document.getElementById("magiasContainer");
    const div = document.createElement("div");
    div.className = "magia";

    div.innerHTML = `
      <div class="magia-linha">
      <input type="text" class="magiaNome" placeholder="Nome" value="${magia.nome ?? ""}">
      <select class="magiaCirculo">
      <option value="">Círculo</option>
      <option value="1" ${magia.circulo === 1 ? 'selected' : ''}>1° Primeiro</option>
      <option value="2" ${magia.circulo === 2 ? 'selected' : ''}>2° Segundo</option>
      <option value="3" ${magia.circulo === 3 ? 'selected' : ''}>3° Terceiro</option>
      <option value="4" ${magia.circulo === 4 ? 'selected' : ''}>4° Quarto</option>
      <option value="5" ${magia.circulo === 5 ? 'selected' : ''}>5° Quinto</option>
      </select>
      <select class="magiaTipo">
      <option value="arcana" ${magia.tipo === 'arcana' ? 'selected' : ''}>Arcana</option>
      <option value="divina" ${magia.tipo === 'divina' ? 'selected' : ''}>Divina</option>
      </select>
      <select class="magiaEscola">
      <option value="">Escola</option>
      <option value="abjuracao" ${magia.escola === 'abjuracao' ? 'selected' : ''}>Abjuração</option>
      <option value="adivinhacao" ${magia.escola === 'adivinhacao' ? 'selected' : ''}>Adivinhação</option>
      <option value="convocacao" ${magia.escola === 'convocacao' ? 'selected' : ''}>Convocação</option>
      <option value="encantamento" ${magia.escola === 'encantamento' ? 'selected' : ''}>Encantamento</option>
      <option value="evocacao" ${magia.escola === 'evocacao' ? 'selected' : ''}>Evocação</option>
      <option value="ilusao" ${magia.escola === 'ilusao' ? 'selected' : ''}>Ilusão</option>
      <option value="necromancia" ${magia.escola === 'necromancia' ? 'selected' : ''}>Necromancia</option>
      <option value="transmutacao" ${magia.escola === 'transmutacao' ? 'selected' : ''}>Transmutação</option>
      </select>
      <button type="button" class="toggleDesc">Descrição</button>
      <button type="button" class="removeMagiaBtn">Excluir</button>
      </div>
      <div class="magia-linha">
      <input type="text" class="magiaExecucao" placeholder="Execução" value="${magia.execucao ?? ""}">
      <input type="text" class="magiaAlcance" placeholder="Alcance" value="${magia.alcance ?? ""}">
      <input type="text" class="magiaAlvo" placeholder="Alvo" value="${magia.alvo ?? ""}">
      </div>
      <div class="magia-linha">
      <input type="text" class="magiaDuracao" placeholder="Duração" value="${magia.duracao ?? ""}">
      <input type="text" class="magiaResistencia" placeholder="Resistência" value="${magia.resistencia ?? ""}">
      </div>
      <div class="magiaDesc" style="display:${magia.descricao ? 'block' : 'none'};">
      <textarea placeholder="Detalhes e efeitos da magia">${magia.descricao ?? ""}</textarea>
      </div>
      <hr style="border-top: 1px solid #d4c098; margin: 8px 0;">
    `;

    div.querySelector(".removeMagiaBtn")?.addEventListener("click", () => div.remove());
    div.querySelector(".toggleDesc")?.addEventListener("click", () => {
        const d = div.querySelector(".magiaDesc");
        d.style.display = d.style.display === "none" ? "block" : "none";
    });

    container?.appendChild(div);
}