document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    // 1. Obter valores do formulário
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;
    const mensagemErro = document.getElementById('mensagemErro');
    
    // Limpar mensagens de erro anteriores
    mensagemErro.textContent = '';
    mensagemErro.style.display = 'none';

    // 2. Validação básica do cliente
    if (!email || !senha) {
        mensagemErro.textContent = 'Por favor, preencha todos os campos';
        mensagemErro.style.display = 'block';
        return;
    }

    try {
        // 3. Enviar requisição de login
        const response = await fetch('/api/auth/login', {  // Note o endpoint corrigido
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                email,  // Normalmente só precisamos de email e senha para login
                senha 
            })
        });

        // 4. Processar resposta
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Erro no login');
        }

        // 5. Armazenar token e dados do usuário
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // 6. Redirecionar
        window.location.href = '/main';

    } catch (error) {
        // 7. Tratamento de erros
        console.error('Erro no login:', error);
        
        mensagemErro.textContent = error.message || 'Erro ao conectar com o servidor';
        mensagemErro.style.display = 'block';
        
        // Opcional: Limpar campos em caso de erro
        document.getElementById('senha').value = '';
    }
});