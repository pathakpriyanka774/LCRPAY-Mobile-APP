# --------------------------------------------------
# 🌐 React Native Core
# --------------------------------------------------
-keep class com.facebook.react.bridge.** { *; }
-keep class com.facebook.react.uimanager.** { *; }
-keep class com.facebook.react.modules.** { *; }
-keep class com.facebook.react.views.** { *; }

# Keep all methods annotated with @ReactMethod
-keepclassmembers class * {
    @com.facebook.react.bridge.ReactMethod <methods>;
}

# --------------------------------------------------
# ⚙️ Hermes (if you use Hermes JS engine)
# --------------------------------------------------
-keep class com.facebook.hermes.** { *; }
-dontwarn com.facebook.hermes.**

# --------------------------------------------------
# 🌀 React Native Reanimated
# --------------------------------------------------
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# --------------------------------------------------
# 🔒 Your custom native module (AppSignatureHelper)
# --------------------------------------------------
-keep class com.LcrPay.LcrPay.util.AppSignatureHelper { *; }

# --------------------------------------------------
# 📦 Expo & OTA updates (expo-updates / expo-manifests)
# --------------------------------------------------
-keep class expo.modules.updates.** { *; }
-keep class expo.modules.manifests.** { *; }
-keep class expo.modules.** { *; }
-keep interface expo.modules.** { *; }

# --------------------------------------------------
# 🌐 Networking libraries (OkHttp / Okio)
# --------------------------------------------------
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }
-keep class okio.** { *; }
-dontwarn okhttp3.**
-dontwarn okio.**

# --------------------------------------------------
# 🧰 General React Native / ProGuard
# --------------------------------------------------
-dontwarn com.facebook.proguard.**
-dontwarn javax.annotation.**
-dontwarn com.facebook.react.**
