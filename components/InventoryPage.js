import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, ImageBackground,
  LayoutAnimation, UIManager, Platform, ToastAndroid,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from "@react-navigation/native";
import { PieChart } from 'react-native-chart-kit';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Inventory() {
  const { t } = useTranslation();
  const [submittedData, setSubmittedData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
      useCallback(() => {
        loadInventory();
      }, [])
  );

  const loadInventory = async () => {
    try {
      const response = await fetch('http://192.168.0.109:3000/getProductInventory');
      const data = await response.json();

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setSubmittedData(data);
      showToast(t('dataUpdated'));
    } catch (error) {
      console.log('Error loading inventory:', error);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadInventory().then(() => setRefreshing(false));
  }, []);

  const inventoryData = submittedData.reduce((acc, item) => {
    const category = item.category || 'Uncategorized';
    if (!acc[category]) acc[category] = {};
    if (!acc[category][item.product]) acc[category][item.product] = { quantity: 0, price: 0 };

    acc[category][item.product].quantity += parseFloat(item.quantity);
    acc[category][item.product].price += parseFloat(item.price);
    return acc;
  }, {});

  const inventoryList = [];
  const pieChartData = [];

  Object.keys(inventoryData).forEach((category) => {
    Object.keys(inventoryData[category]).forEach((product) => {
      const item = inventoryData[category][product];
      const pricePerUnit = item.price / item.quantity;

      inventoryList.push({
        category,
        name: product,
        quantity: item.quantity,
        pricePerUnit,
        totalPrice: item.price,
      });

      pieChartData.push({
        name: `${product} (${category})`,
        quantity: item.quantity,
        color: getRandomColor(),
        legendFontColor: '#000',
        legendFontSize: 12,
      });
    });
  });

  function getRandomColor() {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  }

  function showToast(message) {
    ToastAndroid.showWithGravity(message, ToastAndroid.SHORT, ToastAndroid.BOTTOM);
  }

  return (
      <ImageBackground
          source={require('../assets/background2.png')}
          style={styles.background}
      >
        <Text style={styles.header}>{t('inventoryOverviewTitle')}</Text>

        {pieChartData.length > 0 ? (
            <PieChart
                data={pieChartData}
                width={350}
                height={220}
                chartConfig={{
                  backgroundColor: '#2A6F97',
                  backgroundGradientFrom: '#A9D6E5',
                  backgroundGradientTo: '#AED9E0',
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor="quantity"
                backgroundColor="transparent"
                paddingLeft="10"
                absolute
            />
        ) : (
            <Text style={styles.noData}>{t('noDataMessage')}</Text>
        )}

        <ScrollView
            contentContainerStyle={styles.gridContainer}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {inventoryList.map((item, index) => (
              <View key={`${item.category}-${item.name}-${index}`} style={styles.card}>
                <Text style={styles.categoryText}>
                  {t('categoryLabel')}: <Text style={styles.boldText}>{item.category}</Text>
                </Text>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDetail}>
                  {t('quantityLabel')}: {item.quantity} Kg
                </Text>
                <Text style={styles.itemDetail}>
                  {t('pricePerUnitLabel')}: ₹{item.pricePerUnit.toFixed(2)}
                </Text>
                <Text style={styles.totalPrice}>
                  {t('totalPriceLabel')}: ₹{item.totalPrice.toFixed(2)}
                </Text>
              </View>
          ))}
        </ScrollView>
      </ImageBackground>
  );
}
const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    padding: 20,
    paddingTop: 40,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0077b6',
    textAlign: 'center',
    marginBottom: 15,
  },
  noData: {
    fontSize: 16,
    color: '#333',
    marginVertical: 10,
    textAlign: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#caf0f8',
    padding: 15,
    borderRadius: 20,
    width: '47%',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  categoryText: {
    fontSize: 14,
    color: '#264653',
    marginBottom: 5,
  },
  boldText: {
    fontWeight: 'bold',
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#023047',
  },
  itemDetail: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e76f51',
    marginTop: 8,
  },
});
