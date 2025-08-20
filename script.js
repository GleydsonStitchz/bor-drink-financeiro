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
                detalhes = `<ul class="transacao-item-lista">${t.items.map(item => `<li>${item.quantidade}x ${item.nome}</li>`).join('')}</ul>`;
                valor = t.total;
                responsavel = `V: ${t.vendedor}<br><small>Pg: ${t.pagamento}</small>`;
            } else {
                detalhes = t.descricao;
                valor = t.valor;
                responsavel = `S: ${t.socio || 'N/A'}`;
            }
            tr.innerHTML = `<td class="tipo-${t.tipo}">${t.tipo.charAt(0).toUpperCase() + t.tipo.slice(1)}</td><td>${detalhes}</td><td>${formatarMoeda(valor)}</td><td>${responsavel}</td><td>${formatarDataHora(t.data)}</td><td><button class="edit-btn" data-id="${t.id}">Editar</button><button class="delete-btn" data-id="${t.id}">Excluir</button></td>`;
            transacoesBody.appendChild(tr);
        });
    };
    transacoesBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const id = e.target.dataset.id;
            if (confirm('Tem certeza?')) {
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
        if (e.target.classList.contains('edit-btn')) {
            const id = e.target.dataset.id;
            const transacao = db.transacoes.find(t => t.id === id);
            if (!transacao) return;
            document.getElementById('edit-transacao-id').value = transacao.id;
            const data = new Date(transacao.data);
            document.getElementById('edit-transacao-data').value = data.toISOString().split('T')[0];
            document.getElementById('edit-transacao-horario').value = data.toTimeString().slice(0, 5);
            const vendaFields = editTransacaoModal.querySelector('.edit-venda-fields');
            const custoAporteFields = editTransacaoModal.querySelector('.edit-custo-aporte-fields');
            const aporteFields = editTransacaoModal.querySelector('.edit-aporte-fields');
            vendaFields.style.display = 'none';
            custoAporteFields.style.display = 'none';
            aporteFields.style.display = 'none';
            if (transacao.tipo === 'venda') {
                vendaFields.style.display = 'block';
                const vendedorSelect = document.getElementById('edit-transacao-vendedor');
                vendedorSelect.innerHTML = '';
                db.vendedores.forEach(v => { vendedorSelect.innerHTML += `<option value="${v.nome}">${v.nome}</option>`; });
                vendedorSelect.value = transacao.vendedor;
                document.getElementById('edit-transacao-pagamento').value = transacao.pagamento;
            } else if (transacao.tipo === 'custo') {
                custoAporteFields.style.display = 'block';
                document.getElementById('edit-transacao-descricao').value = transacao.descricao;
                document.getElementById('edit-transacao-valor').value = transacao.valor;
            } else if (transacao.tipo === 'aporte') {
                custoAporteFields.style.display = 'block';
                aporteFields.style.display = 'block';
                document.getElementById('edit-transacao-descricao').value = transacao.descricao;
                document.getElementById('edit-transacao-valor').value = transacao.valor;
                document.getElementById('edit-transacao-socio').value = transacao.socio;
            }
            editTransacaoModal.style.display = 'block';
        }
    });
    editTransacaoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-transacao-id').value;
        const index = db.transacoes.findIndex(t => t.id === id);
        if (index === -1) return;
        const data = document.getElementById('edit-transacao-data').value;
        const horario = document.getElementById('edit-transacao-horario').value;
        db.transacoes[index].data = new Date(`${data}T${horario}`).toISOString();
        const tipo = db.transacoes[index].tipo;
        if (tipo === 'venda') {
            db.transacoes[index].vendedor = document.getElementById('edit-transacao-vendedor').value;
            db.transacoes[index].pagamento = document.getElementById('edit-transacao-pagamento').value;
        } else {
            db.transacoes[index].descricao = document.getElementById('edit-transacao-descricao').value;
            db.transacoes[index].valor = parseFloat(document.getElementById('edit-transacao-valor').value);
            if (tipo === 'aporte') {
                db.transacoes[index].socio = document.getElementById('edit-transacao-socio').value;
            }
        }
        salvarDB();
        renderizarTudo();
        editTransacaoModal.style.display = 'none';
    });
    popularFiltrosDeData = () => {
        const meses = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
        meses.forEach((mes, index) => { mesSelect.innerHTML += `<option value="${index}">${mes}</option>`; });
        const anoAtual = new Date().getFullYear();
        for (let ano = anoAtual; ano >= 2022; ano--) { anoSelect.innerHTML += `<option value="${ano}">${ano}</option>`; }
        mesSelect.value = new Date().getMonth();
        anoSelect.value = anoAtual;
    };
    gerarFechamento = () => {
        const mes = parseInt(mesSelect.value);
        const ano = parseInt(anoSelect.value);
        const transacoesDoMes = db.transacoes.filter(t => { const data = new Date(t.data); return data.getMonth() === mes && data.getFullYear() === ano; });
        const faturamento = transacoesDoMes.filter(t => t.tipo === 'venda').reduce((acc, t) => acc + t.total, 0);
        const custos = transacoesDoMes.filter(t => t.tipo === 'custo').reduce((acc, t) => acc + t.valor, 0);
        const lucroBruto = faturamento - custos;
        const dataFimDoMes = new Date(ano, mes + 1, 0);
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
        btn.onclick = () => {
            editProdutoModal.style.display = 'none';
            editVendedorModal.style.display = 'none';
            editTransacaoModal.style.display = 'none';
        }
    });
    window.onclick = (event) => {
        if (event.target == editProdutoModal || event.target == editVendedorModal || event.target == editTransacaoModal) {
            editProdutoModal.style.display = 'none';
            editVendedorModal.style.display = 'none';
            editTransacaoModal.style.display = 'none';
        }
    }
    
    // --- EVENT LISTENERS FINAIS RESTAURADOS ---
    exportBtn.addEventListener('click', exportarDados);
    importBtn.addEventListener('click', () => importFileInput.click());
    importFileInput.addEventListener('change', importarDados);
    
    // --- INICIALIZAÇÃO GERAL ---
    carregarDB();
    renderizarTudo();
    popularFiltrosDeData();
    setDateTimeAtual(vendaDataInput, vendaHorarioInput);
    setDateTimeAtual(outraDataInput, outraHorarioInput);
}); 
