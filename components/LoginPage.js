import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Animated as RNAnimated,
  Pressable,
  SafeAreaView,
  Dimensions,
} from "react-native";
import Animated, { FadeIn, BounceIn, ZoomIn } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { LanguageContext } from "./style";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
// useEffect(() => {
//   const loadCredentials = async () => {
//     try {
//       const storedUsername = await AsyncStorage.getItem("savedUsername");
//       const storedPassword = await AsyncStorage.getItem("savedPassword");
//
//       if (storedUsername) setUsername(storedUsername);
//       if (storedPassword) setPassword(storedPassword);
//     } catch (error) {
//       console.error("Failed to load saved credentials:", error);
//     }
//   };

//   loadCredentials();
// }, []);

export default function LoginPage() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { changeLanguage, language } = useContext(LanguageContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [usernameError, setUsernameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const background = require('../assets/background2.png');

  const languageOptions = [
    { label: "తెలుగు", value: "telugu" },
    { label: "English", value: "english" },
    { label: "हिंदी", value: "hindi" },
  ];
  const { width, height } = Dimensions.get('screen');
  const [shakeUsername] = useState(new RNAnimated.Value(0));
  const [shakePassword] = useState(new RNAnimated.Value(0));

  const triggerShake = (anim) => {
    anim.setValue(0);
    RNAnimated.sequence([
      RNAnimated.timing(anim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      RNAnimated.timing(anim, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      RNAnimated.timing(anim, {
        toValue: 6,
        duration: 100,
        useNativeDriver: true,
      }),
      RNAnimated.timing(anim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleLogin = async () => {
    Keyboard.dismiss();
    let hasError = false;

    if (!username) {
      setUsernameError(true);
      triggerShake(shakeUsername);
      hasError = true;
    } else {
      setUsernameError(false);
    }

    if (!password) {
      setPasswordError(true);
      triggerShake(shakePassword);
      hasError = true;
    } else {
      setPasswordError(false);
    }

    if (hasError) return;

    setIsLoggingIn(true);

    try {
      const response = await fetch("http://192.168.0.109:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (result.success) {
        if (result.token) await AsyncStorage.setItem("userToken", result.token);
        if (result.role) await AsyncStorage.setItem("userRole", result.role);
        if (result.username) await AsyncStorage.setItem("username", result.username);
        if (result.user_id) await AsyncStorage.setItem("userId", result.user_id.toString());

        navigation.navigate("Main");
      } else {
        setUsernameError(true);
        setPasswordError(true);
        triggerShake(shakeUsername);
        triggerShake(shakePassword);
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSelectLanguage = (lang) => {
    changeLanguage(lang);
    setLanguageModalVisible(false);
  };

  return (
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ImageBackground
                source={background}
                style={[styles.background, { width, height }]}
                resizeMode="cover"
            >
              <Animated.View entering={BounceIn.delay(300)} style={styles.container}>
                <Animated.Text
                    entering={ZoomIn.duration(1000)}
                    style={styles.brandTitle}
                >
                  GIRIBAZAR
                </Animated.Text>

                {/* Language Selection */}
                <TouchableOpacity
                    style={styles.languageCard}
                    onPress={() => setLanguageModalVisible(true)}
                >
                  <Text style={styles.languageCardText}>
                    {languageOptions.find((l) => l.value === language)?.label || t("selectLanguage")}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#000" />
                </TouchableOpacity>

                <Text style={styles.loginText}>{t("login")}</Text>

                {/* Username Field */}
                <RNAnimated.View style={{ transform: [{ translateX: shakeUsername }] }}>
                  <View style={[styles.inputBox, usernameError && styles.inputError]}>
                    <MaterialIcons name="person" size={22} color="#666" style={styles.iconStyle} />
                    <TextInput
                        style={styles.inputField}
                        placeholder="Username"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                        placeholderTextColor="#666"
                    />
                  </View>
                </RNAnimated.View>

                {/* Password Field */}
                <RNAnimated.View style={{ transform: [{ translateX: shakePassword }] }}>
                  <View style={[styles.inputBox, passwordError && styles.inputError]}>
                    <Ionicons name="lock-closed" size={22} color="#666" style={styles.iconStyle} />
                    <TextInput
                        style={styles.inputField}
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        placeholderTextColor="#666"
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons
                          name={showPassword ? "eye-off" : "eye"}
                          size={22}
                          color="#666"
                          style={styles.iconStyle}
                      />
                    </TouchableOpacity>
                  </View>
                </RNAnimated.View>

                {/* Continue Button */}
                <Animated.View entering={ZoomIn.delay(600)}>
                  <Pressable
                      onPress={handleLogin}
                      disabled={isLoggingIn}
                      style={({ pressed }) => [
                        styles.continueButton,
                        { transform: [{ scale: pressed ? 0.96 : 1 }] },
                      ]}
                  >
                    {isLoggingIn ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.continueText}>{t("continue")}</Text>
                    )}
                  </Pressable>
                </Animated.View>
              </Animated.View>

              {/* Language Selection Modal */}
              {languageModalVisible && (
                  <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                      {languageOptions.map((lang, index) => (
                          <TouchableOpacity
                              key={index}
                              style={[
                                styles.modalItem,
                                language === lang.value && styles.selectedLanguageItem,
                              ]}
                              onPress={() => handleSelectLanguage(lang.value)}
                          >
                            <Text style={styles.modalItemText}>{lang.label}</Text>
                          </TouchableOpacity>
                      ))}
                      <TouchableOpacity onPress={() => setLanguageModalVisible(false)} style={styles.modalCancel}>
                        <Text style={{ fontSize: 16, color: "#0077B6" }}>{t("cancel")}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
              )}
            </ImageBackground>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'black', // fallback background
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    zIndex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 20,
  },
  languageCard: {
    width: 240,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    marginBottom: 20,
  },
  languageCardText: {
    fontSize: 16,
    color: "#333",
  },
  loginText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 15,
    width: 300,
    height: 50,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  iconStyle: {
    marginRight: 10,
  },
  inputField: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  inputError: {
    borderColor: "red",
    borderWidth: 1.5,
  },
  continueButton: {
    backgroundColor: "#0077B6",
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 12,
    marginTop: 20,
  },
  continueText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 99,
  },
  modalContent: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 16,
    width: "80%",
    elevation: 5,
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  selectedLanguageItem: {
    backgroundColor: "#E0F7FA",
    borderRadius: 8,
  },
  modalItemText: {
    fontSize: 16,
    color: "#333",
  },
  modalCancel: {
    marginTop: 15,
    alignItems: "center",
  },
  brandTitle: {
    fontSize: 42,
    fontWeight: "900",
    color: "#0077B6",
    marginBottom: 40,
    letterSpacing: 3,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    fontFamily: Platform.OS === "ios" ? "HelveticaNeue-Bold" : "sans-serif-condensed",
  },
});