import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ImageBackground,
  TextInput,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';

const SellHistory = () => {
  const { t } = useTranslation();
  const [sellHistory, setSellHistory] = useState([]);
  const [filteredSellHistory, setFilteredSellHistory] = useState([]);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const BASE_URL = 'http://192.168.0.109:3000';

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${BASE_URL}/getSaleHistory`);
        const data = await response.json();

        if (!Array.isArray(data)) throw new Error("Invalid response format");

        setSellHistory(data);
        setFilteredSellHistory(data);

        const totalAmount = data.reduce((sum, item) => sum + parseFloat(item.price), 0);
        setTotal(totalAmount);
      } catch (error) {
        console.error('Error fetching sell history:', error);
      }
    };

    fetchHistory();
  }, []);

  const handleSearch = (text) => {
    setSearchQuery(text);
    const filtered = sellHistory.filter(item =>
        item.name?.toLowerCase().includes(text.toLowerCase()) ||
        item.category?.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredSellHistory(filtered);

    const totalAmount = filtered.reduce((sum, item) => sum + parseFloat(item.price), 0);
    setTotal(totalAmount);
  };

  return (
      <View style={styles.container}>
        {/* Background Image Layer */}
        <ImageBackground
            source={require("../assets/background2.png")}
            style={styles.background}
            resizeMode="cover"
        />

        {/* Foreground Content Layer */}
        <View style={styles.content}>
          <Text style={styles.title}>{t('sellHistoryTitle')}</Text>

          <TextInput
              style={styles.searchBar}
              placeholder={t('searchPlaceholder') || "Search by product or category"}
              value={searchQuery}
              onChangeText={handleSearch}
          />

          <FlatList
              data={filteredSellHistory}
              keyExtractor={(item, index) => index.toString()}
              contentContainerStyle={styles.list}
              renderItem={({ item }) => {
                if (!item || !item.name) return null;
                return (
                    <View style={styles.card}>
                      <Text>{t('productLabel')}: {item.name}</Text>
                      <Text>{t('categoryLabel')}: {item.category}</Text>
                      <Text>{t('quantitySoldLabel')}: {item.quantity}</Text>
                      <Text>{t('priceLabel')}: ₹{parseFloat(item.price).toFixed(2)}</Text>
                      <Text>{t('dateLabel')}: 🕒 {new Date(item.created_at).toLocaleString()}</Text>
                    </View>
                );
              }}
          />

          <Text style={styles.totalText}>
            {t('totalAmountLabel')}: ₹{total.toFixed(2)}
          </Text>
        </View>
      </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    width: width,
    height: height,
  },
  content: {
    flex: 1,
    padding: 20,
    zIndex: 1, // ensures it's above the background
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    color: "#0077b6",
    alignSelf: 'center',
  },
  searchBar: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 16,
    marginBottom: 15,
    marginHorizontal: '5%',
    elevation: 3,
  },
  list: {
    paddingBottom: 80,
  },
  card: {
    backgroundColor: '#caf0f8',
    padding: 20,
    borderRadius: 20,
    marginVertical: 10,
    width: '90%',
    alignSelf: 'center',
    elevation: 5,
  },
  totalText: {
    color: 'black',
    fontSize: 25,
    fontWeight: 'bold',
    marginTop: 10,
    alignSelf: 'center',
  },
});

export default SellHistory;
