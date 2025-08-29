document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('tarefas-container');
    const modal = document.getElementById('image-modal');
    const modalImage = document.getElementById('modal-image');
    const closeBtn = document.querySelector('.image-modal-close');

    function fetchTarefas() {
        fetch('http://localhost:3000/tarefas')
            .then(response => response.json())
            .then(tarefas => {
                container.innerHTML = '';
                if (tarefas.length === 0) {
                    container.innerHTML = '<p>Nenhuma tarefa disponível no momento.</p>';
                } else {
                    tarefas.forEach(tarefa => {
                        const tarefaDiv = document.createElement('div');
                        tarefaDiv.className = 'tarefa';
                        
                        const imagemHTML = tarefa.imagem ? `<img src="${tarefa.imagem}" alt="Imagem da Tarefa" class="tarefa-img">` : '';

                        tarefaDiv.innerHTML = `
                            <h2>${tarefa.titulo}</h2>
                            <p><strong>Matéria:</strong> ${tarefa.materia}</p>
                            <p><strong>Professor:</strong> ${tarefa.professor}</p>
                            <p><strong>Prazo:</strong> ${new Date(tarefa.data_entrega).toLocaleDateString()}</p>
                            <p><strong>Descrição:</strong> ${tarefa.descricao || 'Nenhuma descrição'}</p>
                            ${imagemHTML}
                            <button class="remover-btn" data-id="${tarefa.id}">Remover Tarefa</button>
                        `;
                        container.appendChild(tarefaDiv);
                    });

                    document.querySelectorAll('.remover-btn').forEach(button => {
                        button.addEventListener('click', function() {
                            const tarefaId = this.getAttribute('data-id');
                            removerTarefa(tarefaId);
                        });
                    });

                    // Adicionar evento de clique nas imagens para abrir o modal
                    document.querySelectorAll('.tarefa-img').forEach(img => {
                        img.addEventListener('click', function() {
                            modal.style.display = 'flex';
                            modalImage.src = this.src;
                        });
                    });
                }
            })
            .catch(error => {
                console.error('Erro ao buscar tarefas:', error);
                container.innerHTML = '<p>Erro ao carregar as tarefas.</p>';
            });
    }

    function removerTarefa(id) {
        if (confirm('Tem certeza que deseja remover esta tarefa?')) {
            fetch(`http://localhost:3000/tarefas/${id}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (response.ok) {
                    alert('Tarefa removida com sucesso!');
                    fetchTarefas();
                } else {
                    alert('Erro ao remover a tarefa. Tente novamente.');
                }
            })
            .catch(error => {
                console.error('Erro ao remover a tarefa:', error);
                alert('Erro na conexão com o servidor.');
            });
        }
    }

    // Fecha o modal ao clicar no botão de fechar
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // Fecha o modal ao clicar fora da imagem
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Fecha o modal ao apertar a tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            modal.style.display = 'none';
        }
    });

    fetchTarefas();
});