let usuarioLogado = false;
let carrinho = [];
let currentProduct = null;
let carouselIndex = 0;
let selectedSize = '';
let selectedColor = '';
let slideAtual = 0;

let dadosUsuario = {
    nome: "",
    telefone: "",
    endereco: ""
};

const produtosDestaqueIds = [1, 2]; // IDs que aparecerão no banner superior

const db_produtos = [
    { 
        id: 1, 
        nome: "Conjunto Top e Legging Azul", 
        preco: 80.00, 
        cat: "academia", 
        imgs: ["img_produtos/conj_leg_azul.jpeg", "img_produtos/conj_leg_rosa.jpeg"], 
        cores: [
            { nome: "Azul Bebê", hex: "#87CEEB" },
            { nome: "Rosa Choque", hex: "#FF1493" }
        ],
        tamanhos: ["P", "M", "G"],
        descricao: "Tecido premium com alta elasticidade e toque gelado." 
    },
    { 
        id: 2, 
        nome: "Biquíni Cortininha", 
        preco: 120.00, 
        cat: "praia", 
        imgs: ["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800"], 
        cores: [
            { nome: "Preto", hex: "#000000" },
            { nome: "Branco", hex: "#ffffff" },
            { nome: "Amarelo", hex: "#FFFF00" }
        ],
        tamanhos: ["PP", "P", "M"],
        descricao: "Modelagem perfeita para o bronzeado." 
    }
];

/* ==========================================================
   2. INICIALIZAÇÃO E NAVEGAÇÃO
   ========================================================== */
window.onload = () => { 
    renderizar(db_produtos); 
    inicializarBannerDestaque(); 
};

function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
        page.style.display = 'none';
    });

    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        targetPage.style.display = 'block';
        window.scrollTo(0, 0);
    }
}

function checkAuth(pageId) {
    if (!usuarioLogado) {
        alert("Ops! 🌸 Você precisa entrar ou se cadastrar para continuar.");
        showPage('authPage');
    } else {
        showPage(pageId);
        if(pageId === 'cartPage') atualizarCarrinhoUI();
    }
}

/* ==========================================================
   3. BANNER / CARROSSEL PRINCIPAL
   ========================================================== */
function inicializarBannerDestaque() {
    const container = document.getElementById('sliderContainer');
    const dotsContainer = document.getElementById('sliderDots');
    if (!container || !dotsContainer) return;

    const destaques = db_produtos.filter(p => produtosDestaqueIds.includes(p.id));

    container.innerHTML = destaques.map(prod => `
        <div class="slide-item" onclick="verProduto(${prod.id})">
            <img src="${prod.imgs[0]}" class="slide-bg">
            <img src="${prod.imgs[0]}" class="slide-img">
        </div>
    `).join('');

    dotsContainer.innerHTML = destaques.map((_, idx) => `
        <div class="dot ${idx === 0 ? 'active' : ''}" onclick="irParaSlide(${idx})"></div>
    `).join('');

    setInterval(proximoSlide, 5000);
}

function proximoSlide() {
    const totalSlides = produtosDestaqueIds.length;
    slideAtual = (slideAtual + 1) % totalSlides;
    atualizarPosicaoSlider();
}

function irParaSlide(idx) {
    slideAtual = idx;
    atualizarPosicaoSlider();
}

function atualizarPosicaoSlider() {
    const container = document.getElementById('sliderContainer');
    const dots = document.querySelectorAll('.dot');
    if (container) container.style.transform = `translateX(-${slideAtual * 100}%)`;
    dots.forEach((dot, idx) => dot.classList.toggle('active', idx === slideAtual));
}

/* ==========================================================
   4. VITRINE E FILTROS
   ========================================================== */
function renderizar(lista) {
    const grid = document.getElementById('productGrid');
    if(!grid) return;
    grid.innerHTML = lista.map(p => `
        <div class="card" onclick="verProduto(${p.id})">
            <img src="${p.imgs[0]}">
            <div class="card-info">
                <h4>${p.nome}</h4>
                <p>R$ ${p.preco.toFixed(2)}</p>
            </div>
        </div>
    `).join('');
}

function filtrar(cat, btn) {
    if(btn) {
        document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
    }
    const filtrados = cat === 'all' ? db_produtos : db_produtos.filter(p => p.cat === cat);
    renderizar(filtrados);
}

/* ==========================================================
   5. DETALHES DO PRODUTO
   ========================================================== */
