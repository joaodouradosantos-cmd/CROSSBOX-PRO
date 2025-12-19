 
const STORAGE_PROFILE = "crossfit_profile";
const STORAGE_RM = "crossfit_1rm";
const STORAGE_RM_HISTORY = "crossfit_1rm_history";
const STORAGE_TREINO = "crossfit_treinos";
const STORAGE_BACKUP_META = "crossfit_backup_meta";

/* NOVOS ARMAZENAMENTOS */
const STORAGE_RESERVAS = "crossfit_reservas";
const STORAGE_PRESENCAS = "crossfit_presencas";
const STORAGE_RANKINGS = "crossfit_rankings";

/* ENDPOINT DO BACKEND PARA OCR DO QUADRO */
const OCR_ENDPOINT = "https://o-teu-backend.exemplo/ocr-wod"; // troca pela tua URL real

/* ===== PERFIL ===== */
let profile = JSON.parse(localStorage.getItem(STORAGE_PROFILE) || "{}");

const nomeEl = document.getElementById("nome");
const nivelEl = document.getElementById("nivel");
const sexoEl = document.getElementById("sexo");
const idadeEl = document.getElementById("idade");
const alturaEl = document.getElementById("altura");
const pesoEl = document.getElementById("peso");
const objetivoEl = document.getElementById("objetivo");
const perfilForm = document.getElementById("perfilForm");
const subtitleEl = document.getElementById("appSubtitle");
const subtitleLine1El = document.getElementById("appSubtitleLine1");
const subtitleLine2El = document.getElementById("appSubtitleLine2");

function updateProfileInfo() {
  if (perfilForm) perfilForm.style.display = "none";
}

function updateSubtitle() {
  if (!subtitleLine1El || !subtitleLine2El) return;

  if (profile && profile.nome && profile.nome.trim() !== "") {
    // primeira linha SEM "de"
    subtitleLine1El.textContent = "Registo de treinos";
    subtitleLine2El.textContent = profile.nome.trim();
  } else {
    subtitleLine1El.textContent = "Registo de treinos";
    subtitleLine2El.textContent = "Toca para configurar o teu perfil";
  }
}

function loadProfile() {
  if (!sexoEl) return;
  if (profile.nome && nomeEl) nomeEl.value = profile.nome;
  if (profile.nivel && nivelEl) nivelEl.value = profile.nivel;
  if (profile.sexo) sexoEl.value = profile.sexo;
  if (profile.idade) idadeEl.value = profile.idade;
  if (profile.altura) alturaEl.value = profile.altura;
  if (profile.peso) pesoEl.value = profile.peso;
  if (profile.objetivo && objetivoEl) objetivoEl.value = profile.objetivo;
  updateProfileInfo();
  updateSubtitle();
}

const saveProfileBtn = document.getElementById("saveProfile");
if (saveProfileBtn) {
  saveProfileBtn.addEventListener("click", () => {
    profile = {
  nome: nomeEl && nomeEl.value ? nomeEl.value.trim() : "",
  nivel: nivelEl ? (nivelEl.value || "") : "",
  sexo: sexoEl.value || "",
  idade: idadeEl.value ? parseInt(idadeEl.value, 10) : "",
  altura: alturaEl.value ? parseInt(alturaEl.value, 10) : "",
  peso: pesoEl.value ? parseFloat(pesoEl.value) : "",
  objetivo: objetivoEl ? (objetivoEl.value || "") : ""
};

    localStorage.setItem(STORAGE_PROFILE, JSON.stringify(profile));
    updateProfileInfo();
    updateSubtitle();
    registerBackupMeta("Perfil atualizado");
    alert("Perfil atualizado.");
    renderPerformance();
  });
}

/* clicar no título abre/fecha o formulário de perfil */
if (subtitleEl && perfilForm) {
  subtitleEl.addEventListener("click", () => {
    const visible = perfilForm.style.display === "block";
    perfilForm.style.display = visible ? "none" : "block";
  });
}

/* ===== EXERCÍCIOS ===== */
const MOVES = [
  /* BARRA – FORÇA BASE E HALTEROFILISMO */
  "Chest Press",
  "Back Squat",
  "Front Squat",
  "Overhead Squat",
  "Sots Press",
  "Deadlift",
  "Sumo Deadlift",
  "Romanian Deadlift (RDL)",
  "Snatch Deadlift",

  "Power Clean",
  "Hang Clean",
  "Squat Clean",
  "Clean & Jerk",

  "Power Snatch",
  "Hang Power Snatch",
  "Squat Snatch",

  "Strict Press",
  "Push Press",
  "Push Jerk",
  "Split Jerk",
  "Thruster",

  "Barbell Row",
  "Bent Over Row",
  "Good Morning",
  "Lunges com barra",
  "Hip Thrust com barra",

  /* HALTERES / DUMBBELL */
  "Dumbbell Press",
  "Dumbbell Bench Press",
  "Dumbbell Snatch",
  "Dumbbell Clean",
  "Dumbbell Clean & Jerk",
  "Dumbbell Thruster",
  "Dumbbell Row",
  "Dumbbell Lunges",

  /* KETTLEBELL / OUTROS CARREGAMENTOS */
  "Kettlebell Swing",
  "Kettlebell Clean",
  "Kettlebell Snatch",
  "Goblet Squat",
  "Kettlebell Lunges",

  /* ACESSÓRIOS PESADOS / STRONGMAN – 1RM EM CARGA TRANSPORTADA */
  "Hip Thrust",
  "Glute Bridge",
  "Reverse Hyperextension",
  "Shrug",
  "Farmer Carry",
  "Sandbag Carry",
  "Yoke Carry",
  "Bear Complex"
];

const MOVES_PT = {};

