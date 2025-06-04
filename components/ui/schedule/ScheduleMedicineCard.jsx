import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ScheduleMedicineCard = ({ 
  medicine, 
  onEdit, 
  onDelete, 
  onTimePress,
  formatTime,
  formatDays,
  isEditing,
  daysOfWeek,
  onToggleDay
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isExpired = () => {
    if (!medicine.endDate) return false;
    const today = new Date();
    const endDate = new Date(medicine.endDate);
    today.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    return endDate < today;
  };

  const getStatusColor = () => {
    if (isExpired()) return '#ff6b6b';
    return medicine.isActive ? '#51ffc6' : '#ffa726';
  };

  const getStatusText = () => {
    if (isExpired()) return 'Expired';
    return medicine.isActive ? 'Active' : 'Inactive';
  };

  const getStatusIcon = () => {
    if (isExpired()) return 'time-outline';
    return medicine.isActive ? 'checkmark-circle' : 'pause-circle';
  };

  return (
    <View style={[styles.medicineCard, isExpired() && styles.expiredCard]}>
      <View style={styles.medicineHeader}>
        <View style={styles.nameContainer}>
          <Text style={styles.medicineName}>{medicine.name}</Text>
          {isExpired() && (
            <View style={styles.expiredBadge}>
              <Ionicons name="time-outline" size={12} color="#fff" />
              <Text style={styles.expiredBadgeText}>EXPIRED</Text>
            </View>
          )}
        </View>
        <View style={styles.medicineActions}>
          <TouchableOpacity onPress={() => onEdit(medicine)}>
            <Ionicons 
              name="pencil" 
              size={24} 
              color="#51ffc6" 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(medicine.id)}>
            <Ionicons name="trash" size={24} color="#ff6b6b" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.medicineDetail}>
        <Ionicons name="time" size={20} color="#666" />
        <TouchableOpacity onPress={() => onTimePress(medicine.id)}>
          <Text style={styles.detailText}>{formatTime(medicine.time)}</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.medicineDetail}>
        <Ionicons name="calendar" size={20} color="#666" />
        <Text style={styles.detailText}>{formatDays(medicine.days)}</Text>
      </View>
      
      <View style={styles.medicineDetail}>
        <Ionicons name="medical" size={20} color="#666" />
        <Text style={styles.detailText}>{medicine.dosage}</Text>
      </View>

      <View style={styles.medicineDetail}>
        <Ionicons name="calendar-outline" size={20} color="#666" />
        <Text style={styles.detailText}>
          Start: {formatDate(medicine.startDate)}
        </Text>
      </View>

      <View style={styles.medicineDetail}>
        <Ionicons name="calendar-clear-outline" size={20} color="#666" />
        <Text style={styles.detailText}>
          End: {medicine.endDate ? formatDate(medicine.endDate) : 'No end date'}
        </Text>
      </View>

      {medicine.notes && (
        <View style={styles.medicineDetail}>
          <Ionicons name="document-text" size={20} color="#666" />
          <Text style={styles.detailText}>{medicine.notes}</Text>
        </View>
      )}

      <View style={styles.medicineDetail}>
        <Ionicons 
          name={getStatusIcon()} 
          size={20} 
          color={getStatusColor()} 
        />
        <Text style={[styles.detailText, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
      </View>
      
      {isEditing && (
        <View style={styles.daysContainer}>
          {daysOfWeek.map(day => (
            <TouchableOpacity
              key={day.id}
              style={[
                styles.dayButton,
                medicine.days.includes(day.id) && styles.dayButtonActive
              ]}
              onPress={() => onToggleDay(day.id)}
            >
              <Text style={medicine.days.includes(day.id) ? styles.dayTextActive : styles.dayText}>
                {day.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  medicineCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  expiredCard: {
    backgroundColor: '#fef7f7',
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b6b',
  },
  medicineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  nameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  medicineName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  expiredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
  },
  expiredBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  medicineActions: {
    flexDirection: 'row',
    gap: 12,
  },
  medicineDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  detailText: {
    color: '#666',
    fontSize: 16,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  dayButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  dayButtonActive: {
    backgroundColor: '#51ffc6',
  },
  dayText: {
    color: '#666',
  },
  dayTextActive: {
    color: '#333',
    fontWeight: '600',
  },
});

export default ScheduleMedicineCard;
