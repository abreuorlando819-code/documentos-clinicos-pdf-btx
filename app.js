(() => {
  const $ = (id) => document.getElementById(id);
  const qsa = (sel) => Array.from(document.querySelectorAll(sel));

  const todayISO = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const da = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${da}`;
  };

  const setDateToday = () => {
    ["f_data", "r_data", "o_data", "a_data", "l_data"].forEach((id) => {
      const el = $(id);
      if (el && el.type === "date") el.value = todayISO();
    });
  };

  const getPacienteNome = () => {
    // prioridade: ficha (f_nome). fallback: receita (r_nome)
    return ($("f_nome")?.value || $("r_nome")?.value || "").trim();
  };

  const setPacienteNomeEverywhere = (nome) => {
    ["f_nome", "r_nome", "o_nome", "a_nome", "l_nome"].forEach((id) => {
      const el = $(id);
      if (el) el.value = nome;
    });
  };

  const ensureNomeAntesDeEmitir = () => {
    const nome = getPacienteNome();
    if (!nome) {
      alert("⚠️ Informe o NOME do paciente antes de emitir PDF/Imprimir.");
      // joga o usuário pra ficha para preencher
      showView("ficha");
      $("f_nome")?.focus();
      return false;
    }
    // garante consistência (anti-erro)
    setPacienteNomeEverywhere(nome);
    return true;
  };

  // ===== Navegação (robusta) =====
  const sidebar = document.querySelector(".sidebar");
  const navBtns = qsa(".navBtn");
  const views = qsa(".view");

  function showView(name) {
    navBtns.forEach((b) => b.classList.toggle("active", b.dataset.view === name));
    views.forEach((v) => v.classList.add("hidden"));
    const target = $(`view-${name}`);
    if (target) target.classList.remove("hidden");
  }

  sidebar?.addEventListener("click", (e) => {
    const btn = e.target.closest(".navBtn");
    if (!btn) return;
    const name = btn.dataset.view;
    if (!name) return;
    showView(name);
  });

  // ===== Reset total (Novo Paciente) =====
  function resetAll() {
    // limpa inputs e textareas
    document.querySelectorAll("input, textarea").forEach((el) => {
      if (!el) return;
      if (el.type === "date") return; // seta depois
      el.value = "";
    });

    setDateToday();
    showView("ficha");
    $("f_nome")?.focus();
  }

  // Botão “Novo” da ficha vira “Novo paciente” (com confirmação)
  const btnNovo = $("btnNovoFicha");
  if (btnNovo) {
    btnNovo.addEventListener("click", () => {
      const ok = confirm("Iniciar NOVO paciente? Isso vai limpar todos os campos.");
      if (ok) resetAll();
    });
  }

  // ===== Profissional (modal) =====
  const prof = { nome: "", conselho: "", tel: "", cidade: "Belém/PA", end: "" };
  const modal = $("modal");

  const closeModal = () => modal?.classList.add("hidden");

  $("btnSettings")?.addEventListener("click", () => {
    if (!modal) return;
    $("p_nome") && ($("p_nome").value = prof.nome);
    $("p_conselho") && ($("p_conselho").value = prof.conselho);
    $("p_tel") && ($("p_tel").value = prof.tel);
    $("p_cidade") && ($("p_cidade").value = prof.cidade);
    $("p_end") && ($("p_end").value = prof.end);
    modal.classList.remove("hidden");
  });

  $("closeModal")?.addEventListener("click", closeModal);
  $("cancelSettings")?.addEventListener("click", closeModal);

  $("saveSettings")?.addEventListener("click", () => {
    prof.nome = ($("p_nome")?.value || "").trim();
    prof.conselho = ($("p_conselho")?.value || "").trim();
    prof.tel = ($("p_tel")?.value || "").trim();
    prof.cidade = (($("p_cidade")?.value || "").trim() || "Belém/PA");
    prof.end = ($("p_end")?.value || "").trim();
    closeModal();
  });

  const profLine = () => {
    const parts = [];
    if (prof.nome) parts.push(prof.nome);
    if (prof.conselho) parts.push(prof.conselho);
    if (prof.tel) parts.push(`Tel: ${prof.tel}`);
    if (prof.end) parts.push(prof.end);
    if (prof.cidade) parts.push(prof.cidade);
    return parts.join(" • ");
  };

  // ===== Receita modelos rápidos =====
  function appendRx(text) {
    const t = $("r_texto");
    if (!t) return;
    const sep = t.value.trim() ? "\n\n" : "";
    t.value = (t.value + sep + text).trimStart();
  }

  $("btnDipirona")?.addEventListener("click", () =>
    appendRx("DIPIRONA 1g\nTomar 1 comprimido a cada 6/6 horas, se dor, por 3 dias.")
  );
  $("btnIbu")?.addEventListener("click", () =>
    appendRx("IBUPROFENO 600mg\nTomar 1 comprimido a cada 8/8 horas, após alimentação, por 3 dias.")
  );
  $("btnAmox")?.addEventListener("click", () =>
    appendRx("AMOXICILINA 500mg\nTomar 1 cápsula a cada 8/8 horas, por 7 dias.")
  );
  $("btnLimparReceita")?.addEventListener("click", () => {
    const t = $("r_texto");
    if (t) t.value = "";
  });

  // ===== Laudo modelo 1 =====
  const LAUDO_MODEL_KEY = "btx_laudo_modelo_v1";
  $("btnSalvarModeloLaudo")?.addEventListener("click", () => {
    const txt = ($("l_texto")?.value || "").trim();
    if (!txt) return alert("Escreva o texto do laudo antes de salvar como modelo.");
    localStorage.setItem(LAUDO_MODEL_KEY, txt);
    alert("Modelo salvo localmente.");
  });
  $("btnCarregarModeloLaudo")?.addEventListener("click", () => {
    const txt = localStorage.getItem(LAUDO_MODEL_KEY);
    if (!txt) return alert("Ainda não existe modelo salvo.");
    const t = $("l_texto");
    if (t) t.value = txt;
  });
  $("btnLimparLaudo")?.addEventListener("click", () => {
    const t = $("l_texto");
    if (t) t.value = "";
  });

  // ===== Coleta linhas =====
  const v = (id) => ($(id)?.value || "").trim();

  function linesFicha() {
    const nome = getPacienteNome() || "-";
    return [
      `Paciente: ${nome}`,
      `Data: ${v("f_data") || "-"}`,
      `Nascimento: ${v("f_nasc") || "-"}`,
      `Telefone: ${v("f_tel") || "-"}`,
      `Endereço: ${v("f_end") || "-"}`,
      "",
      `Motivo da consulta: ${v("f_motivo") || "-"}`,
      "",
      "ANAMNESE:",
      v("f_anamnese") || "-",
      "",
      "PROCEDIMENTO REALIZADO HOJE:",
      v("f_realizado") || "-",
      "",
      "PLANO / PROCEDIMENTOS A REALIZAR:",
      v("f_plano") || "-",
      "",
      "OBSERVAÇÕES:",
      v("f_obs") || "-",
    ];
  }

  function linesReceita() {
    const nome = getPacienteNome() || "-";
    return [
      `Paciente: ${nome}`,
      `Data: ${v("r_data") || "-"}`,
      `Endereço: ${v("r_end") || "-"}`,
      "",
      "PRESCRIÇÃO:",
      v("r_texto") || "-",
    ];
  }

  function linesOrc() {
    const nome = getPacienteNome() || "-";
    return [
      `Paciente: ${nome}`,
      `Data: ${v("o_data") || "-"}`,
      "",
      "DESCRIÇÃO DO ORÇAMENTO:",
      v("o_texto") || "-",
      "",
      "OBSERVAÇÕES:",
      v("o_obs") || "-",
    ];
  }

  function linesAtestado() {
    const nome = getPacienteNome() || "-";
    return [
      `Paciente: ${nome}`,
      `Data: ${v("a_data") || "-"}`,
      "",
      "ATESTADO:",
      v("a_texto") || "-",
    ];
  }

  function linesLaudo() {
    const nome = getPacienteNome() || "-";
    return [
      `Paciente: ${nome}`,
      `Data: ${v("l_data") || "-"}`,
      "",
      "LAUDO:",
      v("l_texto") || "-",
    ];
  }

  // ===== Impressão / PDF =====
  const escapeHtml = (s) =>
    String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

  function printSimple(title, bodyLines) {
    if (!ensureNomeAntesDeEmitir()) return;

    const w = window.open("", "_blank");
    if (!w) return;

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

  async function makePDF(title, bodyLines, filename) {
    if (!ensureNomeAntesDeEmitir()) return;

    const jspdf = window.jspdf;
    if (!jspdf?.jsPDF) {
      alert("Biblioteca de PDF não carregou. Verifique sua internet no primeiro carregamento.");
      return;
    }

    const doc = new jspdf.jsPDF({ unit: "mm", format: "a4" });

    const margin = 12;
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const frameX = margin, frameY = margin;
    const frameW = pageW - margin * 2;
    const frameH = pageH - margin * 2;

    doc.setLineWidth(0.4);
    doc.rect(frameX, frameY, frameW, frameH);

    let y = frameY + 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(title, frameX + 6, y);

    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const pInfo = profLine() || "Dados do profissional (configure em: Configurações do Profissional)";
    const pLines = doc.splitTextToSize(pInfo, frameW - 12);
    doc.text(pLines, frameX + 6, y);

    y += pLines.length * 4 + 3;
    doc.setLineWidth(0.2);
    doc.line(frameX + 6, y, frameX + frameW - 6, y);

    y += 6;
    doc.setFontSize(11);
    const content = bodyLines.join("\n");
    const textLines = doc.splitTextToSize(content, frameW - 12);

    let curY = y;
    for (const line of textLines) {
      if (curY > frameY + frameH - 14) {
        doc.addPage();
        doc.setLineWidth(0.4);
        doc.rect(frameX, frameY, frameW, frameH);
        curY = frameY + 14;
      }
      doc.text(line, frameX + 6, curY);
      curY += 5;
    }

    if (curY < frameY + frameH - 16) curY = frameY + frameH - 16;
    doc.setLineWidth(0.2);
    doc.line(frameX + 6, curY, frameX + frameW - 6, curY);
    doc.setFontSize(10);
    doc.text("Assinatura/Carimbo:", frameX + 6, curY + 6);

    doc.save(filename);
  }

  // ===== Emissão (com segurança) =====
  $("pdfFicha")?.addEventListener("click", () => makePDF("FICHA CLÍNICA", linesFicha(), "ficha_clinica.pdf"));
  $("printFicha")?.addEventListener("click", () => printSimple("FICHA CLÍNICA", linesFicha()));

  $("pdfReceita")?.addEventListener("click", () => makePDF("RECEITUÁRIO", linesReceita(), "receituario.pdf"));
  $("printReceita")?.addEventListener("click", () => printSimple("RECEITUÁRIO", linesReceita()));

  $("pdfOrc")?.addEventListener("click", () => makePDF("ORÇAMENTO", linesOrc(), "orcamento.pdf"));
  $("printOrc")?.addEventListener("click", () => printSimple("ORÇAMENTO", linesOrc()));

  $("pdfAtestado")?.addEventListener("click", () => makePDF("ATESTADO", linesAtestado(), "atestado.pdf"));
  $("printAtestado")?.addEventListener("click", () => printSimple("ATESTADO", linesAtestado()));

  $("pdfLaudo")?.addEventListener("click", () => makePDF("LAUDO", linesLaudo(), "laudo.pdf"));
  $("printLaudo")?.addEventListener("click", () => printSimple("LAUDO", linesLaudo()));

  // ===== Sincronização do nome do paciente =====
  // Sempre que você digitar na ficha, ele replica para os outros módulos
  $("f_nome")?.addEventListener("input", (e) => {
    const nome = (e.target.value || "").trimStart();
    setPacienteNomeEverywhere(nome);
  });

  // Inicialização
  setDateToday();
  showView("ficha");
})();
