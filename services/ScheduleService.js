import { API_URL } from '../config';

// Get all schedules for the authenticated user
export const getSchedules = async (token) => {
  try {
    const response = await fetch(`${API_URL}/schedules`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch schedules');
    }

    return data;
  } catch (error) {
    console.error('Error fetching schedules:', error);
    throw error;
  }
};

// Get a specific schedule by ID
export const getScheduleById = async (token, scheduleId) => {
  try {
    const response = await fetch(`${API_URL}/schedules/${scheduleId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch schedule');
    }

    return data;
  } catch (error) {
    console.error('Error fetching schedule:', error);
    throw error;
  }
};

// Create a new medication schedule
export const createSchedule = async (token, scheduleData) => {
  try {
    const response = await fetch(`${API_URL}/schedules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(scheduleData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create schedule');
    }

    return data;
  } catch (error) {
    console.error('Error creating schedule:', error);
    throw error;
  }
};

// Update an existing schedule
export const updateSchedule = async (token, scheduleId, scheduleData) => {
  try {
    const response = await fetch(`${API_URL}/schedules/${scheduleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(scheduleData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to update schedule');
    }

    return data;
  } catch (error) {
    console.error('Error updating schedule:', error);
    throw error;
  }
};

// Delete a schedule
export const deleteSchedule = async (token, scheduleId) => {
  try {
    const response = await fetch(`${API_URL}/schedules/${scheduleId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete schedule');
    }

    return data;
  } catch (error) {
    console.error('Error deleting schedule:', error);
    throw error;
  }
};

// Log medication action (taken, skipped, snoozed, missed)
export const logMedicationAction = async (token, logData) => {
  try {
    const response = await fetch(`${API_URL}/schedules/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(logData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to log medication action');
    }

    return data;
  } catch (error) {
    console.error('Error logging medication action:', error);
    throw error;
  }
};

// Get medication logs with filtering options
export const getMedicationLogs = async (token, filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null) {
        queryParams.append(key, filters[key]);
      }
    });

    const response = await fetch(`${API_URL}/schedules/logs/history?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch medication logs');
    }

    return data;
  } catch (error) {
    console.error('Error fetching medication logs:', error);
    throw error;
  }
};

// Get adherence statistics
export const getAdherenceStats = async (token, filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null) {
        queryParams.append(key, filters[key]);
      }
    });

    const response = await fetch(`${API_URL}/schedules/stats/adherence?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch adherence statistics');
    }

    return data;
  } catch (error) {
    console.error('Error fetching adherence statistics:', error);
    throw error;
  }
};

// Get pending notifications for the user
export const getPendingNotifications = async (token) => {
  try {
    const response = await fetch(`${API_URL}/schedules/notifications/pending`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch pending notifications');
    }

    return data;
  } catch (error) {
    console.error('Error fetching pending notifications:', error);
    throw error;
  }
};

// Cancel notifications for a specific schedule
export const cancelScheduleNotifications = async (token, scheduleId) => {
  try {
    const response = await fetch(`${API_URL}/schedules/${scheduleId}/notifications/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to cancel schedule notifications');
    }

    return data;
  } catch (error) {
    console.error('Error cancelling schedule notifications:', error);
    throw error;
  }
};

// Cancel all notifications for the user
export const cancelAllNotifications = async (token) => {
  try {
    const response = await fetch(`${API_URL}/schedules/notifications/cancel-all`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to cancel all notifications');
    }

    return data;
  } catch (error) {
    console.error('Error cancelling all notifications:', error);
    throw error;
  }
};

// Register device for push notifications
export const registerDeviceForNotifications = async (token, deviceData) => {
  try {
    const response = await fetch(`${API_URL}/notifications/register-device`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(deviceData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to register device for notifications');
    }

    return data;
  } catch (error) {
    console.error('Error registering device for notifications:', error);
    throw error;
  }
};

// Helper function to transform frontend schedule data to backend format
export const transformScheduleForBackend = (frontendSchedule) => {
  return {
    medicine_name: frontendSchedule.name,
    dosage: frontendSchedule.dosage,
    scheduled_time: formatTimeForBackend(frontendSchedule.time),
    days_of_week: frontendSchedule.days,
    start_date: frontendSchedule.startDate ? frontendSchedule.startDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    end_date: frontendSchedule.endDate ? frontendSchedule.endDate.toISOString().split('T')[0] : null,
    notes: frontendSchedule.notes || null,
  };
};

// Helper function to transform backend schedule data to frontend format
export const transformScheduleForFrontend = (backendSchedule) => {
  const timeString = backendSchedule.scheduled_time;
  const [hours, minutes] = timeString.split(':');
  const time = new Date();
  time.setHours(parseInt(hours), parseInt(minutes), 0, 0);

  return {
    id: backendSchedule.id,
    name: backendSchedule.medicine_name,
    dosage: backendSchedule.dosage,
    time: time,
    days: backendSchedule.days_of_week,
    notes: backendSchedule.notes,
    isActive: backendSchedule.is_active,
    startDate: backendSchedule.start_date,
    endDate: backendSchedule.end_date,
    createdAt: backendSchedule.created_at,
    updatedAt: backendSchedule.updated_at,
  };
};

// Helper function to format time for backend (HH:MM:SS format)
const formatTimeForBackend = (date) => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}:00`;
}; 