# Activity Tracking Backend Implementation

## Database Table Schema

Create a table named `user_activities` with the following structure:

```sql
CREATE TABLE user_activities (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    user_name VARCHAR(255),
    phone_number VARCHAR(15),
    email VARCHAR(255),
    activity_type VARCHAR(50) NOT NULL,
    activity_details JSON,
    amount DECIMAL(10,2) DEFAULT NULL,
    timestamp DATETIME NOT NULL,
    platform VARCHAR(20) DEFAULT 'mobile',
    app_version VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_activity_type (activity_type),
    INDEX idx_timestamp (timestamp)
);
```

## API Endpoint

**POST** `/activity/track`

### Headers
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

### Request Body
```json
{
    "activity_type": "login|recharge|bill_payment|...",
    "timestamp": "2025-01-28T10:30:00.000Z",
    "details": {
        "phone_number": "9220648066",
        "amount": 299,
        "operator": "Jio",
        "transaction_id": "TXN123456",
        "platform": "mobile",
        "app_version": "1.0.0"
    }
}
```

### Response
```json
{
    "success": true,
    "message": "Activity tracked successfully"
}
```

## Activity Types Tracked

- `login` - User login events
- `logout` - User logout events  
- `recharge` - Mobile/DTH recharge transactions
- `bill_payment` - Utility bill payments
- `money_transfer` - Money transfer transactions
- `wallet_topup` - Wallet top-up events
- `profile_update` - Profile modification events
- `kyc_verification` - KYC verification steps
- `membership_purchase` - Prime membership purchases
- `scan_pay` - QR code payment transactions
- `qr_payment` - QR payment events
- `bank_transfer` - Bank transfer transactions
- `loan_application` - Loan application events
- `insurance_purchase` - Insurance purchase events
- `complaint_filed` - Customer complaint events
- `referral_used` - Referral code usage
- `reward_claimed` - Reward claiming events
- `notification_opened` - Notification interaction
- `app_opened` - App launch events
- `screen_viewed` - Screen navigation events

## Implementation Notes

1. The tracking is non-blocking - failures won't affect user experience
2. All sensitive data should be properly sanitized before storage
3. Consider implementing data retention policies
4. Add proper indexing for efficient querying
5. Implement rate limiting to prevent abuse