// ========== CÓDIGO ORIGINAL DO CALENDÁRIO ==========
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

// ========== MELHORIAS NO SISTEMA DE MATRÍCULAS ==========
let matriculas = JSON.parse(localStorage.getItem('matriculas')) || [];
let currentPage = 1;
const itemsPerPage = 5;

// Função melhorada para renderizar a tabela com paginação
function renderizarMatriculas(filtro = 'all', pesquisa = '') {
    const tbody = document.getElementById('tabela-matriculas-body');
    tbody.innerHTML = '';

    const dadosFiltrados = matriculas.filter(matricula => {
        const matchStatus = filtro === 'all' || matricula.status === filtro;
        const matchPesquisa = matricula.nome.toLowerCase().includes(pesquisa.toLowerCase()) || 
                             matricula.ra.includes(pesquisa);
        return matchStatus && matchPesquisa;
    });

    // Paginação
    const totalPages = Math.ceil(dadosFiltrados.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const dadosPagina = dadosFiltrados.slice(start, end);

    // Renderizar itens
    dadosPagina.forEach(matricula => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${matricula.ra}</td>
            <td>${matricula.nome}</td>
            <td>${matricula.curso}</td>
            <td>${new Date(matricula.data).toLocaleDateString('pt-BR')}</td>
            <td>
                <span class="status-badge status-${matricula.status}">
                    ${matricula.status.charAt(0).toUpperCase() + matricula.status.slice(1)}
                </span>
            </td>
            <td>
                <button class="btn-acao btn-visualizar" onclick="visualizarMatricula('${matricula.ra}')">
                    👁️ Detalhes
                </button>
                <button class="btn-acao btn-editar" onclick="editarMatricula('${matricula.ra}')">
                    ✏️ Editar
                </button>
                <button class="btn-acao btn-excluir" onclick="excluirMatricula('${matricula.ra}')">
                    × Excluir
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Renderizar paginação
    renderizarPaginacao(totalPages);
}

// Função de paginação
function renderizarPaginacao(totalPages) {
    const paginacao = document.getElementById('paginacao');
    if (!paginacao) return;

    paginacao.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = `pagina-btn ${i === currentPage ? 'active' : ''}`;
        btn.textContent = i;
        btn.onclick = () => {
            currentPage = i;
            renderizarMatriculas(
                document.getElementById('status-filter').value,
                document.getElementById('search-input').value
            );
        };
        paginacao.appendChild(btn);
    }
}

// Modal e formulário aprimorado
let matriculaEditando = null;

function abrirFormularioMatricula(ra = null) {
    matriculaEditando = ra ? matriculas.find(m => m.ra === ra) : null;
    
    if (matriculaEditando) {
        // Preencher formulário para edição
        document.getElementById('ra').value = matriculaEditando.ra;
        document.getElementById('nome').value = matriculaEditando.nome;
        document.getElementById('curso').value = matriculaEditando.curso;
        document.getElementById('data').value = matriculaEditando.data.split('T')[0];
        document.getElementById('status').value = matriculaEditando.status;
        document.getElementById('observacoes').value = matriculaEditando.observacoes || '';
        
        // Exibir anexos
        const anexosContainer = document.getElementById('arquivos-anexos');
        anexosContainer.innerHTML = '';
        if (matriculaEditando.anexos) {
            matriculaEditando.anexos.forEach((anexo, index) => {
                const div = document.createElement('div');
                div.className = 'arquivo-item';
                div.innerHTML = `
                    ${anexo.nome}
                    <button onclick="removerAnexo(${index})">×</button>
                `;
                anexosContainer.appendChild(div);
            });
        }
    } else {
        // Limpar formulário para nova matrícula
        document.getElementById('form-matricula').reset();
        document.getElementById('arquivos-anexos').innerHTML = '';
    }
    
    document.getElementById('modal-matricula').style.display = 'block';
}

function fecharModal() {
    document.getElementById('modal-matricula').style.display = 'none';
    matriculaEditando = null;
}

// Função para salvar matrícula (criar/editar)
function salvarMatricula(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const novaMatricula = {
        ra: formData.get('ra'),
        nome: formData.get('nome'),
        curso: formData.get('curso'),
        data: formData.get('data'),
        status: formData.get('status'),
        observacoes: formData.get('observacoes'),
        anexos: []
    };

    // Validação de RA único
    if (!matriculaEditando && matriculas.some(m => m.ra === novaMatricula.ra)) {
        alert('RA já cadastrado!');
        return;
    }

    // Processar arquivos
    const fileInput = document.getElementById('documentos');
    for (let i = 0; i < fileInput.files.length; i++) {
        const file = fileInput.files[i];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            novaMatricula.anexos.push({
                nome: file.name,
                tipo: file.type,
                dados: e.target.result.split(',')[1]
            });
        };
        reader.readAsDataURL(file);
    }

    // Atualizar ou adicionar matrícula
    if (matriculaEditando) {
        Object.assign(matriculaEditando, novaMatricula);
    } else {
        matriculas.push(novaMatricula);
    }

    localStorage.setItem('matriculas', JSON.stringify(matriculas));
    renderizarMatriculas();
    fecharModal();
}

// Função para exportar dados
function exportarParaCSV() {
    const csvContent = [
        ['RA', 'Nome', 'Curso', 'Data', 'Status'].join(','),
        ...matriculas.map(m => [
            m.ra,
            `"${m.nome}"`,
            `"${m.curso}"`,
            m.data,
            m.status
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'matriculas.csv';
    a.click();
}

// Função para exportar PDF (requer biblioteca jsPDF)
function exportarParaPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.text('Relatório de Matrículas', 10, 10);
    let y = 20;
    
    matriculas.forEach((matricula, index) => {
        doc.text(`${index + 1}. ${matricula.nome} (RA: ${matricula.ra})`, 10, y);
        y += 10;
        if (y > 280) {
            doc.addPage();
            y = 10;
        }
    });
    
    doc.save('matriculas.pdf');
}

// Atualizar controles da tabela
document.querySelector('.controles-matriculas').innerHTML += `
    <div class="export-buttons">
        <button class="btn" onclick="exportarParaCSV()">Exportar CSV</button>
        <button class="btn" onclick="exportarParaPDF()">Exportar PDF</button>
    </div>
`;

// Adicionar paginação ao HTML
document.querySelector('.tabela-container').insertAdjacentHTML('afterend', `
    <div id="paginacao" class="paginacao"></div>
`);

// Inicializar biblioteca PDF (adicionar no head)
document.head.insertAdjacentHTML('beforeend', `
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
`);