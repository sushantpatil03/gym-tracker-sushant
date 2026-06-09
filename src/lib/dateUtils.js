// Simple date utilities to avoid heavy dependencies
export function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function format(date, fmt) {
  const d = new Date(date);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const fullMonths = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  
  return fmt
    .replace('MMMM', fullMonths[d.getMonth()])
    .replace('MMM', months[d.getMonth()])
    .replace('MM', String(d.getMonth() + 1).padStart(2, '0'))
    .replace('DD', String(d.getDate()).padStart(2, '0'))
    .replace('D', d.getDate())
    .replace('YYYY', d.getFullYear())
    .replace('dddd', days[d.getDay()]);
}

export function getTodayFormatted() {
  const d = new Date();
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
}