/* GUIA – LISTA TIPO JSON (inclui todos os exercícios disponíveis na app) */
const EXER_INFO = [
  /* BARRA / HALTERES – FORÇA BASE */
  {
    en: "Chest Press",
    pt: "Supino com barra",
    descricao: "Empurrar a barra para longe do peito, deitado no banco, controlando a descida e a subida."
  },
  {
    en: "Back Squat",
    pt: "Agachamento com barra nas costas",
    descricao: "Agachamento com a barra apoiada nas costas, descendo até pelo menos à paralela com o tronco firme."
  },
  {
    en: "Front Squat",
    pt: "Agachamento frontal",
    descricao: "Agachamento com a barra apoiada na parte da frente dos ombros, exigindo tronco mais vertical e core forte."
  },
  {
    en: "Overhead Squat",
    pt: "Agachamento acima da cabeça",
    descricao: "Agachamento com a barra acima da cabeça, braços estendidos e muita estabilidade de ombros e core."
  },
  {
    en: "Sots Press",
    pt: "Sots press",
    descricao: "A partir da posição de agachamento frontal, com a barra em rack, realizar um press acima da cabeça mantendo-se em baixo, exigindo muita estabilidade de ombros e core."
  },
  {
    en: "Deadlift",
    pt: "Peso morto",
    descricao: "Levar a barra do chão até à anca com costas neutras, empurrando o chão com as pernas e contraindo glúteos no topo."
  },
  {
    en: "Sumo Deadlift",
    pt: "Peso morto sumo",
    descricao: "Variação com pés mais afastados e mãos a agarrar a barra entre as pernas, reduzindo a amplitude da anca."
  },
  {
    en: "Romanian Deadlift (RDL)",
    pt: "Peso morto romeno",
    descricao: "Peso morto com menos flexão de joelhos, focado em posteriores da coxa e glúteos, mantendo a barra perto do corpo."
  },

  {
    en: "Power Clean",
    pt: "Power clean",
    descricao: "Levar a barra do chão até aos ombros de forma explosiva, recebendo-a acima da paralela."
  },
  {
    en: "Squat Clean",
    pt: "Squat clean",
    descricao: "Clean com receção em agachamento completo antes de regressar à posição de pé."
  },
  {
    en: "Clean & Jerk",
    pt: "Clean & jerk",
    descricao: "Levar a barra do chão aos ombros (clean) e dos ombros até acima da cabeça (jerk) em dois movimentos distintos."
  },

  {
    en: "Power Snatch",
    pt: "Power snatch",
    descricao: "Arranco com receção acima da paralela, num único movimento do chão até overhead."
  },
  {
    en: "Squat Snatch",
    pt: "Squat snatch",
    descricao: "Arranco com receção em agachamento profundo, seguido de extensão até ficar totalmente de pé."
  },
  {
    en: "Snatch Deadlift",
    pt: "Peso morto snatch",
    descricao: "Peso morto com pega larga, replicando a primeira fase do arranco e mantendo a barra encostada ao corpo."
  },
  {
    en: "Hang Power Snatch",
    pt: "Arranco power do hang",
    descricao: "Arranco iniciado a partir do hang, acima dos joelhos, recebendo a barra acima da paralela."
  },
  {
    en: "Hang Clean",
    pt: "Clean do hang",
    descricao: "Clean iniciado com a barra acima dos joelhos, recebendo no rack frontal com extensão explosiva da anca."
  },

  {
    en: "Strict Press",
    pt: "Press militar estrito",
    descricao: "Press de ombros sem ajuda das pernas, usando apenas a força de ombros e braços."
  },
  {
    en: "Push Press",
    pt: "Push press",
    descricao: "Press de ombros com pequeno impulso das pernas, terminando com a barra acima da cabeça."
  },
  {
    en: "Push Jerk",
    pt: "Push jerk",
    descricao: "Impulso de pernas e encaixe da barra acima da cabeça, recebendo em semi-agachamento antes de estender."
  },
  {
    en: "Split Jerk",
    pt: "Split jerk",
    descricao: "Jerk em passada, recebendo a barra overhead com uma perna à frente e outra atrás para maior estabilidade."
  },

  {
    en: "Thruster",
    pt: "Thruster",
    descricao: "Agachamento frontal seguido diretamente de press acima da cabeça num único movimento fluido."
  },
  {
    en: "Barbell Row",
    pt: "Remada com barra",
    descricao: "Com o tronco inclinado à frente, puxar a barra em direção ao abdómen mantendo as costas neutras."
  },
  {
    en: "Bent Over Row",
    pt: "Remada inclinada",
    descricao: "Remada com maior inclinação do tronco, focando dorsais e parte média das costas."
  },
  {
    en: "Good Morning",
    pt: "Good morning",
    descricao: "Com a barra nas costas, inclinar o tronco à frente com ligeira flexão de joelhos e voltar à posição inicial."
  },
  {
    en: "Lunges com barra",
    pt: "Passadas com barra",
    descricao: "Passadas à frente ou atrás com a barra apoiada nos ombros, mantendo o tronco direito."
  },
  {
    en: "Hip Thrust com barra",
    pt: "Hip thrust com barra",
    descricao: "Elevar a anca com as costas apoiadas num banco e a barra sobre a bacia, focando glúteos."
  },

  /* HALTERES E KETTLEBELLS */
  {
    en: "Dumbbell Press",
    pt: "Press com halteres",
    descricao: "Press de ombros com halteres, de pé ou sentado, subindo os halteres acima da cabeça."
  },
  {
    en: "Dumbbell Bench Press",
    pt: "Supino com halteres",
    descricao: "Deitado no banco, empurrar dois halteres para cima a partir do peito, controlando a descida."
  },
  {
    en: "Dumbbell Snatch",
    pt: "Snatch com halteres",
    descricao: "Levar o haltere do chão até acima da cabeça num movimento explosivo e contínuo."
  },
  {
    en: "Dumbbell Clean",
    pt: "Clean com halteres",
    descricao: "Levar o haltere do chão ou das pernas até ao ombro, com extensão de anca."
  },
  {
    en: "Dumbbell Clean & Jerk",
    pt: "Clean & jerk com halteres",
    descricao: "Clean com haltere até ao ombro seguido de impulso até overhead."
  },
  {
    en: "Dumbbell Thruster",
    pt: "Thruster com halteres",
    descricao: "Agachamento seguido de press com halteres acima da cabeça num só movimento."
  },
  {
    en: "Dumbbell Row",
    pt: "Remada com halteres",
    descricao: "Remada unilateral ou bilateral puxando o haltere em direção ao tronco."
  },
  {
    en: "Dumbbell Lunges",
    pt: "Passadas com halteres",
    descricao: "Passadas segurando um haltere em cada mão junto ao corpo."
  },
  {
    en: "Walking Lunge",
    pt: "Passadas a andar",
    descricao: "Passadas alternadas deslocando-se para a frente, com ou sem carga, mantendo o tronco direito e o joelho traseiro próximo do chão."
  },

  {
    en: "Kettlebell Swing",
    pt: "Swing com kettlebell",
    descricao: "Balanço da kettlebell usando sobretudo o impulso da anca, não dos braços."
  },
  {
    en: "Kettlebell Clean",
    pt: "Clean com kettlebell",
    descricao: "Levar a kettlebell do fundo até à posição de rack junto ao peito."
  },
  {
    en: "Kettlebell Snatch",
    pt: "Snatch com kettlebell",
    descricao: "Arranco unilateral, do chão ou do baloiço até acima da cabeça."
  },
  {
    en: "Goblet Squat",
    pt: "Agachamento goblet",
    descricao: "Agachamento segurando a kettlebell ou haltere junto ao peito."
  },
  {
    en: "Kettlebell Lunges",
    pt: "Passadas com kettlebell",
    descricao: "Passadas segurando a kettlebell ao lado do corpo ou em posição de rack."
  },

  /* GINÁSTICA / CALISTENIA – BÁSICOS */
  {
    en: "Pull-Up",
    pt: "Puxada na barra",
    descricao: "Suspenso na barra, puxar até o queixo ultrapassar a barra com pegada em pronação."
  },
  {
    en: "Chin-Up",
    pt: "Puxada em supinação",
    descricao: "Puxada na barra com palmas das mãos viradas para ti, focando mais bíceps."
  },
  {
    en: "Strict Chin-Up",
    pt: "Chin-up estrito",
    descricao: "Versão controlada sem kipping, subindo até o queixo ultrapassar a barra apenas com força muscular."
  },
  {
    en: "Scapular Pull-Up",
    pt: "Puxada escapular",
    descricao: "Suspenso na barra, mover apenas as escápulas, aproximando ligeiramente o peito da barra sem dobrar os cotovelos."
  },

  {
    en: "Chest-to-Bar Pull-Up",
    pt: "Puxada ao peito",
    descricao: "Puxada na barra até o peito tocar na barra, exigindo maior amplitude."
  },
  {
    en: "Kipping Pull-Up",
    pt: "Pull-up com kipping",
    descricao: "Puxada na barra usando balanço hollow/arch para ganhar impulso e aumentar repetições."
  },
  {
    en: "Bar Muscle-Up",
    pt: "Muscle-up na barra",
    descricao: "Transição explosiva que combina puxada e dip para passar o tronco acima da barra."
  },
  {
    en: "Ring Muscle-Up",
    pt: "Muscle-up nas argolas",
    descricao: "Transição nas argolas, mais instável e exigente do que na barra."
  },
  {
    en: "Muscle-Up",
    pt: "Muscle-up",
    descricao: "Termo genérico para o movimento que combina puxada e dip, em barra ou argolas."
  },

  {
    en: "Ring Row",
    pt: "Remada nas argolas",
    descricao: "Com o corpo inclinado sob as argolas, puxar o peito em direção às argolas mantendo o corpo alinhado."
  },
  {
    en: "Ring Dip",
    pt: "Dip nas argolas",
    descricao: "Suportado nas argolas, descer até cerca de 90º de flexão de cotovelos e voltar à extensão completa."
  },
  {
    en: "Ring Support Hold",
    pt: "Suporte nas argolas",
    descricao: "Manter a posição de braços estendidos nas argolas com corpo alinhado e ombros ativos."
  },

  {
    en: "Toes-to-Bar (T2B)",
    pt: "Toes-to-bar",
    descricao: "Suspenso na barra, tocar com os pés na barra usando kip hollow/arch."
  },
  {
    en: "Knees-to-Elbows (K2E)",
    pt: "Knees-to-elbows",
    descricao: "Suspenso na barra, elevar os joelhos até tocarem nos cotovelos."
  },
  {
    en: "Hanging Knee Raise",
    pt: "Elevação de joelhos na barra",
    descricao: "Versão mais simples, elevando os joelhos em direção ao peito."
  },

  {
    en: "Sit-Up",
    pt: "Abdominal sit-up",
    descricao: "Deitado de costas, subir o tronco até ficar sentado, podendo usar AbMat."
  },
  {
    en: "Floor Leg Raise",
    pt: "Elevação de pernas no chão",
    descricao: "Deitado de costas, elevar as pernas estendidas mantendo a lombar encostada ao chão."
  },
  {
    en: "V-Up",
    pt: "V-up",
    descricao: "Elevar simultaneamente tronco e pernas tocando com as mãos nos pés, formando um 'V'."
  },

  {
    en: "GHD Sit-Up",
    pt: "Abdominal em GHD",
    descricao: "Abdominal na máquina GHD com grande amplitude de movimento."
  },
  {
    en: "Back Extension (GHD)",
    pt: "Extensão lombar em GHD",
    descricao: "Extensão de tronco na máquina GHD, focando lombar e glúteos."
  },

  {
    en: "Pistol Squat",
    pt: "Agachamento pistol",
    descricao: "Agachamento numa só perna, mantendo a outra estendida à frente."
  },

  /* HANDSTAND / INVERSÕES */
  {
    en: "Handstand Hold",
    pt: "Pino estático",
    descricao: "Manter a posição de pino, junto à parede ou livre, com ombros ativos e core firme."
  },
  {
    en: "Nose-to-Wall Handstand Hold",
    pt: "Pino nariz à parede",
    descricao: "Pino com barriga voltada para a parede e nariz quase a tocar, alinhando corpo e ombros."
  },
  {
    en: "Handstand Walk",
    pt: "Caminhada em pino",
    descricao: "Deslocar-se em pino utilizando as mãos, exigindo equilíbrio e controlo corporal."
  },
  {
    en: "Handstand Shoulder Tap",
    pt: "Toques de ombro em pino",
    descricao: "Em pino, alternar toques de mão no ombro oposto, aumentando a estabilidade unilateral."
  },
  {
    en: "Handstand Push-Up (HSPU)",
    pt: "Pino com flexão",
    descricao: "Flexão de braços em pino, com ou sem kipping, até a cabeça tocar no chão ou alvo."
  },
  {
    en: "Strict Handstand Push-Up",
    pt: "Pino com flexão estrita",
    descricao: "HSPU sem kipping, controlando toda a amplitude apenas com força dos ombros."
  },
  {
    en: "Wall Walk",
    pt: "Subida à parede",
    descricao: "A partir do chão, caminhar com os pés pela parede e as mãos para perto da parede até ao pino, e voltar a descer."
  },
  {
    en: "Handstand Walk Practice",
    pt: "Prática de caminhada em pino",
    descricao: "Trabalho técnico de pequenas deslocações em pino para ganhar confiança e controlo."
  },

  /* CORE / HOLLOW–ARCH / PLANKS (SKILLS DE GINÁSTICA) */
  {
    en: "Hollow Hold",
    pt: "Hollow hold",
    descricao: "Deitado de costas, manter omoplatas e pernas elevadas, costas coladas ao chão e core contraído."
  },
  {
    en: "Hollow Rock",
    pt: "Hollow rock",
    descricao: "Na posição de hollow hold, balançar para a frente e para trás mantendo a forma rígida."
  },
  {
    en: "Arch Hold",
    pt: "Arch hold",
    descricao: "Deitado de barriga para baixo, elevar peito e pernas, criando posição de arco com braços à frente."
  },
  {
    en: "Arch Rock",
    pt: "Arch rock",
    descricao: "Na posição de arch hold, balançar para a frente e para trás mantendo o corpo em tensão."
  },
  {
    en: "Kip Swing",
    pt: "Kip swing",
    descricao: "Balanço hollow/arch na barra de tração, base para kipping pull-ups e toes-to-bar."
  },

  {
    en: "Plank",
    pt: "Prancha",
    descricao: "Posição de prancha, com antebraços ou mãos no chão, corpo alinhado e core contraído."
  },
  {
    en: "Plank Hold",
    pt: "Prancha isométrica",
    descricao: "Manter posição de prancha com corpo alinhado dos ombros aos tornozelos, contraindo core e glúteos."
  },
  {
    en: "Plank Pike",
    pt: "Prancha em pike",
    descricao: "A partir da prancha, elevar a anca formando um 'V' invertido e regressar ao alinhamento."
  },
  {
    en: "Plank Jump",
    pt: "Salto a partir da prancha",
    descricao: "Em prancha, saltar com ambos os pés na direção das mãos e voltar atrás, mantendo o core firme."
  },

  {
    en: "Tuck Roll",
    pt: "Rolo em tuck",
    descricao: "Com joelhos ao peito, rolar para trás e para a frente mantendo o corpo compacto, útil para coordenação."
  },

  /* SKILLS EM BARRA / RINGS – PROGRESSÕES */
  {
    en: "Band Pull-Down",
    pt: "Puxada com banda elástica",
    descricao: "Com a banda fixa acima da cabeça, puxar em direção ao peito, simulando um lat pull-down."
  },
  {
    en: "Band Transition",
    pt: "Transição com banda",
    descricao: "Drill com banda para treinar a passagem de puxada para dip na técnica de muscle-up."
  },
  {
    en: "Pull-Over",
    pt: "Pull-over na barra",
    descricao: "Movimento em que o corpo passa de suspensão para apoio em cima da barra num só gesto."
  },

  /* PVC / MOBILIDADE / TÉCNICA */
  {
    en: "PVC Overhead Squat",
    pt: "Agachamento overhead com PVC",
    descricao: "Agachamento acima da cabeça usando tubo de PVC, focado em técnica e mobilidade sem carga."
  },
  {
    en: "PVC Pass Through",
    pt: "Passagem com tubo PVC",
    descricao: "Levar o tubo de PVC da frente para trás e vice-versa, com braços estendidos, para mobilidade de ombros."
  },
  {
    en: "Dynamic Squat Stretch",
    pt: "Alongamento dinâmico de agachamento",
    descricao: "Trabalho de mobilidade em agachamento profundo, alternando posições para libertar anca e tornozelos."
  },

  /* ABDOMINAIS / L-SIT E VARIAÇÕES */
  {
    en: "L-Sit Hold",
    pt: "L-sit",
    descricao: "Em apoio de mãos ou argolas, manter pernas estendidas à frente formando um 'L' com o tronco."
  },

  /* METCON / CONDICIONAMENTO */
  {
    en: "Burpee",
    pt: "Burpee",
    descricao: "Do pé para a posição de prancha, flexão opcional e salto final com extensão completa."
  },
  {
    en: "Burpee Box Jump-Over",
    pt: "Burpee box jump-over",
    descricao: "Burpee seguido de salto por cima da caixa, podendo sair pelo outro lado."
  },
  {
    en: "Burpee Box Jump",
    pt: "Burpee box jump",
    descricao: "Burpee seguido de salto para cima da caixa, terminando em extensão completa em cima da caixa."
  },
  {
    en: "Burpee Pull-Up",
    pt: "Burpee com pull-up",
    descricao: "Burpee seguido de salto para a barra e realização de uma tração."
  },
  {
    en: "Box Jump",
    pt: "Salto para caixa",
    descricao: "Salto com os dois pés para cima da caixa, terminando em extensão completa."
  },
  {
    en: "Box Jump Over",
    pt: "Salto por cima da caixa",
    descricao: "Salto para cima e para o outro lado da caixa, sem necessidade de extensão completa em cima."
  },
  {
    en: "Wall Ball",
    pt: "Lançamento à parede",
    descricao: "Agachamento com bola medicinal seguido de lançamento a um alvo na parede."
  },

  {
    en: "Row",
    pt: "Remo",
    descricao: "Remo em máquina, semelhante a Rowing, trabalhando pernas, core e puxada com os braços."
  },
  {
    en: "Rowing",
    pt: "Remo",
    descricao: "Remo em máquina, trabalhando pernas, core e puxada com os braços."
  },
  {
    en: "Ski Erg",
    pt: "Ski erg",
    descricao: "Simulador de esqui, puxando as manetes de cima para baixo em movimento contínuo."
  },
  {
    en: "Assault Bike",
    pt: "Bicicleta de resistência",
    descricao: "Bicicleta com resistência de ar, trabalhando simultaneamente braços e pernas."
  },
  {
    en: "Running",
    pt: "Corrida",
    descricao: "Corrida simples, em tapete ou no exterior, em ritmo contínuo ou intervalado."
  },
  {
    en: "Sprint",
    pt: "Sprint",
    descricao: "Corrida explosiva de curta distância em alta intensidade."
  },

  {
    en: "Double Under",
    pt: "Saltos duplos na corda",
    descricao: "Saltos em que a corda passa duas vezes por baixo dos pés em cada salto."
  },
  {
    en: "Single Under",
    pt: "Saltos simples na corda",
    descricao: "Saltos em que a corda passa uma vez por baixo dos pés em cada salto."
  },

  {
    en: "Sled Push",
    pt: "Empurrar trenó",
    descricao: "Empurrar trenó com carga ao longo de uma distância definida."
  },
  {
    en: "Sled Pull",
    pt: "Puxar trenó",
    descricao: "Puxar trenó com carga usando arnês ou corda, para trás ou para a frente."
  },
  {
    en: "Farmer Carry",
    pt: "Caminhada com cargas",
    descricao: "Caminhar segurando cargas pesadas (halteres ou kettlebells) ao lado do corpo."
  },

  /* COMPLEXOS / STRONGMAN */
  {
    en: "Bear Complex",
    pt: "Bear complex",
    descricao: "Sequência contínua: power clean, front squat, push press, back squat e novo push press."
  },
  {
    en: "Devil Press",
    pt: "Devil press",
    descricao: "Burpee com halteres seguido de swing até overhead num movimento fluido."
  },
  {
    en: "Man Maker",
    pt: "Man maker",
    descricao: "Combinação de remada, burpee, clean e thruster com halteres."
  },
  {
    en: "Sandbag Carry",
    pt: "Caminhada com saco",
    descricao: "Transportar um saco pesado ao peito, ombro ou costas ao longo de uma distância."
  },
  {
    en: "Yoke Carry",
    pt: "Caminhada com yoke",
    descricao: "Caminhar com uma estrutura pesada (yoke) apoiada nos ombros, trabalhando força total."
  },
  {
    en: "Rope Climb",
    pt: "Subida à corda",
    descricao: "Subir a corda usando técnica de pernas ou apenas braços, tocando um alvo no topo."
  },

  /* ACESSÓRIOS / MOBILIDADE EXTRA */
  {
    en: "Hip Thrust",
    pt: "Elevação de anca",
    descricao: "Elevar a anca com costas apoiadas num banco, com ou sem carga, focando glúteos."
  },
  {
    en: "Glute Bridge",
    pt: "Ponte de glúteos",
    descricao: "Elevar a anca a partir de posição deitado no chão, mantendo ombros apoiados."
  },
  {
    en: "Reverse Hyperextension",
    pt: "Hiperextensão reversa",
    descricao: "Elevar as pernas atrás do corpo na máquina Reverse Hyper, trabalhando glúteos e lombar."
  },
  {
    en: "Shrug",
    pt: "Encolhimento de ombros",
    descricao: "Elevar os ombros em direção às orelhas segurando barra ou halteres, focando trapézios."
  },

  /* BODYWEIGHT / WARM-UP EXTRA */
  {
    en: "Air Squat",
    pt: "Agachamento livre",
    descricao: "Agachamento apenas com o peso corporal, pés à largura dos ombros, descendo até a anca ficar abaixo da linha dos joelhos e subindo com extensão completa."
  },
  {
    en: "Jumping Jack",
    pt: "Saltos de abertura",
    descricao: "Saltos em que braços e pernas abrem e fecham em simultâneo, usados sobretudo em aquecimento geral."
  },
  {
    en: "Down Dog / Up Dog",
    pt: "Transição cão a olhar para baixo / cobra",
    descricao: "Sequência de mobilidade entre a posição de cão a olhar para baixo e a posição de cobra, alongando ombros, cadeia posterior e coluna."
  },
  {
    en: "Dead Hang",
    pt: "Pendurado estático na barra",
    descricao: "Manter-se pendurado na barra com braços estendidos e ombros ativos, sem balançar, reforçando pega e estabilidade escapular."
  },
  {
    en: "Wall Sit",
    pt: "Sentar na parede",
    descricao: "Isometria de pernas com costas apoiadas na parede e joelhos a 90 graus, mantendo a posição durante o tempo prescrito."
  },
  {
    en: "DB Devil Press",
    pt: "Devil press com halteres",
    descricao: "Burpee com halteres seguido de swing até overhead num só movimento contínuo, exercício muito exigente de corpo inteiro."
  },
  {
    en: "KB Swing (Russian)",
    pt: "Swing russo com kettlebell",
    descricao: "Swing da kettlebell até à altura dos ombros, focado na extensão explosiva da anca e na cadeia posterior."
  },
  {
    en: "KB Swing (American)",
    pt: "Swing americano com kettlebell",
    descricao: "Swing da kettlebell até acima da cabeça, exigindo maior amplitude de movimento e controlo de ombros."
  }
];

