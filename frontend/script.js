const API_BASE_URL = "/api";

const PAGES = [
  "page-home",
  "page-search",
  "page-mentor-profile",
  "page-payment",
  "page-confirmation",
  "page-history",
];
let currentMentor = {};
// Definido para uma data e hora inicial que será selecionada por padrão
let selectedDateTime = { date: "2025-11-05", time: "11:00" };

// Função para mostrar mensagem de erro (ajuda a diagnosticar problemas de API)
function showApiError(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.classList.remove("hidden");
  container.innerHTML = `
                <div class="error-message-box">
                    <h5 class="font-bold mb-2">Erro de Conexão com o Backend (Python/Supabase)</h5>
                    <p class="text-sm">O frontend não conseguiu se conectar ao servidor da API em <code>${API_BASE_URL}</code>.</p>
                    <p class="text-sm mt-1"><strong>Verifique:</strong> O servidor Python (FastAPI) está rodando (<code>uvicorn main:app --reload</code>)?</p>
                </div>
            `;
}

function switchPage(pageId) {
  PAGES.forEach((id) => {
    const page = document.getElementById(id);
    if (page) page.classList.remove("active");
  });
  const targetPage = document.getElementById(pageId);
  if (targetPage) {
    targetPage.classList.add("active");
    window.scrollTo(0, 0);
  }
}

// Função para renderizar os cards de mentores
function displayMentors(mentors, container, isFeatured = false) {
  container.innerHTML = "";
  const displayMentors = isFeatured ? mentors.slice(0, 3) : mentors;

  if (mentors.length === 0 && !isFeatured) {
    document.getElementById("no-results-message").style.display = "block";
    return;
  } else if (!isFeatured) {
    document.getElementById("no-results-message").style.display = "none";
  }

  displayMentors.forEach((mentor) => {
    const initials = mentor.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2);

    const cardHtml = `
            <div class="card-shadcn  p-6 space-y-4 flex flex-col justify-between cursor-pointer hover:shadow-md transition-all duration-300" data-mentor-id="${
              mentor.id
            }">
                <div class="space-y-3">
                    <div class="flex items-center space-x-4">
                        <img src="${
                          mentor.image_url
                        }" onerror="this.onerror=null; this.src='https://placehold.co/56x56/f0f9ff/0f172a?text=${initials}';" alt="Avatar de ${
      mentor.name
    }" class="h-14 w-14 shrink-0 rounded-full mentor-card-avatar" />
                        <div>
                            <h4 class="font-bold text-gray-800 text-xl">
                                ${mentor.name} 
                            </h4>
                            <p class="text-sm text-muted-foreground">${
                              mentor.subject
                            }</p>
                        </div>
                    </div>
                    <div class="pt-2">
                         <div class="flex items-center space-x-2">
                            <span class="text-lg font-extrabold text-primary">R$ ${mentor.price.toFixed(
                              2
                            )}/h</span>
                            ${
                              mentor.verified
                                ? '<span class="badge-shadcn badge-success ml-2">VERIFICADO</span>'
                                : ""
                            }
                        </div>
                        <p class="text-sm text-muted-foreground mt-1">Avaliação: ⭐ ${
                          mentor.rating
                        }/5</p>
                    </div>
                </div>
                
                <button class="btn-shadcn btn-primary-shadcn w-full mt-4 h-11" data-mentor-id="${
                  mentor.id
                }">Ver Perfil</button>
            </div>
          `;
    container.insertAdjacentHTML("beforeend", cardHtml);
  });
}

// Função para buscar mentores na API
async function fetchMentors(subject = "", verified = false, maxPrice = 300) {
  const mentorList = document.getElementById("search-mentor-list");
  const resultsCount = document.getElementById("results-count");
  const errorContainer = document.getElementById("search-error-container");

  mentorList.innerHTML = "";
  errorContainer.classList.add("hidden");

  let url = `${API_BASE_URL}/mentors?max_price=${maxPrice}`;
  if (subject) url += `&subject=${subject}`;
  if (verified) url += `&verified=true`;

  try {
    const response = await fetch(url);
    if (!response.ok)
      throw new Error(
        "Falha ao buscar mentores. Código de Status: " + response.status
      );
    const mentors = await response.json();

    displayMentors(mentors, mentorList, false);
    resultsCount.textContent = `${mentors.length} Resultado(s) Encontrado(s)`;
  } catch (error) {
    console.error("Erro ao carregar mentores:", error);
    resultsCount.textContent = `Erro ao carregar resultados.`;
    showApiError("search-error-container");
  }
}

