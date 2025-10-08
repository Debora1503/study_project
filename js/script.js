// ==== Geral ==== //

document.addEventListener('DOMContentLoaded', () => {
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});

const hero = document.querySelector('.hero');
if (hero) {
    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth) * 100;
        const y = (e.clientY / window.innerHeight) * 100;
        hero.style.backgroundPosition = `${x}% ${y}%`;
    });
}

// ==== Eventos para os csrds ==== //

/**
 * Configura um único event listener no container dos cards.
 * Este listener gere os cliques em todos os cards filhos.
 */

// ==== Função Auxiliar para Gerir o Foco ====
function exitFocusMode() {
    const cardsContainer = document.getElementById('cards-container');
    if (cardsContainer) {
        cardsContainer.classList.remove('focus-mode');
        cardsContainer.querySelectorAll('.card.expanded').forEach(card => {
            card.classList.remove('expanded');
        });
    }
}


function setupCardListeners() {
    const cardsContainer = document.getElementById('cards-container');
    if (!cardsContainer) return;

    cardsContainer.addEventListener('click', function(event) {
        if (event.target.closest('.edit-materia-btn, .save-btn, .apontamentos-textarea')) {
            return;
        }

        const clickedCard = event.target.closest('.card');
        if (clickedCard) {
            const isOpening = !clickedCard.classList.contains('expanded');
            exitFocusMode();

            if (isOpening) {
                clickedCard.classList.add('expanded');
                cardsContainer.classList.add('focus-mode');
            }
        } else {
            exitFocusMode();
        }
    });
}


// ==== Cards materia ==== //
// ==== Cards materia (com lógica de "Guardar" corrigida) ==== //

function renderCards(events) {
    const cardsContainer = document.getElementById('cards-container');
    const addCardBtn = document.getElementById('add-card-btn');

    cardsContainer.innerHTML = '';

    if (!events || events.length === 0) {
        if (addCardBtn) addCardBtn.style.display = 'block';
        return;
    } else {
        if (addCardBtn) addCardBtn.style.display = 'none';
    }

    let sortedEvents = [...events].sort((a, b) => (a.start ? a.start.getTime() : 0) - (b.start ? b.start.getTime() : 0));

    sortedEvents.forEach(ev => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.eventId = ev.id || ev.start.getTime();

        const materia = ev.extendedProps.materia || "Nenhuma definida";
        const apontamentos = ev.extendedProps.apontamentos || "";

        card.innerHTML = `
            <div class="card-header">
                <h3>${ev.title}</h3>
                <span class="arrow-icon">▼</span>
            </div>
            <div class="card-details">
                <p><strong>Data:</strong> ${ev.start ? ev.start.toLocaleDateString('pt-PT') : ''}</p>
                <div class="materia-container">
                    <strong>Matéria:</strong> 
                    <span class="materia-text">${materia}</span>
                    <button class="edit-materia-btn">✏️</button>
                </div>
            </div>
            <div class="apontamentos-block">
                <h4>Apontamentos</h4>
                <textarea class="apontamentos-textarea" rows="4">${apontamentos}</textarea>
                <button class="save-btn">Guardar</button>
            </div>
        `;

        const editBtn = card.querySelector('.edit-materia-btn');
        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (!card.classList.contains('expanded')) {
                    card.classList.add('expanded');
                }
                const materiaSpan = card.querySelector('.materia-text');
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'editable-input';
                input.value = materiaSpan.textContent === 'Nenhuma definida' ? '' : materiaSpan.textContent;
                materiaSpan.replaceWith(input);
                input.focus();

                function saveMateria() {
                    const novaMateria = input.value.trim() || "Nenhuma definida";
                    ev.setExtendedProp('materia', novaMateria);
                    const newSpan = document.createElement('span');
                    newSpan.className = 'materia-text';
                    newSpan.textContent = novaMateria;
                    input.replaceWith(newSpan);
                }
                input.addEventListener('blur', saveMateria);
                input.addEventListener('keydown', (evtKey) => {
                    if (evtKey.key === 'Enter') input.blur();
                    else if (evtKey.key === 'Escape') {
                        const originalSpan = document.createElement('span');
                        originalSpan.className = 'materia-text';
                        originalSpan.textContent = materia;
                        input.replaceWith(originalSpan);
                    }
                });
            });
        }

        const textarea = card.querySelector('.apontamentos-textarea');
        const saveBtn = card.querySelector('.save-btn');

        function saveNotes() {
            ev.setExtendedProp('apontamentos', textarea.value);
            saveBtn.textContent = 'Guardado!';
            setTimeout(() => { saveBtn.textContent = 'Guardar'; }, 1500);
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                saveNotes();
                exitFocusMode();
            });
        }


        cardsContainer.appendChild(card);
    });
}