/* Movimentos considerados técnicos (para % e para sugerir tipo "técnica/força") */
const TECHNICAL_MOVES = [
  // Força / barra – básicos e de %
  "Back Squat",
  "Front Squat",
  "Overhead Squat",
  "Deadlift",
  "Sumo Deadlift",
  "Romanian Deadlift (RDL)",
  "Chest Press",
  "Strict Press",
  "Push Press",
  "Push Jerk",
  "Split Jerk",
  "Thruster",
  "Good Morning",
  "Barbell Row",
  "Bent Over Row",
  "Hip Thrust com barra",
  "Lunges com barra",

  // Levantamento olímpico
  "Power Clean",
  "Squat Clean",
  "Hang Clean",
  "Hang Power Clean",
  "Clean & Jerk",
  "Power Snatch",
  "Squat Snatch",
  "Snatch Deadlift",
  "Hang Power Snatch",
  "Sots Press",

  // Halteres / KB com técnica
  "Dumbbell Snatch",
  "Dumbbell Clean",
  "Dumbbell Clean & Jerk",
  "Dumbbell Thruster",
  "Dumbbell Bench Press",
  "Dumbbell Press",
  "Dumbbell Row",
  "Dumbbell Lunges",
  "Kettlebell Swing",
  "Kettlebell Clean",
  "Kettlebell Snatch",
  "Goblet Squat",
  "Kettlebell Lunges",
  "KB Swing (Russian)",
  "KB Swing (American)",

  // Ginástica técnica / skills
  "Pull-Up",
  "Chin-Up",
  "Strict Chin-Up",
  "Scapular Pull-Up",
  "Chest-to-Bar Pull-Up",
  "Kipping Pull-Up",
  "Bar Muscle-Up",
  "Ring Muscle-Up",
  "Muscle-Up",
  "Ring Dip",
  "Ring Support Hold",
  "Ring Row",
  "Toes-to-Bar (T2B)",
  "Knees-to-Elbows (K2E)",
  "Hanging Knee Raise",
  "Pistol Squat",
  "L-Sit Hold",

  // Handstand / inversões
  "Handstand Hold",
  "Nose-to-Wall Handstand Hold",
  "Handstand Walk",
  "Handstand Shoulder Tap",
  "Handstand Push-Up (HSPU)",
  "Strict Handstand Push-Up",
  "Wall Walk",
  "Handstand Walk Practice",

  // Core / shapes ginásticos
  "Hollow Hold",
  "Hollow Rock",
  "Arch Hold",
  "Arch Rock",
  "Kip Swing",

  // Técnicos de barra/argolas com banda
  "Band Pull-Down",
  "Band Transition",
  "Pull-Over",

  // PVC / mobilidade técnica
  "PVC Overhead Squat",
  "PVC Pass Through",
  "Dynamic Squat Stretch"
];

