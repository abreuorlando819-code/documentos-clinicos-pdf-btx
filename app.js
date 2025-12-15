(() => {
  // Helpers
  const $ = (id) => document.getElementById(id);
  const qsa = (sel) => Array.from(document.querySelectorAll(sel));

  // Data de hoje (YYYY-MM-DD)
  const todayISO = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const da = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${da}`;
  };

  // ===== PROFISSIONAL (persistente) =====
  const PROF_KEY = "btx_prof_v1";

  const profDefault = () => ({
    nome: "",
    conselho: "",
    tel: "",
    cidade: "Belém/PA",
    end: ""
  });

  const getProf = () => {
    try {
      const raw = localStorage.getItem(PROF_KEY);
      if (!raw) return profDefault();
      const data = JSON.parse(raw);
      return {
        nome: (data.nome || "").trim(),
        conselho: (data.conselho || "").trim(),
        tel: (data.tel || "").trim(),
        cidade: (data.cidade || "Belém/PA").trim(),
        end: (data.end || "").trim(),
      };
    } catch {
      return profDefault();
    }
  };

  const setProf = (data) => {
    localStorage.setItem(PROF_KEY, JSON.stringify(data));
  };

  const profLine = () => {
    const p = getProf();
    const parts = [];
    if (p.nome) parts.push(p.nome);
    if (p.conselho) parts.push(p.conselho);
    if (p.tel) parts.push(`Tel: ${p.tel}`);
    if (p.end) parts.push(p.end);
    if (p.cidade) parts.push(p.cidade);
    // se estiver vazio, ao menos mostra cidade (ou uma msg)
    return parts.join(" • ") || (p.cidade || "Dados do profissional não configurados");
  };

  // ===== PACIENTE ATIVO (sincronizado) =====
  const pacienteIds = ["f_nome", "r_nome", "o_nome", "a_nome", "l_nome"];

  const getPacienteNome = () => {
    // prioridade ficha, depois receita, etc.
    for (const id of pacienteIds) {
      const el = $(id);
      const v = (el?.value || "").trim();
      if (v) return v;
    }
    return "";
  };

  const setPacienteNomeEverywhere = (nome) => {
    pacienteIds.forEach((id) => {
      const el = $(id);
      if (el) el.value = nome;
    });
  };

  const ensureNomeAntesDeEmitir = () => {
    const nome = getPacienteNome();
    if (!nome) {
      alert("⚠️ Informe o NOME do paciente antes de emitir PDF/Imprimir.");
      setView("ficha");
      $("f_nome")?.focus();
      return false;
    }
    // anti-erro: padroniza o nome em todos os módulos
    setPacienteNomeEverywhere(nome);
    return true;
  };

  // ===== NAVEGAÇÃO DE MÓDULOS =====
  const navBtns = qsa(".navBtn");
  const views = {
    ficha: $("view-ficha"),
    receita: $("view-receita"),
    orcamento: $("view-orcamento"),
    atestado: $("view-atestado"),
    laudo: $("view-laudo"),
  };

  function setView(name) {
    navBtns.forEach((b) =>
      b.classList.toggle("active", b.dataset.view === name)
    );
    Object.entries(views).forEach(([k, el]) => {
      if (el) el.classList.toggle("hidden", k !== name);
    });
  }

  navBtns.forEach((btn) => {
    btn.addEventListener("click", () => setView(btn.dataset.view));
  });

  // ===== DATAS PADRÃO =====
  const setDateToday = () => {
    ["f_data", "r_data", "o_data", "a_data", "l_data"].forEach((id) => {
      const el = $(id);
      if (el && el.type === "date") el.value = todayISO();
    });
  };

  // ===== RESET TOTAL (NOVO PACIENTE) =====
  function resetAll() {
    // limpa input/textarea (exceto datas)
    document.querySelectorAll("input, textarea").forEach((el) => {
      if (!el) return;
      if (el.type === "date") return;
      el.value = "";
    });
    setDateToday();
    setView("ficha");
    $("f_nome")?.focus();
  }

  $("btnNovoFicha")?.addEventListener("click", () => {
    const ok = confirm("Iniciar NOVO paciente? Isso vai limpar todos os campos.");
    if (ok) resetAll();
  });

  // sincroniza nome digitado na ficha -> todos
  $("f_nome")?.addEventListener("input", (e) => {
    setPacienteNomeEverywhere((e.target.value || "").trimStart());
  });

  // ===== MODAL PROFISSIONAL =====
  const modal = $("modal");
  const closeModal = () => modal?.classList.add("hidden");

  $("btnSettings")?.addEventListener("click", () => {
    const p = getProf();
    $("p_nome") && ($("p_nome").value = p.nome);
    $("p_conselho") && ($("p_conselho").value = p.conselho);
    $("p_tel") && ($("p_tel").value = p.tel);
    $("p_cidade") && ($("p_cidade").value = p.cidade);
    $("p_end") && ($("p_end").value = p.end);
    modal?.classList.remove("hidden");
  });

  $("closeModal")?.addEventListener("click", closeModal);
  $("cancelSettings")?.addEventListener("click", closeModal);

  $("saveSettings")?.addEventListener("click", () => {
    const p = {
      nome: ($("p_nome")?.value || "").trim(),
      conselho: ($("p_conselho")?.value || "").trim(),
      tel: ($("p_tel")?.value || "").trim(),
      cidade: (($("p_cidade")?.value || "").trim() || "Belém/PA"),
      end: ($("p_end")?.value || "").trim(),
    };
    setProf(p);
    closeModal();
  });

  // ===== RECEITA: MODELOS RÁPIDOS =====
  function appendRx(text) {
    const t = $("r_texto");
    if (!t) return;
    const sep = t.value.trim() ? "\n\n" : "";
    t.value = (t.value + sep + text).trimStart();
  }

  $("btnDipirona")?.addEventListener("click", () => {
    appendRx("DIPIRONA 1g\nTomar 1 comprimido a cada 6/6 horas, se dor, por 3 dias.");
  });
  $("btnIbu")?.addEventListener("click", () => {
    appendRx("IBUPROFENO 600mg\nTomar 1 comprimido a cada 8/8 horas, após alimentação, por 3 dias.");
  });
  $("btnAmox")?.addEventListener("click", () => {
    appendRx("AMOXICILINA 500mg\nTomar 1 cápsula a cada 8/8 horas, por 7 dias.");
  });
  $("btnLimparReceita")?.addEventListener("click", () => {
    const t = $("r_texto");
    if (t) t.value = "";
  });

  // ===== LAUDO: 1 MODELO LOCAL =====
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

  // ===== TEXTO / COLETA =====
  const v = (id) => ($(`${id}`)?.value || "").trim();

  const linesFicha = () => ([
    `Paciente: ${getPacienteNome() || "-"}`,
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
  ]);

  const linesReceita = () => ([
    `Paciente: ${getPacienteNome() || "-"}`,
    `Data: ${v("r_data") || "-"}`,
    `Endereço: ${v("r_end") || "-"}`,
    "",
    "PRESCRIÇÃO:",
    v("r_texto") || "-",
  ]);

  const linesOrc = () => ([
    `Paciente: ${getPacienteNome() || "-"}`,
    `Data: ${v("o_data") || "-"}`,
    "",
    "DESCRIÇÃO DO ORÇAMENTO:",
    v("o_texto") || "-",
    "",
    "OBSERVAÇÕES:",
    v("o_obs") || "-",
  ]);

  const linesAtestado = () => ([
    `Paciente: ${getPacienteNome() || "-"}`,
    `Data: ${v("a_data") || "-"}`,
    "",
    "ATESTADO:",
    v("a_texto") || "-",
  ]);

  const linesLaudo = () => ([
    `Paciente: ${getPacienteNome() || "-"}`,
    `Data: ${v("l_data") || "-"}`,
    "",
    "LAUDO:",
    v("l_texto") || "-",
  ]);

  // ===== IMPRESSÃO =====
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

  // ===== PDF (jsPDF) =====
  async function makePDF(title, bodyLines, filename) {
    if (!ensureNomeAntesDeEmitir()) return;

    const jspdf = window.jspdf;
    if (!jspdf?.jsPDF) {
      alert("Biblioteca de PDF não carregou. Verifique a internet no primeiro carregamento.");
      return;
    }

    const doc = new jspdf.jsPDF({ unit: "mm", format: "a4" });

    const margin = 12;
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const frameX = margin, frameY = margin;
    const frameW = pageW - margin * 2;
    const frameH = pageH - margin * 2;

    // Moldura
    doc.setLineWidth(0.4);
    doc.rect(frameX, frameY, frameW, frameH);

    let y = frameY + 10;

    // Título
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(title, frameX + 6, y);

    // Linha do profissional (AGORA SEMPRE PUXA DO localStorage)
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const pInfo = profLine();
    const pLines = doc.splitTextToSize(pInfo, frameW - 12);
    doc.text(pLines, frameX + 6, y);

    // Separador
    y += pLines.length * 4 + 3;
    doc.setLineWidth(0.2);
    doc.line(frameX + 6, y, frameX + frameW - 6, y);

    // Corpo
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

    // Rodapé assinatura
    if (curY < frameY + frameH - 16) curY = frameY + frameH - 16;
    doc.setLineWidth(0.2);
    doc.line(frameX + 6, curY, frameX + frameW - 6, curY);
    doc.setFontSize(10);
    doc.text("Assinatura/Carimbo:", frameX + 6, curY + 6);

    doc.save(filename);
  }

  // ===== BOTÕES: PDF + IMPRIMIR =====
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

  // ===== START =====
  setDateToday();
  setView("ficha");
})();