// ==== Calendario ==== //

document.addEventListener('DOMContentLoaded', function() {
    setupCardListeners();

    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'pt',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: [],
        dateClick: function(info) {
            const title = prompt("Digite o nome da disciplina:");
            if (title) {
                calendar.addEvent({
                    title: title,
                    start: info.dateStr,
                    allDay: true,
                });
            }
        },
        eventClick: function(info) {
            const newTitle = prompt("Editar Matéria:", info.event.title);
            if (newTitle) {
                info.event.setProp('title', newTitle);
            }
        },
        eventDidMount: function(info) {
            info.el.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                if (confirm("Deseja apagar esta matéria?")) {
                    info.event.remove();
                }
            });
        },
        eventAdd: () => renderCards(calendar.getEvents()),
        eventRemove: () => renderCards(calendar.getEvents()),
        eventChange: () => renderCards(calendar.getEvents()),
    });

    const addCardBtn = document.getElementById('add-card-btn');
    if (addCardBtn) {
        addCardBtn.addEventListener('click', function() {
            const title = prompt("Título do novo card:");
            if (title) {
                calendar.addEvent({
                    title: title,
                    start: new Date(),
                    allDay: true
                });
            }
        });
    }

    calendar.render();
    renderCards(calendar.getEvents());
    startClockOrCountdown(calendar);
    startStudyTips();
});


// ==== Relogio +  Contador ==== //
let showingCountdown = false;
let selectedEventId = null;

function flipNumber(id, newNumber) {
    const card = document.getElementById(id);
    if (!card || card.dataset.number === newNumber) return;

    card.classList.add('flip');
    setTimeout(() => {
        card.textContent = newNumber;
        card.dataset.number = newNumber;
        card.classList.remove('flip');
    }, 350);
}

function updateClock() {
    const daysWrapper = document.getElementById('days-wrapper');
    const daysSeparator = document.getElementById('days-separator');
    if (daysWrapper) daysWrapper.style.display = 'none';
    if (daysSeparator) daysSeparator.style.display = 'none';

    const now = new Date();
    flipNumber('hour', String(now.getHours()).padStart(2, '0'));
    flipNumber('minute', String(now.getMinutes()).padStart(2, '0'));
    flipNumber('second', String(now.getSeconds()).padStart(2, '0'));
}

function updateCountdown(nextEvent) {
    const diff = nextEvent.start - new Date();
    if (diff <= 0) {
        updateClock();
        return;
    }

    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutos = Math.floor((diff / (1000 * 60)) % 60);
    const segundos = Math.floor((diff / 1000) % 60);

    const daysWrapper = document.getElementById('days-wrapper');
    const daysSeparator = document.getElementById('days-separator');

    if (dias > 0) {
        if (daysWrapper) daysWrapper.style.display = 'inline-block';
        if (daysSeparator) daysSeparator.style.display = 'inline-block';
        flipNumber('day', String(dias).padStart(2, '0'));
    } else {
        if (daysWrapper) daysWrapper.style.display = 'none';
        if (daysSeparator) daysSeparator.style.display = 'none';
    }

    flipNumber('hour', String(horas).padStart(2, '0'));
    flipNumber('minute', String(minutos).padStart(2, '0'));
    flipNumber('second', String(segundos).padStart(2, '0'));
}