/* Movimentos de metcon / condicionamento (para sugerir tipo "metcon") */
const METCON_MOVES = [
  // Metcon clássicos de peso corporal
  "Burpee",
  "Burpee Box Jump-Over",
  "Burpee Box Jump",
  "Burpee Pull-Up",
  "Air Squat",
  "Jumping Jack",
  "Sit-Up",
  "Floor Leg Raise",
  "V-Up",
  "Plank",
  "Plank Hold",
  "Plank Pike",
  "Plank Jump",
  "Tuck Roll",
  "Wall Sit",

  // Caixa / wall ball
  "Box Jump",
  "Box Jump Over",
  "Wall Ball",

  // Halteres / KB em contexto de condicionamento
  "Dumbbell Snatch",
  "Dumbbell Thruster",
  "Dumbbell Lunges",
  "Walking Lunge",
  "DB Devil Press",
  "Devil Press",
  "Man Maker",
  "Kettlebell Swing",
  "Kettlebell Lunges",
  "KB Swing (Russian)",
  "KB Swing (American)",
  "Goblet Squat",

  // Cardio máquinas e corrida
  "Running",
  "Sprint",
  "Rowing",
  "Row",
  "Ski Erg",
  "Assault Bike",

  // Corda
  "Double Under",
  "Single Under",

  // Carries / trenó / strongman de condicionamento
  "Farmer Carry",
  "Sandbag Carry",
  "Yoke Carry",
  "Sled Push",
  "Sled Pull",

  // Subida à corda – em WOD é quase sempre metcon
  "Rope Climb"
];

