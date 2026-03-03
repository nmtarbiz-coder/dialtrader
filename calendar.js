// =============================
// CALENDAR MODULE (FIXED)
// =============================

let mainCalendar = null;
let dashboardCalendar = null;

// Safe loader
window.loadCalendarsSafe = async function () {
  if (!window.db || !window.currentUser) return;

  const { data, error } = await db
    .from('calendar_events')
    .select('*')
    .eq('user_id', currentUser.id);

  if (error) {
    console.error('Calendar load error:', error);
    return;
  }

  const events = (data || []).map(e => ({
    id: e.id,
    title: e.title,
    start: e.event_date,
    allDay: true
  }));

  // =============================
  // MAIN CALENDAR PAGE
  // =============================

  const mainEl = document.getElementById('main-calendar');
  if (mainEl) {
    if (mainCalendar) {
      mainCalendar.destroy();
      mainCalendar = null;
    }

    mainCalendar = new FullCalendar.Calendar(mainEl, {
      initialView: 'dayGridMonth',
      height: 650,
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      events: events
    });

    mainCalendar.render();

    // Force layout recalculation
    setTimeout(() => {
      mainCalendar.updateSize();
    }, 100);
  }

  // =============================
  // DASHBOARD WEEK VIEW
  // =============================

  const dashEl = document.getElementById('dashboard-calendar');
  if (dashEl) {
    if (dashboardCalendar) {
      dashboardCalendar.destroy();
      dashboardCalendar = null;
    }

    dashboardCalendar = new FullCalendar.Calendar(dashEl, {
      initialView: 'dayGridWeek',
      height: 350,
      headerToolbar: false,
      events: events
    });

    dashboardCalendar.render();

    // Force layout recalculation
    setTimeout(() => {
      dashboardCalendar.updateSize();
    }, 100);
  }
};

// =============================
// BASIC EVENT MODAL
// =============================

window.openCalendarModal = function () {

  const modal = document.createElement('div');
  modal.style.position = 'fixed';
  modal.style.inset = '0';
  modal.style.background = 'rgba(0,0,0,0.6)';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.zIndex = '9999';

  modal.innerHTML = `
    <div style="
      background:#1e1e1e;
      padding:2rem;
      border-radius:12px;
      width:400px;
      max-width:95%;
      box-shadow:0 20px 50px rgba(0,0,0,0.5);
      color:#fff;
    ">
      <h3 style="margin-top:0;">Add Event</h3>

      <input id="cal-title" placeholder="Title"
        style="width:100%;margin-bottom:0.75rem;padding:0.6rem;border-radius:8px;border:1px solid #444;background:#2a2a2a;color:#fff;">

      <textarea id="cal-desc" placeholder="Description (optional)"
        style="width:100%;margin-bottom:0.75rem;padding:0.6rem;border-radius:8px;border:1px solid #444;background:#2a2a2a;color:#fff;min-height:80px;"></textarea>

      <input type="date" id="cal-date"
        style="width:100%;margin-bottom:1rem;padding:0.6rem;border-radius:8px;border:1px solid #444;background:#2a2a2a;color:#fff;">

      <div style="display:flex;justify-content:flex-end;gap:0.5rem;">
        <button id="cal-cancel"
          style="padding:0.5rem 1rem;border-radius:8px;border:1px solid #555;background:#2a2a2a;color:#fff;cursor:pointer;">
          Cancel
        </button>

        <button id="cal-save"
          style="padding:0.5rem 1.2rem;border-radius:8px;border:none;background:#c9a84c;color:#000;font-weight:600;cursor:pointer;">
          Save
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const close = () => document.body.removeChild(modal);

  document.getElementById('cal-cancel').onclick = close;

  document.getElementById('cal-save').onclick = async () => {
    const title = document.getElementById('cal-title').value.trim();
    const description = document.getElementById('cal-desc').value.trim();
    const event_date = document.getElementById('cal-date').value;

    if (!title || !event_date) {
      alert("Title and date required.");
      return;
    }

    const { error } = await db.from('calendar_events').insert({
      user_id: currentUser.id,
      title,
      description,
      event_date,
      event_type: 'manual'
    });

    if (error) {
      console.error(error);
      alert("Error saving event.");
      return;
    }

    close();
    loadCalendarsSafe();
  };
};

// =============================
// PAGE SWITCH HOOK (FIXED)
// =============================

const originalShowPage = window.showPage;

window.showPage = function (name) {
  originalShowPage(name);

  if (name === 'calendar' || name === 'dashboard') {
    setTimeout(() => {
      loadCalendarsSafe();
    }, 150); // Slightly longer delay ensures page is visible
  }
};

// =============================
// INITIAL LOAD
// =============================

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    loadCalendarsSafe();
  }, 300);
});
