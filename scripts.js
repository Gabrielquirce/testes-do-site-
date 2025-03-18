document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("formulario");

    form.addEventListener("submit", function (event) {
        let isValid = true;

        // Função para exibir erro abaixo do input
        function setError(input, message) {
            let errorSpan = input.nextElementSibling;
            if (!errorSpan || !errorSpan.classList.contains("error-message")) {
                errorSpan = document.createElement("span");
                errorSpan.className = "error-message";
                errorSpan.style.color = "red";
                errorSpan.style.fontSize = "12px";
                errorSpan.style.display = "block";
                input.parentNode.appendChild(errorSpan);
            }
            errorSpan.textContent = message;
            input.classList.add("input-error");
            isValid = false;
        }

        // Função para remover erro quando o usuário começa a digitar
        function clearError(input) {
            let errorSpan = input.nextElementSibling;
            if (errorSpan && errorSpan.classList.contains("error-message")) {
                errorSpan.textContent = "";
            }
            input.classList.remove("input-error");
        }

        // Campos para validação
        const campos = [
            {
                input: document.getElementById("inputName4"),
                validacao: (valor) => /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(valor.trim()),
                mensagemErro: "O nome não pode conter números ou caracteres especiais."
            },
            {
                input: document.getElementById("inputEmail"),
                validacao: (valor) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim()),
                mensagemErro: "E-mail inválido! Digite um endereço válido, como exemplo@dominio.com."
            },
            {
                input: document.getElementById("inputAge"),
                validacao: (valor) => valor >= 0 && valor <= 120,
                mensagemErro: "Idade inválida! Deve estar entre 0 e 120."
            },
            {
                input: document.getElementById("inputYear"),
                validacao: (valor) => {
                    const anoAtual = new Date().getFullYear();
                    return valor >= 1900 && valor <= anoAtual + 2;
                },
                mensagemErro: `Ano letivo inválido! Deve estar entre 1900 e ${new Date().getFullYear() + 2}.`
            },
            {
                input: document.getElementById("inputFone"),
                validacao: (valor) => /^\(\d{2}\) \d{4,5}-\d{4}$/.test(valor),
                mensagemErro: "Telefone inválido! Deve estar no formato (XX) XXXXX-XXXX ou (XX) XXXX-XXXX."
            },
            {
                input: document.getElementById("inputMatricula"),
                validacao: (valor) => /^\d{6,}$/.test(valor.trim()),
                mensagemErro: "Matrícula inválida! Deve conter pelo menos 6 dígitos numéricos."
            }
        ];

        // Validação dos campos
        campos.forEach(({ input, validacao, mensagemErro }) => {
            const valor = input.value.trim();
            if (!validacao(valor)) {
                setError(input, mensagemErro);
            } else {
                clearError(input);
            }
        });

        if (!isValid) {
            event.preventDefault();
        }
    });

    // Aplicar evento para remover erro ao digitar
    document.querySelectorAll("input").forEach((input) => {
        input.addEventListener("input", () => clearError(input));
    });

    // Máscara para telefone
    const telefone = document.getElementById("inputFone");
    telefone.addEventListener("input", function () {
        let valor = telefone.value.replace(/\D/g, "");
        if (valor.length > 11) valor = valor.slice(0, 11);

        if (valor.length <= 10) {
            telefone.value = valor.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
        } else {
            telefone.value = valor.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
        }
    });
});
// Código JavaScript Integrado
let currentDate = new Date();
let events = JSON.parse(localStorage.getItem('calendarEvents')) || {};

function generateCalendar(month, year) {
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    document.getElementById('current-month').textContent = 
        `${firstDay.toLocaleString('pt-BR', { month: 'long' })} ${year}`.toUpperCase();

    // Dias vazios
    for (let i = 0; i < firstDay.getDay(); i++) {
        calendar.appendChild(createEmptyDay());
    }

    // Dias do mês
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, month, day);
        calendar.appendChild(createCalendarDay(date));
    }

    updateEventList();
}

function createEmptyDay() {
    const emptyDay = document.createElement('div');
    emptyDay.classList.add('calendar-day');
    return emptyDay;
}