/* Inferir tipo automaticamente para o WOD */
function inferTipo(ex) {
  if (!ex) return "";

  if (TECHNICAL_MOVES.includes(ex)) {
    return "técnica";
  }

  if (METCON_MOVES.includes(ex)) {
    return "metcon";
  }

  // resto tratado como força
  return "força";
}

/* Lista completa de exercícios em inglês (para WOD, Objetivo, Guia) */
const ALL_EXERCISES = Array.from(new Set(EXER_INFO.map(ex => ex.en))).sort();

/* Completar MOVES_PT com todos os exercícios do guia */
EXER_INFO.forEach(ex => {
  MOVES_PT[ex.en] = ex.pt;
});

const PERC = [
  0.25, 0.30, 0.35, 0.40, 0.50, 0.60, 0.65, 0.70, 0.75, 0.80, 0.85, 0.90, 0.95
];

let dataRm = JSON.parse(localStorage.getItem(STORAGE_RM) || "{}");
let rmHistory = JSON.parse(localStorage.getItem(STORAGE_RM_HISTORY) || "{}");

const sel = document.getElementById("exercise");
const rm = document.getElementById("oneRm");
const bodyTable = document.getElementById("tableBody");
/* Ferramenta rápida 1RM */
const quickExerciseEl = document.getElementById("quickExercise");
const quickPercentEl = document.getElementById("quickPercent");
const quickPesoEl = document.getElementById("quickPeso");
const quickPesoInputEl = document.getElementById("quickPesoInput");
const quickPercResultEl = document.getElementById("quickPercResult");

/* WOD */
let treinos = JSON.parse(localStorage.getItem(STORAGE_TREINO) || "[]");
  if (!Array.isArray(treinos)) {
  treinos = [];
  localStorage.setItem(STORAGE_TREINO, JSON.stringify(treinos));
}

const treinoDataEl = document.getElementById("treinoData");

// ===== Resumo (registos): iniciar fechado e não empurrar o ecrã =====
const wodResumoDetailsEl = document.getElementById("wodResumoDetails");
if (wodResumoDetailsEl) wodResumoDetailsEl.open = false;

// Se mudares a data do WOD, fecha o resumo (evita ficar aberto e vazio no dia seguinte)
if (treinoDataEl && wodResumoDetailsEl) {
  treinoDataEl.addEventListener("change", () => { wodResumoDetailsEl.open = false; });
}

// ===== Limpeza: remover o antigo "Resultado do WOD" (já não existe na app) =====
try { localStorage.removeItem("crossfit_wod_result"); } catch(e) {}

const treinoExEl = document.getElementById("treinoExercicio");
const treinoExSearchEl = document.getElementById("treinoExercicioSearch");
const treinoParteEl = document.getElementById("treinoParte");
const treinoFormatoEl = document.getElementById("treinoFormato");
const treinoRondasEl = document.getElementById("treinoRondas");
const treinoRepsEl = document.getElementById("treinoReps");
const treinoPesoEl = document.getElementById("treinoPeso");
const treinoTempoEl = document.getElementById("treinoTempo");
const treinoDistEl = document.getElementById("treinoDist");
const treinoPercentEl = document.getElementById("treinoPercent");
const treinoPercentInfoEl = document.getElementById("treinoPercentInfo");
const treinoAddBtn = document.getElementById("treinoAdd");
const treinoBody = document.getElementById("treinoBody");
const treinoResumoEl = document.getElementById("treinoResumo");
const treinoSugestaoEl = document.getElementById("treinoSugestao");
const weeklyHistoryEl = document.getElementById("weeklyHistory");
const printHistoryBtn = document.getElementById("printHistoryBtn");
const dailyHistoryBody = document.getElementById("dailyHistoryBody");
const treinoScrollEl = document.getElementById("treinoScroll");
/* Foto do quadro → OCR */
if (wodPhotoBtn && wodPhotoInput) {
  wodPhotoBtn.addEventListener("click", () => {
    wodPhotoInput.value = "";
    wodPhotoInput.click();
  });

  wodPhotoInput.addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    handleWodPhotoFile(file);
  });
}

if (wodOcrApplyBtn) {
  wodOcrApplyBtn.addEventListener("click", applyOcrToWod);
}

if (printHistoryBtn) {
  printHistoryBtn.addEventListener("click", exportHistoricoPdf);
}

/* ===== BACKUP ===== */
function formatDateTime(dt) {
  const d = new Date(dt);
  if (isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
}

function registerBackupMeta(evento) {
  try {
    const meta = JSON.parse(localStorage.getItem(STORAGE_BACKUP_META) || "{}");
    meta.lastChange = new Date().toISOString();
    meta.lastEvent = evento || "";
    localStorage.setItem(STORAGE_BACKUP_META, JSON.stringify(meta));
    updateBackupInfo();
  } catch (e) {}
}

function updateBackupInfo() {
  if (!backupInfoEl) return;
  const meta = JSON.parse(localStorage.getItem(STORAGE_BACKUP_META) || "{}");
  const lastBackup = meta.lastBackup ? formatDateTime(meta.lastBackup) : "nunca";
  const lastChange = meta.lastChange ? formatDateTime(meta.lastChange) : "sem registo";
  backupInfoEl.innerHTML =
    `<div class="helper-text">
       Último backup exportado: <strong>${lastBackup}</strong><br>
       Última alteração de dados: <strong>${lastChange}</strong>
     </div>`;
}

function buildBackupObject() {
  return {
    version: 2,
    createdAt: new Date().toISOString(),
    profile: profile || {},
    dataRm: dataRm || {},
    rmHistory: rmHistory || {},
    treinos: treinos || [],
    reservas: reservas || [],
    presencas: presencas || [],
    rankingsMensais: rankingsMensais || []
  };
}

function downloadJson(obj, filename) {
  const dataStr = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(obj));
  const a = document.createElement("a");
  a.setAttribute("href", dataStr);
  a.setAttribute("download", filename);
  document.body.appendChild(a);
  a.click();
  a.remove();
}

if (exportBackupBtn) {
  exportBackupBtn.addEventListener("click", () => {
    const backup = buildBackupObject();
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const filename = `crossfit_backup_${yyyy}${mm}${dd}.json`;
    downloadJson(backup, filename);

    try {
      const meta = JSON.parse(localStorage.getItem(STORAGE_BACKUP_META) || "{}");
      meta.lastBackup = new Date().toISOString();
      localStorage.setItem(STORAGE_BACKUP_META, JSON.stringify(meta));
    } catch (e) {}
    updateBackupInfo();
    alert("Backup exportado. Podes agora guardar o ficheiro em Google Drive, iCloud, Ficheiros, etc.");
  });
}

