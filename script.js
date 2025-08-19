document.addEventListener('DOMContentLoaded', () => {

    const STORAGE_KEY = 'borDrinkFinanceiro';

    // --- SELEÇÃO DOS ELEMENTOS DO DOM ---
    const tipoRegistroSelect = document.getElementById('tipo-registro');
    const dataInput = document.getElementById('data-input');
    const aporteSocioDiv = document.getElementById('aporte-socio-div');
    const registroForm = document.getElementById('registro-form');
    const descricaoInput = document.getElementById('descricao-input');
    const valorInput = document.getElementById('valor-input');
    const socioSelect = document.getElementById('socio-select');
    const transacoesBody = document.getElementById('transacoes-body');
    const totalInvestidoEuSpan = document.getElementById('total-investido-eu');
    const totalInvestidoVovoSpan = document.getElementById('total-investido-vovo');
    const mesSelect = document.getElementById('mes-select');
    const anoSelect = document.getElementById('ano-select');
    const fechamentoBtn = document.getElementById('fechamento-btn');
    const fechamentoResultado = document.getElementById('fechamento-resultado');
    const exportBtn = document.getElementById('export-btn');
    const importBtn = document.getElementById('import-btn');
    const importFileInput = document.getElementById('import-file-input');
    
    // --- FUNÇÕES DE DADOS (localStorage) ---
    const carregarTransacoes = () => JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    const salvarTransacoes = (transacoes) => localStorage.setItem(STORAGE_KEY, JSON.stringify(transacoes));

    // --- FUNÇÕES DE RENDERIZAÇÃO E ATUALIZAÇÃO ---
    const formatarMoeda = (valor) => `R$ ${valor.toFixed(2).replace('.', ',')}`;
    const formatarData = (dataISO) => new Date(dataISO).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

    const renderizarTudo = () => {
        renderizarTransacoes();
        atualizarPainelSocios();
    }

    const atualizarPainelSocios = () => {
        const transacoes = carregarTransacoes();
        const aportesEu = transacoes.filter(t => t.tipo === 'aporte' && t.socio === 'eu').reduce((acc, t) => acc + t.valor, 0);
        const aportesVovo = transacoes.filter(t => t.tipo === 'aporte' && t.socio === 'vovo').reduce((acc, t) => acc + t.valor, 0);
        totalInvestidoEuSpan.textContent = formatarMoeda(aportesEu);
        totalInvestidoVovoSpan.textContent = formatarMoeda(aportesVovo);
    };

    const renderizarTransacoes = () => {
        transacoesBody.innerHTML = '';
        const transacoes = carregarTransacoes();
        transacoes.sort((a, b) => new Date(b.data) - new Date(a.data));
        transacoes.forEach(t => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="tipo-${t.tipo}">${t.tipo.charAt(0).toUpperCase() + t.tipo.slice(1)} ${t.socio ? `(${t.socio})` : ''}</td>
                <td>${t.descricao}</td>
                <td>${formatarMoeda(t.valor)}</td>
                <td>${formatarData(t.data)}</td>
                <td><button class="delete-btn" data-id="${t.id}">X</button></td>
            `;
            transacoesBody.appendChild(tr);
        });
    };

    // --- FUNÇÃO DE FECHAMENTO MENSAL (ATUALIZADA) ---
    const gerarFechamento = () => {
        const mes = parseInt(mesSelect.value);
        const ano = parseInt(anoSelect.value);
        const transacoes = carregarTransacoes();
        const transacoesDoMes = transacoes.filter(t => { const data = new Date(t.data); return data.getUTCMonth() === mes && data.getUTCFullYear() === ano; });

        const vendasDoMes = transacoesDoMes.filter(t => t.tipo === 'venda');
        const custosDoMes = transacoesDoMes.filter(t => t.tipo === 'custo');

        const faturamento = vendasDoMes.reduce((acc, t) => acc + t.valor, 0);
        const custos = custosDoMes.reduce((acc, t) => acc + t.valor, 0);
        const lucroBruto = faturamento - custos;

        const dataFimDoMes = new Date(Date.UTC(ano, mes + 1, 0));
        const aportesAteOMes = transacoes.filter(t => t.tipo === 'aporte' && new Date(t.data) <= dataFimDoMes);
        const totalInvestidoEu = aportesAteOMes.filter(t => t.socio === 'eu').reduce((acc, t) => acc + t.valor, 0);
        const totalInvestidoVovo = aportesAteOMes.filter(t => t.socio === 'vovo').reduce((acc, t) => acc + t.valor, 0);
        const capitalTotal = totalInvestidoEu + totalInvestidoVovo;
        const participacaoEu = capitalTotal > 0 ? (totalInvestidoEu / capitalTotal) : 0;
        const participacaoVovo = capitalTotal > 0 ? (totalInvestidoVovo / capitalTotal) : 0;
        const lucroEu = lucroBruto > 0 ? lucroBruto * participacaoEu : 0;
        const lucroVovo = lucroBruto > 0 ? lucroBruto * participacaoVovo : 0;
        const prejuizo = lucroBruto < 0 ? lucroBruto : 0;

        let relatorioHTML = `<h3>Fechamento de ${mesSelect.options[mesSelect.selectedIndex].text} de ${ano}</h3>`;

        // Detalhamento de Vendas
        relatorioHTML += `<h4>Detalhes de Vendas (${formatarMoeda(faturamento)})</h4>`;
        if (vendasDoMes.length > 0) {
            relatorioHTML += '<ul>';
            vendasDoMes.forEach(v => {
                relatorioHTML += `<li>[${formatarData(v.data)}] ${v.descricao}: <strong>${formatarMoeda(v.valor)}</strong></li>`;
            });
            relatorioHTML += '</ul>';
        } else {
            relatorioHTML += '<p>Nenhuma venda registrada neste mês.</p>';
        }

        // Detalhamento de Custos
        relatorioHTML += `<h4>Detalhes de Custos (${formatarMoeda(custos)})</h4>`;
        if (custosDoMes.length > 0) {
            relatorioHTML += '<ul>';
            custosDoMes.forEach(c => {
                relatorioHTML += `<li>[${formatarData(c.data)}] ${c.descricao}: <strong>${formatarMoeda(c.valor)}</strong></li>`;
            });
            relatorioHTML += '</ul>';
        } else {
            relatorioHTML += '<p>Nenhum custo registrado neste mês.</p>';
        }

        // Resumo Financeiro e Divisão
        relatorioHTML += `<hr><p><strong>Lucro/Prejuízo do Mês:</strong> <strong class="${lucroBruto >= 0 ? 'tipo-venda' : 'tipo-custo'}">${formatarMoeda(lucroBruto)}</strong></p><hr>
        <h4>Divisão do Lucro Baseada no Capital Investido:</h4>
        <p>Sua Participação (${(participacaoEu * 100).toFixed(2)}%): <strong>${formatarMoeda(lucroEu)}</strong></p>
        <p>Participação da Vovó (${(participacaoVovo * 100).toFixed(2)}%): <strong>${formatarMoeda(lucroVovo)}</strong></p>
        ${prejuizo < 0 ? `<p class="tipo-custo">Atenção: O mês fechou com prejuízo de ${formatarMoeda(prejuizo)}.</p>` : ''}`;
        
        fechamentoResultado.innerHTML = relatorioHTML;
    };
    
    // --- EVENT LISTENERS ---
    registroForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const dataSelecionada = new Date(dataInput.value + 'T12:00:00');
        const novaTransacao = {
            id: Date.now(),
            tipo: tipoRegistroSelect.value,
            descricao: descricaoInput.value,
            valor: parseFloat(valorInput.value),
            data: dataSelecionada.toISOString()
        };
        if (novaTransacao.tipo === 'aporte') {
            novaTransacao.socio = socioSelect.value;
        }
        const transacoes = carregarTransacoes();
        transacoes.push(novaTransacao);
        salvarTransacoes(transacoes);
        registroForm.reset();
        setDataParaHoje();
        aporteSocioDiv.classList.add('hidden');
        renderizarTudo();
    });
    // --- Restante do código (é o mesmo de antes, cole-o aqui) ---
    transacoesBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const idParaDeletar = parseInt(e.target.getAttribute('data-id'));
            let transacoes = carregarTransacoes();
            const transacaoRemovida = transacoes.find(t => t.id === idParaDeletar);
            if (transacaoRemovida && transacaoRemovida.descricao === 'Investimento Inicial') {
                alert('Não é possível remover o investimento inicial!'); return;
            }
            transacoes = transacoes.filter(t => t.id !== idParaDeletar);
            salvarTransacoes(transacoes);
            renderizarTudo();
        }
    });
    tipoRegistroSelect.addEventListener('change', () => {
        aporteSocioDiv.classList.toggle('hidden', tipoRegistroSelect.value !== 'aporte');
    });
    const inicializarDados = () => {
        let transacoes = carregarTransacoes();
        if (!transacoes.some(t => t.descricao === 'Investimento Inicial')) {
            const dataInicial = new Date().toISOString();
            transacoes.push({ id: Date.now(), tipo: 'aporte', socio: 'eu', descricao: 'Investimento Inicial', valor: 550, data: dataInicial });
            transacoes.push({ id: Date.now() + 1, tipo: 'aporte', socio: 'vovo', descricao: 'Investimento Inicial', valor: 550, data: dataInicial });
            salvarTransacoes(transacoes);
        }
    };
    const popularFiltrosDeData = () => {
        const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        meses.forEach((mes, index) => { mesSelect.innerHTML += `<option value="${index}">${mes}</option>`; });
        const anoAtual = new Date().getFullYear();
        for (let ano = anoAtual; ano >= 2022; ano--) { anoSelect.innerHTML += `<option value="${ano}">${ano}</option>`;}
        mesSelect.value = new Date().getMonth();
        anoSelect.value = anoAtual;
    };
    const setDataParaHoje = () => {
        const hoje = new Date();
        dataInput.value = hoje.toISOString().split('T')[0];
    };
    const exportarDados = () => {
        const transacoes = localStorage.getItem(STORAGE_KEY);
        if (!transacoes || transacoes === '[]') { alert('Não há dados para exportar!'); return; }
        const blob = new Blob([transacoes], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const hoje = new Date().toISOString().split('T')[0];
        a.href = url; a.download = `backup-bor-drink-${hoje}.json`;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); URL.revokeObjectURL(url);
    };
    const importarDados = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const dados = JSON.parse(e.target.result);
                if (!Array.isArray(dados)) throw new Error('Arquivo inválido.');
                if (confirm('Atenção! Isso irá substituir TODOS os dados atuais. Deseja continuar?')) {
                    salvarTransacoes(dados);
                    location.reload(); 
                }
            } catch (error) { alert('Erro ao ler o arquivo.'); console.error(error); }
        };
        reader.readAsText(file);
    };
    fechamentoBtn.addEventListener('click', gerarFechamento);
    exportBtn.addEventListener('click', exportarDados);
    importBtn.addEventListener('click', () => importFileInput.click());
    importFileInput.addEventListener('change', importarDados);
    inicializarDados();
    popularFiltrosDeData();
    setDataParaHoje();
    renderizarTudo();
});
