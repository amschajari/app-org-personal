export const formatDate = (dateStr?: string): string => {
  if (!dateStr) return 'Sin fecha';
  
  // Format YYYY-MM-DD
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    
    return date.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short',
    });
  }
  return dateStr;
};

export const getGreeting = (): { greeting: string; dateText: string } => {
  const now = new Date();
  const hour = now.getHours();

  let greeting = 'Buenos días';
  if (hour >= 12 && hour < 20) {
    greeting = 'Buenas tardes';
  } else if (hour >= 20 || hour < 6) {
    greeting = 'Buenas noches';
  }

  const dateText = now.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  // Capitalize first letter of weekday
  const capitalizedDate = dateText.charAt(0).toUpperCase() + dateText.slice(1);

  return { greeting, dateText: capitalizedDate };
};

export const isTaskToday = (dateStr?: string): boolean => {
  if (!dateStr) return false;
  const todayStr = new Date().toISOString().split('T')[0];
  return dateStr.split('T')[0] === todayStr;
};

export const isTaskOverdue = (dateStr?: string): boolean => {
  if (!dateStr) return false;
  const todayStr = new Date().toISOString().split('T')[0];
  return dateStr.split('T')[0] < todayStr;
};
