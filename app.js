(() => {
  // Helpers
  const $ = (id) => document.getElementById(id);
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const on = (id, event, fn) => {
    const el = $(id);
    if (el) el.addEventListener(event, fn);
  };

  const todayISO = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const da = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${da}`;
  };

  // Roda só quando DOM estiver pronto (evita “sumiu tudo” por travamento cedo)
  document.addEventListener("DOMContentLoaded", () => {
    // =========================
    // Estado (memória)
    // =========================
    const prof = {
      nome: "",
      conselho: "",
      tel: "",
      cidade: "Belém/PA",
      end: ""
    };

    // =========================
    // Navegação (ROBUSTA)
    // =========================
    const sidebar = qs(".sidebar");
    const navBtns = qsa(".navBtn");
    const views = qsa(".view");

    function showView(name) {
      // ativa botão
      navBtns.forEach(b => b.classList.toggle("active", b.dataset.view === name));

      // esconde todas as views
      views.forEach(v => v.classList.add("hidden"));

      // mostra view alvo
      const target = $(`view-${name}`);
      if (target) target.classList.remove("hidden");
    }

    // Delegação: mesmo que você mexa nos botões depois, continua funcionando
    sidebar?.addEventListener("click", (e) => {
      const btn = e.target.closest(".navBtn");
      if (!btn) return;
      const name = btn.dataset.view;
      if (!name) return;
      showView(name);
    });

    // =========================
    // Datas padrão
    // =========================
    ["f_data", "r_data", "o_data", "a_data", "l_data"].forEach(id => {
      const el = $(id);
      if (el) el.value = todayISO();
    });

    // =========================
    // Botão NOVO (Ficha)
    // =========================
    on("btnNovoFicha", "click", () => {
      const container = $("view-ficha");
      if (!container) return;

      container.querySelectorAll("input, textarea").forEach(campo => {
        if (campo.id === "f_data" && campo.type === "date") {
          campo.value = todayISO();
          return;
        }
        campo.value = "";
      });
    });

    // =========================
    // Modal Configurações
    // =========================
    const modal = $("modal");

    function closeModal() {
      modal?.classList.add("hidden");
    }

    on("btnSettings", "click", () => {
      if (!modal) return;

      if ($("p_nome")) $("p_nome").value = prof.nome;
      if ($("p_conselho")) $("p_conselho").value = prof.conselho;
      if ($("p_tel")) $("p_tel").value = prof.tel;
      if ($("p_cidade")) $("p_cidade").value = prof.cidade;
      if ($("p_end")) $("p_end").value = prof.end;

      modal.classList.remove("hidden");
    });

    on("closeModal", "click", closeModal);
    on("cancelSettings", "click", closeModal);

    on("saveSettings", "click", () => {
      prof.nome = $("p_nome")?.value.trim() || "";
      prof.conselho = $("p_conselho")?.value.trim() || "";
      prof.tel = $("p_tel")?.value.trim() || "";
      prof.cidade = $("p_cidade")?.value.trim() || "Belém/PA";
      prof.end = $("p_end")?.value.trim() || "";
      closeModal();
    });

    // =========================
    // Receita: modelos rápidos
    // =========================
    function appendRx(text) {
      const t = $("r_texto");
      if (!t) return;
      const sep = t.value.trim() ? "\n\n" : "";
      t.value = (t.value + sep + text).trimStart();
    }

    on("btnDipirona", "click", () => {
      appendRx("DIPIRONA 1g\nTomar 1 comprimido a cada 6/6 horas, se dor, por 3 dias.");
    });

    on("btnIbu", "click", () => {
      appendRx("IBUPROFENO 600mg\nTomar 1 comprimido a cada 8/8 horas, após alimentação, por 3 dias.");
    });

    on("btnAmox", "click", () => {
      appendRx("AMOXICILINA 500mg\nTomar 1 cápsula a cada 8/8 horas, por 7 dias.");
    });

    on("btnLimparReceita", "click", () => {
      const t = $("r_texto");
      if (t) t.value = "";
    });

    // =========================
    // Laudo: modelo simples (1)
    // =========================
    const LAUDO_MODEL_KEY = "btx_laudo_modelo_v1";

    on("btnSalvarModeloLaudo", "click", () => {
      const txt = $("l_texto")?.value.trim() || "";
      if (!txt) return alert("Escreva o texto do laudo antes de salvar como modelo.");
      localStorage.setItem(LAUDO_MODEL_KEY, txt);
      alert("Modelo salvo localmente.");
    });

    on("btnCarregarModeloLaudo", "click", () => {
      const txt = localStorage.getItem(LAUDO_MODEL_KEY);
      if (!txt) return alert("Ainda não existe modelo salvo.");
      const t = $("l_texto");
      if (t) t.value = txt;
    });

    on("btnLimparLaudo", "click", () => {
      const t = $("l_texto");
      if (t) t.value = "";
    });

    // =========================
    // Impressão / PDF helpers
    // =========================
    function escapeHtml(s) {
      return String(s)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
    }

    function profLine() {
      const parts = [];
      if (prof.nome) parts.push(prof.nome);
      if (prof.conselho) parts.push(prof.conselho);
      if (prof.tel) parts.push(`Tel: ${prof.tel}`);
      if (prof.end) parts.push(prof.end);
      if (prof.cidade) parts.push(prof.cidade);
      return parts.join(" • ");
    }

    function printSimple(title, bodyLines) {
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
      const profInfo = profLine() || "Dados do profissional (configure em: Configurações do Profissional)";
      const profLines = doc.splitTextToSize(profInfo, frameW - 12);
      doc.text(profLines, frameX + 6, y);

      y += profLines.length * 4 + 3;
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

    // =========================
    // Linhas por módulo
    // =========================
    function linesFicha() {
      return [
        `Paciente: ${$("f_nome")?.value || "-"}`,
        `Data: ${$("f_data")?.value || "-"}`,
        `Nascimento: ${$("f_nasc")?.value || "-"}`,
        `Telefone: ${$("f_tel")?.value || "-"}`,
        `Endereço: ${$("f_end")?.value || "-"}`,
        "",
        `Motivo da consulta: ${$("f_motivo")?.value || "-"}`,
        "",
        "ANAMNESE:",
        $("f_anamnese")?.value || "-",
        "",
        "PROCEDIMENTO REALIZADO HOJE:",
        $("f_realizado")?.value || "-",
        "",
        "PLANO / PROCEDIMENTOS A REALIZAR:",
        $("f_plano")?.value || "-",
        "",
        "OBSERVAÇÕES:",
        $("f_obs")?.value || "-",
      ];
    }

    function linesReceita() {
      return [
        `Paciente: ${$("r_nome")?.value || "-"}`,
        `Data: ${$("r_data")?.value || "-"}`,
        `Endereço: ${$("r_end")?.value || "-"}`,
        "",
        "PRESCRIÇÃO:",
        $("r_texto")?.value || "-",
      ];
    }

    function linesOrc() {
      return [
        `Paciente: ${$("o_nome")?.value || "-"}`,
        `Data: ${$("o_data")?.value || "-"}`,
        "",
        "DESCRIÇÃO DO ORÇAMENTO:",
        $("o_texto")?.value || "-",
        "",
        "OBSERVAÇÕES:",
        $("o_obs")?.value || "-",
      ];
    }

    function linesAtestado() {
      return [
        `Paciente: ${$("a_nome")?.value || "-"}`,
        `Data: ${$("a_data")?.value || "-"}`,
        "",
        "ATESTADO:",
        $("a_texto")?.value || "-",
      ];
    }

    function linesLaudo() {
      return [
        `Paciente: ${$("l_nome")?.value || "-"}`,
        `Data: ${$("l_data")?.value || "-"}`,
        "",
        "LAUDO:",
        $("l_texto")?.value || "-",
      ];
    }

    // =========================
    // Botões PDF + Imprimir (sem travar se faltar)
    // =========================
    on("pdfFicha", "click", () => makePDF("FICHA CLÍNICA", linesFicha(), "ficha_clinica.pdf"));
    on("printFicha", "click", () => printSimple("FICHA CLÍNICA", linesFicha()));

    on("pdfReceita", "click", () => makePDF("RECEITUÁRIO", linesReceita(), "receituario.pdf"));
    on("printReceita", "click", () => printSimple("RECEITUÁRIO", linesReceita()));

    on("pdfOrc", "click", () => makePDF("ORÇAMENTO", linesOrc(), "orcamento.pdf"));
    on("printOrc", "click", () => printSimple("ORÇAMENTO", linesOrc()));

    on("pdfAtestado", "click", () => makePDF("ATESTADO", linesAtestado(), "atestado.pdf"));
    on("printAtestado", "click", () => printSimple("ATESTADO", linesAtestado()));

    on("pdfLaudo", "click", () => makePDF("LAUDO", linesLaudo(), "laudo.pdf"));
    on("printLaudo", "click", () => printSimple("LAUDO", linesLaudo()));

    // Início garantido
    showView("ficha");
  });
})();
