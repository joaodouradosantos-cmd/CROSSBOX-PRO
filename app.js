const dataEl = document.getElementById("data");
const parteEl = document.getElementById("parte");
const exEl = document.getElementById("exercicio");
const seriesEl = document.getElementById("series");
const repsEl = document.getElementById("reps");
const pesoEl = document.getElementById("peso");
const histEl = document.getElementById("historico");

const hoje = new Date().toISOString().slice(0,10);
dataEl.value = hoje;

function load() {
  const key = "wod_" + dataEl.value;
  histEl.textContent = localStorage.getItem(key) || "";
}

document.getElementById("add").addEventListener("click", () => {
  const linha =
    parteEl.value + ") " +
    exEl.value + " — " +
    seriesEl.value + "x" +
    repsEl.value + " @ " +
    pesoEl.value + "kg\n";

  const key = "wod_" + dataEl.value;
  const atual = localStorage.getItem(key) || "";
  localStorage.setItem(key, atual + linha);
  load();
});

dataEl.addEventListener("change", load);
load();
