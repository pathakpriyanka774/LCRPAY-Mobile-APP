import React from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { withAlpha } from "../utils/helper";
import Theme from "./Theme";

// Color constants matching home screen exactly
const ICON_GRADIENT = [withAlpha(Theme.colors.primary, 0.9), "#7C3AED"];

const AllServices = () => {
  const navigation = useNavigation();
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = Math.max(
    Math.floor((screenWidth - 16 * 2 - 14 * 2 - 12) / 2),
    0
  );

  const serviceSections = [
    {
      title: "Recharge & Bill Pay",
      subtitle: "Quickly top-up and clear your bills",
      items: [
        {
          iconName: "phone-android",
          text: "Mobile Prepaid",
          onPress: () => navigation.navigate("Recharge1"),
        },
        {
          iconName: "phonelink-ring",
          text: "Mobile Postpaid",
          onPress: () =>
            navigation.navigate("FastagTransaction", {
              endpoint: "Mobile Postpaid",
              name: "Postpaid Recharge",
              btnName: "Prepaid Recharge",
              reminder: "Postpaid Recharge",
            }),
        },
        {
          iconName: "directions-car",
          text: "FASTag",
          disabled: true,
          comingSoon: true,
        },
        {
          iconName: "contact-phone",
          text: "Landline",
          onPress: () =>
            navigation.navigate("FastagTransaction", {
              endpoint: "Landline Postpaid",
              name: "Landline Postpaid Recharge",
              btnName: "Add New Landline",
              reminder: "Pay Landline Plans",
            }),
        },
      ],
    },
    {
      title: "Housing & Utilities",
      subtitle: "Essentials for your home in one place",
      items: [
        {
          iconName: "electrical-services",
          text: "Electricity",
          onPress: () =>
            navigation.navigate("FastagTransaction", {
              endpoint: "Electricity",
              name: "Electricity Recharge",
              btnName: "Pay Electricity Bill",
              reminder: "Pay Electricity Plans",
            }),
        },
        {
          iconName: "ev-station",
          text: "EV Recharge",
          onPress: () =>
            navigation.navigate("FastagTransaction", {
              endpoint: "EV Recharge",
              name: "EV Recharge",
              btnName: "Recharge EV",
              reminder: "Pay EV Recharge",
            }),
        },
        {
          iconName: "whatshot",
          text: "LPG",
          onPress: () =>
            navigation.navigate("FastagTransaction", {
              endpoint: "LPG Gas",
              name: "LPG Recharge",
              btnName: "Pay LPG Bill",
              reminder: "Pay LPG Bill",
            }),
        },
        {
          iconName: "local-fire-department",
          text: "Piped Gas",
          onPress: () =>
            navigation.navigate("FastagTransaction", {
              endpoint: "Gas",
              name: "piped Gas Recharge",
              btnName: "Pay Gas Bill",
              reminder: "Pay Gas Bill",
            }),
        },

        {
          iconName: "local-gas-station",
          text: "Fleet Card Recharge",
          onPress: () =>
            navigation.navigate("FastagTransaction", {
              endpoint: "Fleet Card Recharge",
              name: "Recharge Fleet Card",
              btnName: "Fleet Card Recharge",
              reminder: "Pay Fleet Card Recharge",
            }),
        },
        {
          iconName: "apartment",
          text: "Rental",
          onPress: () =>
            navigation.navigate("FastagTransaction", {
              endpoint: "Rental",
              name: "Rent payment",
              btnName: "Pay Rent",
              reminder: "Pay Rent payment",
            }),
        },
        
        {
          iconName: "home-work",
          text: "Housing Society",
          onPress: () =>
            navigation.navigate("FastagTransaction", {
              endpoint: "Housing Society",
              name: "Housing Society payment",
              btnName: "Pay Housing Society",
              reminder: "Pay Housing Society",
            }),
        },
        {
          iconName: "water-drop",
          text: "Water Bill",
          onPress: () =>
            navigation.navigate("FastagTransaction", {
              endpoint: "Water",
              name: "Housing Water Bill payment",
              btnName: "Pay Walter Bill",
              reminder: "Pay  Walter Bill",
            }),
        },
        {
          iconName: "group-work",
          text: "Clubs and Associations",
          onPress: () =>
            navigation.navigate("FastagTransaction", {
              endpoint: "Clubs and Associations",
              name: "Clubs and Associations payment",
              btnName: "Pay Clubs & AssociationsBill",
              reminder: "Pay AssociationsBill",
            }),
        },
        {
          iconName: "speed",
          text: "Prepaid Meter",
          onPress: () =>
            navigation.navigate("FastagTransaction", {
              endpoint: "Prepaid Meter",
              name: "Prepaid Meter payment",
              btnName: "Prepaid Meter Payment",
              reminder: "Pay Prepaid Meter",
            }),
        },
      ],
    },
    {
      title: "Finance",
      subtitle: "Stay current on money matters",
      items: [
        {
          iconName: "credit-card",
          text: "Credit Card",
          onPress: () =>
            navigation.navigate("FastagTransaction", {
              endpoint: "Credit Card",
              name: "Credit card Bill",
              btnName: "Pay Credit card Bill",
              reminder: "Pay Credit card Bill",
            }),
        },

        {
          iconName: "person-search",
          text: "Agent Collection",
          onPress: () =>
            navigation.navigate("FastagTransaction", {
              endpoint: "Agent Collection",
              name: "Agent Collection",
              btnName: "Collect Payment",
              reminder: "Agent Collection Reminder",
            }),
        },

        {
          iconName: "account-balance-wallet",
          text: "Loan Repayment",
          onPress: () =>
            navigation.navigate("FastagTransaction", {
              endpoint: "Loan Repayment",
              name: "Loan Repayment",
              btnName: "Pay Loan premium",
              reminder: "Pay Loan premium",
            }),
        },
        {
          iconName: "gpp-good",
          text: "Insurance",
          onPress: () =>
            navigation.navigate("FastagTransaction", {
              endpoint: "Insurance",
              name: "Insurance premium",
              btnName: "Pay Insurance premium",
              reminder: "Pay Insurance premium",
            }),
        },
        {
          iconName: "savings",
          text: "Recurring Deposit",
          onPress: () =>
            navigation.navigate("FastagTransaction", {
              endpoint: "Recurring Deposit",
              name: "Recurring Deposit",
              btnName: "Pay Recurring Deposit",
              reminder: "Pay Recurring Deposit",
            }),
        },
        {
          iconName: "school",
          text: "Education Fees",
          onPress: () =>
            navigation.navigate("FastagTransaction", {
              endpoint: "Education Fees",
              name: "Education payment",
              btnName: "Pay Education Fees",
              reminder: "Pay Education Fees",
            }),
        },
        {
          iconName: "volunteer-activism",
          text: "Donation",
          onPress: () =>
            navigation.navigate("FastagTransaction", {
              endpoint: "Donation",
              name: "Donation payment",
              btnName: "Proceed to Donation",
              reminder: "Pay Donation",
            }),
        },
      ],
    },
    {
      title: "Entertainment",
      subtitle: "Keep your screens and subscriptions running",
      items: [
        {
          iconName: "wifi",
          text: "Broadband Postpaid",
          onPress: () =>
            navigation.navigate("FastagTransaction", {
              endpoint: "Broadband Postpaid",
              name: "Broadband Recharge",
              btnName: "Broadband Recharge",
              reminder: "Pay Broadband Recharge",
            }),
        },
        {
          iconName: "live-tv",
          text: "Cable TV",
          onPress: () =>
            navigation.navigate("FastagTransaction", {
              endpoint: "Cable TV",
              name: "Cable TV Recharge",
              btnName: "Recharge Cable TV",
              reminder: "Pay Cable TV Recharge",
            }),
        },
        {
          iconName: "settings-input-antenna",
          text: "DTH",
          onPress: () =>
            navigation.navigate("FastagTransaction", {
              endpoint: "DTH",
              name: "DTH Recharge",
              btnName: "Recharge DTH",
              reminder: "Pay DTH Recharge",
            }),
        },
        {
          iconName: "subscriptions",
          text: "Subscription",
          onPress: () =>
            navigation.navigate("FastagTransaction", {
              endpoint: "Subscription",
              name: "Pay Recharge",
              btnName: "Pay Subscription",
              reminder: "Pay Subscription Fees",
            }),
        },
      ],
    },

    {
      title: "Government Payments",
      subtitle: "Handle civic and transport dues",
      items: [
        {
          iconName: "receipt-long",
          text: "E-Challan",
          onPress: () =>
            navigation.navigate("FastagTransaction", {
              endpoint: "eChallan",
              name: "eChallan payment",
              btnName: "Pay eChallan",
              reminder: "Pay eChallan",
            }),
        },
        {
          iconName: "account-balance",
          text: "Municiple Taxes",
          onPress: () =>
            navigation.navigate("FastagTransaction", {
              endpoint: "Municipal Taxes",
              name: "Municipal Taxes payment",
              btnName: "Pay Municipal Taxes",
              reminder: "Pay Municipal Taxes",
            }),
        },
        {
          iconName: "domain",
          text: "Municipal Services",
          onPress: () =>
            navigation.navigate("FastagTransaction", {
              endpoint: "Municipal Services",
              name: "Municipal Services payment",
              btnName: "Pay Municipal Services",
              reminder: "Pay Municipal Services",
            }),
        },
        
        {
          iconName: "credit-card",
          text: "NCMC Recharge",
          onPress: () =>
            navigation.navigate("FastagTransaction", {
              endpoint: "NCMC Recharge",
              name: "NCMC Recharge",
              btnName: "Pay NCMC Recharge",
              reminder: "NCMC Recharge",
            }),
        },
        {
          iconName: "account-balance",
          text: "NPS",
          onPress: () =>
            navigation.navigate("FastagTransaction", {
              endpoint: "National Pension System",
              name: "Pay NPS",
              btnName: "Pay NPS",
              reminder: "Pay National Pension System",
            }),
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>All Services</Text>
        <Text style={styles.pageSubtitle}>
          Clean, bill-first shortcuts to pay and recharge faster.
        </Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {serviceSections.map((section) => (
          <View key={section.title} style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeading}>
                <View style={styles.sectionDot} />
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
              {section.subtitle ? (
                <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>
              ) : null}
            </View>
            <View style={styles.optionsGrid}>
              {section.items.map((item) => (
                <ServiceOption
                  key={`${section.title}-${item.text}`}
                  iconName={item.iconName}
                  text={item.text}
                  iconColor={Theme.colors.primary}
                  onPress={item.onPress}
                  cardWidth={cardWidth}
                  disabled={item.disabled}
                  comingSoon={item.comingSoon}
                />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const ServiceOption = ({ iconName, text, iconColor, onPress, cardWidth, disabled, comingSoon }) => (
  <TouchableOpacity
    style={[styles.optionCard, { width: cardWidth }, disabled && styles.disabledCard]}
    onPress={onPress}
    activeOpacity={disabled ? 1 : 0.85}
    disabled={disabled}
  >
    <LinearGradient colors={ICON_GRADIENT} style={styles.iconWrap}>
      <MaterialIcons name={iconName} size={24} color={disabled ? "#999" : Theme.colors.secondary} />
    </LinearGradient>
    <Text style={[styles.optionText, disabled && styles.disabledText]}>{text}</Text>
    {comingSoon && <Text style={styles.comingSoonText}>Coming Soon</Text>}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.bg,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 28,
  },
  pageHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: Theme.colors.text,
  },
  pageSubtitle: {
    fontSize: 14,
    color: Theme.colors.subtext,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Theme.colors.text,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Theme.colors.subtext,
  },
  sectionCard: {
    backgroundColor: Theme.colors.secondary,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#000000", // Black border (color change only)
    shadowColor: "#1e293b",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  sectionHeader: {
    marginBottom: 8,
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: Theme.colors.primary,
    marginRight: 8,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 4,
  },
  optionCard: {
    backgroundColor: "#DAA520", // Golden yellow background
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#000000", // Black border
    shadowColor: "#0f172a",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  iconWrap: {
    alignSelf: "center",
    padding: 10,
    borderRadius: 12,
  },
  optionText: {
    color: "#000000", // Black text for contrast with golden yellow
    fontSize: 14,
    fontWeight: "600",
    marginTop: 10,
    textAlign: "center",
  },
  disabledCard: {
    opacity: 0.6,
  },
  disabledText: {
    color: "#999",
  },
  comingSoonText: {
    color: "#999",
    fontSize: 10,
    marginTop: 2,
    textAlign: "center",
  },
});

export default AllServices;
