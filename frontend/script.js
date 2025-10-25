const API_BASE_URL = "http://127.0.0.1:8000/api";

const PAGES = [
  "page-home",
  "page-search",
  "page-mentor-profile",
  "page-payment",
  "page-confirmation",
  "page-history",
  "page-session",
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
                <div class="error-message-box p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
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

// Função para renderizar os cards de mentores (MODIFICADO para o layout MentorLink)
function displayMentors(mentors, container, isFeatured = false) {
  container.innerHTML = "";
  // Não filtra mais por featured, apenas exibe a lista completa na página de busca
  const displayMentors = mentors;

  if (mentors.length === 0 && !isFeatured) {
    document.getElementById("no-results-message").style.display = "block";
    return;
  } else if (!isFeatured) {
    document.getElementById("no-results-message").style.display = "none";
  }

  // Como removemos a seção de Destaque da Home, esta função é usada primariamente para a página de busca.
  if (isFeatured) return; // Se for para destaque, não exibe nada (para não quebrar)

  displayMentors.forEach((mentor) => {
    const initials = mentor.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2);

    const cardHtml = `
            <div class="mentorlink-card cursor-pointer" data-mentor-id="${mentor.id
      }">
                <div class="mentorlink-card-image" style="background-image: url('${mentor.image_url
      }')">
                    <span class="mentorlink-price-tag">R$ ${mentor.price.toFixed(
        2
      )}/h</span>
                </div>
                <div class="mentorlink-card-content p-4 relative">
                    <img src="${mentor.image_url
      }" onerror="this.onerror=null; this.src='https://placehold.co/70x70/E8634E/FFFFFF?text=${initials}';" alt="Avatar de ${mentor.name
      }" class="mentorlink-avatar absolute" />
                    <h4 class="font-bold text-gray-900 text-lg mt-8">
                        ${mentor.name}
                    </h4>
                    <p class="text-sm text-gray-500">${mentor.subject}</p>
                    <div class="flex items-center text-sm text-gray-500 mt-2 justify-between">
                        <span class="flex items-center text-sm">
                            <span class="text-yellow-500 mr-1">⭐</span>
                            <span>${mentor.rating} (${mentor.rating * 300
      } avaliações)</span>
                        </span>
                        ${mentor.verified
        ? '<span class="badge-shadcn badge-success-new">VERIFICADO</span>'
        : ""
      }
                    </div>
                    <button class="btn-shadcn btn-primary-shadcn w-full mt-4 h-9 text-sm" data-mentor-id="${mentor.id
      }">Ver Perfil</button>
                </div>
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
                <button class="p-1 rounded-md hover:bg-gray-100 transition-colors text-lg text-gray-600">←</button>
                <span class="text-base font-bold">${monthName}</span>
                <button class="p-1 rounded-md hover:bg-gray-100 transition-colors text-lg text-gray-600">→</button>
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

// Carrega o perfil do mentor (MODIFICADO para o layout MentorLink)
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
                    <div class="flex items-start space-x-6 border-b pb-6">
                        <img src="${mentor.image_url
      }" onerror="this.onerror=null; this.src='https://placehold.co/96x96/E8634E/FFFFFF?text=${initials}';" alt="Avatar de ${mentor.name
      }" class="h-28 w-28 shrink-0 rounded-xl mentor-card-avatar border-4 border-gray-100 object-cover" />
                        <div>
                            <h2 class="text-3xl font-bold text-gray-900">${mentor.name
      } ${mentor.verified
        ? '<span class="badge-shadcn badge-success-new ml-2">VERIFICADO</span>'
        : ""
      }</h2>
                            <p class="text-lg text-primary font-semibold mt-1">${mentor.subject
      } - Especialista</p>
                            <div class="flex items-center text-sm mt-2 text-gray-600">
                                <p class="text-lg font-semibold text-gray-700">⭐ ${mentor.rating
      }/5 (${mentor.rating * 300} avaliações)</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 class="text-2xl font-bold mb-3 text-gray-900">Sobre</h3>
                        <p class="text-muted-foreground text-base leading-relaxed">${mentor.bio
      }</p>
                    </div>

                    <div>
                        <h3 class="text-2xl font-bold mb-4 text-gray-900">Avaliações</h3>
                        <!-- Avaliações Simuladas -->
                        <div class="review-item border-b pb-4 mb-4">
                            <div class="review-avatar">J</div>
                            <div class="review-content">
                                <p class="review-name">João Pedro <span class="review-date">Há 2 semanas</span></p>
                                <p class="review-rating text-yellow-500">★★★★★</p>
                                <p class="review-text">Mentoria excepcional! A Maria tem um conhecimento profundo e sabe explicar conceitos complexos de forma clara.</p>
                            </div>
                        </div>
                        <div class="review-item border-b pb-4 mb-4">
                            <div class="review-avatar">A</div>
                            <div class="review-content">
                                <p class="review-name">Ana Carolina <span class="review-date">Há 1 mês</span></p>
                                <p class="review-rating text-yellow-500">★★★★★</p>
                                <p class="review-text">Melhor investimento que fiz na minha carreira. Recomendo 100%!</p>
                            </div>
                        </div>
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
  const availableTimes = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];

  scheduleButton.textContent = `Agendar Sessão`;
  scheduleButton.disabled = false;

  let initialSelectedTime = "11:00";

  availableTimes.forEach((time) => {
    const slot = document.createElement("button");
    slot.className =
      "btn-shadcn btn-secondary-new h-9 px-4 py-1 text-sm transition-colors duration-200";
    slot.textContent = time;
    slot.dataset.time = time;

    // Seleciona o horário inicial (11:00 na data 2025-11-05) por padrão
    if (
      selectedDateTime.date === "2025-11-05" &&
      time === initialSelectedTime
    ) {
      slot.classList.remove("btn-secondary-new");
      slot.classList.add("bg-primary", "text-white", "hover:bg-primary-dark");
      selectedDateTime.time = initialSelectedTime;
    }

    slot.addEventListener("click", (e) => {
      document.querySelectorAll(".available-times .btn-shadcn").forEach((s) => {
        s.classList.add("btn-secondary-new");
        s.classList.remove(
          "bg-primary",
          "text-white",
          "hover:bg-primary-dark"
        );
      });
      e.target.classList.remove("btn-secondary-new");
      e.target.classList.add(
        "bg-primary",
        "text-white",
        "hover:bg-primary-dark"
      );
      selectedDateTime.time = e.target.dataset.time;
      scheduleButton.disabled = false;
    });
    timeSlotsContainer.appendChild(slot);
  });

  scheduleButton.addEventListener("click", () => {
    if (selectedDateTime.date && selectedDateTime.time) {
      document.getElementById("payment-mentor-name").textContent = mentor.name;
      document.getElementById("payment-time").textContent =
        selectedDateTime.time;
      document.getElementById("payment-date-time").textContent =
        selectedDateTime.date;
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

    let borderClass = "border-primary";
    let actionContent = "";
    let statusTag = "";

    if (isUpcoming) {
      borderClass = "border-primary";
      actionContent = `
                        <button class="btn-shadcn btn-primary-shadcn access-room h-9 px-4 text-sm shrink-0">Acessar Sala</button>
                        <button class="text-sm font-medium text-red-500 hover:text-red-700 transition-colors cancel-session h-9 px-4 shrink-0" data-id="${session.id}">Cancelar</button>
                    `;
      statusTag = `<span class="badge-shadcn bg-primary text-white text-xs">AGENDADA</span>`;
    } else if (isCompleted) {
      borderClass = "border-green-500";
      statusTag = `<span class="badge-shadcn badge-success">CONCLUÍDA</span>`;
      actionContent = `<button class="text-sm font-medium text-primary hover:underline transition-colors">Deixar Avaliação</button>`;
    } else if (isCancelled) {
      borderClass = "border-gray-400";
      statusTag = `<span class="badge-shadcn bg-gray-100 text-gray-600 border border-gray-200">CANCELADA</span>`;
      actionContent = `<span class="text-sm text-muted-foreground">Agendamento Cancelado</span>`;
    }

    const card = document.createElement("div");
    card.className = `card-shadcn p-5 flex flex-col md:flex-row justify-between items-start md:items-center border-l-4 ${borderClass} shadow-md`;
    card.innerHTML = `
                    <div class="flex-1">
                        <h4 class="font-semibold text-lg text-gray-800">Aula com ${session.mentorName
      }</h4>
                        <p class="text-sm text-muted-foreground mt-1">${session.subject
      } | ${session.date} | ${session.time
      } | R$ ${session.price.toFixed(2)}</p>
                    </div>
                    <div class="flex space-x-3 items-center mt-4 md:mt-0">
                        ${statusTag}
                        <div class="flex space-x-3">${actionContent}</div>
                    </div>
                `;
    historyContainer.appendChild(card);
  });

  // O botão "Acessar Sala" agora leva à simulação da página de sessão.
  document.querySelectorAll(".access-room").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      switchPage("page-session");
    });
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
      {
        id: 3,
        mentorName: "Carlos Eduardo",
        subject: "Liderança Tech",
        date: "2025-09-01",
        time: "16:00",
        price: 200.0,
        status: "cancelled",
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

  // O botão 'view-all-mentors-bottom' foi removido do HTML.
  /*
  document
    .getElementById("view-all-mentors-bottom")
    .addEventListener("click", (e) => {
      e.preventDefault();
      fetchMentors("", false, 300);
      switchPage("page-search");
    });
  */
  document
    .getElementById("header-signup-button")
    .addEventListener("click", (e) => {
      e.preventDefault();
      fetchMentors("", false, 300);
      switchPage("page-search");
    });

  // --- Lógica de Busca e Filtro ---
  const priceRangeInput = document.getElementById("price-range-input");
  const priceMaxDisplay = document.getElementById("price-max-display");
  const searchTopicInput = document.getElementById("search-topic-input");
  const searchVerifiedOnly = document.getElementById("search-verified-only");

  priceRangeInput.addEventListener("input", () => {
    priceMaxDisplay.textContent = `R$ ${parseFloat(
      priceRangeInput.value
    ).toFixed(2)}`;
  });

  const applyFilters = () => {
    const subject = searchTopicInput.value;
    const verified = searchVerifiedOnly.checked;
    const maxPrice = priceRangeInput.value;
    fetchMentors(subject, verified, maxPrice);
  };

  document
    .getElementById("apply-filters-button")
    .addEventListener("click", applyFilters);
  document
    .getElementById("apply-filters-button-sidebar")
    .addEventListener("click", applyFilters);

  // A busca da home agora só leva para a página de busca, pois o campo de busca da home foi removido na nova versão (Imagem 1).
  // Mantemos esta lógica comentada ou adaptada se a versão de busca for usada.
  // const homeSearchButton = document.getElementById("home-search-button");
  // if(homeSearchButton) {
  //   homeSearchButton.addEventListener("click", () => {
  //     const subject = document.getElementById("home-search-input").value;
  //     document.getElementById("search-topic-input").value = subject;
  //     fetchMentors(subject, false, 300);
  //     switchPage("page-search");
  //   });
  // }


  // --- Redirecionamento de Card/Botão de Perfil ---
  document.addEventListener("click", (e) => {
    const target = e.target;
    const card = target.closest(".mentorlink-card");
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

  // --- Inicialização da Home (Removido Mentores em Destaque da Home para aderir ao design da imagem 1) ---
  /*
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
  */

  // Limpando o contêiner de featured (apenas para garantir)
  const featuredContainer = document.querySelector(".mentor-list-featured");
  if (featuredContainer) featuredContainer.innerHTML = "";

  switchPage("page-home");
});