// Renderiza o calendário de agendamento (Simulação)
function renderCalendar() {
  const widget = document.getElementById("calendar-widget");
  widget.innerHTML = "";

  const daysInMonth = 30;
  const monthName = "Novembro 2025";
  const firstDayIndex = 6; // Sábado

  const header = `
            <div class="calendar-header flex justify-between items-center font-semibold mb-3 text-gray-800">
                <button class="p-1 rounded-md hover:bg-white transition-colors text-sm">←</button>
                <span class="text-base font-bold">${monthName}</span>
                <button class="p-1 rounded-md hover:bg-white transition-colors text-sm">→</button>
            </div>
        `;

  const grid = document.createElement("div");
  grid.className = "grid grid-cols-7 text-center text-xs";

  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  dayNames.forEach((name) => {
    const div = document.createElement("div");
    div.className = "day-name text-muted-foreground pb-2 font-medium";
    div.textContent = name.substring(0, 3);
    grid.appendChild(div);
  });

  for (let i = 0; i < firstDayIndex; i++) {
    grid.appendChild(document.createElement("div"));
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateString = `2025-11-${day < 10 ? "0" + day : day}`;
    const dayDiv = document.createElement("div");
    dayDiv.className =
      "day-number w-9 h-9 flex items-center justify-center mx-auto rounded-full cursor-pointer transition-colors text-sm";
    dayDiv.textContent = day;
    dayDiv.dataset.date = dateString;

    if (day === 5) {
      dayDiv.classList.add(
        "bg-primary",
        "text-white",
        "font-medium",
        "shadow-md"
      );
    } else if (day >= 5 && day <= 15) {
      dayDiv.classList.add("hover:bg-primary/10", "hover:text-primary");
      dayDiv.addEventListener("click", (e) => {
        document.querySelectorAll(".day-number").forEach((d) => {
          d.classList.remove(
            "bg-primary",
            "text-white",
            "font-medium",
            "shadow-md"
          );
          if (parseInt(d.textContent) >= 5 && parseInt(d.textContent) <= 15) {
            d.classList.add("hover:bg-primary/10", "hover:text-primary");
          }
        });
        e.target.classList.remove("hover:bg-primary/10", "hover:text-primary");
        e.target.classList.add(
          "bg-primary",
          "text-white",
          "font-medium",
          "shadow-md"
        );
        selectedDateTime.date = e.target.dataset.date;
        setupScheduleListeners(currentMentor);
      });
    } else {
      dayDiv.classList.add(
        "text-muted-foreground",
        "opacity-50",
        "pointer-events-none"
      );
    }
    grid.appendChild(dayDiv);
  }

  widget.innerHTML = header;
  widget.appendChild(grid);
}

// Carrega o perfil do mentor
async function loadProfile(mentorId) {
  try {
    const response = await fetch(`${API_BASE_URL}/mentors/${mentorId}`);
    if (!response.ok) throw new Error("Mentor não encontrado.");
    const mentor = await response.json();
    currentMentor = mentor;

    const initials = mentor.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2);

    document.getElementById("profile-details-area").innerHTML = `
                <div class="card-shadcn p-8 space-y-6">
                    <div class="flex items-center space-x-6 border-b pb-6">
                        <img src="${
                          mentor.image_url
                        }" onerror="this.onerror=null; this.src='https://placehold.co/96x96/f0f9ff/0f172a?text=${initials}';" alt="Avatar de ${
      mentor.name
    }" class="h-24 w-24 shrink-0 rounded-full mentor-card-avatar" />
                        <div>
                            <h2 class="text-3xl font-bold text-gray-800">${
                              mentor.name
                            } ${
      mentor.verified
        ? '<span class="badge-shadcn badge-success ml-2">✓</span>'
        : ""
    }</h2>
                            <p class="text-lg text-muted-foreground mt-1">${
                              mentor.subject
                            } - Especialista</p>
                            <p class="mt-2 text-xl font-extrabold text-primary">R$ ${mentor.price.toFixed(
                              2
                            )} / hora</p>
                            <p class="text-lg font-semibold text-gray-700">⭐ ${
                              mentor.rating
                            }/5</p>
                        </div>
                    </div>
                    
                    <div>
                        <h3 class="text-2xl font-bold mb-3 text-gray-800">Sobre o Mentor</h3>
                        <p class="text-muted-foreground text-base leading-relaxed">${
                          mentor.bio
                        }</p>
                    </div>

                    <div>
                        <h3 class="text-2xl font-bold mb-3 text-gray-800">Certificados</h3>
                        <ul class="space-y-3">
                            <li class="flex items-center text-gray-700 text-base"><svg class="mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>Certificado ${
                              mentor.subject
                            } Avançado</li>
                            <li class="flex items-center text-gray-700 text-base"><svg class="mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>Mestrado em Computação</li>
                        </ul>
                    </div>
                </div>
            `;

    renderCalendar();
    setupScheduleListeners(mentor);

    switchPage("page-mentor-profile");
  } catch (error) {
    alert("Não foi possível carregar o perfil do mentor: " + error.message);
  }
}