function verProduto(id) {
    currentProduct = db_produtos.find(p => p.id === id);
    selectedSize = ''; 
    carouselIndex = 0;

    document.getElementById('detNome').innerText = currentProduct.nome;
    document.getElementById('detPreco').innerText = currentProduct.preco.toFixed(2);
    document.getElementById('detDescricao').innerText = currentProduct.descricao;
    document.getElementById('detCat').innerText = currentProduct.cat;

    // Cores
    const colorContainer = document.querySelector('.color-options');
    if (currentProduct.cores) {
        selectedColor = currentProduct.cores[0].nome;
        document.getElementById('selectedColorName').innerText = selectedColor;
        colorContainer.innerHTML = currentProduct.cores.map((cor, idx) => `
            <div class="color-swatch ${idx === 0 ? 'active' : ''}" 
                 style="background: ${cor.hex}" 
                 onclick="selectColor(this, '${cor.nome}')"></div>
        `).join('');
    }

    // Tamanhos
    const sizeContainer = document.querySelector('.size-selector-grid');
    sizeContainer.innerHTML = currentProduct.tamanhos.map(tam => `
        <button class="size-btn" onclick="selectSize(this)">${tam}</button>
    `).join('');

    // Carrossel de Fotos do Produto
    const track = document.getElementById('productCarousel');
    track.innerHTML = currentProduct.imgs.map(img => `<img src="${img}">`).join('');
    track.style.transform = `translateX(0)`;

    showPage('productDetailsPage');
}

function selectColor(el, cor) {
    document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
    el.classList.add('active');
    selectedColor = cor;
    document.getElementById('selectedColorName').innerText = cor;
}

function selectSize(btn) {
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedSize = btn.innerText;
}

function moveCarousel(dir) {
    const total = currentProduct.imgs.length;
    carouselIndex = (carouselIndex + dir + total) % total;
    document.getElementById('productCarousel').style.transform = `translateX(-${carouselIndex * 100}%)`;
}

/* ==========================================================
   6. CARRINHO E COMPRA
   ========================================================== */
function adicionarAoCarrinhoComOpcoes() {
    if (!usuarioLogado) {
        alert("Você precisa estar logada para comprar! 💕");
        return showPage('authPage');
    }
    if (!selectedSize) return alert("Por favor, selecione um tamanho.");

    carrinho.push({ ...currentProduct, tamanho: selectedSize, cor: selectedColor });
    atualizarCarrinhoUI();
    alert("Adicionado à sacola! 🛍️");
}

function removerItem(index) {
    carrinho.splice(index, 1);
    atualizarCarrinhoUI();
}

function limparSacola() {
    if (carrinho.length === 0) return;
    if (confirm("Deseja esvaziar sua sacola? 🛍️")) {
        carrinho = [];
        atualizarCarrinhoUI();
    }
}

function atualizarCarrinhoUI() {
    const count = document.getElementById('cartCount');
    if(count) count.innerText = carrinho.length;

    const list = document.getElementById('cartList');
    if(!list) return;

    if (carrinho.length === 0) {
        list.innerHTML = `<p style="text-align:center; color:#999; margin: 30px 0;">Sua sacola está vazia... 🌸</p>`;
        document.getElementById('totalPrice').innerText = "R$ 0,00";
        return;
    }

    // Sincroniza campos de entrega
    document.getElementById('cartEntregaNome').value = dadosUsuario.nome;
    document.getElementById('cartEntregaTelefone').value = dadosUsuario.telefone;
    document.getElementById('cartEntregaEndereco').value = dadosUsuario.endereco;

    let total = 0;
    list.innerHTML = carrinho.map((item, index) => {
        total += item.preco;
        return `
            <div class="cart-item" style="display:flex; justify-content:space-between; align-items:center; background:#fdfdfd; padding:12px; border-radius:12px; margin-bottom:10px; border:1px solid #f0f0f0;">
                <div style="display:flex; align-items:center; gap:12px;">
                    <img src="${item.imgs[0]}" style="width:55px; height:55px; object-fit:cover; border-radius:8px;">
                    <div>
                        <h4 style="font-size:14px; margin:0; color:#333;">${item.nome}</h4>
                        <small style="color:#888;">${item.cor} | Tam: ${item.tamanho}</small>
                        <p style="margin:0; font-weight:700; color:var(--rosa);">R$ ${item.preco.toFixed(2)}</p>
                    </div>
                </div>
                <button onclick="removerItem(${index})" style="background:none; border:none; color:#ff4d4d; cursor:pointer;">
                    <i class="fas fa-times-circle"></i>
                </button>
            </div>`;
    }).join('');

    document.getElementById('totalPrice').innerText = `R$ ${total.toFixed(2)}`;
}

/* ==========================================================
   7. AUTENTICAÇÃO E PERFIL
   ========================================================== */
function executarAuth() {
    const nome = document.getElementById('authNome').value;
    const email = document.getElementById('authEmail').value;
    const senha = document.getElementById('authSenha').value;

    if (!nome || !email || !senha) {
        alert("Preencha todos os campos! 💕");
        return;
    }

    usuarioLogado = true;
    dadosUsuario.nome = nome;
    document.getElementById('profNome').value = nome;

    alert(`Bem-vinda, ${nome}! ✨`);
    showPage('homePage');
}

