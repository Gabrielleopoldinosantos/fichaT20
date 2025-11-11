// util.js
import { atualizarInventario } from "./calculos.js"; // Para recalcular ao adicionar/remover item

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


export function criarItemInventario(nome = "", qtd = null, peso = null, desc = "") {
  const div = document.createElement("div");
  div.className = "itemInventario";

  div.innerHTML = `
    <input type="text" class="itemNome" placeholder="Nome do item" value="${nome}">
    
    <div class="item-dados-secundarios">
        <input type="number" class="itemQtd" placeholder="Qtd" value="${qtd !== null ? qtd : ''}" min="1">
        <input type="number" class="itemPeso" placeholder="Peso" value="${peso !== null ? peso : ''}" min="0">
        <span class="itemTotal">0</span>
    </div>
    
    <div class="item-acoes">
        <button type="button" class="toggleDesc">Descrição</button>
        <button type="button" class="removeItem">Remover</button>
    </div>

    <div class="itemDesc" style="display:none;">
      <textarea placeholder="Descrição do item">${desc}</textarea>
    </div>
  `;    

    div.querySelector(".itemQtd")?.addEventListener("input", atualizarInventario);
    div.querySelector(".itemPeso")?.addEventListener("input", atualizarInventario);
    div.querySelector(".removeItem")?.addEventListener("click", () => {
        div.remove();
        atualizarInventario();
    });
    div.querySelector(".toggleDesc")?.addEventListener("click", () => {
        const d = div.querySelector(".itemDesc");
        d.style.display = d.style.display === "none" ? "block" : "none";
    });

  document.getElementById("inventarioContainer").appendChild(div);
  atualizarInventario();
}

export function criarMagia(magia = {}) {
    const container = document.getElementById("magiasContainer");
    const div = document.createElement("div");
    div.className = "magia";

    div.innerHTML = `
      <div class="magia-linha">
      <input type="text" class="magiaNome" placeholder="Nome" value="${magia.nome ?? ""}">
      <input type="number" class="magiaCirculo" placeholder="Círculo" min="1" max="5" value="${magia.circulo || ''}">
      <select class="magiaTipo">
      <option value="arcana" ${magia.tipo === 'arcana' ? 'selected' : ''}>Arcana</option>
      <option value="divina" ${magia.tipo === 'divina' ? 'selected' : ''}>Divina</option>
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