// Configura os horários disponíveis e botões de agendamento
function setupScheduleListeners(mentor) {
  const timeSlotsContainer = document.getElementById(
    "available-times-container"
  );
  const scheduleButton = document.getElementById("schedule-and-pay-button");

  timeSlotsContainer.innerHTML = "";
  const availableTimes = ["10:00", "11:00", "14:00", "16:30", "18:00", "19:30"];

  scheduleButton.textContent = `Agendar e Pagar (R$ ${mentor.price.toFixed(
    2
  )})`;
  scheduleButton.disabled = false;

  let initialSelectedTime = "11:00";

  availableTimes.forEach((time) => {
    const slot = document.createElement("button");
    slot.className =
      "btn-shadcn btn-secondary-shadcn h-9 px-4 py-1 text-sm hover:bg-primary/10 hover:text-primary transition-colors duration-200";
    slot.textContent = time;
    slot.dataset.time = time;

    // Seleciona o horário inicial (11:00 na data 2025-11-05) por padrão
    if (
      selectedDateTime.date === "2025-11-05" &&
      time === initialSelectedTime
    ) {
      slot.classList.remove(
        "btn-secondary-shadcn",
        "hover:bg-primary/10",
        "hover:text-primary"
      );
      slot.classList.add(
        "bg-primary",
        "text-white",
        "hover:bg-gray-800",
        "shadow-md"
      );
      selectedDateTime.time = initialSelectedTime;
    }

    slot.addEventListener("click", (e) => {
      document.querySelectorAll(".available-times .btn-shadcn").forEach((s) => {
        s.classList.add(
          "btn-secondary-shadcn",
          "hover:bg-primary/10",
          "hover:text-primary"
        );
        s.classList.remove(
          "bg-primary",
          "text-white",
          "hover:bg-gray-800",
          "shadow-md"
        );
      });
      e.target.classList.remove("btn-secondary-shadcn");
      e.target.classList.add(
        "bg-primary",
        "text-white",
        "hover:bg-gray-800",
        "shadow-md"
      );
      selectedDateTime.time = e.target.dataset.time;
      scheduleButton.disabled = false;
    });
    timeSlotsContainer.appendChild(slot);
  });

  scheduleButton.addEventListener("click", () => {
    if (selectedDateTime.date && selectedDateTime.time) {
      document.getElementById("payment-mentor-name").textContent = mentor.name;
      document.getElementById(
        "payment-date-time"
      ).textContent = `${selectedDateTime.date} às ${selectedDateTime.time}`;
      document.getElementById(
        "payment-price-value"
      ).textContent = `R$ ${mentor.price.toFixed(2)}`;

      currentMentor.appointment = {
        date: selectedDateTime.date,
        time: selectedDateTime.time,
        price: mentor.price,
        name: mentor.name,
        subject: mentor.subject,
      };

      switchPage("page-payment");
    } else {
      alert("Selecione a data e o horário.");
    }
  });
}

// Adiciona a sessão ao Local Storage (Histórico)
function logSessionHistory() {
  if (!currentMentor.appointment) return;

  const newSession = {
    id: Date.now(),
    mentorName: currentMentor.appointment.name,
    subject: currentMentor.appointment.subject,
    date: currentMentor.appointment.date,
    time: currentMentor.appointment.time,
    price: currentMentor.appointment.price,
    status: "upcoming",
  };

  const sessions = JSON.parse(localStorage.getItem("tutoriSessions") || "[]");
  sessions.push(newSession);
  localStorage.setItem("tutoriSessions", JSON.stringify(sessions));
}