function salvarPerfil() {
    dadosUsuario.nome = document.getElementById('profNome').value;
    dadosUsuario.telefone = document.getElementById('profTelefone').value;
    dadosUsuario.endereco = document.getElementById('profEndereco').value;

    alert("Dados de entrega salvos! 💖");
    showPage('homePage');
}

/* ==========================================================
   8. PAGAMENTO E FINALIZAÇÃO
   ========================================================== */
function irParaPagamento() {
    if (carrinho.length === 0) return alert("Sua sacola está vazia! 🛍️");

    const nome = document.getElementById('cartEntregaNome').value;
    const tel = document.getElementById('cartEntregaTelefone').value;
    const end = document.getElementById('cartEntregaEndereco').value;

    if (!nome || !tel || !end) {
        alert("⚠️ Por favor, preencha os dados de entrega na sacola!");
        return;
    }

    dadosUsuario = { nome, telefone: tel, endereco: end };
    document.getElementById('payTotal').innerText = document.getElementById('totalPrice').innerText;
    showPage('paymentPage');
}

function togglePaymentFields() {
    const metodo = document.querySelector('input[name="payMethod"]:checked').value;
    document.getElementById('pixArea').style.display = (metodo === 'pix') ? 'block' : 'none';
    document.getElementById('cardForm').style.display = (metodo === 'cartao') ? 'flex' : 'none';
}

function confirmarPagamentoFinal() {
    const metodo = document.querySelector('input[name="payMethod"]:checked').value;
    const btn = document.getElementById('btnFinalizar');

    if (metodo === 'cartao') {
        if (!document.getElementById('cardName').value || !document.getElementById('cardNumber').value) {
            return alert("⚠️ Preencha os dados do cartão.");
        }
    }

    btn.disabled = true;
    btn.innerText = "PROCESSANDO...";

    setTimeout(() => {
        alert("✅ Pagamento Confirmado!");
        alert(`Obrigada, ${dadosUsuario.nome}! Seu pedido será enviado para: ${dadosUsuario.endereco}`);
        carrinho = [];
        atualizarCarrinhoUI();
        btn.disabled = false;
        btn.innerText = "CONFIRMAR PAGAMENTO";
        showPage('homePage');
    }, 3000);
}

function toggleEnvioFields() {
    const tipo = document.querySelector('input[name="tipoEnvio"]:checked').value;
    const entrega = document.getElementById('camposEntrega');
    const retirada = document.getElementById('camposRetirada');

    if (tipo === 'entrega') {
        entrega.style.display = 'block';
        retirada.style.display = 'none';
    } else {
        entrega.style.display = 'none';
        retirada.style.display = 'block';
    }
}

// Atualização da função de ir para o pagamento
function irParaPagamento() {
    if (carrinho.length === 0) return alert("Sua sacola está vazia! 🛍️");

    const tipoEnvio = document.querySelector('input[name="tipoEnvio"]:checked').value;

    if (tipoEnvio === 'entrega') {
        const nome = document.getElementById('cartEntregaNome').value;
        const tel = document.getElementById('cartEntregaTelefone').value;
        const end = document.getElementById('cartEntregaEndereco').value;

        if (!nome || !tel || !end) {
            alert("⚠️ Por favor, preencha todos os dados de entrega!");
            return;
        }
        dadosUsuario = { tipo: "Entrega", nome, telefone: tel, endereco: end };
    } else {
        const nomeRetirada = document.getElementById('cartRetiradaNome').value;
        const filial = document.getElementById('selectFilial').value;

        if (!nomeRetirada) {
            alert("⚠️ Por favor, informe quem irá retirar o pedido!");
            return;
        }
        dadosUsuario = { 
            tipo: "Retirada na Loja", 
            nome: nomeRetirada, 
            telefone: "N/A", 
            endereco: "Filial " + filial 
        };
    }

    // Atualiza o valor na tela de pagamento
    document.getElementById('payTotal').innerText = document.getElementById('totalPrice').innerText;
    showPage('paymentPage');
}

// Opcional: Ajustar a confirmação final para mostrar o local correto
    function confirmarPagamentoFinal() {
        // ... sua lógica de validação de cartão ou pix ...

        const total = document.getElementById('totalPrice').innerText;
        const info = window.dadosPedido;

        let mensagem = `*NOVO PEDIDO - SANIA MODAS*%0A%0A`;
        mensagem += `*Tipo:* ${info.tipo}%0A`;
        mensagem += `*Cliente:* ${info.nome}%0A`;
        mensagem += `*Local:* ${info.local}%0A`;
        mensagem += `*Total:* ${total}%0A%0A`;
        mensagem += `_Aguardando validação do pagamento._`;

        // Exemplo de link para WhatsApp (substitua pelo seu número)
        const foneLoja = "5521999999999"; 
        window.open(`https://wa.me/${foneLoja}?text=${mensagem}`);

        alert("Pedido finalizado com sucesso!");
        carrinho = [];
        atualizarCarrinhoUI();
        showPage('homePage');
}
