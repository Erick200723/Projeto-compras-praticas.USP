document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const mensagemErro = document.getElementById('mensagemErro');

    console.log('Dados do formulário:', { nome, email, senha }); // Debug inicial

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nome, email, senha })
        });

        console.log('Resposta do servidor:', response); // Debug da resposta

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Erro na resposta:', errorData); // Debug de erro
            mensagemErro.textContent = errorData.error || 'Erro no login';
            mensagemErro.style.display = 'block';
            return;
        }

        const data = await response.json();
        console.log('Login bem-sucedido:', data); // Debug de sucesso
        
        // Armazena o token e redireciona
        localStorage.setItem('token', data.token);
        window.location.href = '/main';

    } catch (error) {
        console.error('Erro no fetch:', error); // Debug de erro de conexão
        mensagemErro.textContent = 'Erro ao conectar com o servidor';
        mensagemErro.style.display = 'block';
    }
});