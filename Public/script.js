function carregarItens() {
    fetch('http://localhost:3000/itens')
        .then(response => response.json())
        .then(data => {
            const lista = document.getElementById('lista');
            lista.innerHTML = '';
            data.forEach(item => {
                const li = document.createElement('li');
                li.textContent = `${item.nome} - ${item.quantidade} x R$ ${item.preco}`;
                lista.appendChild(li);
            });
        });

    fetch('http://localhost:3000/media')
        .then(response => response.json())
        .then(data => {
            document.getElementById('media').textContent = data.media.toFixed(2);
        });
}

function adicionarItem() {
    const nome = document.getElementById('nome').value;
    const quantidade = document.getElementById('quantidade').value;
    const preco = document.getElementById('preco').value;

    fetch('http://localhost:3000/itens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, quantidade, preco })
    })
    .then(() => carregarItens());
}

carregarItens();