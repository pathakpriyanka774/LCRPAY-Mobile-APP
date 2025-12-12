package com.LcrPay.LcrPay

import com.facebook.react.bridge.*

class UPIModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName() = "UPIManager"

  @ReactMethod
  fun pay(uri: String, packageName: String?, promise: Promise) {
    try {
      val activity = reactContext.currentActivity as? MainActivity
        ?: return promise.reject("NO_ACTIVITY", "Activity is null")

      activity.startUPIPayment(uri, packageName)
      promise.resolve("UPI Intent Sent")
    } catch (e: Exception) {
      promise.reject("UPI_ERROR", e)
    }
  }

  @ReactMethod
  fun isInstalled(packageName: String, promise: Promise) {
    val activity = reactContext.currentActivity as? MainActivity
      ?: return promise.reject("NO_ACTIVITY", "Activity is null")

    promise.resolve(activity.isAppInstalled(packageName))
  }

  @ReactMethod
  fun isUpiReady(packageName: String, promise: Promise) {
    val activity = reactContext.currentActivity as? MainActivity
      ?: return promise.reject("NO_ACTIVITY", "Activity is null")

    promise.resolve(activity.isAppUpiReady(packageName))
  }
}
