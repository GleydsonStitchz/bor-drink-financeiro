document.addEventListener('DOMContentLoaded', () => {
    const DB_KEY = 'borDrinkPDV';

    // --- ESTRUTURA DE DADOS E INICIALIZAÇÃO ---
    let db = {
        produtos: [],
        vendedores: [],
        transacoes: []
    };

    let carrinhoAtual = [];
    let produtoSelecionadoParaVenda = null;

    const carregarDB = () => {
        const data = localStorage.getItem(DB_KEY);
        if (data) {
            db = JSON.parse(data);
        }
    };

    const salvarDB = () => {
        localStorage.setItem(DB_KEY, JSON.stringify(db));
    };

    // --- SELEÇÃO DOS ELEMENTOS DO DOM ---
    // Formulários
    const produtoForm = document.getElementById('produto-form');
    const vendedorForm = document.getElementById('vendedor-form');
    // Inputs de Produto
    const produtoCodigoInput = document.getElementById('produto-codigo-input');
    const produtoNomeInput = document.getElementById('produto-nome-input');
    const produtoPrecoInput = document.getElementById('produto-preco-input');
    const produtoEstoqueInput = document.getElementById('produto-estoque-input');
    // Inputs de Vendedor
    const vendedorNomeInput = document.getElementById('vendedor-nome-input');
    // Tabelas
    const produtosBody = document.getElementById('produtos-body');
    const vendedoresBody = document.getElementById('vendedores-body');
    const transacoesBody = document.getElementById('transacoes-body');
    // Lógica de Vendas
    const produtoBuscaInput = document.getElementById('produto-busca-input');
    const produtoBuscaResultados = document.getElementById('produto-busca-resultados');
    const quantidadeVendaInput = document.getElementById('quantidade-venda-input');
    const addItemCarrinhoBtn = document.getElementById('add-item-carrinho-btn');
    const carrinhoLista = document.getElementById('carrinho-lista');
    const carrinhoTotalValor = document.getElementById('carrinho-total-valor');
    const vendedorSelectVenda = document.getElementById('vendedor-select-venda');
    const finalizarVendaBtn = document.getElementById('finalizar-venda-btn');
    // Modais
    const editProdutoModal = document.getElementById('edit-produto-modal');
    const editVendedorModal = document.getElementById('edit-vendedor-modal');
    const editProdutoForm = document.getElementById('edit-produto-form');
    const editVendedorForm = document.getElementById('edit-vendedor-form');

    // --- FUNÇÕES GERAIS ---
    const formatarMoeda = (valor) => `R$ ${valor.toFixed(2).replace('.', ',')}`;

    const renderizarTudo = () => {
        renderizarProdutos();
        renderizarVendedores();
        renderizarDropdownVendedores();
        renderizarTransacoes();
    };
    
    // --- LÓGICA DE GERENCIAMENTO DE PRODUTOS ---
    const renderizarProdutos = () => {
        produtosBody.innerHTML = '';
        db.produtos.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${p.codigo}</td>
                <td>${p.nome}</td>
                <td>${formatarMoeda(p.preco)}</td>
                <td>${p.estoque}</td>
                <td>
                    <button class="edit-btn" data-id="${p.id}">Editar</button>
                    <button class="delete-btn" data-id="${p.id}">Excluir</button>
                </td>
            `;
            produtosBody.appendChild(tr);
        });
    };

    produtoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const novoProduto = {
            id: Date.now(),
            codigo: produtoCodigoInput.value.toUpperCase(),
            nome: produtoNomeInput.value,
            preco: parseFloat(produtoPrecoInput.value),
            estoque: parseInt(produtoEstoqueInput.value)
        };
        db.produtos.push(novoProduto);
        salvarDB();
        renderizarProdutos();
        produtoForm.reset();
    });

    produtosBody.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        if (e.target.classList.contains('delete-btn')) {
            if (confirm('Tem certeza que deseja excluir este produto?')) {
                db.produtos = db.produtos.filter(p => p.id !== id);
                salvarDB();
                renderizarProdutos();
            }
        }
        if (e.target.classList.contains('edit-btn')) {
            const produto = db.produtos.find(p => p.id === id);
            document.getElementById('edit-produto-id').value = produto.id;
            document.getElementById('edit-produto-codigo').value = produto.codigo;
            document.getElementById('edit-produto-nome').value = produto.nome;
            document.getElementById('edit-produto-preco').value = produto.preco;
            document.getElementById('edit-produto-estoque').value = produto.estoque;
            editProdutoModal.style.display = 'block';
        }
    });

    editProdutoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = parseInt(document.getElementById('edit-produto-id').value);
        const index = db.produtos.findIndex(p => p.id === id);
        db.produtos[index] = {
            id: id,
            codigo: document.getElementById('edit-produto-codigo').value.toUpperCase(),
            nome: document.getElementById('edit-produto-nome').value,
            preco: parseFloat(document.getElementById('edit-produto-preco').value),
            estoque: parseInt(document.getElementById('edit-produto-estoque').value)
        };
        salvarDB();
        renderizarProdutos();
        editProdutoModal.style.display = 'none';
    });
    
    // --- LÓGICA DE GERENCIAMENTO DE VENDEDORES ---
    const renderizarVendedores = () => {
        vendedoresBody.innerHTML = '';
        db.vendedores.forEach(v => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${v.nome}</td>
                <td>
                    <button class="edit-btn" data-id="${v.id}">Editar</button>
                    <button class="delete-btn" data-id="${v.id}">Excluir</button>
                </td>
            `;
            vendedoresBody.appendChild(tr);
        });
    };

    const renderizarDropdownVendedores = () => {
        vendedorSelectVenda.innerHTML = '<option value="">Selecione um vendedor</option>';
        db.vendedores.forEach(v => {
            vendedorSelectVenda.innerHTML += `<option value="${v.nome}">${v.nome}</option>`;
        });
    };

    vendedorForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const novoVendedor = { id: Date.now(), nome: vendedorNomeInput.value };
        db.vendedores.push(novoVendedor);
        salvarDB();
        renderizarVendedores();
        renderizarDropdownVendedores();
        vendedorForm.reset();
    });

    vendedoresBody.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        if (e.target.classList.contains('delete-btn')) {
            if (confirm('Tem certeza que deseja excluir este vendedor?')) {
                db.vendedores = db.vendedores.filter(v => v.id !== id);
                salvarDB();
                renderizarVendedores();
                renderizarDropdownVendedores();
            }
        }
         if (e.target.classList.contains('edit-btn')) {
            const vendedor = db.vendedores.find(v => v.id === id);
            document.getElementById('edit-vendedor-id').value = vendedor.id;
            document.getElementById('edit-vendedor-nome').value = vendedor.nome;
            editVendedorModal.style.display = 'block';
        }
    });

    editVendedorForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = parseInt(document.getElementById('edit-vendedor-id').value);
        const index = db.vendedores.findIndex(v => v.id === id);
        db.vendedores[index].nome = document.getElementById('edit-vendedor-nome').value;
        salvarDB();
        renderizarVendedores();
        renderizarDropdownVendedores();
        editVendedorModal.style.display = 'none';
    });


    // --- LÓGICA DO CARRINHO E REGISTRO DE VENDAS ---
    produtoBuscaInput.addEventListener('input', () => {
        const termo = produtoBuscaInput.value.toLowerCase();
        produtoBuscaResultados.innerHTML = '';
        if (termo.length < 1) return;

        const resultados = db.produtos.filter(p => p.nome.toLowerCase().includes(termo) || p.codigo.toLowerCase().includes(termo));
        
        resultados.forEach(p => {
            const div = document.createElement('div');
            div.className = 'resultado-item';
            div.innerHTML = `<strong>${p.codigo}</strong> - ${p.nome} <small>(${formatarMoeda(p.preco)})</small>`;
            div.onclick = () => {
                produtoSelecionadoParaVenda = p;
                produtoBuscaInput.value = `${p.codigo} - ${p.nome}`;
                produtoBuscaResultados.innerHTML = '';
            };
            produtoBuscaResultados.appendChild(div);
        });
    });

    const renderizarCarrinho = () => {
        carrinhoLista.innerHTML = '';
        let total = 0;
        carrinhoAtual.forEach((item, index) => {
            const li = document.createElement('li');
            const itemTotal = item.preco * item.quantidade;
            li.innerHTML = `
                <span>${item.quantidade}x ${item.nome}</span>
                <span>${formatarMoeda(itemTotal)}</span>
            `;
            carrinhoLista.appendChild(li);
            total += itemTotal;
        });
        carrinhoTotalValor.textContent = formatarMoeda(total);
    };

    addItemCarrinhoBtn.addEventListener('click', () => {
        if (!produtoSelecionadoParaVenda) {
            alert('Por favor, selecione um produto da busca.');
            return;
        }
        const quantidade = parseInt(quantidadeVendaInput.value);
        if (quantidade > produtoSelecionadoParaVenda.estoque) {
            alert(`Estoque insuficiente! Apenas ${produtoSelecionadoParaVenda.estoque} unidades disponíveis.`);
            return;
        }

        carrinhoAtual.push({
            id: produtoSelecionadoParaVenda.id,
            nome: produtoSelecionadoParaVenda.nome,
            preco: produtoSelecionadoParaVenda.preco,
            quantidade: quantidade
        });
        
        renderizarCarrinho();
        // Limpar campos para próximo item
        produtoSelecionadoParaVenda = null;
        produtoBuscaInput.value = '';
        quantidadeVendaInput.value = 1;
    });

    finalizarVendaBtn.addEventListener('click', () => {
        if (carrinhoAtual.length === 0) {
            alert('Adicione pelo menos um item à venda.');
            return;
        }
        if (!vendedorSelectVenda.value) {
            alert('Selecione um vendedor.');
            return;
        }

        const totalVenda = carrinhoAtual.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);

        // Dar baixa no estoque
        carrinhoAtual.forEach(itemCarrinho => {
            const indexProduto = db.produtos.findIndex(p => p.id === itemCarrinho.id);
            db.produtos[indexProduto].estoque -= itemCarrinho.quantidade;
        });

        const novaTransacao = {
            id: 'V-' + Date.now(),
            tipo: 'venda',
            vendedor: vendedorSelectVenda.value,
            total: totalVenda,
            data: new Date().toISOString(),
            items: carrinhoAtual
        };

        db.transacoes.push(novaTransacao);
        salvarDB();
        
        // Limpar tudo para a próxima venda
        carrinhoAtual = [];
        renderizarCarrinho();
        vendedorSelectVenda.value = '';
        
        renderizarTudo(); // Atualiza todas as tabelas (estoque, histórico)
        alert('Venda registrada com sucesso!');
    });

    // --- LÓGICA DE HISTÓRICO ---
    const renderizarTransacoes = () => {
        transacoesBody.innerHTML = '';
        db.transacoes.sort((a, b) => new Date(b.data) - new Date(a.data));
        db.transacoes.forEach(t => {
            const tr = document.createElement('tr');
            const itensHtml = t.items.map(item => `<li>${item.quantidade}x ${item.nome}</li>`).join('');
            tr.innerHTML = `
                <td>${t.id}</td>
                <td><ul>${itensHtml}</ul></td>
                <td>${formatarMoeda(t.total)}</td>
                <td>${t.vendedor}</td>
                <td>${new Date(t.data).toLocaleDateString('pt-BR')}</td>
            `;
            transacoesBody.appendChild(tr);
        });
    };

    // --- Fechando Modais ---
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.onclick = () => {
            editProdutoModal.style.display = 'none';
            editVendedorModal.style.display = 'none';
        }
    });
    window.onclick = (event) => {
        if (event.target == editProdutoModal || event.target == editVendedorModal) {
            editProdutoModal.style.display = 'none';
            editVendedorModal.style.display = 'none';
        }
    }

    // --- INICIALIZAÇÃO GERAL ---
    carregarDB();
    renderizarTudo();
});
