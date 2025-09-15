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
            events.forEach(event => {
                let card = document.createElement('div');
                card.className = 'card';
                card.innerHTML = `
                    <h3>${event.title}</h3> 
                    <p>Data: ${event.start.toLocaleDateString()}</p>
                    <button onclick="alert('Ação para ${event.title}')">Ação</button>
                `;
                cardsContainer.appendChild(card);
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

    // botão cria evento e card
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