function startClockOrCountdown(calendar) {
    const toggleBtn = document.getElementById('toggle-countdown');
    const eventSelect = document.getElementById('event-select');
    const eventInfo = document.getElementById('event-info');

    function updateEventOptions() {
        const futureEvents = calendar.getEvents().filter(ev => ev.start > new Date());
        const savedSelection = eventSelect.value;
        eventSelect.innerHTML = '';

        if (futureEvents.length === 0) {
            toggleBtn.style.display = "none";
            eventSelect.style.display = "none";
            if (eventInfo) eventInfo.textContent = "";
            showingCountdown = false;
            toggleBtn.textContent = "Ver contagem";
            update();
            return;
        }

        futureEvents.sort((a, b) => a.start - b.start);
        futureEvents.forEach(ev => {
            const opt = document.createElement('option');
            opt.value = ev.id || ev.start.getTime();
            opt.textContent = `${ev.title} (${ev.start.toLocaleDateString('pt-PT')})`;
            eventSelect.appendChild(opt);
        });

        if (futureEvents.some(ev => (ev.id || ev.start.getTime()) == savedSelection)) {
            eventSelect.value = savedSelection;
        }

        selectedEventId = eventSelect.value;
        update();
    }

    function update() {
        const currentSelectedEvent = calendar.getEvents().find(ev => (ev.id || ev.start.getTime()) == selectedEventId);

        if (!currentSelectedEvent || !showingCountdown) {
            if (eventInfo) eventInfo.textContent = "";
            updateClock();
        } else {
            const eventDate = currentSelectedEvent.start.toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' });
            if (eventInfo) eventInfo.textContent = `Contagem para: ${currentSelectedEvent.title} (${eventDate})`;
            updateCountdown(currentSelectedEvent);
        }

        const hasFutureEvents = calendar.getEvents().some(ev => ev.start > new Date());
        if (toggleBtn) toggleBtn.style.display = hasFutureEvents ? "inline-block" : "none";
        if (eventSelect) eventSelect.style.display = hasFutureEvents ? "inline-block" : "none";
    }

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            showingCountdown = !showingCountdown;
            toggleBtn.textContent = showingCountdown ? "Ver relógio" : "Ver contagem";
            update();
        });
    }

    if (eventSelect) {
        eventSelect.addEventListener('change', (e) => {
            selectedEventId = e.target.value;
            update();
        });
    }

    calendar.on('eventAdd', updateEventOptions);
    calendar.on('eventRemove', updateEventOptions);
    calendar.on('eventChange', updateEventOptions);

    updateEventOptions();
    setInterval(update, 1000);
}


// ==== Dicas ==== //
function startStudyTips() {
    const tips = [
        "Faça pausas de 5 a 10 minutos a cada 50 minutos de estudo (Técnica Pomodoro).",
        "Ensine o que aprendeu a outra pessoa para fixar melhor o conteúdo.",
        "Crie mapas mentais para organizar as ideias de forma visual.",
        "Alterne entre matérias difíceis e fáceis para manter o cérebro estimulado.",
        "Durma bem! Uma boa noite de sono é crucial para a consolidação da memória.",
        "Beba água. Manter-se hidratado melhora a concentração.",
        "Evite estudar na cama. Associe a sua secretária ao local de foco.",
        "Releia as suas anotações no final do dia."
    ];

    const tipElement = document.getElementById('study-tip-text');
    if (!tipElement) return;
    let currentTipIndex = 0;

    function showNextTip() {
        currentTipIndex = (currentTipIndex + 1) % tips.length;
        tipElement.classList.add('fade-out');
        setTimeout(() => {
            tipElement.textContent = tips[currentTipIndex];
            tipElement.classList.remove('fade-out');
        }, 500);
    }

    tipElement.textContent = tips[0];
    setInterval(showNextTip, 10000);
}