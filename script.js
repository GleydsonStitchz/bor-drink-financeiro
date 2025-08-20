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
    const editTransacaoModal = document.getElementById('edit-transacao-modal');
    const editTransacaoForm = document.getElementById('edit-transacao-form');
    const vendaHorarioInput = document.getElementById('venda-horario-input');
    const pagamentoSelect = document.getElementById('pagamento-select');
    const outraDataInput = document.getElementById('outra-data-input');
    const outraHorarioInput = document.getElementById('outra-horario-input');
    const produtoForm = document.getElementById('produto-form');
    const vendedorForm = document.getElementById('vendedor-form');
    const outraTransacaoForm = document.getElementById('outra-transacao-form');
    const produtosBody = document.getElementById('produtos-body');
    const vendedoresBody = document.getElementById('vendedores-body');
    const transacoesBody = document.getElementById('transacoes-body');
    const produtoBuscaInput = document.getElementById('produto-busca-input');
    const produtoBuscaResultados = document.getElementById('produto-busca-resultados');
    const quantidadeVendaInput = document.getElementById('quantidade-venda-input');
    const addItemCarrinhoBtn = document.getElementById('add-item-carrinho-btn');
    const carrinhoLista = document.getElementById('carrinho-lista');
    const carrinhoTotalValor = document.getElementById('carrinho-total-valor');
    const vendaDataInput = document.getElementById('venda-data-input');
    const vendedorSelectVenda = document.getElementById('vendedor-select-venda');
    const finalizarVendaBtn = document.getElementById('finalizar-venda-btn');
    const tipoOutraTransacao = document.getElementById('tipo-outra-transacao');
    const outraDescricaoInput = document.getElementById('outra-descricao-input');
    const outraValorInput = document.getElementById('outra-valor-input');
    const outraAporteSocioDiv = document.getElementById('outra-aporte-socio-div');
    const outraSocioSelect = document.getElementById('outra-socio-select');
    const editProdutoModal = document.getElementById('edit-produto-modal');
    const editVendedorModal = document.getElementById('edit-vendedor-modal');
    const editProdutoForm = document.getElementById('edit-produto-form');
    const editVendedorForm = document.getElementById('edit-vendedor-form');
    const mesSelect = document.getElementById('mes-select');
    const anoSelect = document.getElementById('ano-select');
    const fechamentoBtn = document.getElementById('fechamento-btn');
    const fechamentoResultado = document.getElementById('fechamento-resultado');
    const exportBtn = document.getElementById('export-btn');
    const importBtn = document.getElementById('import-btn');
    const importFileInput = document.getElementById('import-file-input');
    
    // --- FUNÇÕES GERAIS ---
    const formatarMoeda = (valor) => `R$ ${valor.toFixed(2).replace('.', ',')}`;
    const formatarData = (dataISO) => new Date(dataISO).toLocaleDateString('pt-BR', {});
    const formatarDataHora = (dataISO) => {
        const data = new Date(dataISO);
        const dataFormatada = data.toLocaleDateString('pt-BR', {});
        const horaFormatada = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        return `${dataFormatada} ${horaFormatada}`;
    };
    const setDateTimeAtual = (dateEl, timeEl) => {
        const agora = new Date();
        if (dateEl) dateEl.value = agora.toISOString().split('T')[0];
        if (timeEl) timeEl.value = agora.toTimeString().slice(0, 5);
    };

    const renderizarTudo = () => {
        renderizarProdutos();
        renderizarVendedores();
        renderizarDropdownVendedores();
        renderizarTransacoes();
    };
    
    // --- LÓGICA DE PRODUTOS E VENDEDORES ---
    const renderizarProdutos = () => { /* ... (código existente, omitido por brevidade) ... */ };
    produtoForm.addEventListener('submit', (e) => { /* ... (código existente, omitido por brevidade) ... */ });
    produtosBody.addEventListener('click', (e) => { /* ... (código existente, omitido por brevidade) ... */ });
    editProdutoForm.addEventListener('submit', (e) => { /* ... (código existente, omitido por brevidade) ... */ });
    const renderizarVendedores = () => { /* ... (código existente, omitido por brevidade) ... */ };
    const renderizarDropdownVendedores = () => { /* ... (código existente, omitido por brevidade) ... */ };
    vendedorForm.addEventListener('submit', (e) => { /* ... (código existente, omitido por brevidade) ... */ });
    vendedoresBody.addEventListener('click', (e) => { /* ... (código existente, omitido por brevidade) ... */ });
    editVendedorForm.addEventListener('submit', (e) => { /* ... (código existente, omitido por brevidade) ... */ });

    // --- LÓGICA DO CARRINHO E VENDA ---
    produtoBuscaInput.addEventListener('input', () => { /* ... (código existente, omitido por brevidade) ... */ });
    const renderizarCarrinho = () => { /* ... (código existente, omitido por brevidade) ... */ };
    addItemCarrinhoBtn.addEventListener('click', () => { /* ... (código existente, omitido por brevidade) ... */ });
    finalizarVendaBtn.addEventListener('click', () => { /* ... (código existente, omitido por brevidade) ... */ });

    // --- LÓGICA PARA CUSTOS E APORTES ---
    tipoOutraTransacao.addEventListener('change', () => { /* ... (código existente, omitido por brevidade) ... */ });
    outraTransacaoForm.addEventListener('submit', (e) => { /* ... (código existente, omitido por brevidade) ... */ });
    
    // --- LÓGICA DE HISTÓRICO E EDIÇÃO ---
    const renderizarTransacoes = () => { /* ... (código existente, omitido por brevidade) ... */ };
    transacoesBody.addEventListener('click', (e) => { /* ... (código existente, omitido por brevidade) ... */ });
    editTransacaoForm.addEventListener('submit', (e) => { /* ... (código existente, omitido por brevidade) ... */ });

    // --- LÓGICA DE FECHAMENTO MENSAL ---
    const popularFiltrosDeData = () => { /* ... (código existente, omitido por brevidade) ... */ };
    const gerarFechamento = () => { /* ... (código existente, omitido por brevidade) ... */ };
    
    // --- LÓGICA DE IMPORTAÇÃO E EXPORTAÇÃO ---
    const exportarDados = () => {
        const dataStr = JSON.stringify(db);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-bor-drink-pdv-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };
    const importarDados = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if ('produtos' in data && 'vendedores' in data && 'transacoes' in data) {
                    if (confirm('Isso irá substituir todos os dados atuais. Deseja continuar?')) {
                        db = data;
                        salvarDB();
                        location.reload();
                    }
                } else {
                    alert('Arquivo de backup inválido.');
                }
            } catch (err) {
                alert('Erro ao ler o arquivo.');
            }
        };
        reader.readAsText(file);
    };
    
    // ======================================================================
    // CÓDIGO COMPLETO (Funções omitidas acima estão presentes aqui)
    // ======================================================================
    renderizarProdutos = () => {
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
        if (e.target.classList.contains('delete-btn')) { if (confirm('Tem certeza?')) { db.produtos = db.produtos.filter(p => p.id !== id); salvarDB(); renderizarProdutos(); } }
        if (e.target.classList.contains('edit-btn')) {
            const p = db.produtos.find(p => p.id === id);
            document.getElementById('edit-produto-id').value = p.id; document.getElementById('edit-produto-codigo').value = p.codigo; document.getElementById('edit-produto-nome').value = p.nome; document.getElementById('edit-produto-preco').value = p.preco; document.getElementById('edit-produto-estoque').value = p.estoque;
            editProdutoModal.style.display = 'block';
        }
    });
    editProdutoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = parseInt(document.getElementById('edit-produto-id').value);
        const index = db.produtos.findIndex(p => p.id === id);
        db.produtos[index] = { id, codigo: document.getElementById('edit-produto-codigo').value.toUpperCase(), nome: document.getElementById('edit-produto-nome').value, preco: parseFloat(document.getElementById('edit-produto-preco').value), estoque: parseInt(document.getElementById('edit-produto-estoque').value) };
        salvarDB(); renderizarProdutos(); editProdutoModal.style.display = 'none';
    });
    renderizarVendedores = () => {
        vendedoresBody.innerHTML = '';
        db.vendedores.forEach(v => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${v.nome}</td><td><button class="edit-btn" data-id="${v.id}">Editar</button><button class="delete-btn" data-id="${v.id}">Excluir</button></td>`;
            vendedoresBody.appendChild(tr);
        });
    };
    renderizarDropdownVendedores = () => {
        vendedorSelectVenda.innerHTML = '<option value="">Selecione um vendedor</option>';
        db.vendedores.forEach(v => { vendedorSelectVenda.innerHTML += `<option value="${v.nome}">${v.nome}</option>`; });
    };
    vendedorForm.addEventListener('submit', (e) => {
        e.preventDefault();
        db.vendedores.push({ id: Date.now(), nome: document.getElementById('vendedor-nome-input').value });
        salvarDB(); renderizarVendedores(); renderizarDropdownVendedores(); vendedorForm.reset();
    });
    vendedoresBody.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        if (e.target.classList.contains('delete-btn')) { if (confirm('Tem certeza?')) { db.vendedores = db.vendedores.filter(v => v.id !== id); salvarDB(); renderizarVendedores(); renderizarDropdownVendedores(); } }
        if (e.target.classList.contains('edit-btn')) {
            const v = db.vendedores.find(v => v.id === id);
            document.getElementById('edit-vendedor-id').value = v.id; document.getElementById('edit-vendedor-nome').value = v.nome;
            editVendedorModal.style.display = 'block';
        }
    });
    editVendedorForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = parseInt(document.getElementById('edit-vendedor-id').value);
        const index = db.vendedores.findIndex(v => v.id === id);
        db.vendedores[index].nome = document.getElementById('edit-vendedor-nome').value;
        salvarDB(); renderizarVendedores(); renderizarDropdownVendedores(); editVendedorModal.style.display = 'none';
    });
    produtoBuscaInput.addEventListener('input', () => {
        const termo = produtoBuscaInput.value.toLowerCase();
        produtoBuscaResultados.innerHTML = ''; produtoSelecionadoParaVenda = null;
        if (termo.length < 1) return;
        const resultados = db.produtos.filter(p => p.nome.toLowerCase().includes(termo) || p.codigo.toLowerCase().includes(termo));
        resultados.forEach(p => {
            const div = document.createElement('div');
            div.className = 'resultado-item'; div.innerHTML = `<strong>${p.codigo}</strong> - ${p.nome} <small>(${formatarMoeda(p.preco)})</small>`;
            div.onclick = () => { produtoSelecionadoParaVenda = p; produtoBuscaInput.value = `${p.codigo} - ${p.nome}`; produtoBuscaResultados.innerHTML = ''; quantidadeVendaInput.focus(); };
            produtoBuscaResultados.appendChild(div);
        });
    });
    renderizarCarrinho = () => {
        carrinhoLista.innerHTML = ''; let total = 0;
        carrinhoAtual.forEach((item) => {
            const li = document.createElement('li'); const itemTotal = item.preco * item.quantidade;
            li.innerHTML = `<span>${item.quantidade}x ${item.nome}</span><span>${formatarMoeda(itemTotal)}</span>`;
            carrinhoLista.appendChild(li); total += itemTotal;
        });
        carrinhoTotalValor.textContent = formatarMoeda(total);
    };
    addItemCarrinhoBtn.addEventListener('click', () => {
        if (!produtoSelecionadoParaVenda) { alert('Selecione um produto.'); return; }
        const quantidade = parseInt(quantidadeVendaInput.value);
        if (quantidade <= 0) { alert('A quantidade deve ser maior que zero.'); return; }
        if (quantidade > produtoSelecionadoParaVenda.estoque) { alert(`Estoque insuficiente! Apenas ${produtoSelecionadoParaVenda.estoque} disponíveis.`); return; }
        carrinhoAtual.push({ id: produtoSelecionadoParaVenda.id, nome: produtoSelecionadoParaVenda.nome, preco: produtoSelecionadoParaVenda.preco, quantidade: quantidade });
        renderizarCarrinho(); produtoSelecionadoParaVenda = null; produtoBuscaInput.value = ''; quantidadeVendaInput.value = 1; produtoBuscaInput.focus();
    });
    finalizarVendaBtn.addEventListener('click', () => {
        if (carrinhoAtual.length === 0) { alert('Adicione itens à venda.'); return; }
        if (!vendedorSelectVenda.value) { alert('Selecione um vendedor.'); return; }
        if (!vendaDataInput.value || !vendaHorarioInput.value) { alert('Selecione a data e o horário da venda.'); return; }
        carrinhoAtual.forEach(itemCarrinho => {
            const indexProduto = db.produtos.findIndex(p => p.id === itemCarrinho.id);
            if (indexProduto !== -1) { db.produtos[indexProduto].estoque -= itemCarrinho.quantidade; }
        });
        const dataCompleta = new Date(`${vendaDataInput.value}T${vendaHorarioInput.value}`);
        db.transacoes.push({ id: 'V-' + Date.now(), tipo: 'venda', vendedor: vendedorSelectVenda.value, pagamento: pagamentoSelect.value, total: carrinhoAtual.reduce((acc, item) => acc + (item.preco * item.quantidade), 0), data: dataCompleta.toISOString(), items: carrinhoAtual });
        salvarDB(); carrinhoAtual = []; renderizarCarrinho(); vendedorSelectVenda.value = ''; setDateTimeAtual(vendaDataInput, vendaHorarioInput); renderizarTudo(); alert('Venda registrada com sucesso!');
    });
    tipoOutraTransacao.addEventListener('change', () => {
        outraAporteSocioDiv.classList.toggle('hidden', tipoOutraTransacao.value !== 'aporte');
    });
    outraTransacaoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!outraDataInput.value || !outraHorarioInput.value) { alert('Por favor, preencha a data e o horário.'); return; }
        const tipo = tipoOutraTransacao.value;
        const dataCompleta = new Date(`${outraDataInput.value}T${outraHorarioInput.value}`);
        const novaTransacao = { id: tipo.charAt(0).toUpperCase() + '-' + Date.now(), tipo: tipo, descricao: outraDescricaoInput.value, valor: parseFloat(outraValorInput.value), data: dataCompleta.toISOString() };
        if (tipo === 'aporte') { novaTransacao.socio = outraSocioSelect.value; }
        db.transacoes.push(novaTransacao);
        salvarDB(); renderizarTransacoes(); outraTransacaoForm.reset(); setDateTimeAtual(outraDataInput, outraHorarioInput); outraAporteSocioDiv.classList.add('hidden');
    });
    renderizarTransacoes = () => {
        transacoesBody.innerHTML = '';
        db.transacoes.sort((a, b) => new Date(b.data) - new Date(a.data));
        let ultimaDataExibida = null;
        db.transacoes.forEach(t => {
            const dataAtualTransacao = formatarData(t.data);
            if (dataAtualTransacao !== ultimaDataExibida) {
                const trHeader = document.createElement('tr');
                trHeader.className = 'date-header';
                trHeader.innerHTML = `<td colspan="6">Transações de ${dataAtualTransacao}</td>`;
                transacoesBody.appendChild(trHeader);
                ultimaDataExibida = dataAtualTransacao;
            }
            const tr = document.createElement('tr');
            let detalhes = '', valor = 0, responsavel = '';
            if (t.tipo === 'venda') {
                detalhes = `
