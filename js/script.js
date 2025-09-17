//pagina principal
document.getElementById('year').textContent = new Date().getFullYear();
const hero = document.querySelector('.hero');
document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    hero.style.backgroundPosition = `${x}% ${y}%`;
});

//cards + calendario
document.addEventListener('DOMContentLoaded', function() {
    const cardsContainer = document.getElementById('cards-container');
    const addCardBtn = document.getElementById('add-card-btn');
    
    function renderCards(events) {
        cardsContainer.innerHTML = '';
        if (events.length === 0) {
            addCardBtn.style.display = 'block';
        } else {
            addCardBtn.style.display = 'none';

            // ordenar por data (mais recente → mais antigo)
            let sortedEvents = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());

            sortedEvents.forEach(event => {
                let card = document.createElement('div');
                card.className = 'card';

                let materia = event.extendedProps.materia || "Nenhuma definida";
                let apontamentos = event.extendedProps.apontamentos || "";

                card.innerHTML = `
                    <h3>${event.title}</h3> 
                    <p>Data: ${event.start.toLocaleDateString()}</p>
                    <p>
                        <strong>Matéria:</strong> 
                        <span class="materia-text">${materia}</span>
                        <button class="edit-materia-btn">✏️</button>
                    </p>
                    <label style="display:block; margin-top:10px; font-weight:bold;">
                        Apontamentos:
                    </label>
                    <textarea class="apontamentos-textarea" rows="4" style="width:100%; padding:5px;">${apontamentos}</textarea>
                `;

                // editar materia (incline input)
                card.querySelector('.edit-materia-btn').addEventListener('click', () => {
                    let materiaSpan = card.querySelector('.materia-text');

                    let input = document.createElement('input');
                    input.type = 'text';
                    input.value = materiaSpan.textContent;
                    input.style.width = "70%";

                    materiaSpan.replaceWith(input);
                    input.focus();

                    function saveMateria() {
                        let novaMateria = input.value.trim() || "Nenhuma definida";
                        event.setExtendedProp('materia', novaMateria);

                        let newSpan = document.createElement('span');
                        newSpan.className = 'materia-text';
                        newSpan.textContent = novaMateria;

                        input.replaceWith(newSpan);
                    }

                    input.addEventListener('blur', saveMateria);
                    input.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter') {
                            saveMateria();
                        }
                    });
                        //guardar apontamentos automaticamente ao escrever
                    let textarea = card.querySelector('.apontamentos-textarea');
                    textarea.addEventListener('input', () => {
                        event.setExtendedProp('apontamentos', textarea.value);
                    });
                    cardsContainer.appendChild(card);
                });


            });
        }
    }

    
    // inicializa o calendário
    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'pt',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: [],
        dateClick: function(info) {
            let title = prompt("Digite o nome da disciplina:");
            if (title) {
                calendar.addEvent({
                    title: title,
                    start: info.dateStr,
                    allDay: true,
                    color: '#dc70d8',
                });
            }
        },
        eventClick: function(info) {
            // clique esquerdo → editar
            let newTitle = prompt("Editar Matéria:", info.event.title);
            if (newTitle) {
                info.event.setProp('title', newTitle);
            }
        },
        eventDidMount: function(info) {
            // clique direito → apagar
            info.el.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                if (confirm("Deseja apagar esta matéria?")) {
                    info.event.remove();
                }
            });
        },
        eventAdd: function() {
            renderCards(calendar.getEvents());
        },
        eventRemove: function() {
            renderCards(calendar.getEvents());
        },
        eventChange: function() {
            renderCards(calendar.getEvents());
        }
    });

    calendar.render();
    renderCards(calendar.getEvents()); // inicializa os cards

    // botão cria evento e o card
    addCardBtn.addEventListener('click', function() {
        let title = prompt("Título do evento:");
        if (title) {
            let today = new Date().toISOString().split('T')[0];
            calendar.addEvent({
                title: title,
                start: today,
                allDay: true
            });
        }
    });
});