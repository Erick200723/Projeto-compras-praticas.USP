console.log('script')
document.getElementById('formCadastro').addEventListener('submit', async function (event) {
    event.preventDefault(); // Impede o envio padrão do formulário

    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const confirSenha = document.getElementById('confirSenha').value;

    // Validação básica no frontend
    if (!nome || !email || !senha || !confirSenha) {
        document.getElementById('mensagemErro').innerText = 'Preencha todos os campos.';
        return; // Impede o envio do formulário
    }

    if (senha !== confirSenha) {
        document.getElementById('mensagemErro').innerText = 'As senhas não coincidem.';
        return; // Impede o envio do formulário
    }

    try {
        const response = await fetch('/cadastrar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nome, email, senha, confirSenha }),
        });

        const data = await response.json();

        if (data.success) {
            // Redireciona para outra página em caso de sucesso
            window.location.href = "/tela-de-lista-e-grafico.html";
        } else {
            // Exibe a mensagem de erro na tela
            document.getElementById('mensagemErro').innerText = data.message;
        }
    } catch (error) {
        console.error('Erro ao enviar o formulário:', error);
        document.getElementById('mensagemErro').innerText = 'Erro ao conectar com o servidor.';
    }
});