import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, FlatList, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import BottomMenu from '../components/ui/BottomMenu';
import NewsCard from '../components/ui/news/NewsCard';
import NewsIcon from '../assets/Defibrillator.png'
import { API_URL } from '../config';

const { width } = Dimensions.get('window');

const News = () => {
  const navigation = useNavigation();
  const [activeCategory, setActiveCategory] = useState('All');
  const [newsData, setNewsData] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [featuredNews, setFeaturedNews] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [fontsLoaded] = useFonts({
    'DarkerGrotesque': require('@expo-google-fonts/darker-grotesque').DarkerGrotesque_500Medium,
    'DarkerGrotesque-Bold': require('@expo-google-fonts/darker-grotesque').DarkerGrotesque_700Bold,
  });

  // Fetch news from API
  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/news`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Transform API data to match component structure
        const transformedNews = data.data.map(item => ({
          id: item.id.toString(),
          title: item.title,
          category: item.category,
          image: item.imageUrl || item.image,
          imageUrl: item.imageUrl || item.image,
          date: new Date(item.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }),
          readTime: `${item.reading_time} min read`,
          summary: item.summary,
          content: item.content,
          featured: item.is_feature,
          createdAt: item.createdAt
        }));
        
        setNewsData(transformedNews);
        
        // Extract unique categories
        const uniqueCategories = ['All', ...new Set(transformedNews.map(item => item.category))];
        setCategories(uniqueCategories);
        
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    // Filter news based on selected category
    if (activeCategory === 'All') {
      setFilteredNews(newsData);
    } else {
      setFilteredNews(newsData.filter(item => item.category === activeCategory));
    }

    // Set featured news
    setFeaturedNews(newsData.filter(item => item.featured));
  }, [activeCategory, newsData]);

  const renderCategoryItem = (category) => (
    <TouchableOpacity 
      key={category}
      style={[styles.categoryButton, activeCategory === category && styles.activeCategoryButton]}
      onPress={() => setActiveCategory(category)}
    >
      <Text style={[styles.categoryText, activeCategory === category && styles.activeCategoryText]}>
        {category}
      </Text>
    </TouchableOpacity>
  );

  if (!fontsLoaded) {
    return null;
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.scrollView}>
          <View style={styles.headerContainer}>
            <Image source={NewsIcon} style={styles.icon} />
            <Text style={styles.header}>Health News</Text>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#51ffc6" />
            <Text style={styles.loadingText}>Loading news...</Text>
        </View>
        </View>
        <BottomMenu activeRoute="News" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.scrollView}>
          <View style={styles.headerContainer}>
            <Image source={NewsIcon} style={styles.icon} />
            <Text style={styles.header}>Health News</Text>
          </View>
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={48} color="#ff6b6b" />
            <Text style={styles.errorText}>Failed to load news</Text>
            <Text style={styles.errorSubText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchNews}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
        </View>
        </View>
        <BottomMenu activeRoute="News" />
      </View>
  );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.headerContainer}>
          <Image source={NewsIcon} style={styles.icon} />
          <Text style={styles.header}>Health News</Text>
        </View>
        
        {/* Featured News Carousel */}
        <View style={styles.featuredContainer}>
          <Text style={styles.sectionTitle}>Featured Articles</Text>
          <FlatList
            data={featuredNews}
            renderItem={({ item }) => <NewsCard newsItem={item} variant="featured" />}
            keyExtractor={item => `featured-${item.id}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredList}
          />
        </View>
        
        {/* Categories */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map(category => renderCategoryItem(category))}
        </ScrollView>
        
        {/* News List */}
        <View style={styles.newsListContainer}>
          <Text style={styles.sectionTitle}>
            {activeCategory === 'All' ? 'All Articles' : activeCategory}
          </Text>
          <FlatList
            data={filteredNews}
            renderItem={({ item }) => <NewsCard newsItem={item} />}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
      
      <BottomMenu activeRoute="News" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'DarkerGrotesque-Bold',
    marginLeft: 6,
  },
  icon: {
    width: 40,
    height: 40,
  },
  featuredContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: 'DarkerGrotesque-Bold',
    fontSize: 22,
    color: '#333',
    marginBottom: 16,
  },
  featuredList: {
    paddingRight: 16,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoriesContent: {
    paddingRight: 16,
  },
  categoryButton: {
    paddingTop: 4,
    paddingBottom: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  activeCategoryButton: {
    backgroundColor: '#51ffc6',
    borderColor: '#51ffc6',
  },
  categoryText: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 16,
    color: '#666',
  },
  activeCategoryText: {
    color: '#333',
    fontFamily: 'DarkerGrotesque-Bold',
  },
  newsListContainer: {
    marginBottom: 100, // Space for bottom menu
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'DarkerGrotesque-Bold',
    fontSize: 18,
    color: '#333',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontFamily: 'DarkerGrotesque-Bold',
    fontSize: 18,
    color: '#ff6b6b',
    marginBottom: 16,
  },
  errorSubText: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  retryButton: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#51ffc6',
  },
  retryButtonText: {
    fontFamily: 'DarkerGrotesque-Bold',
    fontSize: 18,
    color: '#333',
  },
});

export default News;