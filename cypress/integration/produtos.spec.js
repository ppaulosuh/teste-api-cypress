/// <reference types="cypress" />
import contrato from '../Contratos/produtos.contract'

describe('Teste da Funcionalidade Produtos', () => {
    let token
    before(() => {
        cy.token('fulano@qa.com', 'teste').then(tkn => { token = tkn })
    });

    it('Deve validar contrato de produtos', () => {
        cy.request('produtos').then(response => {
            return contrato.validateAsync(response.body)
        })
    });

    it('listar produtos', () => {
        cy.request({
            method: 'GET',
            url: 'Produtos',
        }).then((response) => {
            expect(response.status).to.equal(200)
            expect(response.body).to.have.property('produtos')
            expect(response.duration).to.be.lessThan(20)
        })

    });

    it('Cadastrar Produto', () => {
        let produto = `Produto EBAC ${Math.floor(Math.random() * 100000)}`
        cy.request({
            method: 'POST',
            url: 'produtos',
            body: {
                "nome": produto,
                "preco": 200,
                "descricao": "Produto Novo",
                "quantidade": 100
            },
            headers: { authorization: token }
        }).then((response) => {
            expect(response.status).to.equal(201)
            expect(response.body.message).to.equal('Cadastro realizado com sucesso')
        })
    });

    it('Deve validar mensagem de erro ao cadastrar produto repetido', () => {
        cy.cadastrarProduto(token, "Produto EBAC Novo 1", 250, "Descriçãod do Produto novo", 180)
        
        .then((response) => {
            expect(response.status).to.equal(400)
            expect(response.body.message).to.equal('Já existe produto com esse nome')
        })
    });

    it('Deve editar um produto já cadastrado', () => {
        cy.request('produtos').then(response => {
            //cy.log(response.body.produtos[0]._id)
            let id = response.body.produtos[0]._id
            cy.request({
                method: 'PUT',
                url: `produtos/${id}`,
                headers: {authorization: token},
                body:
                {
                    "nome": "Produto EBAC editado 1",
                    "preco": 100,
                    "descricao": "Produto Novo",
                    "quantidade": 100
                  }
            }).then(response => {
                expect(response.body.message).to.equal("Registro alterado com sucesso")
            })
        })
    });
        
        it('Deve editar um produto cadastrado previamente', () => {
            let produto = `Produto EBAC ${Math.floor(Math.random() * 100000)}`
            cy.cadastrarProduto(token, produto, 250, "Descrição do Produto novo", 180)
            .then(response => {
                let id = response.body._id

                cy.request({
                    method: 'PUT',
                    url: `produtos/${id}`,
                    headers: {authorization: token},
                    body:
                    {
                        "nome": produto,
                        "preco": 200,
                        "descricao": "Produto Novo",
                        "quantidade": 200

                      }
                }).then(response => {
                    expect(response.body.message).to.equal("Registro alterado com sucesso")
                })
            })
        });

        it('Deve deletar um produto previamente cadastrado', () => {
            let produto = `Produto EBAC ${Math.floor(Math.random() * 100000)}`
            cy.cadastrarProduto(token, produto, 250, "Descrição do Produto novo", 180)
            .then(response => {
                let id = response.body._id
                cy.request({
                    method: 'DELETE',
                    url: `produtos/${id}`,
                    headers: {authorization: token}
                }).then(response => {
                    expect(response.body.message).to.equal('Registro excluído com sucesso')
                    expect(response.status).to.equal(200)
                })
            })
        });
    });