if (importBackupBtn && backupFileInput) {
  importBackupBtn.addEventListener("click", () => {
    backupFileInput.value = "";
    backupFileInput.click();
  });

  backupFileInput.addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
      try {
        const content = evt.target.result;
        const data = JSON.parse(content);

        if (!data || typeof data !== "object") {
          alert("Ficheiro inválido.");
          return;
        }

        if (!("dataRm" in data) && !("treinos" in data)) {
          alert("Este ficheiro não parece ser um backup válido da app.");
          return;
        }

        profile = data.profile || {};
        dataRm = data.dataRm || {};
        rmHistory = data.rmHistory || {};
        treinos = data.treinos || [];
        reservas = data.reservas || [];
        presencas = data.presencas || [];
        rankingsMensais = data.rankingsMensais || [];

        localStorage.setItem(STORAGE_PROFILE, JSON.stringify(profile));
        localStorage.setItem(STORAGE_RM, JSON.stringify(dataRm));
        localStorage.setItem(STORAGE_RM_HISTORY, JSON.stringify(rmHistory));
        localStorage.setItem(STORAGE_TREINO, JSON.stringify(treinos));
        localStorage.setItem(STORAGE_RESERVAS, JSON.stringify(reservas));
        localStorage.setItem(STORAGE_PRESENCAS, JSON.stringify(presencas));
        localStorage.setItem(STORAGE_RANKINGS, JSON.stringify(rankingsMensais));

        registerBackupMeta("Backup importado");

        loadProfile();
        renderRm();
        refreshCalcExOptions();
        refreshGraphExerciseOptions();
        renderTreinos();
        renderReservas();

        alert("Backup importado com sucesso.");
      } catch (err) {
        console.error(err);
        alert("Erro ao ler o ficheiro de backup.");
      }
    };
    reader.readAsText(file);
  });
}

/* GUIA EXERCÍCIOS – EN + PT na mesma coluna, mais limpo para telemóvel */
function renderGuiaExercicios() {
  if (!guiaBody) return;
  guiaBody.innerHTML = "";

  const filtro = (guiaSearch?.value || "").toLowerCase().trim();

  EXER_INFO.forEach(ex => {
    const texto = (ex.en + " " + ex.pt + " " + ex.descricao).toLowerCase();
    if (filtro && !texto.includes(filtro)) return;

    const tr = document.createElement("tr");

    // Coluna 1 → EN + PT em duas linhas
    const tdNome = document.createElement("td");
    tdNome.innerHTML = `<strong>${ex.en}</strong><br><span>${ex.pt}</span>`;
    tr.appendChild(tdNome);

    // Coluna 2 → descrição
    const tdDesc = document.createElement("td");
    tdDesc.textContent = ex.descricao;
    tr.appendChild(tdDesc);

    guiaBody.appendChild(tr);
  });
}

if (guiaSearch) {
  guiaSearch.addEventListener("input", renderGuiaExercicios);
}

/* ===== PERFORMANCE (WOD / 1RM / METCON) ===== */
function parseTimeToSeconds(str) {
  if (!str) return null;
  const clean = String(str).trim().toLowerCase();
  if (!clean) return null;

  // 1) hh:mm:ss ou mm:ss em qualquer parte do texto
  const colonMatch = clean.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (colonMatch) {
    const hasHours = !!colonMatch[3];
    const h = hasHours ? parseInt(colonMatch[1], 10) : 0;
    const m = hasHours ? parseInt(colonMatch[2], 10) : parseInt(colonMatch[1], 10);
    const s = hasHours ? parseInt(colonMatch[3], 10) : parseInt(colonMatch[2], 10);

    if ([h, m, s].some(n => isNaN(n))) return null;
    if (m < 0 || m >= 60 || s < 0 || s >= 60) return null;

    return h * 3600 + m * 60 + s;
  }

  // 2) Só número → minutos (ex.: "20" = 20 minutos)
  if (/^\d+(\.\d+)?$/.test(clean)) {
    const val = parseFloat(clean);
    return isNaN(val) ? null : Math.round(val * 60);
  }

  // 3) Formatos tipo “20'”, “20 min”, “2h”
  const unitMatch = clean.match(/(\d+)\s*(h|hr|hrs|hora|horas|m|min|mins|minuto|minutos|')/);
  if (unitMatch) {
    const valor = parseInt(unitMatch[1], 10);
    const unidade = unitMatch[2];

    if (["h", "hr", "hrs", "hora", "horas"].includes(unidade)) return valor * 3600;
    return valor * 60;
  }

  return null;
}

function formatSecondsToTime(totalSeconds) {
  if (totalSeconds == null || isNaN(totalSeconds)) return "";
  const t = Math.round(totalSeconds);
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  if (h > 0) {
    return `${h}:${mm}:${ss}`;
  }
  return `${m}:${ss}`;
}

function renderPerformance() {
  /* WOD – dias com mais carga */
  if (perfWodBody) {
    perfWodBody.innerHTML = "";
    if (!treinos.length) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 5;
      td.textContent = "Ainda não existem WOD registados.";
      tr.appendChild(td);
      perfWodBody.appendChild(tr);
    } else {
      const map = {};
      treinos.forEach(t => {
        if (!t.date) return;
        if (!map[t.date]) {
          map[t.date] = {
            cargaTotal: 0,
            distTotalKm: 0,
            numEx: 0,
            melhorTempoMetconSeg: null
          };
        }
        map[t.date].cargaTotal += t.carga || 0;
        map[t.date].distTotalKm += t.distanciaKm || 0;
        map[t.date].numEx += 1;

        if (t.tipo === "metcon" && t.tempo) {
          const sec = parseTimeToSeconds(t.tempo);
          if (sec != null) {
            if (map[t.date].melhorTempoMetconSeg == null || sec < map[t.date].melhorTempoMetconSeg) {
              map[t.date].melhorTempoMetconSeg = sec;
            }
          }
        }
      });

      const rows = Object.keys(map).map(date => ({
        date,
        cargaTotal: map[date].cargaTotal,
        distTotalKm: map[date].distTotalKm,
        numEx: map[date].numEx,
        melhorTempoMetconSeg: map[date].melhorTempoMetconSeg
      }));

      rows.sort((a, b) => (b.cargaTotal || 0) - (a.cargaTotal || 0));

      rows.slice(0, 10).forEach(r => {
        const tr = document.createElement("tr");

        const tdData = document.createElement("td");
        tdData.textContent = r.date;
        tr.appendChild(tdData);

        const tdCarga = document.createElement("td");
        tdCarga.textContent = formatKg(r.cargaTotal);
        tr.appendChild(tdCarga);

        const tdDist = document.createElement("td");
        tdDist.textContent = r.distTotalKm ? formatKm(r.distTotalKm) : "-";
        tr.appendChild(tdDist);

        const tdNum = document.createElement("td");
        tdNum.textContent = r.numEx.toString();
        tr.appendChild(tdNum);

        const tdTempo = document.createElement("td");
        tdTempo.textContent = r.melhorTempoMetconSeg != null
          ? formatSecondsToTime(r.melhorTempoMetconSeg)
          : "-";
        tr.appendChild(tdTempo);

        perfWodBody.appendChild(tr);
      });

      if (!perfWodBody.hasChildNodes()) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = 5;
        td.textContent = "Sem dados suficientes para gerar ranking.";
        tr.appendChild(td);
        perfWodBody.appendChild(tr);
      }
    }
  }

  /* Top 1RM */
  if (perf1rmBody) {
    perf1rmBody.innerHTML = "";
    const nomes = Object.keys(dataRm || {});
    if (!nomes.length) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 3;
      td.textContent = "Ainda não registaste nenhum 1RM.";
      tr.appendChild(td);
      perf1rmBody.appendChild(tr);
    } else {
      const pesoCorporal = profile && profile.peso ? profile.peso : null;
      const rows = nomes.map(name => ({
        name,
        value: dataRm[name]
      })).sort((a, b) => (b.value || 0) - (a.value || 0));

      rows.slice(0, 10).forEach(r => {
        const tr = document.createElement("tr");

        const tdName = document.createElement("td");
        const label = MOVES_PT[r.name] ? `${r.name} – ${MOVES_PT[r.name]}` : r.name;
        tdName.textContent = label;
        tr.appendChild(tdName);

        const tdVal = document.createElement("td");
        tdVal.textContent = formatKg(r.value);
        tr.appendChild(tdVal);

        const tdRel = document.createElement("td");
        if (pesoCorporal) {
          const rel = r.value / pesoCorporal;
          tdRel.textContent = rel.toFixed(2) + "x";
        } else {
          tdRel.textContent = "-";
        }
        tr.appendChild(tdRel);

        perf1rmBody.appendChild(tr);
      });
    }
  }

  /* Metcon – melhores tempos (tipo = 'metcon') */
  if (perfMetconBody) {
    perfMetconBody.innerHTML = "";
    const metconMap = {};

    treinos.forEach(t => {
      if (t.tipo !== "metcon" || !t.tempo) return;
      const sec = parseTimeToSeconds(t.tempo);
      if (sec == null) return;
      const key = t.ex || "Metcon";
      const existing = metconMap[key];
      if (!existing || sec < existing.tempoSeg) {
        metconMap[key] = {
          exercicio: key,
          tempoSeg: sec,
          tempoStr: t.tempo,
          date: t.date || "",
          carga: t.carga || 0,
          distanciaKm: t.distanciaKm || 0
        };
      }
    });

    const rows = Object.keys(metconMap).map(k => metconMap[k]).sort((a, b) => a.tempoSeg - b.tempoSeg);

    if (!rows.length) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 4;
      td.textContent = "Ainda não registaste metcons com tempo em formato mm:ss.";
      tr.appendChild(td);
      perfMetconBody.appendChild(tr);
    } else {
      rows.slice(0, 10).forEach(r => {
        const tr = document.createElement("tr");

        const tdEx = document.createElement("td");
        const label = MOVES_PT[r.exercicio] ? `${r.exercicio} – ${MOVES_PT[r.exercicio]}` : r.exercicio;
        tdEx.textContent = label;
        tr.appendChild(tdEx);

        const tdTempo = document.createElement("td");
        tdTempo.textContent = r.tempoStr;
        tr.appendChild(tdTempo);

        const tdData = document.createElement("td");
        tdData.textContent = r.date;
        tr.appendChild(tdData);

        const tdCarga = document.createElement("td");
        let cargaLabel = "-";
        if (r.distanciaKm && r.distanciaKm > 0) {
          cargaLabel = formatKm(r.distanciaKm);
        } else if (r.carga && r.carga > 0) {
          cargaLabel = formatKg(r.carga);
        }
        tdCarga.textContent = cargaLabel;
        tr.appendChild(tdCarga);

        perfMetconBody.appendChild(tr);
      });
    }
  }
}