function createCalendarDay(date) {
    const dayElement = document.createElement('div');
    dayElement.classList.add('calendar-day', 'current-month', 'editable-date');
    dayElement.innerHTML = `<strong>${date.getDate()}</strong>`;
    dayElement.dataset.date = date.toISOString().split('T')[0];

    // Eventos de edição
    dayElement.ondblclick = (e) => {
        e.stopPropagation();
        showDatePicker(date);
    };

    dayElement.onclick = () => manageEvent(date);

    // Adicionar eventos existentes
    const dateKey = date.toISOString().split('T')[0];
    if (events[dateKey]) {
        events[dateKey].forEach((event, index) => {
            dayElement.appendChild(createEventElement(event, index + 1));
        });
    }

    return dayElement;
}

function createEventElement(event, index) {
    const eventElement = document.createElement('div');
    eventElement.classList.add('event');
    eventElement.textContent = `${index}. ${event}`;
    return eventElement;
}

function showDatePicker(oldDate) {
    const newDateStr = prompt(`Editar data:\nData atual: ${oldDate.toLocaleDateString('pt-BR')}\n\nDigite a nova data (DD/MM/AAAA):`);
    
    if (!newDateStr) return;

    const [day, month, year] = newDateStr.split('/').map(Number);
    const newDate = new Date(year, month - 1, day);
    
    if (isValidDate(newDate)) {
        updateEventDates(oldDate, newDate);
        generateCalendar(currentDate.getMonth(), currentDate.getFullYear());
    } else {
        alert('Data inválida! Use o formato DD/MM/AAAA');
    }
}

function isValidDate(d) {
    return d instanceof Date && !isNaN(d);
}

function updateEventDates(oldDate, newDate) {
    const oldKey = oldDate.toISOString().split('T')[0];
    const newKey = newDate.toISOString().split('T')[0];
    
    if (events[oldKey]) {
        events[newKey] = [...(events[newKey] || []), ...events[oldKey]];
        delete events[oldKey];
        localStorage.setItem('calendarEvents', JSON.stringify(events));
    }
}

function manageEvent(date) {
    const dateKey = date.toISOString().split('T')[0];
    const existingEvents = events[dateKey] || [];
    
    const action = prompt(`Data: ${date.toLocaleDateString('pt-BR')}\nEventos: ${existingEvents.join(', ')}\n\nDigite:\n- Novo evento para adicionar\n- "remover [número]" para excluir`);

    if (!action) return;

    if (action.toLowerCase().startsWith('remover')) {
        const index = parseInt(action.split(' ')[1]) - 1;
        if (!isNaN(index) && index >= 0 && index < existingEvents.length) {
            existingEvents.splice(index, 1);
        }
    } else if (action.trim()) {
        existingEvents.push(action.trim());
    }

    updateEvents(dateKey, existingEvents);
    generateCalendar(currentDate.getMonth(), currentDate.getFullYear());
}

function updateEvents(dateKey, eventsArray) {
    if (eventsArray.length > 0) {
        events[dateKey] = eventsArray;
    } else {
        delete events[dateKey];
    }
    localStorage.setItem('calendarEvents', JSON.stringify(events));
}

function updateEventList() {
    const container = document.getElementById('events-container');
    container.innerHTML = '';
    
    Object.keys(events).forEach(date => {
        const dateObj = new Date(date);
        if (dateObj.getMonth() === currentDate.getMonth()) {
            events[date].forEach((event, index) => {
                const eventItem = document.createElement('div');
                eventItem.classList.add('event-item');
                eventItem.innerHTML = `
                    <span>${dateObj.toLocaleDateString('pt-BR')}: ${event}</span>
                    <div>
                        <button onclick="editEvent('${date}', ${index})">Editar</button>
                        <button onclick="removeEvent('${date}', ${index})">×</button>
                    </div>
                `;
                container.appendChild(eventItem);
            });
        }
    });
}

function editEvent(dateKey, index) {
    const newText = prompt('Editar evento:', events[dateKey][index]);
    if (newText !== null) {
        events[dateKey][index] = newText.trim();
        localStorage.setItem('calendarEvents', JSON.stringify(events));
        generateCalendar(currentDate.getMonth(), currentDate.getFullYear());
    }
}

function removeEvent(dateKey, index) {
    if (events[dateKey]) {
        events[dateKey].splice(index, 1);
        if (events[dateKey].length === 0) {
            delete events[dateKey];
        }
        localStorage.setItem('calendarEvents', JSON.stringify(events));
        generateCalendar(currentDate.getMonth(), currentDate.getFullYear());
    }
}

function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    generateCalendar(currentDate.getMonth(), currentDate.getFullYear());
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    generateCalendar(currentDate.getMonth(), currentDate.getFullYear());
}

// Inicialização
generateCalendar(currentDate.getMonth(), currentDate.getFullYear());