import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Fontisto from '@expo/vector-icons/Fontisto';

const MetricsCard = ({ 
  healthMetrics, 
  metricsLoading, 
  onUpdateBMI, 
  onUpdateBP, 
  onUpdateBloodType, 
  onUpdateBMR 
}) => {
  
  const getMetricIconStyle = (type) => {
    switch(type) {
      case 'bmi':
        return {
          iconColor: '#3498db',
          backgroundColor: '#ebf3fd',
          shadowColor: '#3498db'
        };
      case 'bp':
        return {
          iconColor: '#e74c3c',
          backgroundColor: '#fdf2f2',
          shadowColor: '#e74c3c'
        };
      case 'bloodtype':
        return {
          iconColor: '#8e44ad',
          backgroundColor: '#f8f4fd',
          shadowColor: '#8e44ad'
        };
      case 'bmr':
        return {
          iconColor: '#f39c12',
          backgroundColor: '#fef9e7',
          shadowColor: '#f39c12'
        };
      default:
        return {
          iconColor: '#51ffb4',
          backgroundColor: '#e8faf4',
          shadowColor: '#51ffb4'
        };
    }
  };

  return (
    <>
      <Text style={styles.sectionTitle}>Health Metrics</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.metricsScroll} contentContainerStyle={styles.metricsContainer}>
        <TouchableOpacity onPress={onUpdateBMI} activeOpacity={0.8}>
          <View style={styles.metricCard}>
            <View style={[styles.iconContainer, { backgroundColor: getMetricIconStyle('bmi').backgroundColor }]}>
              {metricsLoading ? (
                <ActivityIndicator size={24} color={getMetricIconStyle('bmi').iconColor} />
              ) : (
                <MaterialIcons 
                  name="monitor-weight" 
                  size={24} 
                  color={getMetricIconStyle('bmi').iconColor}
                />
              )}
            </View>
            <Text style={styles.metricTitle}>BMI</Text>
            <Text style={styles.metricValue}>{healthMetrics.bmi.value}</Text>
            <Text style={styles.metricSubtext}>{healthMetrics.bmi.category}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={onUpdateBP} activeOpacity={0.8}>
          <View style={styles.metricCard}>
            <View style={[styles.iconContainer, { backgroundColor: getMetricIconStyle('bp').backgroundColor }]}>
              {metricsLoading ? (
                <ActivityIndicator size={24} color={getMetricIconStyle('bp').iconColor} />
              ) : (
                <MaterialIcons 
                  name="favorite" 
                  size={24} 
                  color={getMetricIconStyle('bp').iconColor}
                />
              )}
            </View>
            <Text style={styles.metricTitle}>Blood Pressure</Text>
            <Text style={styles.metricValue}>{healthMetrics.bloodPressure.systolic}/{healthMetrics.bloodPressure.diastolic}</Text>
            <Text style={styles.metricSubtext}>{healthMetrics.bloodPressure.date || 'Not recorded'}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={onUpdateBloodType} activeOpacity={0.8}>
          <View style={styles.metricCard}>
            <View style={[styles.iconContainer, { backgroundColor: getMetricIconStyle('bloodtype').backgroundColor }]}>
              {metricsLoading ? (
                <ActivityIndicator size={24} color={getMetricIconStyle('bloodtype').iconColor} />
              ) : (
                <MaterialIcons 
                  name="bloodtype" 
                  size={24} 
                  color={getMetricIconStyle('bloodtype').iconColor}
                />
              )}
            </View>
            <Text style={styles.metricTitle}>Blood Type</Text>
            <Text style={styles.metricValue}>{healthMetrics.bloodType}</Text>
            <Text style={styles.metricSubtext}>{healthMetrics.bloodType.includes('O-') ? 'Universal donor' : healthMetrics.bloodType.includes('AB+') ? 'Universal recipient' : ''}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={onUpdateBMR} activeOpacity={0.8}>
          <View style={styles.metricCard}>
            <View style={[styles.iconContainer, { backgroundColor: getMetricIconStyle('bmr').backgroundColor }]}>
              {metricsLoading ? (
                <ActivityIndicator size={24} color={getMetricIconStyle('bmr').iconColor} />
              ) : (
                <Fontisto 
                  name="fire" 
                  size={20} 
                  color={getMetricIconStyle('bmr').iconColor}
                />
              )}
            </View>
            <Text style={styles.metricTitle}>BMR</Text>
            <Text style={styles.metricValue}>{healthMetrics.bmr.value}</Text>
            <Text style={styles.metricSubtext}>{healthMetrics.bmr.category}</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
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
  metricsScroll: {
    marginBottom: 20,
  },
  metricsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
    height: 150,
  },
  metricCard: {
    width: 120,
    height: 140,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  metricTitle: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 15,
    color: '#666',
    marginTop: 4,
  },
  metricValue: {
    fontFamily: 'DarkerGrotesque-Bold',
    fontSize: 22,
    color: '#333',
    marginTop: 2,
  },
  metricSubtext: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
});

export default MetricsCard;
