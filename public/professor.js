document.getElementById('tarefaForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = new FormData(this);

    fetch('http://localhost:3000/tarefas', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        alert('Tarefa postada com sucesso!');
        console.log('Tarefa adicionada:', data);
        document.getElementById('tarefaForm').reset();
    })
    .catch(error => {
        console.error('Erro ao postar a tarefa:', error);
        alert('Erro ao postar a tarefa. Tente novamente.');
    });
});