import React, { useRef, useState, useEffect, useCallback } from "react";
import { View, TouchableOpacity, Text, ScrollView, Image, Dimensions, StyleSheet, Animated, Modal, BackHandler, Alert, Button, Linking, Platform, StatusBar, Easing } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { useFocusEffect } from "@react-navigation/native";
import ProfileMain from "../components/ProfileMain";
import Theme from "../components/Theme";
import { useDispatch, useSelector } from "react-redux";
import { userData } from "../src/features/userRegister/RegisterSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAadharDetail } from "../src/features/aadharKyc/AadharSlice";
import WhatsAppLogo from "../assets/whatsApp.png"
import { LinearGradient } from "expo-linear-gradient";
import { withAlpha } from "../utils/helper";
import { useCameraPermission } from "react-native-vision-camera";


const images = [
  { src: require("../assets/10.png"), action: "Membership" },
  { src: require("../assets/2.png"), action: "LoanSelectionScreen" },
];

const { width } = Dimensions.get("window");

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ============================================================
// Marquee Component with Right to Left Animation
// ============================================================
const MarqueeComponent = ({ message }) => {
  const scrollPosition = useRef(new Animated.Value(0)).current;
  const animationRef = useRef(null);
  const [textWidth, setTextWidth] = useState(0);
  const [marqueeWidth, setMarqueeWidth] = useState(SCREEN_WIDTH);
  const gap = 30;

  const startAnimation = useCallback(() => {
    const distance = textWidth ? -(textWidth + gap) : -1000;
    const startFrom = marqueeWidth || SCREEN_WIDTH;
    const travelDistance = startFrom + Math.abs(distance);
    const baseDistance = SCREEN_WIDTH + 1000;
    const duration = (travelDistance / baseDistance) * 20000;

    scrollPosition.setValue(startFrom);
    animationRef.current?.stop();

    animationRef.current = Animated.loop(
      Animated.timing(scrollPosition, {
        toValue: distance,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    animationRef.current.start();
  }, [gap, marqueeWidth, scrollPosition, textWidth]);

  useEffect(() => {
    if (!message) return;

    startAnimation();

    return () => {
      animationRef.current?.stop();
    };
  }, [message, startAnimation]);

  return (
    <View style={styles.marqueeOuter}>
      <View
        style={styles.marqueeContainer}
        onLayout={(event) => {
          const width = event.nativeEvent.layout.width;
          if (width && width !== marqueeWidth) {
            setMarqueeWidth(width);
          }
        }}
      >
        <View style={styles.marqueeInner}>
          <Animated.Text
            style={[
              styles.marqueeText,
              {
                transform: [{ translateX: scrollPosition }],
              },
            ]}
            numberOfLines={1}
            onLayout={(event) => {
              const width = event.nativeEvent.layout.width;
              if (width && width !== textWidth) {
                setTextWidth(width);
              }
            }}
          >
            📢 {message}
          </Animated.Text>
          <Animated.Text
            style={[
              styles.marqueeText,
              {
                transform: [{ translateX: scrollPosition }],
                marginLeft: gap,
              },
            ]}
            numberOfLines={1}
          >
            📢 {message}
          </Animated.Text>
        </View>
      </View>
    </View>
  );
};

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();



  const indexRef = useRef(0);
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);

  const startAuto = useCallback(() => {
    stopAuto();
    timerRef.current = setInterval(() => {
      const next = (indexRef.current + 1) % images.length;
      indexRef.current = next;
      setIndex(next);
      scrollViewRef.current?.scrollTo({ x: next * SCREEN_WIDTH, animated: true });
    }, 3000);
  }, []);


  const stopAuto = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);


  useEffect(() => {
    startAuto();
    return stopAuto;
  }, [startAuto, stopAuto]);

  const user = useSelector((state) => state.register.user);
  const { AadharDetail } = useSelector((state) => state.aadhar);

  useEffect(() => {
    dispatch(getAadharDetail());
  }, [dispatch]);


  const handleBannerPress = (action) => {
    try {
      if (typeof action === "string" && action.startsWith("http")) {
        Linking.openURL(action);
      } else {
        navigation.navigate(action);
      }
    } catch (e) {
      console.log("Banner press error", e);
    }
  };


  useFocusEffect(
    useCallback(() => {
      dispatch(userData());
    }, [dispatch])
  );

  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const listener = scrollX.addListener(({ value }) => {
      const index = Math.floor(value / width) % images.length;
      setCurrentIndex(index);
    });

    return () => scrollX.removeListener(listener);
  }, [scrollX]);

  useEffect(() => {
    // Removed duplicate auto-scroll; handled by startAuto/stopAuto
  }, [currentIndex]);


  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const { hasPermission, requestPermission } = useCameraPermission();

  const OpenScanner = async () => {
    if (hasPermission) {
      navigation.navigate("Scan");
    } else {
      await requestPermission();
      if (hasPermission) {
        navigation.navigate("Scan");
      }
    }
  };

  // ============================================================================================================================
  // Handle Online Offline Kyc Mode through Admin Dyanmically
  // ============================================================================================================================

  const [kycMode, setKycMode] = useState();

  const handleKycMode = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      };
      const response = await axios.get(
        `https://bbpslcrapi.lcrpay.com/misc/get_kyc_mode`,
        { headers }
      );
      console.log(`this is kyc mode ------>`, response.data);
      setKycMode(response?.data?.kyc_mode);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Axios Error:",
          error.response?.status,
          error.response?.data
        );

        if (error.response?.status === 404) {
          Alert.alert("Error", "Requested resource not found (404)");
        }
      } else {
        console.error("Unexpected Error:", error);
        Alert.alert("Error", "Something went wrong!");
      }
    }
  };

  const handlekyc = async () => {
    await handleKycMode();

    console.log("Current KYC Mode:", kycMode);

    if (kycMode === "online") {
      console.log("=======", user);

      // ✅ 2. Check Aadhar KYC Status
      if (user?.user?.aadhar_verification_status === false && user?.user?.pan_verification_status === false && user?.user?.email_verification_status === false) {
        return navigation.navigate("Profile");
      }
      console.log("Aadhaar", user?.user?.aadhar_verification_status);
      console.log("pankyc", user?.user.pan_verification_status);
      console.log("Email", user?.user?.email_verification_status);

      // ✅ 3. Check PAN KYC Status (Only if Aadhar is submitted)
      if (user?.user?.aadhar_verification_status === true && user?.user?.pan_verification_status === false && user?.user?.email_verification_status === false) {
        return navigation.navigate("Profile3");
      }
      // ✅ 1. Check Email Verification First
      // if (user?.user?.aadhar_verification_status === true && user?.user?.pan_verification_status === true && user?.user?.email_verification_status === false) {
      //   return navigation.navigate("Profile4");
      // }

      // ✅ 4. If Everything is Submitted, Navigate to Final Verification
      if (
        user?.user?.pan_verification_status === true &&
        user?.user?.aadhar_verification_status === true &&
        user?.user?.email_verification_status === true
      ) {
        return navigation.navigate("KycSubmited");
      }
    } else if (kycMode === "offline") {
      // ✅ 2. Check Aadhar KYC Status
      if (
        user?.aadharkycStatus === "pending" ||
        user?.aadharkycStatus === "rejected"
      ) {
        return navigation.navigate("OfflineKyc");
      }

      // ✅ 3. Check PAN KYC Status (Only if Aadhar is submitted)
      if (
        user?.aadharkycStatus === "submited" &&
        (user?.pankycStatus === "pending" || user?.pankycStatus === "rejected")
      ) {
        return navigation.navigate("Panverify");
      }

      // ✅ 4. If Everything is Submitted, Navigate to Final Verification
      if (
        user?.pankycStatus === "submited" &&
        user?.aadharkycStatus === "submited" &&
        user?.user?.Email
      ) {
        return navigation.navigate("KycSubmited");
      }

      // ✅ 1. Check Email Verification First
      // if (!user?.user?.Email) {
      //   return navigation.navigate("Profile4");
      // }
    }
  };

  useEffect(() => {
    handleKycMode();
  }, []);



  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate("HomeScreen");
        return true;
      };

    }, [navigation])
  );




  // =============================================================
  // Ask for the fingerPrint
  // =============================================================
  const [fingerStatus, setFingerStatus] = useState(null);
  const [modalVisible, setModalVisible] = useState(true);


  const GetFingerPrintStatus = async () => {
    try {
      headers = { "Content-Type": "application/json" };
      const token = await AsyncStorage.getItem("access_token");
      if (!token) throw new Error("No access token found");
      headers["Authorization"] = `Bearer ${token}`;

      const response = await axios.get(
        "https://bbpslcrapi.lcrpay.com/misc/get_fingerprint_status",
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("response Get Status", response.data)
      setFingerStatus(response.data["fingerprint_status"])

    } catch (error) {
      console.log(error)
    }
  }

  const setFingerPrintStatus = async (fingerStatus) => {
    try {
      headers = { "Content-Type": "application/json" };
      const token = await AsyncStorage.getItem("access_token");
      if (!token) throw new Error("No access token found");
      headers["Authorization"] = `Bearer ${token}`;

      console.log(fingerStatus)
      const response = await axios.post(
        "https://bbpslcrapi.lcrpay.com/misc/set_fingerprint_status",
        { type: fingerStatus },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("register/create_pin", response.data)

    } catch (error) {
      console.log(error)
    }
  }




  // ============================================================
  // Get Marke Banners
  // ============================================================

  const [marqueBanners, setmarqueBanners] = useState();

  const fetchmarqueBanners = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      };
      const response = await axios.get(
        `https://bbpslcrapi.lcrpay.com/misc/get_news`,
        { headers }
      );
      console.log(`misc/get_new------>`, response.data);
      setmarqueBanners(response?.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Axios Error:",
          error.response?.status,
          error.response?.data
        );

        if (error.response?.status === 404) {
          Alert.alert("Error", "Requested resource not found (404)");
        }
      } else {
        console.error("Unexpected Error:", error);
        Alert.alert("Error", "Something went wrong!");
      }
    }
  };


  useEffect(() => {
    GetFingerPrintStatus()
    fetchmarqueBanners()
  }, [])




  // =====================================================================
  // More Section code come Here
  // ===================================================================
  const MEMBERSHIP_GRADIENT = [withAlpha("#5F259F", 0.12), withAlpha("#5F259F", 0.35), withAlpha("#5F259F", 0.12)];
  const BG_GRADIENT = [withAlpha(Theme.colors.primary, 0.98), withAlpha("#0b1020", 0.98)];
  const ICON_GRADIENT = [withAlpha(Theme.colors.primary, 0.9), "#7C3AED"]; // purple accent



  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Theme.colors.primary }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Theme.colors.primary}
      />
      <LinearGradient colors={BG_GRADIENT} style={styles.gradientBg}>
        <View style={styles.container}>


         

          {/* ========================================================== */}
          {/* FingerPint Not Set for Status code 1 */}
          {/* ========================================================== */}

          {(fingerStatus === 0) && (
            <Modal animationType="slide" transparent={true} visible={modalVisible}>
              <View style={styles.modalBackground}>
                <View style={styles.modalContainer}>
                  <Image
                    source={require("../assets/FingerPrint4.png")}
                    style={styles.fingerprintImage}
                  />
                  <Text style={styles.modalTitle}>Enable Secure Login</Text>
                  <Text style={styles.modalSubtitle}>
                    Going forward, for added security, we’ll ask you to unlock before
                    you make any transaction.
                  </Text>

                  <TouchableOpacity
                    style={styles.enableButton}
                    onPress={() => {
                      setFingerPrintStatus(1)
                      setModalVisible(false)
                    }}
                  >
                    <Text style={styles.enableButtonText}>Enable Now</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.skipTextContainer}
                    onPress={() => {
                      setFingerPrintStatus(2);
                      setModalVisible(false)
                    }}
                  >
                    <Text style={styles.skipText}>I don’t want to add Security</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          )
          }

          {isDrawerOpen && <ProfileMain closeDrawer={toggleDrawer} />}




          {(user?.aadharKycStatus !== "verified" &&
            user?.panKycStatus !== "verified") && (
              <TouchableOpacity
                onPress={handlekyc}
                style={styles.kycButton}
              >

                <Text style={styles.kycText}>Your KYC Is Pending</Text>

              </TouchableOpacity>
            )}

          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <TouchableOpacity onPress={toggleDrawer}>
                <Image
                  source={AadharDetail?.aadhar_details ? { uri: `data:image/jpeg;base64,${AadharDetail?.aadhar_details?.photo}` } : require("../assets/Profilee.png")}
                  style={styles.profileImage}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.addressContainer}>
                <Text style={styles.addressText}>
                  {user?.user?.MobileNumber || "Loading..."}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.headerRight}>
              <View style={styles.headerRightIcons}>
                <TouchableOpacity onPress={() => navigation.navigate("NotificationScreen")}>
                  <MaterialIcons
                    name="notifications"
                    size={24}
                    color={Theme.colors.secondary}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate("HelpSupport")}>
                  <MaterialIcons
                    name="help-outline"
                    size={24}
                    color={Theme.colors.secondary}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

           {/* =================================================================== */}
          {/* Marque Banner */}
          {/* =================================================================== */}
          {(marqueBanners?.Hidden == true && marqueBanners?.content) && (
            <MarqueeComponent 
              message={marqueBanners?.content}
            />
          )}
          

          <ScrollView contentContainerStyle={{ paddingBottom: 2 }}>


            {/* Prime Membership */}
            <TouchableOpacity
              activeOpacity={0.95}
              onPress={() => navigation.navigate("Membership")}
              style={{ borderRadius: 18, overflow: "hidden", marginHorizontal: 10, marginBottom: 15 }}
            >
              {user?.user?.prime_status ? (
                <LinearGradient
                  colors={[withAlpha(Theme.colors.primary, 0.18), withAlpha(Theme.colors.primary, 0.06)]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.memberCard, styles.primeMemberCardAlt]}
                >
                  <View style={styles.primeContentRow}>
                    <View style={{ flex: 1 }}>
                      <View style={styles.primeHeaderRow}>
                        <View style={styles.badgePill}>
                          <MaterialIcons name="workspace-premium" size={16} color="#2D2D86" />
                          <Text style={styles.badgeText}>PRIME</Text>
                        </View>

                      </View>

                      <Text style={styles.primeTitle}>{"You're a Prime Member"}</Text>
                      <Text style={styles.primeSubtitle}>Thanks for being a Prime member. Enjoy exclusive benefits.</Text>
                    </View>

                    <View style={styles.primeImageWrap}>
                      <View style={styles.primeGlow} />
                      <Image source={require("../assets/LifeTime.png")} style={styles.primeImage} />
                    </View>
                  </View>
                </LinearGradient>
              ) : (
                <LinearGradient
                  colors={MEMBERSHIP_GRADIENT}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.memberCard]}
                >
                  <View style={styles.memberContent}>
                    <View style={{ flex: 1 }}>
                      <View style={styles.badgeRow}>
                        <View style={styles.badge}>
                          <MaterialIcons name="workspace-premium" size={16} color={Theme?.colors?.primary} />
                          <Text style={styles.badgeText}>Prime</Text>
                        </View>
                      </View>

                      <Text style={styles.memberTitle}>Lifetime Prime Membership</Text>
                      <Text style={styles.memberSub}>Get it today for just ₹{user?.primePrice}</Text>


                    </View>

                    <Image source={require("../assets/non_prime.png")} style={styles.memberImage} />
                  </View>
                </LinearGradient>
              )}
            </TouchableOpacity>

            {/* Refer & Earn  */}

            <View style={styles.features}>

              <TouchableOpacity
                onPress={() => navigation.navigate("ScratchCardScreen")}
              >
                <View style={styles.feature}>
                  <TouchableOpacity style={styles.iconContainerr}>
                    <MaterialIcons
                      name="local-offer"
                      size={15}
                      color={Theme.colors.secondary}
                    />
                  </TouchableOpacity>
                  <Text style={styles.featureText}>Explore{"\n"}Rewards</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate("ReferralScreen")}

              >
                <View style={styles.feature}>
                  <TouchableOpacity style={styles.iconContainerr}>
                    <MaterialIcons
                      name="share"
                      size={15}
                      color={Theme.colors.secondary}
                    />
                  </TouchableOpacity>
                  <Text style={styles.featureText}>Refer &{"\n"}Earn LCR</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* BANNERS */}
            <View style={styles.bannerWrap}>
              <Animated.ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                scrollEventThrottle={16}
                showsHorizontalScrollIndicator={false}
                removeClippedSubviews={false}
                style={styles.bannerScroller}                // 👈 give it height
                contentContainerStyle={styles.bannerContent} // 👈 keep slides centered
                onScrollBeginDrag={stopAuto}
                onScrollEndDrag={startAuto}
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                  { useNativeDriver: false }
                )}
              >
                {images.map(({ src, action }, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleBannerPress(action)}
                    activeOpacity={0.85}
                    style={styles.bannerSlide} // 👈 width-per-page
                  >
                    <Image
                      source={src}
                      style={styles.bannerImage}
                      onError={(e) => console.log("Banner image error", index, e.nativeEvent)}
                      onLoadStart={() => console.log("Banner image load start", index)}
                      onLoad={() => console.log("Banner image loaded", index)}
                    />
                  </TouchableOpacity>
                ))}
              </Animated.ScrollView>
              <View style={styles.dotsRow}>
                {images.map((_, i) => (
                  <View key={`dot-${i}`} style={[styles.dot, i === currentIndex ? styles.dotActive : null]} />
                ))}
              </View>
            </View>

            <View style={styles.bbpscontainerlogo}>
              <TouchableOpacity
                style={styles.bbpscontainerlogo}
                onPress={() => navigation.navigate("AllServices")}
                activeOpacity={0.7}
              >
                <View style={styles.logoWrap}>
                  <Image
                    source={require("../assets/BmnemonicReverse.png")}
                    style={styles.bbpsimg}
                  />
                </View>

                <Text style={[styles.sectionTitle, { marginLeft: 0, marginTop: 7, color: "white", fontSize: 18 }]}>
                  Bill Payments
                </Text>
              </TouchableOpacity>
            </View>

            {/* ===================================================================================== */}
            {/*Recharge  */}
            {/* ===================================================================================== */}

            <View style={styles.rechargeAndPayBillsContainer}>
              <View style={styles.rechargeAndPayBills}>
                <View style={styles.sectionRow}>
                  <Text style={styles.sectionTitle}>Recharge</Text>
                  <TouchableOpacity onPress={() => navigation.navigate("AllServices")}>
                    <Text style={styles.viewAllLink}>View All</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.serviceGrid}>

                  <TouchableOpacity
                    style={styles.serviceCard}
                    onPress={() => navigation.navigate("Recharge1")}
                  >
                    <LinearGradient colors={ICON_GRADIENT} style={styles.iconContainer}>
                      <MaterialIcons
                        name="smartphone"
                        size={24}
                        color={Theme.colors.secondary}
                      />
                    </LinearGradient>
                    <Text style={styles.serviceCardText}>Mobile{"\n"}Prepaid</Text>
                  </TouchableOpacity>




                  <TouchableOpacity
                    style={styles.serviceCard}
                    onPress={() =>
                      navigation.navigate("FastagTransaction", {
                        endpoint: "DTH",
                        name: "DTH Recharge",
                        btnName: "Recharge DTH",
                        reminder: "Pay DTH Recharge",
                      })
                    }
                  >
                    <LinearGradient colors={ICON_GRADIENT} style={styles.iconContainer}>
                      <MaterialIcons
                        name="settings-input-antenna"
                        size={24}
                        color={Theme.colors.secondary}
                      />
                    </LinearGradient>
                    <Text style={styles.serviceCardText}>DTH</Text>
                  </TouchableOpacity>




                  <TouchableOpacity
                    style={styles.serviceCard}
                    onPress={() =>
                      navigation.navigate("FastagTransaction", {
                        endpoint: "Fastag",
                        name: "FASTAG Recharge",
                        btnName: "Add New Vehicle",
                        reminder: "Zip through toll Plazas",
                      })
                    }
                  >
                    <LinearGradient colors={ICON_GRADIENT} style={styles.iconContainer}>
                      <MaterialIcons
                        name="directions-car"
                        size={24}
                        color={Theme.colors.secondary}
                      />
                    </LinearGradient>
                    <Text style={styles.serviceCardText}>FASTag</Text>
                  </TouchableOpacity>




                </View>
              </View>
            </View>



            {/* ===================================================================================== */}
            {/*Bill's Pay  */}
            {/* ===================================================================================== */}

            <View style={[styles.insuranceSection, { marginTop: 6 }]}>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>Bill's Pay</Text>
                <TouchableOpacity onPress={() => navigation.navigate("AllServices")}>
                  <Text style={styles.viewAllLink}>View All</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.serviceGrid}>

                <TouchableOpacity
                  style={styles.serviceCard}
                  onPress={() =>
                    navigation.navigate("FastagTransaction", {
                      endpoint: "Electricity",
                      name: "Electricity Recharge",
                      btnName: "Pay Electricity Bill",
                      reminder: "Pay Electricity Plans",
                    })
                  }
                >
                  <LinearGradient colors={ICON_GRADIENT} style={styles.iconContainer}>
                    <MaterialIcons
                      name="electrical-services"
                      size={24}
                      color={Theme.colors.secondary}
                    />
                  </LinearGradient>
                  <Text style={styles.serviceCardText}>Electricity</Text>
                </TouchableOpacity>


                <TouchableOpacity
                  style={styles.serviceCard}
                  onPress={() =>
                    navigation.navigate("FastagTransaction", {
                      endpoint: "Landline Postpaid",
                      name: "Landline Postpaid Recharge",
                      btnName: "Add New Landline",
                      reminder: "Pay Landline Plans",
                    })
                  }
                >
                  <LinearGradient colors={ICON_GRADIENT} style={styles.iconContainer}>
                    <MaterialIcons
                      name="phone-in-talk"
                      size={24}
                      color={Theme.colors.secondary}
                    />
                  </LinearGradient>
                  <Text style={styles.serviceCardText}>Landline</Text>
                </TouchableOpacity>




                <TouchableOpacity
                  style={styles.serviceCard}
                  onPress={() =>
                    navigation.navigate("FastagTransaction", {
                      endpoint: "Broadband Postpaid",
                      name: "Broadband Recharge",
                      btnName: "Broadband Recharge",
                      reminder: "Pay Broadband Recharge",
                    })
                  }
                >
                  <LinearGradient colors={ICON_GRADIENT} style={styles.iconContainer}>
                    <MaterialIcons
                      name="wifi"
                      size={24}
                      color={Theme.colors.secondary}
                    />
                  </LinearGradient>
                  <Text style={styles.serviceCardText}>Broadband</Text>
                </TouchableOpacity>

              </View>

            </View>

            {/* ===================================================================================== */}
            {/*More Services */}
            {/* ===================================================================================== */}
            <View style={[styles.insuranceSection, { marginTop: 6 }]}>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>Learn & Earn</Text>
                <TouchableOpacity onPress={() => navigation.navigate("AllServices")}>
                  <Text style={styles.viewAllLink}>View All</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.serviceGrid}>

                <TouchableOpacity
                  style={styles.serviceCard}
                  onPress={() => navigation.navigate("LoanSelectionScreen")}
                >
                  <LinearGradient colors={ICON_GRADIENT} style={styles.iconContainer}>
                    <MaterialIcons
                      name="account-balance-wallet"
                      size={24}
                      color={Theme.colors.secondary}
                    />
                  </LinearGradient>
                  <Text style={styles.serviceCardText}>Loan</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.serviceCard}
                  onPress={() => navigation.navigate("RealStateScreen")}
                >
                  <LinearGradient colors={ICON_GRADIENT} style={styles.iconContainer}>
                    <MaterialIcons
                      name="home-work"
                      size={24}
                      color={Theme.colors.secondary}
                    />
                  </LinearGradient>
                  <Text style={styles.serviceCardText}>
                    Real Estate
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.serviceCard}
                  onPress={() => navigation.navigate("Insurance")}
                >
                  <LinearGradient colors={ICON_GRADIENT} style={styles.iconContainer}>
                    <MaterialIcons
                      name="verified-user"
                      size={24}
                      color={Theme.colors.secondary}
                    />
                  </LinearGradient>
                  <Text style={styles.serviceCardText}>Insurance</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.serviceCard}
                  onPress={() => navigation.navigate("BludClub")}
                >
                  <LinearGradient colors={ICON_GRADIENT} style={styles.iconContainer}>
                    <MaterialIcons
                      name="volunteer-activism"
                      size={24}
                      color={Theme.colors.secondary}
                    />
                  </LinearGradient>
                  <Text style={styles.serviceCardText}>
                    Blud Club
                  </Text>
                </TouchableOpacity>


                <TouchableOpacity
                  style={styles.serviceCard}
                  onPress={() => navigation.navigate("Education")}
                >
                  <LinearGradient colors={ICON_GRADIENT} style={styles.iconContainer}>
                    <MaterialIcons
                      name="school"
                      size={24}
                      color={Theme.colors.secondary}
                    />
                  </LinearGradient>
                  <Text style={styles.serviceCardText}>
                    Education
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.serviceCard}
                  onPress={() => navigation.navigate("DigitalMarketing")}
                >
                  <LinearGradient colors={ICON_GRADIENT} style={styles.iconContainer}>
                    <MaterialIcons
                      name="campaign"
                      size={24}
                      color={Theme.colors.secondary}
                    />
                  </LinearGradient>
                  <Text style={styles.serviceCardText}>
                    Digital Marketing
                  </Text>
                </TouchableOpacity>


              </View>

            </View>


            {/* ===================================================================================== */}
            {/*Housing & Utilities  */}
            {/* ===================================================================================== */}
            <View style={styles.loanSectionContainer}>
              <View style={styles.loanSection}>
                <View style={styles.sectionRow}>
                  <Text style={styles.sectionTitle}>Housing & Utilities</Text>
                  <TouchableOpacity onPress={() => navigation.navigate("AllServices")}>
                    <Text style={styles.viewAllLink}>View All</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.serviceGrid}>


                  <TouchableOpacity
                    style={styles.serviceCard}
                    onPress={() =>
                      navigation.navigate("FastagTransaction", {
                        endpoint: "LPG Gas",
                        name: "LPG Recharge",
                        btnName: "Pay LPG Bill",
                        reminder: "Pay LPG Bill",
                      })
                    }
                  >
                    <LinearGradient colors={ICON_GRADIENT} style={styles.iconContainer}>
                      <MaterialIcons
                        name="local-gas-station"
                        size={24}
                        color={Theme.colors.secondary}
                      />
                    </LinearGradient>
                    <Text style={styles.serviceCardText}>LPG</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.serviceCard}
                    onPress={() =>
                      navigation.navigate("FastagTransaction", {
                        endpoint: "Gas",
                        name: "piped Gas Recharge",
                        btnName: "Pay Gas Bill",
                        reminder: "Pay Gas Bill",
                      })
                    }
                  >
                    <LinearGradient colors={ICON_GRADIENT} style={styles.iconContainer}>
                      <MaterialIcons
                        name="propane"
                        size={24}
                        color={Theme.colors.secondary}
                      />
                    </LinearGradient>
                    <Text style={styles.serviceCardText}>Piped Gas</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.serviceCard}
                    onPress={() =>
                      navigation.navigate("FastagTransaction", {
                        endpoint: "Rental",
                        name: "Rent payment",
                        btnName: "Pay Rent",
                        reminder: "Pay Rent payment",
                      })
                    }
                  >
                    <LinearGradient colors={ICON_GRADIENT} style={styles.iconContainer}>
                      <MaterialIcons
                        name="home-work"
                        size={24}
                        color={Theme.colors.secondary}
                      />
                    </LinearGradient>
                    <Text style={styles.serviceCardText}>Rent</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>


            {/* ===================================================================================== */}
            {/*Finance */}
            {/* ===================================================================================== */}
            <View style={styles.insuranceSection}>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>Finance</Text>
                <TouchableOpacity onPress={() => navigation.navigate("AllServices")}>
                  <Text style={styles.viewAllLink}>View All</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.serviceGrid}>
                <TouchableOpacity
                  style={styles.serviceCard}
                  onPress={() =>
                    navigation.navigate("FastagTransaction", {
                      endpoint: "Credit Card",
                      name: "Credit card Bill",
                      btnName: "Pay Credit card Bill",
                      reminder: "Pay Credit card Bill",
                    })
                  }
                >
                  <LinearGradient colors={ICON_GRADIENT} style={styles.iconContainer}>
                    <MaterialIcons
                      name="credit-score"
                      size={24}
                      color={Theme.colors.secondary}
                    />
                  </LinearGradient>
                  <Text style={styles.serviceCardText}>Credit{"\n"}Card</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.serviceCard}
                  onPress={() =>
                    navigation.navigate("FastagTransaction", {
                      endpoint: "Loan Repayment",
                      name: "Loan Repayment",
                      btnName: "Pay Loan premium",
                      reminder: "Pay Loan premium",
                    })
                  }
                >
                  <LinearGradient colors={ICON_GRADIENT} style={styles.iconContainer}>
                    <MaterialIcons
                      name="request-quote"
                      size={24}
                      color={Theme.colors.secondary}
                    />
                  </LinearGradient>
                  <Text style={styles.serviceCardText}>
                    Loan{"\n"}Repayment
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.serviceCard}
                  onPress={() =>
                    navigation.navigate("FastagTransaction", {
                      endpoint: "Insurance",
                      name: "Insurance premium",
                      btnName: "Pay Insurance premium",
                      reminder: "Pay Insurance premium",
                    })
                  }
                >
                  <LinearGradient colors={ICON_GRADIENT} style={styles.iconContainer}>
                    <MaterialIcons
                      name="health-and-safety"
                      size={24}
                      color={Theme.colors.secondary}
                    />
                  </LinearGradient>
                  <Text style={styles.serviceCardText}>Insurance</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.serviceCard}
                  onPress={() =>
                    navigation.navigate("FastagTransaction", {
                      endpoint: "Recurring Deposit",
                      name: "Recurring Deposit",
                      btnName: "Pay Recurring Deposit",
                      reminder: "Pay Recurring Deposit",
                    })
                  }
                >
                  <LinearGradient colors={ICON_GRADIENT} style={styles.iconContainer}>
                    <MaterialIcons
                      name="currency-exchange"
                      size={24}
                      color={Theme.colors.secondary}
                    />
                  </LinearGradient>
                  <Text style={styles.serviceCardText}>
                    Recurring{"\n"}Deposit
                  </Text>
                </TouchableOpacity>
              </View>
            </View>




          </ScrollView>



          {/* Bottom Tab Bar */}
          <View style={styles.bottomNavigation}>
            <TouchableOpacity style={styles.bottomNavItem}>
              <MaterialIcons name="home" size={24} color={Theme.colors.secondary} />
              <Text style={styles.bottomNavText}>Home</Text>
            </TouchableOpacity>


            <TouchableOpacity
              style={styles.bottomNavItem}
              onPress={() => navigation.navigate("History")}
            >
              <MaterialIcons
                name="swap-horiz"
                size={24}
                color={Theme.colors.secondary}
              />
              <Text style={styles.bottomNavText}>History</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.bottomNavItem} onPress={OpenScanner}>
              <View style={styles.centerButton}>
                <View style={styles.circle}>
                  <MaterialIcons
                    name="qr-code-scanner"
                    size={45}
                    color={Theme.colors.primary}
                  />
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bottomNavItem}
              onPress={() => navigation.navigate("SearchScreen")}
            >
              <MaterialIcons
                name="search"
                size={24}
                color={Theme.colors.secondary}
              />
              <Text style={styles.bottomNavText}>Search</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bottomNavItem}
              onPress={() => {
                user?.user?.TransactionPIN
                  ? navigation.navigate("CheckBalanceBanks")
                  : navigation.navigate("SettingScreen");
              }}
            >
              <MaterialIcons name="money" size={24} color={Theme.colors.secondary} />
              <Text style={styles.bottomNavText}>Balance</Text>
            </TouchableOpacity>
          </View>

        </View>



        {/* WhatsApp floating button (fixed at right–bottom) */}
        <TouchableOpacity
          style={styles.whatsAppFab}
          activeOpacity={0.85}
          onPress={() => Linking.openURL("https://wa.me/918130760448?text=Hello")}
        >
          <Image source={WhatsAppLogo} style={styles.whatsAppIcon} resizeMode="contain" />
        </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  gradientBg: { flex: 1 },
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  bbpsimg: {
    width: 60,
    height: 40,
    resizeMode: "contain",

  },
  bannerWrap: {
    width: "100%",
    alignItems: "center",
  },
  bannerScroller: {
    height: 120,
  },
  bannerContent: {
    alignItems: "center",
  },
  bannerSlide: {
    width: width,
    paddingHorizontal: 10,
    justifyContent: "center",
  },
  bannerImage: {
    width: "100%",
    height: 110,
    borderRadius: 10,
    resizeMode: "stretch",
  },
  dotsRow: { flexDirection: "row", gap: 6, marginTop: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: withAlpha("#fff", 0.35) },
  dotActive: { width: 16, backgroundColor: "#fff" },

  profileImage: {
    width: 40,
    height: 40,
    padding: 20,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: Theme.colors.secondary,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  addressText: {
    color: Theme.colors.secondary,
    fontSize: 12,
    marginRight: 5,
  },
  headerRight: {
    flexDirection: "column",
    alignItems: "center",
  },
  headerRightIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  kycButton: {
    backgroundColor: "#efe9ae",
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  kycText: {
    color: "black",
    fontSize: 12,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  imageContainer: {
    width: width,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,

  },
  image: {
    width: "100%",
    height: 110,
    resizeMode: "stretch",
    borderRadius: 10,
  },
  indexText: {
    position: "absolute",
    bottom: 10,
    fontSize: 18,
    color: Theme.colors.secondary,
  },
  navigationButtons: {
    position: "absolute",
    bottom: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    width: width * 0.9,
  },
  buttonText: {
    fontSize: 18,
    color: Theme.colors.secondary,
  },

  moneyTransfersContainer: {
    backgroundColor: Theme.colors.secondary,
    // paddingVertical: 10,
    borderRadius: 10,
    marginVertical: 5,
    alignSelf: "center",
    width: "95%",
    elevation: 3,
  },
  moneyTransfers: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
  },
  transferOption: {
    alignItems: "center",
  },
  transferOptionText: {
    color: Theme.colors.primary,
    fontSize: 12,
    marginTop: 5,
    textAlign: "center",
  },
  iconContainer: {
    padding: 10,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: 5,
  },
  upiContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 25,
    marginVertical: 10,
  },
  upiLite: {
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    flex: 1,
    marginRight: 10,
    borderWidth: 0.5,
    borderColor: Theme.colors.primary,
  },
  upiLiteText: {
    color: "black",
    fontSize: 10,
  },
  upiId: {
    flexDirection: "row",
    alignItems: "center",
    width: "45%",
    borderRadius: 5,
    justifyContent: "center",
    paddingHorizontal: 20,
    borderWidth: 0.5,
    borderColor: Theme.colors.primary,
  },
  upiIdText: {
    color: "black",
    fontSize: 10,
    marginLeft: 10,
  },
  featuresContainer: {
    // backgroundColor: Theme.colors.secondary,
    paddingVertical: 10,
    marginVertical: -20,
    // borderRadius: 10,
    width: "107%",
    alignSelf: "center",
    overflow: "hidden",
  },
  features: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    padding: 5,
    flexWrap: "wrap",
  },
  feature: {
    alignItems: "center",
    backgroundColor: Theme.colors.secondary,
    height: 60,
    width: 165,
    borderRadius: 10,
    justifyContent: "center",
    flexDirection: "row",
  },
  iconContainerr: {
    backgroundColor: Theme.colors.primary,
    padding: 5,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    marginRight: 5,
  },
  featureText: {
    color: Theme.colors.primary,
    fontSize: 12,
    marginTop: 5,
    textAlign: "center",
  },
  bbpscontainerlogo: {
    backgroundColor: Theme.colors.primary,
    borderRadius: 10,
    marginVertical: 1,
    width: "95%",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 0,
    padding: 0,
  },
  logoWrap: {
    width: 54,
    height: 40,
    overflow: "hidden",
    marginRight: 0,
  },

  rechargeAndPayBillsContainer: {
    backgroundColor: Theme.colors.secondary,
    borderRadius: 10,
    marginVertical: 1,
    width: "95%",
    alignSelf: "center",
  },
  rechargeAndPayBills: { padding: 15 },
  sectionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  viewAllLink: { color: Theme.colors.primary, fontWeight: "700", fontSize: 12, textDecorationLine: "underline" },
  serviceGrid: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  serviceCard: {
    width: "23%",
    alignItems: "center",
    backgroundColor: Theme.colors.white,
    borderRadius: 12,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
    ...Platform.select({ ios: { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } }, android: { elevation: 2 } })
  },
  serviceCardText: { color: Theme.colors.primary, fontSize: 11, marginTop: 6, textAlign: "center" },
  loanSectionContainer: {
    backgroundColor: Theme.colors.secondary,
    borderRadius: 10,
    marginVertical: 5,
    width: "95%",
    alignSelf: "center",
  },
  loanSection: { padding: 15 },
  viewAllButton: {
    position: "absolute",
    top: 15,
    right: 15,
  },
  viewAllButtonText: {
    color: Theme.colors.primary,
    fontSize: 14,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  insuranceSection: { paddingHorizontal: 15, paddingVertical: 15, backgroundColor: Theme.colors.secondary, borderRadius: 10, marginVertical: 1, width: "95%", alignSelf: "center" },
  sectionTitle: { fontSize: 16, fontWeight: "900", marginBottom: 0, color: Theme.colors.text },
  moreSectionContainer: {
    backgroundColor: Theme.colors.secondary,
    paddingVertical: 10,
    borderRadius: 10,
    marginVertical: 5,
    width: "95%",
    alignSelf: "center",
  },
  moreSection: {
    padding: 15,
  },
  moreOptions: {
    flexDirection: "row",
    justifyContent: "space-around",
    flexWrap: "wrap",
  },
  moreOption: {
    alignItems: "center",
  },
  moreOptionText: {
    color: "green",
    fontSize: 12,
    marginTop: 5,
    textAlign: "center",
  },
  bottomNavigation: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: Theme.colors.navbar_color,
  },
  bottomNavItem: {
    alignItems: "center",
  },
  bottomNavText: {
    color: Theme.colors.secondary,
    fontSize: 12,
    marginTop: 5,
  },
  centerButton: {
    position: "absolute",
    // top
    bottom: -15,
  },
  circle: {
    width: 80,
    height: 80,
    borderRadius: 60,
    backgroundColor: Theme.colors.secondary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Theme.colors.primary,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "flex-end", // Align modal at the bottom
    backgroundColor: "rgba(0,0,0,0.5)", // Dimmed background
  },
  modalContainer: {
    backgroundColor: "#fff",
    width: "100%", // Full width
    height: "55%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 25,
    paddingHorizontal: 20,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.6,
    shadowRadius: 5,
    position: "absolute",
    bottom: 0,
  },
  fingerprintImage: {
    width: 100,
    height: 120,
    marginBottom: 30,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  enableButton: {
    backgroundColor: Theme.colors.primary,
    width: "100%",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  enableButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  skipTextContainer: {
    marginTop: 10,
  },
  skipText: {
    color: "#1A73E8",
    fontSize: 14,
    textDecorationLine: "underline",
    marginTop: 15,
  },




  // whats App logo fiexed at right bottom 
  whatsAppFab: {
    position: "absolute",
    right: 16,
    bottom: 80,
    zIndex: 999,
    borderRadius: 28,
    padding: 10,
  },
  whatsAppIcon: {
    width: 46,
    height: 46,
  },




  // Prime Membership 
  memberCard: {
    borderRadius: 18, overflow: "hidden", borderWidth: 1, borderColor: Theme.colors.borderLight, backgroundColor: Theme.colors.white,
    ...Platform.select({ ios: { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }, android: { elevation: 2 } })
  },
  primeMemberCard: {
    borderWidth: 0,
    backgroundColor: "transparent",
  },
  memberContent: { padding: 16, flexDirection: "row", alignItems: "center", gap: 12 },
  badgeRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  badge: {
    alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999,
    backgroundColor: withAlpha(Theme.colors.primary, 0.16), borderWidth: 1, borderColor: withAlpha(Theme.colors.primary, 0.30), marginBottom: 8
  },
  badgeText: { color: Theme.colors.primary, fontWeight: "800", fontSize: 12 },
  memberTitle: { fontSize: 16, fontWeight: "900", color: Theme.colors.text },
  memberSub: { fontSize: 12, color: Theme.colors.subtext, marginTop: 2 },
  memberImage: { width: 86, height: 86, resizeMode: "contain" },

  activeBadgeContainer: { backgroundColor: "#e6ffed", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  activeBadgeText: { color: "#2e7d32", fontWeight: "700", fontSize: 12 },

  memberActionsRow: { marginTop: 10, alignItems: "flex-start" },
  manageButton: { flexDirection: "row", backgroundColor: "#2D2D86", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  manageButtonText: { color: "#fff", fontWeight: "700" },
  memberSinceText: { color: "#444", fontSize: 12, marginTop: 8 },

  activateButtonHome: { marginTop: 10, backgroundColor: Theme.colors.primary, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, alignItems: "center", width: 150 },
  activateButtonHomeText: { color: "#fff", fontWeight: "700" },

  /* Prime alt layout */
  primeMemberCardAlt: { borderRadius: 18, paddingHorizontal: 18, paddingVertical: 14, overflow: "hidden" },
  primeContentRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  primeHeaderRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },
  badgePill: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: "#fff" },
  ribbonActive: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, backgroundColor: "rgba(46,125,50,0.08)" },
  ribbonText: { color: "#2e7d32", fontWeight: "700", fontSize: 12, marginLeft: 6 },
  primeTitle: { fontSize: 18, fontWeight: "900", color: Theme.colors.text, marginBottom: 6 },
  primeSubtitle: { fontSize: 13, color: Theme.colors.subtext, marginBottom: 8 },
  primeActionsRow: { flexDirection: "row", gap: 10, alignItems: "center", marginTop: 6 },
  manageButtonPrime: { flexDirection: "row", backgroundColor: "#2D2D86", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, alignItems: "center" },
  secondaryButton: { flexDirection: "row", backgroundColor: "rgba(255,255,255,0.9)", paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, alignItems: "center" },
  secondaryButtonText: { color: "#2D2D86", fontWeight: "700" },
  primeImage: { width: 110, height: 110, resizeMode: "contain" },
  primeImageWrap: { width: 120, alignItems: "center", justifyContent: "center", position: "relative" },
  primeGlow: { position: "absolute", width: 140, height: 140, borderRadius: 70, backgroundColor: "rgba(245,197,24,0.18)", zIndex: -1, top: -10, left: 4 },

  // Marquee Banner Styles
  marqueeOuter: {
    width: "95%",
    alignSelf: "center",
    marginVertical: 10,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#edece9ff",
  },
  marqueeImage: {
    width: "100%",
    height: 140,
    resizeMode: "cover",
  },
  marqueeContent: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  marqueeTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 4,
  },
  marqueeSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 8,
    fontWeight: "500",
  },
  marqueeContainer: {
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: withAlpha(Theme.colors.primary, 0.18),
    paddingVertical: 10,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  marqueeInner: {
    flexDirection: "row",
    width: "100%",
  },
  marqueeText: {
    fontSize: 12,
    fontWeight: "600",
    color: Theme.colors.primary,
    paddingHorizontal: 8,
    whiteSpace: "nowrap",
  },

});

export default HomeScreen;
