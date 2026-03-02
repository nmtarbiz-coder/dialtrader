// =============================
// CALENDAR MODULE
// =============================

let mainCalendar = null;
let dashboardCalendar = null;

// Safe calendar loader
async function loadCalendarsSafe() {
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

  // MAIN CALENDAR
  const mainEl = document.getElementById('main-calendar');
  if (mainEl) {
    if (mainCalendar) mainCalendar.destroy();

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
  }

  // DASHBOARD CALENDAR
  const dashEl = document.getElementById('dashboard-calendar');
  if (dashEl) {
    if (dashboardCalendar) dashboardCalendar.destroy();

    dashboardCalendar = new FullCalendar.Calendar(dashEl, {
      initialView: 'dayGridWeek',
      height: 350,
      headerToolbar: false,
      events: events
    });

    dashboardCalendar.render();
  }
}

// Hook into page switching safely
const originalShowPage = window.showPage;

window.showPage = function(name){
  originalShowPage(name);

  if (name === 'calendar' || name === 'dashboard') {
    setTimeout(() => loadCalendarsSafe(), 50);
  }
};
// =============================
// SIMPLE EVENT MODAL
// =============================

window.openCalendarModal = function(){

  const modal = document.createElement('div');
  modal.style.position = 'fixed';
  modal.style.inset = '0';
  modal.style.background = 'rgba(0,0,0,0.55)';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.zIndex = '9999';

 modal.innerHTML = `
  <div style="
    background:#1c1c1c;
    padding:2rem;
    border-radius:14px;
    width:420px;
    max-width:95%;
    box-shadow:0 25px 60px rgba(0,0,0,0.6);
    border:1px solid rgba(201,168,76,0.25);
    color:#fff;
  ">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;">
      <h3 style="margin:0;font-weight:600;color:#fff;">Add Event</h3>
      <button id="cal-cancel-top" style="
        background:none;
        border:none;
        color:#aaa;
        font-size:1.2rem;
        cursor:pointer;
      ">✕</button>
    </div>

    <div style="display:flex;flex-direction:column;gap:0.85rem;">
      <input id="cal-title" placeholder="Title"
        style="padding:0.7rem;border-radius:8px;border:1px solid rgba(255,255,255,0.15);background:#2a2a2a;color:#fff;">

      <textarea id="cal-desc" placeholder="Description (optional)"
        style="padding:0.7rem;border-radius:8px;border:1px solid rgba(255,255,255,0.15);background:#2a2a2a;color:#fff;min-height:80px;"></textarea>

      <input type="date" id="cal-date"
        style="padding:0.7rem;border-radius:8px;border:1px solid rgba(255,255,255,0.15);background:#2a2a2a;color:#fff;">
    </div>

    <div style="display:flex;justify-content:flex-end;gap:0.75rem;margin-top:1.5rem;">
      <button id="cal-cancel"
        style="padding:0.6rem 1rem;border-radius:8px;border:1px solid #555;background:#2a2a2a;color:#fff;cursor:pointer;">
        Cancel
      </button>

      <button id="cal-save"
        style="padding:0.6rem 1.2rem;border-radius:8px;border:none;background:#c9a84c;color:#000;font-weight:600;cursor:pointer;">
        Save Event
      </button>
    </div>
  </div>
`;

  document.body.appendChild(modal);

  const closeModal = () => {
    document.body.removeChild(modal);
  };

  document.getElementById('cal-cancel').onclick = closeModal;
  document.getElementById('cal-cancel-top').onclick = closeModal;

  document.getElementById('cal-save').onclick = async () => {
    const title = document.getElementById('cal-title').value.trim();
    const description = document.getElementById('cal-desc').value.trim();
    const event_date = document.getElementById('cal-date').value;

    if(!title || !event_date){
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

    if(error){
      alert("Error saving event.");
      console.error(error);
      return;
    }

    closeModal();
    loadCalendarsSafe();
  };
};
 