/* ===== RESERVAS & PRESENÇAS (ALUNO) ===== */

/* Garantir que as estruturas são sempre arrays válidas */
if (!Array.isArray(reservas)) reservas = [];
if (!Array.isArray(presencas)) presencas = [];
if (!Array.isArray(rankingsMensais)) rankingsMensais = [];

function saveReservas() {
  try {
    localStorage.setItem(STORAGE_RESERVAS, JSON.stringify(reservas));
  } catch (e) {
    console.error("Erro ao guardar reservas:", e);
    alert("Não foi possível guardar a reserva (erro de armazenamento do navegador).");
  }
}

function savePresencas() {
  try {
    localStorage.setItem(STORAGE_PRESENCAS, JSON.stringify(presencas));
  } catch (e) {
    console.error("Erro ao guardar presenças:", e);
  }
}

function saveRankings() {
  try {
    localStorage.setItem(STORAGE_RANKINGS, JSON.stringify(rankingsMensais));
  } catch (e) {
    console.error("Erro ao guardar rankings mensais:", e);
  }
}

function gerarIdReserva() {
  return "res_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function marcarPresenca(reservaId) {
  const existe = presencas.some(p => p.reservaId === reservaId);
  if (existe) return;
  const now = new Date();
  presencas.push({
    reservaId,
    data: now.toISOString().slice(0, 10),
    hora: now.toTimeString().slice(0,5)
  });
  savePresencas();
  renderReservas();
  atualizarRankingsMensais();
}

function apagarReserva(id) {
  if (!confirm("Apagar esta reserva?")) return;
  reservas = reservas.filter(r => r.id !== id);
  presencas = presencas.filter(p => p.reservaId !== id);
  saveReservas();
  savePresencas();
  renderReservas();
  atualizarRankingsMensais();
}

function adicionarReserva() {
  try {
    const hojeISO = new Date().toISOString().slice(0,10);

    const data = (reservaDataEl && reservaDataEl.value) ? reservaDataEl.value : hojeISO;
    const hora = reservaHoraEl ? reservaHoraEl.value : "";
    const tipo = reservaTipoEl ? reservaTipoEl.value : "";
    const nota = reservaNotaEl ? reservaNotaEl.value.trim() : "";

    if (!data || !hora || !tipo) {
      alert("Preenche pelo menos data, hora e tipo de aula.");
      return;
    }

    const novaReserva = {
      id: gerarIdReserva(),
      data,
      hora,
      tipo,
      nota,
      inscritos: profile && profile.nome ? [profile.nome] : []
    };

    if (!Array.isArray(reservas)) reservas = [];
    reservas.unshift(novaReserva);

    saveReservas();
    if (reservaNotaEl) reservaNotaEl.value = "";
    registerBackupMeta("Reserva registada");
    renderReservas();
    atualizarRankingsMensais();

    console.log("Reserva adicionada:", novaReserva);
  } catch (e) {
    console.error("Erro ao adicionar reserva:", e);
    alert("Ocorreu um erro ao guardar a reserva. Verifica a consola do navegador para mais detalhes.");
  }
}

function mesmoMesAno(dataISO, ano, mes) {
  const d = new Date(dataISO);
  if (isNaN(d.getTime())) return false;
  return d.getFullYear() === ano && (d.getMonth() + 1) === mes;
}

function atualizarRankingsMensais() {
  if (!treinos || !treinos.length) {
    rankingsMensais = [];
    saveRankings();
    renderReservasResumo();
    return;
  }

  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = agora.getMonth() + 1;
  const chave = `${ano}-${String(mes).padStart(2,"0")}`;

  let cargaTotal = 0;
  let distTotal = 0;
  let nTreinos = 0;

  treinos.forEach(t => {
    if (!t.date) return;
    if (!mesmoMesAno(t.date, ano, mes)) return;
    nTreinos++;
    cargaTotal += t.carga || 0;
    distTotal += t.distanciaKm || 0;
  });

  const outras = rankingsMensais.filter(r => r.mes !== chave);
  const atual = {
    mes: chave,
    ano,
    mesNumero: mes,
    nTreinos,
    cargaTotal,
    distTotal
  };

  rankingsMensais = [...outras, atual];
  saveRankings();
  renderReservasResumo();
}

function renderReservasResumo() {
  if (!reservasResumoEl) return;
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = agora.getMonth() + 1;

  const nReservasMes = reservas.filter(r => mesmoMesAno(r.data, ano, mes)).length;
  const nPresencasMes = presencas.filter(p => mesmoMesAno(p.data, ano, mes)).length;

  const chave = `${ano}-${String(mes).padStart(2,"0")}`;
  const rank = rankingsMensais.find(r => r.mes === chave);

  let texto = `Este mês: ${nReservasMes} reservas e ${nPresencasMes} presenças registadas.`;

  if (rank && rank.nTreinos > 0) {
    texto += ` Treinos registados em WOD: ${rank.nTreinos} · Carga total = ${formatKg(rank.cargaTotal)}.`;
    if (rank.distTotal > 0) {
      texto += ` Distância total = ${formatKm(rank.distTotal)}.`;
    }
  } else {
    texto += " Ainda não há dados suficientes de WOD para resumo mensal.";
  }

  reservasResumoEl.textContent = texto;
}