// Renderiza a tela de histórico
function renderHistory() {
  const historyContainer = document.getElementById("history-list-container");
  const sessions = JSON.parse(localStorage.getItem("tutoriSessions") || "[]");
  historyContainer.innerHTML = "";

  if (sessions.length === 0) {
    historyContainer.innerHTML = `
                    <div class="card-shadcn p-6 text-center text-muted-foreground">
                        Nenhuma aula agendada ainda.
                    </div>
                `;
    return;
  }

  sessions.sort((a, b) => new Date(a.date) - new Date(b.date));

  sessions.forEach((session) => {
    const isUpcoming = session.status === "upcoming";
    const isCompleted = session.status === "completed";
    const isCancelled = session.status === "cancelled";

    let borderClass = "border-yellow-500";
    let actionContent = "";
    let statusTag = "";

    if (isUpcoming) {
      borderClass = "border-yellow-500";
      actionContent = `
                        <button class="btn-shadcn btn-primary-shadcn access-room">Acessar Sala</button>
                        <button class="btn-shadcn text-red-600 hover:bg-red-50 bg-white border border-red-600 cancel-session" data-id="${session.id}">Cancelar</button>
                    `;
    } else if (isCompleted) {
      borderClass = "border-green-500";
      statusTag = `<span class="badge-shadcn badge-success">Concluída</span>`;
      actionContent = `<button class="text-sm font-medium text-primary hover:underline transition-colors">Deixar Avaliação</button>`;
    } else if (isCancelled) {
      borderClass = "border-gray-400";
      statusTag = `<span class="badge-shadcn bg-red-100 text-red-600 border border-red-200">Cancelada</span>`;
      actionContent = `<span class="text-sm text-muted-foreground">Agendamento Cancelado</span>`;
    }

    const card = document.createElement("div");
    card.className = `card-shadcn p-5 flex flex-col md:flex-row justify-between items-start md:items-center border-l-4 ${borderClass} shadow-md`;
    card.innerHTML = `
                    <div class="flex-1">
                        <h4 class="font-semibold text-lg text-gray-800">Aula com ${
                          session.mentorName
                        }</h4>
                        <p class="text-sm text-muted-foreground mt-1">${
                          session.subject
                        } | ${session.date} | ${
      session.time
    } | R$ ${session.price.toFixed(2)}</p>
                    </div>
                    <div class="flex space-x-3 items-center mt-4 md:mt-0">
                        ${statusTag}
                        ${actionContent}
                    </div>
                `;
    historyContainer.appendChild(card);
  });

  // O botão "Acessar Sala" agora não faz nada (a página de sessão foi removida para simplificação)
  document.querySelectorAll(".access-room").forEach((btn) => {
    btn.addEventListener("click", () =>
      alert("Simulação: Sala de aula acessada!")
    );
  });

  document.querySelectorAll(".cancel-session").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      if (confirm("Tem certeza que deseja cancelar esta sessão?")) {
        cancelSession(parseInt(e.target.dataset.id));
      }
    });
  });
}

// Função para cancelar uma sessão
function cancelSession(sessionId) {
  const sessions = JSON.parse(localStorage.getItem("tutoriSessions") || "[]");
  const updatedSessions = sessions.map((session) => {
    if (session.id === sessionId) {
      return { ...session, status: "cancelled" };
    }
    return session;
  });
  localStorage.setItem("tutoriSessions", JSON.stringify(updatedSessions));
  renderHistory(); // Atualiza a lista na tela
}

// Inicializa os dados de histórico (exemplo)
if (!localStorage.getItem("tutoriSessions")) {
  localStorage.setItem(
    "tutoriSessions",
    JSON.stringify([
      {
        id: 1,
        mentorName: "Gabriel Santos",
        subject: "Cálculo Avançado",
        date: "2025-11-05",
        time: "10:00",
        price: 90.0,
        status: "upcoming",
      },
      {
        id: 2,
        mentorName: "Ana Clara Faria",
        subject: "Python para Projetos",
        date: "2025-10-15",
        time: "14:00",
        price: 120.0,
        status: "completed",
      },
    ])
  );
}

