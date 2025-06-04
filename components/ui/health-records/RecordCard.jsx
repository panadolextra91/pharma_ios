import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import RecordDetailModal from './RecordDetailModal';

const RecordCard = ({ 
  records, 
  activeTab, 
  setActiveTab, 
  onViewFile,
  emptyStateText = 'No health records found',
  onRecordUpdated
}) => {
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleCardPress = (recordId) => {
    setSelectedRecordId(recordId);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedRecordId(null);
  };

  const getIconName = (type) => {
    switch(type) {
      case 'lab': return 'science';
      case 'prescription': return 'medication';
      case 'note': return 'description';
      default: return 'folder';
    }
  };

  const getTypeLabel = (type) => {
    switch(type) {
      case 'lab': return 'Lab Results';
      case 'prescription': return 'Prescription';
      case 'note': return 'Doctor\'s Note';
      default: return 'Record';
    }
  };

  const getRecordIconStyle = (type) => {
    switch(type) {
      case 'lab':
        return {
          iconColor: '#3498db',
          backgroundColor: '#ebf3fd',
          typeColor: '#2980b9'
        };
      case 'prescription':
        return {
          iconColor: '#27ae60',
          backgroundColor: '#eafaf1',
          typeColor: '#229954'
        };
      case 'note':
        return {
          iconColor: '#f39c12',
          backgroundColor: '#fef9e7',
          typeColor: '#e67e22'
        };
      default:
        return {
          iconColor: '#95a5a6',
          backgroundColor: '#f8f9fa',
          typeColor: '#7f8c8d'
        };
    }
  };

  return (
    <>
      <Text style={styles.sectionTitle}>Clinical Summary</Text>
      <View style={styles.tabsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollView}
        >
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'all' && styles.activeTab]} 
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>All</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'lab' && styles.activeTab]} 
            onPress={() => setActiveTab('lab')}
          >
            <Text style={[styles.tabText, activeTab === 'lab' && styles.activeTabText]}>Labs</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'prescription' && styles.activeTab]} 
            onPress={() => setActiveTab('prescription')}
          >
            <Text style={[styles.tabText, activeTab === 'prescription' && styles.activeTabText]}>Prescriptions</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'note' && styles.activeTab]} 
            onPress={() => setActiveTab('note')}
          >
            <Text style={[styles.tabText, activeTab === 'note' && styles.activeTabText]}>Notes</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      <View style={styles.recordsContainer}>
        {records.length > 0 ? (
          records.map((record) => {
            const iconStyle = getRecordIconStyle(record.type);
            return (
              <TouchableOpacity 
                key={record.id} 
                style={styles.recordCard}
                onPress={() => handleCardPress(record.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.recordIcon, { backgroundColor: iconStyle.backgroundColor }]}>
                  <MaterialIcons 
                    name={getIconName(record.type)} 
                    size={24} 
                    color={iconStyle.iconColor}
                  />
                </View>
                <View style={styles.recordInfo}>
                  <View style={styles.recordHeader}>
                    <Text style={styles.recordTitle}>{record.title}</Text>
                    <Text style={styles.recordDate}>{new Date(record.date).toLocaleDateString()}</Text>
                  </View>
                  <Text style={styles.recordDoctor}>{record.doctor}</Text>
                  <Text style={styles.recordDescription} numberOfLines={1}>
                    {record.description}
                  </Text>
                  <View style={[styles.recordType, { backgroundColor: iconStyle.backgroundColor }]}>
                    <Text style={[styles.recordTypeText, { color: iconStyle.typeColor }]}>{getTypeLabel(record.type)}</Text>
                  </View>
                </View>
                <View style={styles.cardIndicator}>
                  <MaterialIcons name="chevron-right" size={24} color="#ccc" />
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons name="folder-open" size={50} color="#ccc" />
            <Text style={styles.emptyStateText}>
              {activeTab === 'all' ? emptyStateText : `No ${activeTab} records found`}
            </Text>
          </View>
        )}
      </View>
      
      <RecordDetailModal
        visible={modalVisible}
        recordId={selectedRecordId}
        onClose={closeModal}
        onRecordUpdated={onRecordUpdated}
      />
    </>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontFamily: 'DarkerGrotesque-Bold',
    fontSize: 22,
    color: '#333',
    marginBottom: 16,
    marginTop: 8,
  },
  tabsContainer: {
    marginBottom: 20,
    marginTop: -10,
  },
  tabsScrollView: {
    paddingVertical: 8,
  },
  tab: {
    paddingTop: 4,
    paddingBottom: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: 'white',
  },
  activeTab: {
    backgroundColor: '#51ffc6',
  },
  tabText: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 15,
    color: '#666',
  },
  activeTabText: {
    color: '#000',
    fontFamily: 'DarkerGrotesque-Bold',
  },
  recordsContainer: {
    paddingBottom: 100,
  },
  recordCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
  },
  recordIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  recordInfo: {
    flex: 1,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  recordTitle: {
    fontFamily: 'DarkerGrotesque-Bold',
    fontSize: 16,
    color: '#333',
  },
  recordDate: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 12,
    color: '#666',
  },
  recordDoctor: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  recordDescription: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  recordType: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingBottom: 8,
    paddingTop: 4,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  recordTypeText: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 12,
  },
  cardIndicator: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
});

export default RecordCard;