function renderReservas() {
  if (!reservasBody) return;
  reservasBody.innerHTML = "";

  if (!reservas || !reservas.length) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 6;
    td.textContent = "Sem reservas registadas.";
    tr.appendChild(td);
    reservasBody.appendChild(tr);
    renderReservasResumo();
    return;
  }

  reservas.forEach(r => {
    const tr = document.createElement("tr");

    const tdData = document.createElement("td");
    tdData.textContent = r.data || "";
    tr.appendChild(tdData);

    const tdHora = document.createElement("td");
    tdHora.textContent = r.hora || "";
    tr.appendChild(tdHora);

    const tdTipo = document.createElement("td");
    tdTipo.textContent = r.tipo || "";
    tr.appendChild(tdTipo);

    const tdNota = document.createElement("td");
    tdNota.textContent = r.nota || "";
    tr.appendChild(tdNota);

    const tdPres = document.createElement("td");
    const temPresenca = presencas.some(p => p.reservaId === r.id);
    if (temPresenca) {
      tdPres.textContent = "Presente ✅";
    } else {
      const btnPres = document.createElement("button");
      btnPres.className = "btn-secondary";
      btnPres.style.padding = "4px 8px";
      btnPres.style.fontSize = "0.7rem";
      btnPres.textContent = "Marcar presença";
      btnPres.addEventListener("click", () => marcarPresenca(r.id));
      tdPres.appendChild(btnPres);
    }
    tr.appendChild(tdPres);

    const tdDel = document.createElement("td");
    const btnDel = document.createElement("button");
    btnDel.className = "btn-delete";
    btnDel.textContent = "🗑";
    btnDel.addEventListener("click", () => apagarReserva(r.id));
    tdDel.appendChild(btnDel);
    tr.appendChild(tdDel);

    reservasBody.appendChild(tr);
  });

  renderReservasResumo();
}

/* LIGAR BOTÃO GUARDAR RESERVA */
if (reservaAddBtn) {
  reservaAddBtn.addEventListener("click", adicionarReserva);
}

/* ---------------------------------------------------
   TABS PRINCIPAIS (1RM / WOD & Tools) - versão segura
---------------------------------------------------- */
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {

    // remover active de todas as tabs
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const target = btn.dataset.target;

    // esconder todas as sections principais
    document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));

    // ativar só se existir (evita página em branco)
    const sec = document.getElementById(target);
    if (sec && sec.classList.contains("section")) {
      sec.classList.add("active");
    }
  });
});


/* ---------------------------------------------------
   SUB-SECÇÕES (WOD, Objetivo, Gráficos, etc.)
---------------------------------------------------- */
document.querySelectorAll(".opt-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.target;

    // esconder todas as sub-secções
    document.querySelectorAll(".option-section").forEach(s => s.classList.remove("active"));

    // mostrar a secção pedida
    const sec = document.getElementById(target);
    if (sec && sec.classList.contains("option-section")) {
      sec.classList.add("active");
    }

    // atualizar conteúdos específicos de cada secção
    if (target === "opt-wod") {
      renderTreinos();
    }

    if (target === "opt-historico") {
      renderDailyHistory();
    }

    if (target === "opt-performance") {
      renderPerformance();
    }

    if (target === "opt-guia") {
      renderGuiaExercicios();
    }
  });
});


/* ---------------------------------------------------
   BOTÃO DE RESERVAS (caso exista)
---------------------------------------------------- */
if (reservasBtn && reservasSection) {
  reservasBtn.addEventListener("click", () => {
    const visivel = reservasSection.style.display === "block";
    reservasSection.style.display = visivel ? "none" : "block";
  });
}


/* ---------------------------------------------------
   ARRANQUE DA APP (sequência segura)
---------------------------------------------------- */

// impedir crashes se o localStorage tiver dados corrompidos (versão correta)
treinos = JSON.parse(localStorage.getItem(STORAGE_TREINO) || "[]");
if (!Array.isArray(treinos)) {
  treinos = [];
  localStorage.setItem(STORAGE_TREINO, JSON.stringify(treinos));
}

// iniciar selects e dados
initSelects();
loadProfile();
renderRm();

refreshCalcExOptions();
refreshGraphExerciseOptions();

// definir automaticamente a data do WOD se vazio
if (treinoDataEl && !treinoDataEl.value) {
  treinoDataEl.value = new Date().toISOString().slice(0, 10);
}

renderTreinos();          // mostra WOD do dia
updateBackupInfo();       // estado do backup
renderGuiaExercicios();   // guia
renderPerformance();      // desempenho
renderReservas();         // reservas
atualizarRankingsMensais();// rankings


/* ---------------------------------------------------
   SERVICE WORKER
---------------------------------------------------- */

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("./service-worker.js?v=6", { scope: "./" });
  });
}
function renderQuadroWodDia(dataSelecionada) {
  const card = document.getElementById("wodQuadroCard");
  const dataDiv = document.getElementById("wodQuadroData");
  const conteudo = document.getElementById("wodQuadroConteudo");
  if (!card || !dataDiv || !conteudo) return;

  const treinos = JSON.parse(localStorage.getItem("treinos")) || [];
  const doDia = treinos.filter(t => t.data === dataSelecionada);

  if (doDia.length === 0) {
    card.style.display = "none";
    return;
  }

  card.style.display = "block";
  conteudo.innerHTML = "";

  dataDiv.textContent = `WOD — ${new Date(dataSelecionada).toLocaleDateString("pt-PT")}`;

  const grupos = {};

  doDia.forEach(t => {
    if (!grupos[t.parte]) grupos[t.parte] = [];
    grupos[t.parte].push(t);
  });

  Object.keys(grupos).sort().forEach(parte => {
    const bloco = document.createElement("div");
    bloco.style.marginBottom = "10px";

    const titulo = document.createElement("strong");
    titulo.textContent = `${parte})`;
    bloco.appendChild(titulo);

    grupos[parte].forEach(item => {
      const linha = document.createElement("div");
      linha.textContent =
        `• ${item.formato || ""} ${item.rondas ? item.rondas + "×" : ""}${item.reps || ""} ` +
        `${item.exercicio}${item.peso ? " @ " + item.peso + " kg" : ""}`;

      linha.style.padding = "4px 6px";
      linha.style.borderRadius = "6px";
      linha.style.marginTop = "4px";

      // long press
      let pressTimer;
      linha.addEventListener("touchstart", () => {
        pressTimer = setTimeout(() => abrirEdicaoWod(item.id), 2000);
      });
      linha.addEventListener("touchend", () => clearTimeout(pressTimer));

      bloco.appendChild(linha);
    });

    conteudo.appendChild(bloco);
  });
}
function abrirEdicaoWod(id) {
  const treinos = JSON.parse(localStorage.getItem("treinos")) || [];
  const treino = treinos.find(t => t.id === id);
  if (!treino) return;

  if (confirm("Queres apagar este registo?\nOK = apagar\nCancelar = editar")) {
    const novos = treinos.filter(t => t.id !== id);
    localStorage.setItem("treinos", JSON.stringify(novos));
  } else {
    document.getElementById("treinoParte").value = treino.parte;
    document.getElementById("treinoFormato").value = treino.formato;
    document.getElementById("treinoRondas").value = treino.rondas;
    document.getElementById("treinoReps").value = treino.reps;
    document.getElementById("treinoPeso").value = treino.peso;
  }

  renderQuadroWodDia(treino.data);
          }

// Re-desenhar o gráfico quando o utilizador abre a secção (canvas pode estar escondido antes)
document.addEventListener("click", (e) => {
  const btn = e.target && e.target.closest ? e.target.closest(".opt-btn") : null;
  if (!btn) return;
  const tgt = btn.getAttribute("data-target") || "";
  if (tgt === "opt-graficos" || tgt === "opt-performance") {
    setTimeout(() => { try { updateRmChart(); } catch(_) {} }, 60);
  }
});

