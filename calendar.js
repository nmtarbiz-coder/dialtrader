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