document.addEventListener("DOMContentLoaded", async () => {
  // --- Navegação ---
  document.getElementById("nav-home").addEventListener("click", (e) => {
    e.preventDefault();
    switchPage("page-home");
  });
  document.getElementById("nav-mentors").addEventListener("click", (e) => {
    e.preventDefault();
    fetchMentors("", false, 300);
    switchPage("page-search");
  });
  document.getElementById("nav-history").addEventListener("click", (e) => {
    e.preventDefault();
    renderHistory();
    switchPage("page-history");
  });
  document.getElementById("view-all-mentors").addEventListener("click", (e) => {
    e.preventDefault();
    fetchMentors("", false, 300);
    switchPage("page-search");
  });
  document
    .getElementById("cta-mentor-search")
    .addEventListener("click", (e) => {
      e.preventDefault();
      fetchMentors("", false, 300);
      switchPage("page-search");
    });

  // --- Lógica de Busca e Filtro ---
  const priceRangeInput = document.getElementById("price-range-input");
  const priceMaxDisplay = document.getElementById("price-max-display");
  const applyFiltersButton = document.getElementById("apply-filters-button");
  const searchTopicInput = document.getElementById("search-topic-input");
  const searchVerifiedOnly = document.getElementById("search-verified-only");

  priceRangeInput.addEventListener("input", () => {
    priceMaxDisplay.textContent = `R$ ${parseFloat(
      priceRangeInput.value
    ).toFixed(2)}`;
  });

  applyFiltersButton.addEventListener("click", () => {
    const subject = searchTopicInput.value;
    const verified = searchVerifiedOnly.checked;
    const maxPrice = priceRangeInput.value;
    fetchMentors(subject, verified, maxPrice);
  });

  document
    .getElementById("home-search-button")
    .addEventListener("click", () => {
      const subject = document.getElementById("home-search-input").value;
      document.getElementById("search-topic-input").value = subject;
      fetchMentors(subject, false, 300);
      switchPage("page-search");
    });

  // --- Redirecionamento de Card/Botão de Perfil ---
  document.addEventListener("click", (e) => {
    const target = e.target;
    const card = target.closest(".card-shadcn[data-mentor-id]");
    const button = target.closest("button[data-mentor-id]");

    let mentorId = null;

    if (button) {
      mentorId = button.dataset.mentorId;
    } else if (card) {
      mentorId = card.dataset.mentorId;
    }

    if (mentorId) {
      loadProfile(mentorId);
    }
  });

  // --- Fluxo de Pagamento/Confirmação ---
  document.getElementById("back-to-schedule").addEventListener("click", (e) => {
    e.preventDefault();
    switchPage("page-mentor-profile");
  });

  document
    .getElementById("finalize-payment-button")
    .addEventListener("click", () => {
      const inputs = document.querySelectorAll("#page-payment input");
      let isValid = true;
      inputs.forEach((input) => {
        // Simples validação: verifica se o campo está vazio
        if (!input.value) isValid = false;
      });

      if (!isValid) {
        alert("Preencha todos os campos do cartão.");
        return;
      }

      if (currentMentor.appointment) {
        logSessionHistory();
        document.getElementById("confirmed-mentor-name").textContent =
          currentMentor.appointment.name;
        document.getElementById("confirmed-date").textContent =
          currentMentor.appointment.date;
        document.getElementById("confirmed-time").textContent =
          currentMentor.appointment.time;
      }

      switchPage("page-confirmation");
    });

  document.getElementById("go-to-history").addEventListener("click", () => {
    renderHistory();
    switchPage("page-history");
  });

  // --- Inicialização da Home (Mentores em Destaque) ---
  try {
    const response = await fetch(`${API_BASE_URL}/mentors`);
    if (response.ok) {
      const allMentors = await response.json();
      displayMentors(
        allMentors,
        document.querySelector(".mentor-list-featured"),
        true
      );
      document.getElementById("home-error-container").classList.add("hidden");
    } else {
      throw new Error("Falha ao carregar mentores: " + response.status);
    }
  } catch (error) {
    console.error("Erro ao carregar mentores em destaque:", error);
    showApiError("home-error-container");
  }

  switchPage("page-home");
});
