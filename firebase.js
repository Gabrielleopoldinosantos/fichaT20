// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, getDoc, doc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Importa a função de coleta do formulário para salvar
import { coletarFichaDoFormulario, preencherFormularioComFicha } from "./formulario.js";

export const firebaseConfig = {
    apiKey: "AIzaSyBLYyVAn1lY6cvHHEun9MxMsCPNPum6eps",
    authDomain: "solo-2299a.firebaseapp.com",
    projectId: "solo-2299a",
    storageBucket: "solo-2299a.firebasestorage.app",
    messagingSenderId: "678083370622",
    appId: "1:678083370622:web:43a1a34b825340c81bc22f"
};

// Inicializa
const app = initializeApp(firebaseConfig);
export const db  = getFirestore(app);

// Controla a ficha atualmente aberta
export let fichaAtualId = null;
export const setFichaAtualId = (id) => fichaAtualId = id;

export const COL = "fichasTormenta20";

// Funções CRUD

export async function salvarFicha() {
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

export async function listarFichas() {
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

export async function carregarFichaSelecionada() {
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

// Para uso no Realtime
export async function atualizarPVPM(data) { // JÁ ESTÁ EXPORTADA CORRETAMENTE
    if (!fichaAtualId) return;
    const dref = doc(db, COL, fichaAtualId);
    await updateDoc(dref, { 
        pv: data.pv, 
        pvMax: data.pvMax, 
        pm: data.pm, 
        pmMax: data.pmMax, 
        updatedAt: new Date().toISOString() 
    });
}