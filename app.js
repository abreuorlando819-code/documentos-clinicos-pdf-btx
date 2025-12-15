document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     UTILITÁRIOS
  ========================== */
  const $ = (id) => document.getElementById(id);

  function todayISO() {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  }

  /* =========================
     ESTADO DO PROFISSIONAL
  ========================== */
  const profissional = {
    nome: "",
    conselho: "",
    telefone: "",
    cidade: "Belém/PA",
    endereco: ""
  };

  function profissionalLinha() {
    return [
      profissional.nome,
      profissional.conselho,
      profissional.telefone ? `Tel: ${profissional.telefone}` : "",
      profissional.endereco,
      profissional.cidade
    ].filter(Boolean).join(" • ");
  }

  /* =========================
     DATAS PADRÃO
  ========================== */
  ["f_data", "r_data", "o_data", "a_data", "l_data"].forEach(id => {
    const el = $(id);
    if (el) el.value = todayISO();
  });

  /* =========================
     NAVEGAÇÃO ENTRE MÓDULOS
  ========================== */
  const views = {
    ficha: $("view-ficha"),
    receita: $("view-receita"),
    orcamento: $("view-orcamento"),
    atestado: $("view-atestado"),
    laudo: $("view-laudo")
  };

  function mostrarView(nome) {
    Object.entries(views).forEach(([k, el]) => {
      if (el) el.classList.toggle("hidden", k !== nome);
    });

    document.querySelectorAll(".navBtn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.view === nome);
    });
  }

  document.querySelectorAll(".navBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      mostrarView(btn.dataset.view);
    });
  });

  /* =========================
     MODAL PROFISSIONAL
  ========================== */
  const modal = $("modal");

  if ($("btnSettings")) {
    $("btnSettings").onclick = () => {
      $("p_nome").value = profissional.nome;
      $("p_conselho").value = profissional.conselho;
      $("p_tel").value = profissional.telefone;
      $("p_cidade").value = profissional.cidade;
      $("p_end").value = profissional.endereco;
      modal.classList.remove("hidden");
    };
  }

  if ($("closeModal")) $("closeModal").onclick = () => modal.classList.add("hidden");
  if ($("cancelSettings")) $("cancelSettings").onclick = () => modal.classList.add("hidden");

  if ($("saveSettings")) {
    $("saveSettings").onclick = () => {
      profissional.nome = $("p_nome").value.trim();
      profissional.conselho = $("p_conselho").value.trim();
      profissional.telefone = $("p_tel").value.trim();
      profissional.cidade = $("p_cidade").value.trim() || "Belém/PA";
      profissional.endereco = $("p_end").value.trim();
      modal.classList.add("hidden");
    };
  }

  /* =========================
     RECEITA – BOTÕES RÁPIDOS
  ========================== */
  function escreverReceita(texto) {
    const campo = $("r_texto");
    if (!campo) return;
    campo.value = campo.value ? campo.value + "\n\n" + texto : texto;
  }

  if ($("btnDipirona")) $("btnDipirona").onclick = () =>
    escreverReceita("DIPIRONA 1g\nTomar 1 comprimido a cada 6/6 horas, se dor, por 3 dias.");

  if ($("btnIbu")) $("btnIbu").onclick = () =>
    escreverReceita("IBUPROFENO 600mg\nTomar 1 comprimido a cada 8/8 horas, após alimentação, por 3 dias.");

  if ($("btnAmox")) $("btnAmox").onclick = () =>
    escreverReceita("AMOXICILINA 500mg\nTomar 1 cápsula a cada 8/8 horas, por 7 dias.");

  if ($("btnLimparReceita")) $("btnLimparReceita").onclick = () => {
    $("r_texto").value = "";
  };

  /* =========================
     NOVO PACIENTE
  ========================== */
  if ($("btnNovoFicha")) {
    $("btnNovoFicha").onclick = () => {
      if (!confirm("Iniciar novo paciente?")) return;
      document.querySelectorAll("input, textarea").forEach(el => {
        if (el.type !== "date") el.value = "";
      });
      ["f_data", "r_data", "o_data", "a_data", "l_data"].forEach(id => {
        const el = $(id);
        if (el) el.value = todayISO();
      });
      mostrarView("ficha");
    };
  }

  /* =========================
     PDF (jsPDF)
  ========================== */
  function gerarPDF(titulo, linhas, arquivo) {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      alert("jsPDF não carregou.");
      return;
    }

    const doc = new window.jspdf.jsPDF();
    let y = 20;

    doc.setFontSize(14);
    doc.text(titulo, 14, y);
    y += 8;

    doc.setFontSize(10);
    doc.text(profissionalLinha() || "Dados do profissional", 14, y);
    y += 10;

    doc.setFontSize(11);
    linhas.forEach(l => {
      doc.text(l, 14, y);
      y += 6;
    });

    doc.save(arquivo);
  }

  /* =========================
     COLETA DE DADOS
  ========================== */
  const ficha = () => [
    `Paciente: ${$("f_nome").value || "-"}`,
    `Data: ${$("f_data").value || "-"}`,
    `Nascimento: ${$("f_nasc").value || "-"}`,
    `Telefone: ${$("f_tel").value || "-"}`,
    `Endereço: ${$("f_end").value || "-"}`,
    "",
    "ANAMNESE:",
    $("f_anamnese").value || "-",
    "",
    "PROCEDIMENTO REALIZADO:",
    $("f_realizado").value || "-",
    "",
    "PLANO:",
    $("f_plano").value || "-"
  ];

  const receita = () => [
    `Paciente: ${$("r_nome").value || "-"}`,
    `Data: ${$("r_data").value || "-"}`,
    "",
    $("r_texto").value || "-"
  ];

  const orcamento = () => [
    `Paciente: ${$("o_nome").value || "-"}`,
    `Data: ${$("o_data").value || "-"}`,
    "",
    $("o_texto").value || "-"
  ];

  const atestado = () => [
    `Paciente: ${$("a_nome").value || "-"}`,
    `Data: ${$("a_data").value || "-"}`,
    "",
    $("a_texto").value || "-"
  ];

  const laudo = () => [
    `Paciente: ${$("l_nome").value || "-"}`,
    `Data: ${$("l_data").value || "-"}`,
    "",
    $("l_texto").value || "-"
  ];

  if ($("pdfFicha")) $("pdfFicha").onclick = () => gerarPDF("FICHA CLÍNICA", ficha(), "ficha.pdf");
  if ($("pdfReceita")) $("pdfReceita").onclick = () => gerarPDF("RECEITUÁRIO", receita(), "receita.pdf");
  if ($("pdfOrc")) $("pdfOrc").onclick = () => gerarPDF("ORÇAMENTO", orcamento(), "orcamento.pdf");
  if ($("pdfAtestado")) $("pdfAtestado").onclick = () => gerarPDF("ATESTADO", atestado(), "atestado.pdf");
  if ($("pdfLaudo")) $("pdfLaudo").onclick = () => gerarPDF("LAUDO", laudo(), "laudo.pdf");

  /* =========================
     START
  ========================== */
  mostrarView("ficha");

});
