(() => {
  const $ = (id) => document.getElementById(id);

  // Dados do profissional (dentista)
  const prof = {
    nome: "",
    conselho: "",
    tel: "",
    cidade: "Belém/PA",
    end: ""
  };

  // Função para coletar e atualizar os dados do profissional
  function updateProfData() {
    prof.nome = $("p_nome").value.trim();
    prof.conselho = $("p_conselho").value.trim();
    prof.tel = $("p_tel").value.trim();
    prof.cidade = $("p_cidade").value.trim() || "Belém/PA";
    prof.end = $("p_end").value.trim();
  }

  // Atualiza os dados do profissional no modal
  const modal = $("modal");
  $("btnSettings").addEventListener("click", () => {
    $("p_nome").value = prof.nome;
    $("p_conselho").value = prof.conselho;
    $("p_tel").value = prof.tel;
    $("p_cidade").value = prof.cidade;
    $("p_end").value = prof.end;
    modal.classList.remove("hidden");
  });

  function closeModal() {
    modal.classList.add("hidden");
  }
  $("closeModal").addEventListener("click", closeModal);
  $("cancelSettings").addEventListener("click", closeModal);

  $("saveSettings").addEventListener("click", () => {
    updateProfData();
    closeModal();
  });

  // Atualizar a data nos formulários
  const todayISO = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const da = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${da}`;
  };

  // Inicializa datas
  ["f_data", "r_data", "o_data", "a_data", "l_data"].forEach(id => {
    const el = $(id);
    if (el) el.value = todayISO();
  });

  // Funções para gerar as linhas de cada documento
  function linesFicha() {
    return [
      `Paciente: ${$("f_nome").value || "-"}`,
      `Data: ${$("f_data").value || "-"}`,
      `Nascimento: ${$("f_nasc").value || "-"}`,
      `Telefone: ${$("f_tel").value || "-"}`,
      `Endereço: ${$("f_end").value || "-"}`,
      "",
      `Motivo da consulta: ${$("f_motivo").value || "-"}`,
      "",
      "ANAMNESE:",
      $("f_anamnese").value || "-",
      "",
      "PROCEDIMENTO REALIZADO HOJE:",
      $("f_realizado").value || "-",
      "",
      "PLANO / PROCEDIMENTOS A REALIZAR:",
      $("f_plano").value || "-",
      "",
      "OBSERVAÇÕES:",
      $("f_obs").value || "-",
    ];
  }

  function linesReceita() {
    return [
      `Paciente: ${$("r_nome").value || "-"}`,
      `Data: ${$("r_data").value || "-"}`,
      `Endereço: ${$("r_end").value || "-"}`,
      "",
      "PRESCRIÇÃO:",
      $("r_texto").value || "-",
      "",
      `Dentista: ${prof.nome || "-"}`,
      `Conselho: ${prof.conselho || "-"}`,
      `Telefone: ${prof.tel || "-"}`,
      `Endereço: ${prof.end || "-"}`,
      `Cidade: ${prof.cidade || "Belém/PA"}`,
    ];
  }

  function linesOrc() {
    return [
      `Paciente: ${$("o_nome").value || "-"}`,
      `Data: ${$("o_data").value || "-"}`,
      "",
      "DESCRIÇÃO DO ORÇAMENTO:",
      $("o_texto").value || "-",
      "",
      "OBSERVAÇÕES:",
      $("o_obs").value || "-",
    ];
  }

  function linesAtestado() {
    return [
      `Paciente: ${$("a_nome").value || "-"}`,
      `Data: ${$("a_data").value || "-"}`,
      "",
      "ATESTADO:",
      $("a_texto").value || "-",
    ];
  }

  function linesLaudo() {
    return [
      `Paciente: ${$("l_nome").value || "-"}`,
      `Data: ${$("l_data").value || "-"}`,
      "",
      "LAUDO:",
      $("l_texto").value || "-",
    ];
  }

  // Função para gerar PDF usando jsPDF
  async function makePDF(title, bodyLines, filename) {
    const jspdf = window.jspdf;
    if (!jspdf?.jsPDF) {
      alert("Biblioteca de PDF não carregou. Verifique sua internet no primeiro carregamento.");
      return;
    }
    const doc = new jspdf.jsPDF({ unit: "mm", format: "a4" });

    // Layout do PDF
    const margin = 12;
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const frameX = margin, frameY = margin;
    const frameW = pageW - margin * 2;
    const frameH = pageH - margin * 2;

    doc.setLineWidth(0.4);
    doc.rect(frameX, frameY, frameW, frameH); // Borda externa

    let y = frameY + 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(title, frameX + 6, y);

    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const profInfo = profLine() || "Dados do profissional (configure em: Configurações do Profissional)";
    const profLines = doc.splitTextToSize(profInfo, frameW - 12);
    doc.text(profLines, frameX + 6, y);

    y += profLines.length * 4 + 3;
    doc.setLineWidth(0.2);
    doc.line(frameX + 6, y, frameX + frameW - 6, y);

    // Corpo do conteúdo
    y += 6;
    doc.setFontSize(11);
    const content = bodyLines.join("\n");
    const textLines = doc.splitTextToSize(content, frameW - 12);

    let curY = y;
    for (const line of textLines) {
      if (curY > frameY + frameH - 14) {
        doc.addPage();
        doc.setLineWidth(0.4);
        doc.rect(frameX, frameY, frameW, frameH); // Nova página com borda
        curY = frameY + 14;
      }
      doc.text(line, frameX + 6, curY);
      curY += 5;
    }

    doc.setLineWidth(0.2);
    doc.line(frameX + 6, curY, frameX + frameW - 6, curY);
    doc.setFontSize(10);
    doc.text("Assinatura/Carimbo:", frameX + 6, curY + 6);

    doc.save(filename);
  }

  // Funções de ação dos botões
  $("pdfFicha").addEventListener("click", () => makePDF("FICHA CLÍNICA", linesFicha(), "ficha_clinica.pdf"));
  $("printFicha").addEventListener("click", () => printSimple("FICHA CLÍNICA", linesFicha()));

  $("pdfReceita").addEventListener("click", () => makePDF("RECEITUÁRIO", linesReceita(), "receituario.pdf"));
  $("printReceita").addEventListener("click", () => printSimple("RECEITUÁRIO", linesReceita()));

  $("pdfOrc").addEventListener("click", () => makePDF("ORÇAMENTO", linesOrc(), "orcamento.pdf"));
  $("printOrc").addEventListener("click", () => printSimple("ORÇAMENTO", linesOrc()));

  $("pdfAtestado").addEventListener("click", () => makePDF("ATESTADO", linesAtestado(), "atestado.pdf"));
  $("printAtestado").addEventListener("click", () => printSimple("ATESTADO", linesAtestado()));

  $("pdfLaudo").addEventListener("click", () => makePDF("LAUDO", linesLaudo(), "laudo.pdf"));
  $("printLaudo").addEventListener("click", () => printSimple("LAUDO", linesLaudo()));

  // Função de visualização da ficha
  function setView(name) {
    navBtns.forEach(b => b.classList.toggle("active", b.dataset.view === name));
    Object.entries(views).forEach(([k, el]) => el.classList.toggle("hidden", k !== name));
  }

  // Início da navegação e configuração
  setView("ficha");
})();
