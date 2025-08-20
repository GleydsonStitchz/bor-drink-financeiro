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
    const formatarData = (dataISO) => new Date(dataISO).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    const formatarDataHora = (dataISO) => {
        const data = new Date(dataISO);
        return formatarData(dataISO) + ' ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
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
    
    // --- LÓGICA DE CUSTOS E APORTES (BUG CORRIGIDO) ---
    tipoOutraTransacao.addEventListener('change', () => {
        outraAporteSocioDiv.classList.toggle('hidden', tipoOutraTransacao.value !== 'aporte');
    });
    outraTransacaoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!outraDataInput.value || !outraHorarioInput.value) {
            alert('Por favor, preencha a data e o horário.');
            return;
        }
        const tipo = tipoOutraTransacao.value;
        // CORREÇÃO APLICADA AQUI: Usa a data e hora do formulário
        const dataCompleta = new Date(`${outraDataInput.value}T${outraHorarioInput.value}`);
        const novaTransacao = {
            id: tipo.charAt(0).toUpperCase() + '-' + Date.now(),
            tipo: tipo,
            descricao: outraDescricaoInput.value,
            valor: parseFloat(outraValorInput.value),
            data: dataCompleta.toISOString() // Salva a data correta
        };
        if (tipo === 'aporte') {
            novaTransacao.socio = outraSocioSelect.value;
        }
        db.transacoes.push(novaTransacao);
        salvarDB();
        renderizarTransacoes();
        outraTransacaoForm.reset();
        setDateTimeAtual(outraDataInput, outraHorarioInput);
        outraAporteSocioDiv.classList.add('hidden');
    });
    
    // --- LÓGICA DE HISTÓRICO (AGRUPADO POR DIA) ---
    const renderizarTransacoes = () => {
        transacoesBody.innerHTML = '';
        db.transacoes.sort((a, b) => new Date(b.data) - new Date(a.data));
        
        let ultimaDataExibida = null;

        db.transacoes.forEach(t => {
            const dataAtualTransacao = formatarData(t.data);

            // Se a data desta transação for diferente da última, cria um cabeçalho de dia
            if (dataAtualTransacao !== ultimaDataExibida) {
                const trHeader = document.createElement('tr');
                trHeader.className = 'date-header';
                trHeader.innerHTML = `<td colspan="6">Transações de ${dataAtualTransacao}</td>`;
                transacoesBody.appendChild(trHeader);
                ultimaDataExibida = dataAtualTransacao;
            }

            // Cria a linha da transação normal
            const tr = document.createElement('tr');
            let detalhes = '', valor = 0, responsavel = '';
            if (t.tipo === 'venda') {
                detalhes = `<ul class="transacao-item-lista">${t.items.map(item => `<li>${item.quantidade}x ${item.nome}</li>`).join('')}</ul>`;
                valor = t.total;
                responsavel = `V: ${t.vendedor}<br><small>Pg: ${t.pagamento}</small>`;
            } else {
                detalhes = t.descricao;
                valor = t.valor;
                responsavel = `S: ${t.socio || 'N/A'}`;
            }

            tr.innerHTML = `
                <td class="tipo-${t.tipo}">${t.tipo.charAt(0).toUpperCase() + t.tipo.slice(1)}</td>
                <td>${detalhes}</td>
                <td>${formatarMoeda(valor)}</td>
                <td>${responsavel}</td>
                <td>${formatarDataHora(t.data)}</td>
                <td><button class="delete-btn" data-id="${t.id}">Excluir</button></td>
            `;
            transacoesBody.appendChild(tr);
        });
    };

    // --- O RESTANTE DO CÓDIGO (sem alterações) ---
    // (Omitido por brevidade, mas o código completo está abaixo)

    // ================== CÓDIGO COMPLETO DO SCRIPT.JS ==================
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
    const renderizarVendedores = () => {
        vendedoresBody.innerHTML = '';
        db.vendedores.forEach(v => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${v.nome}</td><td><button class="edit-btn" data-id="${v.id}">Editar</button><button class="delete-btn" data-id="${v.id}">Excluir</button></td>`;
            vendedoresBody.appendChild(tr);
        });
    };
    const renderizarDropdownVendedores = () => {
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
        if (e.target.classList.contains('delete-btn')) {
            if (confirm('Tem certeza?')) { db.vendedores = db.vendedores.filter(v => v.id !== id); salvarDB(); renderizarVendedores(); renderizarDropdownVendedores(); }
        }
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
    const renderizarCarrinho = () => {
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
    transacoesBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const id = e.target.dataset.id;
            if (confirm('Tem certeza que deseja excluir esta transação?')) {
                const transacao = db.transacoes.find(t => t.id === id);
                if (transacao && transacao.tipo === 'venda') {
                    transacao.items.forEach(itemVendido => {
                        const indexProduto = db.produtos.findIndex(p => p.id === itemVendido.id);
                        if (indexProduto !== -1) { db.produtos[indexProduto].estoque += itemVendido.quantidade; }
                    });
                }
                db.transacoes = db.transacoes.filter(t => t.id !== id);
                salvarDB();
                renderizarTudo();
            }
        }
    });
    const popularFiltrosDeData = () => {
        const meses = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
        meses.forEach((mes, index) => { mesSelect.innerHTML += `<option value="${index}">${mes}</option>`; });
        const anoAtual = new Date().getFullYear();
        for (let ano = anoAtual; ano >= 2022; ano--) { anoSelect.innerHTML += `<option value="${ano}">${ano}</option>`; }
        mesSelect.value = new Date().getMonth();
        anoSelect.value = anoAtual;
    };
    const gerarFechamento = () => {
        const mes = parseInt(mesSelect.value);
        const ano = parseInt(anoSelect.value);
        const transacoesDoMes = db.transacoes.filter(t => { const data = new Date(t.data); return data.getUTCMonth() === mes && data.getUTCFullYear() === ano; });
        const faturamento = transacoesDoMes.filter(t => t.tipo === 'venda').reduce((acc, t) => acc + t.total, 0);
        const custos = transacoesDoMes.filter(t => t.tipo === 'custo').reduce((acc, t) => acc + t.valor, 0);
        const lucroBruto = faturamento - custos;
        const dataFimDoMes = new Date(Date.UTC(ano, mes + 1, 0));
        const aportesAteOMes = db.transacoes.filter(t => t.tipo === 'aporte' && new Date(t.data) <= dataFimDoMes);
        const totalInvestidoEu = aportesAteOMes.filter(t => t.socio === 'Eu').reduce((acc, t) => acc + t.valor, 0);
        const totalInvestidoVovo = aportesAteOMes.filter(t => t.socio === 'Vovó').reduce((acc, t) => acc + t.valor, 0);
        const capitalTotal = totalInvestidoEu + totalInvestidoVovo;
        const participacaoEu = capitalTotal > 0 ? (totalInvestidoEu / capitalTotal) : 0;
        const participacaoVovo = capitalTotal > 0 ? (totalInvestidoVovo / capitalTotal) : 0;
        const lucroEu = lucroBruto > 0 ? lucroBruto * participacaoEu : 0;
        const lucroVovo = lucroBruto > 0 ? lucroBruto * participacaoVovo : 0;
        fechamentoResultado.innerHTML = `<h3>Fechamento de ${mesSelect.options[mesSelect.selectedIndex].text} de ${ano}</h3><p><strong>Faturamento Total (Vendas):</strong> ${formatarMoeda(faturamento)}</p><p><strong>Custos Totais (Despesas):</strong> ${formatarMoeda(custos)}</p><hr><p><strong>Lucro/Prejuízo do Mês:</strong> <strong class="${lucroBruto >= 0 ? 'tipo-venda' : 'tipo-custo'}">${formatarMoeda(lucroBruto)}</strong></p><hr><h4>Divisão do Lucro Baseada no Capital Investido:</h4><p>Sua Participação (${(participacaoEu * 100).toFixed(2)}%): <strong>${formatarMoeda(lucroEu)}</strong></p><p>Participação da Vovó (${(participacaoVovo * 100).toFixed(2)}%): <strong>${formatarMoeda(lucroVovo)}</strong></p>`;
    };
    fechamentoBtn.addEventListener('click', gerarFechamento);
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.onclick = () => { editProdutoModal.style.display = 'none'; editVendedorModal.style.display = 'none'; }
    });
    window.onclick = (event) => {
        if (event.target == editProdutoModal || event.target == editVendedorModal) {
            editProdutoModal.style.display = 'none'; editVendedorModal.style.display = 'none';
        }
    }
    exportBtn.addEventListener('click', () => {
        const dataStr = JSON.stringify(db); const blob = new Blob([dataStr], { type: 'application/json' }); const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `backup-bor-drink-pdv-${new Date().toISOString().split('T')[0]}.json`;
        a.click(); URL.revokeObjectURL(url);
    });
    importFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if ('produtos' in data && 'vendedores' in data && 'transacoes' in data) {
                    if (confirm('Isso irá substituir todos os dados. Deseja continuar?')) { db = data; salvarDB(); location.reload(); }
                } else { alert('Arquivo de backup inválido.'); }
            } catch (err) { alert('Erro ao ler o arquivo.'); }
        };
        reader.readAsText(file);
    });
    importBtn.addEventListener('click', () => importFileInput.click());
    
    carregarDB();
    renderizarTudo();
    popularFiltrosDeData();
    setDateTimeAtual(vendaDataInput, vendaHorarioInput);
    setDateTimeAtual(outraDataInput, outraHorarioInput);
});
