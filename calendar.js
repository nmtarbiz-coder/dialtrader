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
  modal.style.background = 'rgba(0,0,0,0.7)';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.zIndex = '9999';

  modal.innerHTML = `
    <div style="background:#111;padding:2rem;border-radius:8px;width:400px;max-width:90%;">
      <h3 style="margin-bottom:1rem;">Add Event</h3>
      <input id="cal-title" placeholder="Title" style="width:100%;margin-bottom:0.75rem;padding:0.5rem;">
      <textarea id="cal-desc" placeholder="Description (optional)" style="width:100%;margin-bottom:0.75rem;padding:0.5rem;"></textarea>
      <input type="date" id="cal-date" style="width:100%;margin-bottom:1rem;padding:0.5rem;">
      <div style="display:flex;justify-content:flex-end;gap:0.5rem;">
        <button id="cal-cancel">Cancel</button>
        <button id="cal-save">Save</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById('cal-cancel').onclick = () => {
    document.body.removeChild(modal);
  };

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

    document.body.removeChild(modal);
    loadCalendarsSafe();
  };
};
