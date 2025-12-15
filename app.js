document.addEventListener("DOMContentLoaded", () => {

  // atalho
  const $ = (id) => document.getElementById(id);

  /* =========================
     NAVEGAÇÃO ENTRE MÓDULOS
  ========================== */
  const navBtns = document.querySelectorAll(".navBtn");
  const views = document.querySelectorAll(".view");

  function showView(name) {
    navBtns.forEach(btn => {
      btn.classList.toggle("active", btn.dataset.view === name);
    });

    views.forEach(view => {
      view.classList.add("hidden");
    });

    const target = $("view-" + name);
    if (target) target.classList.remove("hidden");
  }

  navBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      showView(btn.dataset.view);
    });
  });

  /* =========================
     DATA AUTOMÁTICA
  ========================== */
  function todayISO() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const da = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${da}`;
  }

  ["f_data","r_data","o_data","a_data","l_data"].forEach(id => {
    const el = $(id);
    if (el) el.value = todayISO();
  });

  /* =========================
     MODAL PROFISSIONAL
  ========================== */
  const modal = $("modal");

  $("btnSettings")?.addEventListener("click", () => {
    modal.classList.remove("hidden");
  });

  $("closeModal")?.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  $("cancelSettings")?.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  /* =========================
     RECEITA – BOTÕES RÁPIDOS
  ========================== */
  function appendRx(text) {
    const t = $("r_texto");
    if (!t) return;
    if (t.value.trim()) t.value += "\n\n";
    t.value += text;
  }

  $("btnDipirona")?.addEventListener("click", () => {
    appendRx("Dipirona 1g\nTomar 1 comprimido a cada 6 horas por 3 dias.");
  });

  $("btnIbu")?.addEventListener("click", () => {
    appendRx("Ibuprofeno 600mg\nTomar 1 comprimido a cada 8 horas por 3 dias.");
  });

  $("btnAmox")?.addEventListener("click", () => {
    appendRx("Amoxicilina 500mg\nTomar 1 cápsula a cada 8 horas por 7 dias.");
  });

  $("btnLimparReceita")?.addEventListener("click", () => {
    const t = $("r_texto");
    if (t) t.value = "";
  });

  /* =========================
     NOVO PACIENTE (FICHA)
  ========================== */
  $("btnNovoFicha")?.addEventListener("click", () => {
    if (!confirm("Iniciar novo paciente?")) return;

    document.querySelectorAll("input, textarea").forEach(el => {
      if (el.type !== "date") el.value = "";
    });

    ["f_data","r_data","o_data","a_data","l_data"].forEach(id => {
      const el = $(id);
      if (el) el.value = todayISO();
    });

    showView("ficha");
  });

  /* =========================
     INÍCIO
  ========================== */
  showView("ficha");

});
