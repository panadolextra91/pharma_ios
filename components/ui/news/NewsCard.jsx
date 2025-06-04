import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useFonts } from 'expo-font';
import { useNavigation } from '@react-navigation/native';

const NewsCard = ({ newsItem, variant = 'regular' }) => {
  const navigation = useNavigation();
  
  const [fontsLoaded] = useFonts({
    'DarkerGrotesque': require('@expo-google-fonts/darker-grotesque').DarkerGrotesque_500Medium,
    'DarkerGrotesque-Bold': require('@expo-google-fonts/darker-grotesque').DarkerGrotesque_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handlePress = () => {
    navigation.navigate('NewsDetail', { newsId: newsItem.id });
  };

  if (variant === 'featured') {
    return (
      <TouchableOpacity 
        style={styles.featuredCard}
        onPress={handlePress}
      >
        <Image 
          source={{ uri: newsItem.imageUrl || newsItem.image }} 
          style={styles.featuredImage} 
          resizeMode="cover"
        />
        <View style={styles.featuredOverlay}>
          <View style={styles.featuredCategoryTag}>
            <Text style={styles.featuredCategoryText}>{newsItem.category}</Text>
          </View>
          <Text style={styles.featuredTitle}>{newsItem.title}</Text>
          <View style={styles.featuredFooter}>
            <Text style={styles.featuredDate}>{newsItem.date}</Text>
            <Text style={styles.featuredReadTime}>{newsItem.readTime}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      style={styles.newsCard}
      onPress={handlePress}
    >
      <Image 
        source={{ uri: newsItem.imageUrl || newsItem.image }} 
        style={styles.newsImage} 
        resizeMode="cover"
      />
      <View style={styles.newsContent}>
        <View style={styles.categoryTag}>
          <Text style={styles.categoryTagText}>{newsItem.category}</Text>
        </View>
        <Text style={styles.newsTitle}>{newsItem.title}</Text>
        <Text style={styles.newsSummary}>{newsItem.summary}</Text>
        <View style={styles.newsFooter}>
          <Text style={styles.newsDate}>{newsItem.date}</Text>
          <Text style={styles.readTime}>{newsItem.readTime}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Regular news card styles
  newsCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  newsImage: {
    width: '100%',
    height: 200,
  },
  newsContent: {
    padding: 16,
  },
  categoryTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  categoryTagText: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 14,
    color: '#666',
  },
  newsTitle: {
    fontFamily: 'DarkerGrotesque-Bold',
    fontSize: 18,
    color: '#333',
    marginBottom: 8,
  },
  newsSummary: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  newsDate: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 14,
    color: '#999',
  },
  readTime: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 14,
    color: '#999',
  },

  // Featured news card styles
  featuredCard: {
    width: 320,
    height: 250,
    borderRadius: 15,
    marginRight: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    position: 'absolute',
    height: '60%',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  featuredCategoryTag: {
    backgroundColor: '#51ffc6',
    paddingHorizontal: 10,
    paddingBottom: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  featuredCategoryText: {
    fontFamily: 'DarkerGrotesque-Bold',
    fontSize: 14,
    color: '#333',
  },
  featuredTitle: {
    fontFamily: 'DarkerGrotesque-Bold',
    fontSize: 18,
    color: '#fff',
    marginBottom: 8,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  featuredDate: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 14,
    color: '#fff',
  },
  featuredReadTime: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 14,
    color: '#fff',
  },
});

export default NewsCard;
