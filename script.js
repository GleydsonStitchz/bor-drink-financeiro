document.addEventListener('DOMContentLoaded', () => {
    const DB_KEY = 'borDrinkPDV';

    let db = {
        produtos: [],
        vendedores: [],
        transacoes: []
    };

    let carrinhoAtual = [];
    let produtoSelecionadoParaVenda = null;

    const carregarDB = () => {
        const data = localStorage.getItem(DB_KEY);
        if (data) { db = JSON.parse(data); }
    };
    const salvarDB = () => { localStorage.setItem(DB_KEY, JSON.stringify(db)); };

    // --- SELEÇÃO DOS ELEMENTOS DO DOM ---
    const produtoForm = document.getElementById('produto-form');
    const vendedorForm = document.getElementById('vendedor-form');
    const outraTransacaoForm = document.getElementById('outra-transacao-form');
    const produtosBody = document.getElementById('produtos-body');
    const vendedoresBody = document.getElementById('vendedores-body');
    const transacoesBody = document.getElementById('transacoes-body');
    // Vendas
    const produtoBuscaInput = document.getElementById('produto-busca-input');
    const produtoBuscaResultados = document.getElementById('produto-busca-resultados');
    const quantidadeVendaInput = document.getElementById('quantidade-venda-input');
    const addItemCarrinhoBtn = document.getElementById('add-item-carrinho-btn');
    const carrinhoLista = document.getElementById('carrinho-lista');
    const carrinhoTotalValor = document.getElementById('carrinho-total-valor');
    const vendedorSelectVenda = document.getElementById('vendedor-select-venda');
    const finalizarVendaBtn = document.getElementById('finalizar-venda-btn');
    // Outras Transações
    const tipoOutraTransacao = document.getElementById('tipo-outra-transacao');
    const outraDescricaoInput = document.getElementById('outra-descricao-input');
    const outraValorInput = document.getElementById('outra-valor-input');
    const outraAporteSocioDiv = document.getElementById('outra-aporte-socio-div');
    const outraSocioSelect = document.getElementById('outra-socio-select');
    // Modais
    const editProdutoModal = document.getElementById('edit-produto-modal');
    const editVendedorModal = document.getElementById('edit-vendedor-modal');
    const editProdutoForm = document.getElementById('edit-produto-form');
    const editVendedorForm = document.getElementById('edit-vendedor-form');
    // Fechamento
    const mesSelect = document.getElementById('mes-select');
    const anoSelect = document.getElementById('ano-select');
    const fechamentoBtn = document.getElementById('fechamento-btn');
    const fechamentoResultado = document.getElementById('fechamento-resultado');
    // Import/Export
    const exportBtn = document.getElementById('export-btn');
    const importBtn = document.getElementById('import-btn');
    const importFileInput = document.getElementById('import-file-input');

    // --- FUNÇÕES GERAIS ---
    const formatarMoeda = (valor) => `R$ ${valor.toFixed(2).replace('.', ',')}`;
    const formatarData = (dataISO) => new Date(dataISO).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

    const renderizarTudo = () => {
        renderizarProdutos();
        renderizarVendedores();
        renderizarDropdownVendedores();
        renderizarTransacoes();
    };
    
    // --- LÓGICA DE PRODUTOS E VENDEDORES (sem alterações) ---
    // (Cole aqui toda a lógica de renderizarProdutos, produtoForm, produtosBody, editProdutoForm, 
    // renderizarVendedores, renderizarDropdownVendedores, vendedorForm, vendedoresBody, editVendedorForm.
    // Para garantir, o código está abaixo)
    const renderizarProdutos = () => {
        produtosBody.innerHTML = '';
        db.produtos.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${p.codigo}</td><td>${p.nome}</td><td>${formatarMoeda(p.preco)}</td><td>${p.estoque}</td><td><button class="edit-btn" data-id="${p.id}">Editar</button><button class="delete-btn" data-id="${p.id}">Excluir</button></td>`;
            produtosBody.appendChild(tr);
        });
    };
    produtoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        db.produtos.push({ id: Date.now(), codigo: document.getElementById('produto-codigo-input').value.toUpperCase(), nome: document.getElementById('produto-nome-input').value, preco: parseFloat(document.getElementById('produto-preco-input').value), estoque: parseInt(document.getElementById('produto-estoque-input').value) });
        salvarDB(); renderizarProdutos(); produtoForm.reset();
    });
    produtosBody.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        if (e.target.classList.contains('delete-btn')) {
            if (confirm('Tem certeza?')) { db.produtos = db.produtos.filter(p => p.id !== id); salvarDB(); renderizarProdutos(); }
        }
        if (e.target.classList.
