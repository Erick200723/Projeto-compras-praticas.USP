import pickle
import os
from datetime import datetime

class Banco:
    def __init__(self, nome):
        self.__nome = nome
        self.__clientes = []
        self.__transacoes = []
    
    def adicionar_cliente(self, cliente):
        self.__clientes.append(cliente)
    
    def adicionar_transacao(self, transacao):
        self.__transacoes.append(transacao)
    
    def get_clientes(self):
        return self.__clientes
    
    def get_transacoes(self):
        return self.__transacoes

    def salvar_dados(self, arquivo="banco.pkl"):
        with open(arquivo, "wb") as f:
            pickle.dump(self.__dict__, f)  # Salvar apenas os atributos da instância

    @staticmethod
    def carregar_dados(arquivo="banco.pkl"):
        if not os.path.exists(arquivo) or os.path.getsize(arquivo) == 0:
            return Banco("Banco Exemplo")
        
        with open(arquivo, "rb") as f:
            dados = pickle.load(f)
            banco = Banco(dados.get('_Banco__nome', "Banco Exemplo"))
            banco.__clientes = dados.get('_Banco__clientes', [])
            banco.__transacoes = dados.get('_Banco__transacoes', [])
            return banco

class Transacao:
    def __init__(self, id_transacao, tipo, valor, pagador_id, beneficiario_id):
        self.__id_transacao = id_transacao
        self.__tipo = tipo
        self.__valor = valor
        self.__pagador_id = pagador_id
        self.__beneficiario_id = beneficiario_id
        self.__data = datetime.now()
    
    def get_info(self):
        return {
            "id": self.__id_transacao,
            "tipo": self.__tipo,
            "valor": self.__valor,
            "pagador": self.__pagador_id,
            "beneficiario": self.__beneficiario_id,
            "data": self.__data.strftime("%d/%m/%Y %H:%M:%S")
        }

class Emprestimo:
    def __init__(self, id_emprestimo, valor, parcelas):
        self.__id_emprestimo = id_emprestimo
        self.__valor = valor
        self.__parcelas = parcelas
        self.__valor_pago = 0
        self.__taxa_juros = 0.05  # 5% ao mês
        self.__valor_restante = valor * ((1 + self.__taxa_juros) ** parcelas)
        self.__data = datetime.now()
    
    def pagar_mes(self):
        if self.__parcelas > 0:
            parcela = self.get_valor_parcela()
            self.__valor_pago += parcela
            self.__valor_restante -= parcela
            self.__parcelas -= 1

    def amortizar_parcela(self, valor):
        self.__valor_pago += valor
        self.__valor_restante -= valor

    def get_valor_parcela(self):
        if self.__parcelas > 0:
            return self.__valor_restante / self.__parcelas
        return 0
    
    def get_info(self):
        return {
            "id": self.__id_emprestimo,
            "valor": self.__valor,
            "parcelas": self.__parcelas,
            "pago": self.__valor_pago,
            "restante": self.__valor_restante,
            "data": self.__data.strftime("%d/%m/%Y")
        }

class Correntista:
    def __init__(self, id_cliente, nome, saldo=0):
        self.__id_cliente = id_cliente
        self.__nome = nome
        self.__saldo = saldo
        self.__extrato = []
    
    def fazer_transferencia(self, valor, destinatario):
        if self.__saldo >= valor:
            self.__saldo -= valor
            destinatario.receber_transferencia(valor)
            self.__extrato.append(f"Transferência de R${valor:.2f} para {destinatario.get_nome()}")
        else:
            print("Saldo insuficiente!")

    def fazer_emprestimo(self, banco, valor, parcelas):
        emprestimo = Emprestimo(len(banco.get_transacoes()) + 1, valor, parcelas)
        banco.adicionar_transacao(emprestimo)
        self.__saldo += valor
    
    def pagar_fatura(self, valor):
        if self.__saldo >= valor:
            self.__saldo -= valor
            self.__extrato.append(f"Pagamento de fatura: R${valor:.2f}")
        else:
            print("Saldo insuficiente!")

    def receber_transferencia(self, valor):
        self.__saldo += valor
    
    def get_nome(self):
        return self.__nome
    
    def get_saldo(self):
        return self.__saldo
    
    def get_extrato(self):
        return self.__extrato

class Investidor(Correntista):
    def __init__(self, id_cliente, nome, saldo=0):
        super().__init__(id_cliente, nome, saldo)
        self.__investimentos = []
    
    def fazer_investimento(self, valor):
        if self.get_saldo() >= valor:
            self.__investimentos.append(valor)
            self.pagar_fatura(valor)
        else:
            print("Saldo insuficiente!")

    def get_investimentos(self):
        return self.__investimentos

# Exemplo de uso
banco = Banco.carregar_dados()
c1 = Correntista(1, "Carlos", 1000)
c2 = Investidor(2, "Mariana", 5000)
banco.adicionar_cliente(c1)
banco.adicionar_cliente(c2)

# Testando transferências e investimentos
c1.fazer_transferencia(200, c2)
c2.fazer_investimento(1000)

# Salvando estado atualizado
banco.salvar_dados()
