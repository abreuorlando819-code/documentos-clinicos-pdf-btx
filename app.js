(() => {
  const $ = (id) => document.getElementById(id);

  /* =========================
     ESTADO DO PROFISSIONAL
  ========================== */
  const prof = {
    nome: "",
    conselho: "",
    tel: "",
    cidade: "Belém/PA",
    end: ""
  };

  /* =========================
     DATA PADRÃO
  ========================== */
  function todayISO() {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  }

  ["f_data", "r_data", "o_data", "a_data", "l_data"].forEach(id => {
    const el = $(id);
    if (el) el.value = todayISO();
  });

  /* =========================
     NAVEGAÇÃO
  ========================== */
  const views = {
    ficha: $("view-ficha"),
    receita: $("view-receita"),
    orcamento: $("view-orcamento"),
    atestado: $("view-atestado"),
    laudo: $("view-laudo"),
  };

  document.querySelectorAll(".navBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      const view = btn.dataset.view;
      Object.entries(views).forEach(([k, el]) => {
        el.classList.toggle("hidden", k !== view);
      });
      document.querySelectorAll(".navBtn").forEach(b =>
        b.classList.toggle("active", b === btn)
      );
    });
  });

  /* =========================
     MODAL PROFISSIONAL
  ========================== */
  const modal = $("modal");

  $("btnSettings").onclick = () => {
    $("p_nome").value = prof.nome;
    $("p_conselho").value = prof.conselho;
    $("p_tel").value = prof.tel;
    $("p_cidade").value = prof.cidade;
    $("p_end").value = prof.end;
    modal.classList.remove("hidden");
  };

  $("closeModal").onclick = () => modal.classList.add("hidden");
  $("cancelSettings").onclick = () => modal.classList.add("hidden");

  $("saveSettings").onclick = () => {
    prof.nome = $("p_nome").value.trim();
    prof.conselho = $("p_conselho").value.trim();
    prof.tel = $("p_tel").value.trim();
    prof.cidade = $("p_cidade").value.trim() || "Belém/PA";
    prof.end = $("p_end").value.trim();
    modal.classList.add("hidden");
  };

  /* =========================
     TEXTO DO PROFISSIONAL
  ========================== */
  function profLine() {
    return [
      prof.nome,
      prof.conselho,
      prof.tel ? `Tel: ${prof.tel}` : "",
      prof.end,
      prof.cidade
    ].filter(Boolean).join(" • ");
  }

  /* =========================
     PDF SIMPLES
  ========================== */
  function gerarPDF(titulo, linhas, nomeArquivo) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text(titulo, 14, 20);

    doc.setFontSize(10);
    doc.text(profLine() || "Dados do profissional", 14, 28);

    let y = 40;
    doc.setFontSize(11);

    linhas.forEach(l => {
      doc.text(l, 14, y);
      y += 6;
    });

    doc.save(nomeArquivo);
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
    `Motivo: ${$("f_motivo").value || "-"}`,
    "",
    "ANAMNESE:",
    $("f_anamnese").value || "-",
    "",
    "PROCEDIMENTO REALIZADO:",
    $("f_realizado").value || "-",
    "",
    "PLANO:",
    $("f_plano").value || "-",
    "",
    "OBSERVAÇÕES:",
    $("f_obs").value || "-"
  ];

  const receita = () => [
    `Paciente: ${$("r_nome").value || "-"}`,
    `Data: ${$("r_data").value || "-"}`,
    "",
    "PRESCRIÇÃO:",
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

  /* =========================
     BOTÕES PDF
  ========================== */
  $("pdfFicha").onclick = () => gerarPDF("FICHA CLÍNICA", ficha(), "ficha.pdf");
  $("pdfReceita").onclick = () => gerarPDF("RECEITUÁRIO", receita(), "receita.pdf");
  $("pdfOrc").onclick = () => gerarPDF("ORÇAMENTO", orcamento(), "orcamento.pdf");
  $("pdfAtestado").onclick = () => gerarPDF("ATESTADO", atestado(), "atestado.pdf");
  $("pdfLaudo").onclick = () => gerarPDF("LAUDO", laudo(), "laudo.pdf");
})();
