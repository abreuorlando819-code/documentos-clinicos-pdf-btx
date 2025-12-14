(() => {
  const $ = (id) => document.getElementById(id);

  // Datas padrão
  const todayISO = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const da = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${da}`;
  };

  // Estado leve (somente em memória nesta etapa)
  const prof = {
    nome: "",
    conselho: "",
    tel: "",
    cidade: "Belém/PA",
    end: ""
  };

  // Navegação
  const navBtns = Array.from(document.querySelectorAll(".navBtn"));
  const views = {
    ficha: $("view-ficha"),
    receita: $("view-receita"),
    orcamento: $("view-orcamento"),
    atestado: $("view-atestado"),
    laudo: $("view-laudo"),
  };

  function setView(name){
    navBtns.forEach(b => b.classList.toggle("active", b.dataset.view === name));
    Object.entries(views).forEach(([k, el]) => el.classList.toggle("hidden", k !== name));
  }

  navBtns.forEach(btn => btn.addEventListener("click", () => setView(btn.dataset.view)));

  // Inicializa datas
  ["f_data","r_data","o_data","a_data","l_data"].forEach(id => {
    const el = $(id);
    if (el) el.value = todayISO();
  });

  // Modal configurações (sem persistir)
  const modal = $("modal");
  $("btnSettings").addEventListener("click", () => {
    $("p_nome").value = prof.nome;
    $("p_conselho").value = prof.conselho;
    $("p_tel").value = prof.tel;
    $("p_cidade").value = prof.cidade;
    $("p_end").value = prof.end;
    modal.classList.remove("hidden");
  });

  function closeModal(){ modal.classList.add("hidden"); }
  $("closeModal").addEventListener("click", closeModal);
  $("cancelSettings").addEventListener("click", closeModal);

  $("saveSettings").addEventListener("click", () => {
    prof.nome = $("p_nome").value.trim();
    prof.conselho = $("p_conselho").value.trim();
    prof.tel = $("p_tel").value.trim();
    prof.cidade = $("p_cidade").value.trim() || "Belém/PA";
    prof.end = $("p_end").value.trim();
    closeModal();
  });

  // Receita: modelos rápidos (texto simples, sem lógica pesada)
  function appendRx(text){
    const t = $("r_texto");
    const sep = t.value.trim() ? "\n\n" : "";
    t.value = (t.value + sep + text).trimStart();
  }

  $("btnDipirona").addEventListener("click", () => {
    appendRx("DIPIRONA 1g\nTomar 1 comprimido a cada 6/6 horas, se dor, por 3 dias.");
  });
  $("btnIbu").addEventListener("click", () => {
    appendRx("IBUPROFENO 600mg\nTomar 1 comprimido a cada 8/8 horas, após alimentação, por 3 dias.");
  });
  $("btnAmox").addEventListener("click", () => {
    appendRx("AMOXICILINA 500mg\nTomar 1 cápsula a cada 8/8 horas, por 7 dias.");
  });
  $("btnLimparReceita").addEventListener("click", () => $("r_texto").value = "");

  // Laudo: modelo simples (apenas 1)
  const LAUDO_MODEL_KEY = "btx_laudo_modelo_v1";
  $("btnSalvarModeloLaudo").addEventListener("click", () => {
    const txt = $("l_texto").value.trim();
    if (!txt) return alert("Escreva o texto do laudo antes de salvar como modelo.");
    localStorage.setItem(LAUDO_MODEL_KEY, txt);
    alert("Modelo salvo localmente.");
  });
  $("btnCarregarModeloLaudo").addEventListener("click", () => {
    const txt = localStorage.getItem(LAUDO_MODEL_KEY);
    if (!txt) return alert("Ainda não existe modelo salvo.");
    $("l_texto").value = txt;
  });
  $("btnLimparLaudo").addEventListener("click", () => $("l_texto").value = "");

  // Impressão (usa janela do navegador; para PDF usamos jsPDF)
  function printSimple(title, bodyLines){
    const w = window.open("", "_blank");
    const html = `
      <html><head><meta charset="utf-8" />
      <title>${title}</title>
      <style>
        body{font-family: Arial, sans-serif; margin: 24px;}
        .frame{border:1px solid #333; padding:16px;}
        .muted{color:#444; font-size:12px;}
        h1{font-size:18px; margin:0 0 8px;}
        pre{white-space:pre-wrap; font-family: Arial, sans-serif; font-size:13px; line-height:1.35; margin:0;}
      </style>
      </head><body>
        <div class="frame">
          <h1>${title}</h1>
          <div class="muted">${escapeHtml(profLine())}</div>
          <hr/>
          <pre>${escapeHtml(bodyLines.join("\n"))}</pre>
          <hr/>
          <div class="muted">Assinatura/Carimbo: ________________________________</div>
        </div>
        <script>window.onload=()=>{window.print();}</script>
      </body></html>
    `;
    w.document.open();
    w.document.write(html);
    w.document.close();
  }

  function escapeHtml(s){
    return String(s)
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;");
  }

  function profLine(){
    const parts = [];
    if (prof.nome) parts.push(prof.nome);
    if (prof.conselho) parts.push(prof.conselho);
    if (prof.tel) parts.push(`Tel: ${prof.tel}`);
    if (prof.end) parts.push(prof.end);
    if (prof.cidade) parts.push(prof.cidade);
    return parts.join(" • ");
  }

  // PDF (jsPDF) — simples, com borda (enquadramento 1px equivalente)
  async function makePDF(title, bodyLines, filename){
    const jspdf = window.jspdf;
    if (!jspdf?.jsPDF) {
      alert("Biblioteca de PDF não carregou. Verifique sua internet no primeiro carregamento.");
      return;
    }
    const doc = new jspdf.jsPDF({ unit: "mm", format: "a4" });

    // Margens e layout
    const margin = 12;
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const frameX = margin, frameY = margin;
    const frameW = pageW - margin*2;
    const frameH = pageH - margin*2;

    // Borda externa
    doc.setLineWidth(0.4);
    doc.rect(frameX, frameY, frameW, frameH);

    // Cabeçalho
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

    // Corpo
    y += 6;
    doc.setFontSize(11);
    const content = bodyLines.join("\n");
    const textLines = doc.splitTextToSize(content, frameW - 12);

    // Evita sair da página (MVP simples: se ultrapassar, segue para nova página)
    let curY = y;
    for (const line of textLines) {
      if (curY > frameY + frameH - 14) {
        doc.addPage();
        // nova página com moldura também
        doc.setLineWidth(0.4);
        doc.rect(frameX, frameY, frameW, frameH);
        curY = frameY + 14;
      }
      doc.text(line, frameX + 6, curY);
      curY += 5;
    }

    // Rodapé assinatura
    if (curY < frameY + frameH - 16) curY = frameY + frameH - 16;
    doc.setLineWidth(0.2);
    doc.line(frameX + 6, curY, frameX + frameW - 6, curY);
    doc.setFontSize(10);
    doc.text("Assinatura/Carimbo:", frameX + 6, curY + 6);

    doc.save(filename);
  }

  // Coleta de dados por módulo (sem salvar nada)
  function linesFicha(){
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

  function linesReceita(){
    return [
      `Paciente: ${$("r_nome").value || "-"}`,
      `Data: ${$("r_data").value || "-"}`,
      `Endereço: ${$("r_end").value || "-"}`,
      "",
      "PRESCRIÇÃO:",
      $("r_texto").value || "-",
    ];
  }

  function linesOrc(){
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

  function linesAtestado(){
    return [
      `Paciente: ${$("a_nome").value || "-"}`,
      `Data: ${$("a_data").value || "-"}`,
      "",
      "ATESTADO:",
      $("a_texto").value || "-",
    ];
  }

  function linesLaudo(){
    return [
      `Paciente: ${$("l_nome").value || "-"}`,
      `Data: ${$("l_data").value || "-"}`,
      "",
      "LAUDO:",
      $("l_texto").value || "-",
    ];
  }

  // Botões PDF + imprimir
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

  // Início
  setView("ficha");
})();
