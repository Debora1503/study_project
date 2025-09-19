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
    if (!events || events.length === 0) {
        addCardBtn.style.display = 'block';
        return;
    } else {
        addCardBtn.style.display = 'none';
    }

    // ordenar por data (mais antiga -> mais recente)
    let sortedEvents = [...events].sort((a, b) => (a.start ? a.start.getTime() : 0) - (b.start ? b.start.getTime() : 0));

    sortedEvents.forEach(ev => {
        let wrapper = document.createElement('div');
        wrapper.className = 'card-wrapper';

        // card principal
        let card = document.createElement('div');
        card.className = 'card';

        let materia = ev.extendedProps.materia || "Nenhuma definida";
        let apontamentos = ev.extendedProps.apontamentos || "";

        card.innerHTML = `
            <h3>${ev.title}</h3> 
            <p>Data: ${ev.start ? ev.start.toLocaleDateString() : ''}</p>
            <p>
                <strong>Matéria:</strong> 
                <span class="materia-text">${materia}</span>
                <button class="edit-materia-btn">✏️</button>
            </p>
        `;

        // bloco de apontamentos (fora do card, inicialmente escondido)
        let apontamentosBlock = document.createElement('div');
        apontamentosBlock.className = "apontamentos-block";
        apontamentosBlock.style.display = "none";
        apontamentosBlock.style.marginTop = "10px";
        apontamentosBlock.style.padding = "10px";
        apontamentosBlock.style.background = "#fff";
        apontamentosBlock.style.border = "1px solid #ccc";
        apontamentosBlock.style.borderRadius = "8px";
        apontamentosBlock.innerHTML = `
            <h4>Apontamentos - ${materia}</h4>
            <textarea class="apontamentos-textarea" rows="3" style="width:90%; max-width:250px padding:6px; resize:vertical;">${apontamentos}</textarea>
        `;

        // evitar que cliques dentro do bloco fechem-no
        apontamentosBlock.addEventListener('click', (e) => e.stopPropagation());

        // editar matéria (inline) — não abre o bloco
        const editBtn = card.querySelector('.edit-materia-btn');
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const materiaSpan = card.querySelector('.materia-text');

            const input = document.createElement('input');
            input.type = 'text';
            input.value = materiaSpan.textContent === 'Nenhuma definida' ? '' : materiaSpan.textContent;
            input.style.width = "70%";

            materiaSpan.replaceWith(input);
            input.focus();

            function saveMateria() {
                const novaMateria = input.value.trim() || "Nenhuma definida";
                ev.setExtendedProp('materia', novaMateria);

                const newSpan = document.createElement('span');
                newSpan.className = 'materia-text';
                newSpan.textContent = novaMateria;
                input.replaceWith(newSpan);

                // atualizar título do bloco (se já criado)
                const h4 = apontamentosBlock.querySelector('h4');
                if (h4) h4.textContent = 'Apontamentos - ' + novaMateria;
            }

            input.addEventListener('blur', saveMateria);
            input.addEventListener('keydown', (evtKey) => {
                if (evtKey.key === 'Enter') {
                    saveMateria();
                    input.blur();
                }
            });
        });

        // toggle: clicar no card mostra/esconde o bloco de apontamentos
        card.addEventListener('click', () => {
            apontamentosBlock.style.display = apontamentosBlock.style.display === 'none' ? 'block' : 'none';
            if (apontamentosBlock.style.display === 'block') {
                // focar textarea ao abrir
                const ta = apontamentosBlock.querySelector('.apontamentos-textarea');
                ta.focus();
                ta.selectionStart = ta.selectionEnd = ta.value.length;
            }
        });

        // guardar apontamentos: só ao sair do textarea (blur) OR ao clicar em Guardar
        const ta = apontamentosBlock.querySelector('.apontamentos-textarea');
        ta.addEventListener('blur', (e) => {
            ev.setExtendedProp('apontamentos', e.target.value);
        });

        // botao Guardar opcional (útil em mobile)
        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Guardar';
        saveBtn.style.marginTop = '8px';
        saveBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            ev.setExtendedProp('apontamentos', ta.value);
            // podes mostrar uma pequena confirmação:
            // alert('Apontamentos guardados');
        });
        apontamentosBlock.appendChild(saveBtn);

        // montar DOM
        wrapper.appendChild(card);
        wrapper.appendChild(apontamentosBlock);
        cardsContainer.appendChild(wrapper);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const cardsContainer = document.getElementById('cards-container');
    const addCardBtn = document.getElementById('add-card-btn');
    var calendarEl = document.getElementById('calendar');

    //inicia o calendario 
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

    startCountdown(calendar);

});
    
        

function startCountdown(calendar) {
    const countdownElement = document.getElementById("countdown");
    const container = document.getElementById("countdown-container");

    function updateCountdown() {
        let events = calendar.getEvents();
        let now = new Date();

        // Encontrar o primeiro evento futuro
        let nextEvent = events
            .filter(ev => ev.start > now)
            .sort((a, b) => a.start - b.start)[0];

        if (!nextEvent) {
            // Se não houver eventos, mostra apenas o relógio
            let horas = String(now.getHours()).padStart(2, "0");
            let minutos = String(now.getMinutes()).padStart(2, "0");
            let segundos = String(now.getSeconds()).padStart(2, "0");
            countdownElement.textContent = `${horas}:${minutos}:${segundos}`;
            return;
        }

        let diff = nextEvent.start - now;

        if (diff <= 0) {
            countdownElement.textContent = "Evento a decorrer!";
            return;
        }

        let dias = Math.floor(diff / (1000 * 60 * 60 * 24));
        let horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        let minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        let segundos = Math.floor((diff % (1000 * 60)) / 1000);

        if (dias > 0) {
            countdownElement.textContent =
                `${dias}d ${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`;
        } else {
            countdownElement.textContent =
                `${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`;
        }
    }

    // Atualizar a cada segundo
    setInterval(updateCountdown, 1000);
    updateCountdown();
}


document.addEventListener("DOMContentLoaded", function () {
    const cardsContainer = document.getElementById('cards-container');
    const addCardBtn = document.getElementById('add-card-btn');
    var calendarEl = document.getElementById('calendar');

    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        locale: 'pt',
        headerToolbar: {
            left:'prev,next today',
            center:'title',
            right:'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: [],
        dateClick: function(info){
            let title = prompt("Digite o nome da disciplina:");
            if(title){
                calendar.addEvent({
                    title: title,
                    start: info.dateStr,
                    allDay: true,
                    color: '#dc70d8',
                });
            }
        },
        eventClick: function(info){
            let newTitle = prompt("Editar Matéria:", info.event.title);
            if (newTitle){
                info.event.setProp('title', newTitle);
            }
        },
        eventDidMount: function(info){
            info.el.addEventListener('contextmenu', function(e){
                e.preventDefault();
                if (confirm("Deseja apagar esta materia?")){
                    info.event.remove();
                }
            });
        },
        eventAdd: function(){
            renderCards(calendar.getEvents());
        },
        eventRemove: function(){
            renderCards(calendar.getEvents());
        },
        eventChange: function(){
            renderCards(calendar.getEvents());
        }
    });

    calendar.render();
    renderCards(calendar.getEvents());

    addCardBtn.addEventListener('click', function(){
        let title = prompt("Título do evento:");
        if (title){
            let today = new Date().toISOString().split('T')[0];
            calendar.addEvent({
                title: title,
                start: today,
                allDay: true
            });
        }
    });

    // Iniciar countdown
    startCountdown(calendar);
});
