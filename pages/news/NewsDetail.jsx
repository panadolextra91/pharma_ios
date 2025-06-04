import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, Share, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { API_URL } from '../../config';

const { width } = Dimensions.get('window');

const NewsDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { newsId } = route.params || {};
  
  const [newsItem, setNewsItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [fontsLoaded] = useFonts({
      'DarkerGrotesque': require('@expo-google-fonts/darker-grotesque').DarkerGrotesque_500Medium,
      'DarkerGrotesque-Bold': require('@expo-google-fonts/darker-grotesque').DarkerGrotesque_700Bold,
    });

  // Fetch news details from API
  const fetchNewsDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/news/${newsId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch news details');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Transform API data to match component structure
        const transformedNews = {
          id: data.data.id.toString(),
          title: data.data.title,
          category: data.data.category,
          image: data.data.imageUrl || data.data.image,
          imageUrl: data.data.imageUrl || data.data.image,
          date: new Date(data.data.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }),
          readTime: `${data.data.reading_time} min read`,
          summary: data.data.summary,
          content: data.data.content,
          featured: data.data.is_feature,
          createdAt: data.data.createdAt
        };
        
        setNewsItem(transformedNews);
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (error) {
      console.error('Error fetching news details:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (newsId) {
      fetchNewsDetail();
    }
  }, [newsId]);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#51ffc6" />
        <Text style={styles.loadingText}>Loading article...</Text>
      </View>
    );
  }

  if (error || !newsItem) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialIcons name="error-outline" size={48} color="#ff6b6b" />
        <Text style={styles.errorText}>Failed to load article</Text>
        <Text style={styles.errorSubText}>{error || 'Article not found'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchNewsDetail}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this article: ${newsItem.title}`,
        url: newsItem.url || 'https://pharma.app/news/' + newsItem.id,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  // Parse content into paragraphs
  const getArticleContent = () => {
    if (!newsItem.content) {
      return [newsItem.summary || 'No content available.'];
    }
    
    // Split content by double newlines or periods followed by space to create paragraphs
    const paragraphs = newsItem.content
      .split(/\n\n|\. (?=[A-Z])/)
      .filter(paragraph => paragraph.trim().length > 0)
      .map(paragraph => paragraph.trim());
    
    return paragraphs.length > 0 ? paragraphs : [newsItem.content];
  };

  const articleContent = getArticleContent();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Image 
          source={{ uri: `${newsItem.image}?w=1000&auto=format&fit=crop` }} 
          style={styles.headerImage} 
          resizeMode="cover"
        />
        
        <View style={styles.backButtonContainer}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.contentContainer}>
          <View style={styles.categoryTag}>
            <Text style={styles.categoryText}>{newsItem.category}</Text>
          </View>
          
          <Text style={styles.title}>{newsItem.title}</Text>
          
          <View style={styles.metaInfo}>
            <Text style={styles.date}>{newsItem.date}</Text>
            <Text style={styles.readTime}>{newsItem.readTime}</Text>
          </View>
          
          <View style={styles.articleContent}>
            {articleContent.map((paragraph, index) => (
              <Text key={index} style={styles.paragraph}>{paragraph}</Text>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 18,
  },
  scrollView: {
    flex: 1,
  },
  headerImage: {
    width: '100%',
    height: 300,
  },
  backButtonContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  backButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 20,
  },
  categoryTag: {
    backgroundColor: '#51ffc6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  categoryText: {
    fontFamily: 'DarkerGrotesque-Bold',
    fontSize: 16,
    color: '#333',
  },
  title: {
    fontFamily: 'DarkerGrotesque-Bold',
    fontSize: 28,
    color: '#333',
    marginBottom: 12,
  },
  metaInfo: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  date: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 16,
    color: '#666',
    marginRight: 16,
  },
  readTime: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 16,
    color: '#666',
  },
  articleContent: {
    marginBottom: 30,
  },
  paragraph: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 18,
    color: '#333',
    lineHeight: 26,
    marginBottom: 16,
  },
  tagsContainer: {
    marginBottom: 80,
  },
  tagsTitle: {
    fontFamily: 'DarkerGrotesque-Bold',
    fontSize: 18,
    color: '#333',
    marginBottom: 12,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 14,
    color: '#666',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  shareButton: {
    backgroundColor: '#51ffc6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 10,
  },
  shareButtonText: {
    fontFamily: 'DarkerGrotesque-Bold',
    fontSize: 18,
    color: '#333',
    marginLeft: 8,
  },
  errorText: {
    fontFamily: 'DarkerGrotesque-Bold',
    fontSize: 18,
    color: '#ff6b6b',
    marginBottom: 12,
  },
  errorSubText: {
    fontFamily: 'DarkerGrotesque',
    fontSize: 16,
    color: '#666',
  },
  retryButton: {
    backgroundColor: '#51ffc6',
    padding: 14,
    borderRadius: 10,
  },
  retryButtonText: {
    fontFamily: 'DarkerGrotesque-Bold',
    fontSize: 18,
    color: '#333',
  },
});

export default NewsDetail;