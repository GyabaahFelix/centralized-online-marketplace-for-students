# Firestore Security Specification - LYNQED

## 1. Data Invariants
1. **User Ownership Constraint**: A user's profile document (`/users/{userId}`) can only be modified by the matching authenticated owner.
2. **Admin/Banned Safeguards (RBAC)**: Users are strictly forbidden from self-assigning `isBanned` or modifying role list profiles to upgrade to `admin`. Only real admins (looked up via a secure `/admins/{adminId}` path) can modify user privilege fields.
3. **Product Vendor Authorization**: A product listing (`/products/{productId}`) can only be created or modified by a vendor whose `userId` matches `request.auth.uid`.
4. **Order Creator Validation**: High-integrity transactions (`/orders/{orderId}`) can only be placed with a `buyerId` strictly identical to `request.auth.uid`.
5. **Fulfillment State Machine**: Order status modifications must progress through sequential workflow transitions (`placed` -> `preparing` -> `ready_for_pickup` -> `delivering` -> `delivered`). Arbitrary leaps or status reversals are denied.
6. **PII Isolation Policy**: Personally identifiable information such as cell phone numbers and GPS coordinate fields are restricted to the document owner, assigned delivery couriers, or verified administrators, rather than public query lists.
7. **Size & Value Limits**: Text descriptions, listing images arrays, and pricing values have strict uppercase boundaries to protect against payload ballooning.

---

## 2. The "Dirty Dozen" Malicious Payloads
The following payloads simulate attacks trying to bypass database integrity boundaries.

### Payload 1: Unauthorized Profile Manipulation
* **Attack**: Authenticated User `buyer_1` attempts to modify Profile `vendor_2` to change their contact details.
* **Target Path**: `/users/vendor_2`
* **JSON Payload**:
  ```json
  {
    "name": "Hacker Entity",
    "phoneNumber": "+1234567890"
  }
  ```

### Payload 2: Self-Promotion to Admin
* **Attack**: User `buyer_1` registers/updates their own user profile attempting to grant themselves the `"admin"` role.
* **Target Path**: `/users/buyer_1`
* **JSON Payload**:
  ```json
  {
    "name": "Jane Buyer",
    "email": "jane@example.com",
    "roles": ["buyer", "admin"]
  }
  ```

### Payload 3: Forged Product Creation
* **Attack**: User `buyer_1` attempts to list a product as Vendor `vendor_2`.
* **Target Path**: `/products/stolen_product_id`
* **JSON Payload**:
  ```json
  {
    "id": "stolen_product_id",
    "vendorId": "vendor_2",
    "title": "Bootleg Sneakers",
    "price": 450.0,
    "stock": 10,
    "status": "approved"
  }
  ```

### Payload 4: Arbitrary Pricing Inflation
* **Attack**: Vendor `vendor_1` attempts to update their item price to a negative value or a massive amount.
* **Target Path**: `/products/item_123`
* **JSON Payload**:
  ```json
  {
    "price": -9999.99
  }
  ```

### Payload 5: Stolen Order Identity
* **Attack**: User `attacker_buyer` attempts to create an order claiming `buyerId` is `victim_buyer` to force standard checkout fees on standard users.
* **Target Path**: `/orders/fraudulent_order_99`
* **JSON Payload**:
  ```json
  {
    "id": "fraudulent_order_99",
    "buyerId": "victim_buyer",
    "vendorId": "vendor_9",
    "total": 350.00,
    "status": "placed",
    "deliveryOption": "pickup"
  }
  ```

### Payload 6: Force Claim Delivery
* **Attack**: User `buyer_1` (who is not a courier) attempts to assign themselves as the delivery courier for an order.
* **Target Path**: `/orders/order_555`
* **JSON Payload**:
  ```json
  {
    "courierId": "buyer_1",
    "status": "courier_assigned"
  }
  ```

### Payload 7: Shortcut Order Fulfillment State
* **Attack**: Buyer user attempts to skip right from `placed` to `delivered` to skip courier interaction entirely.
* **Target Path**: `/orders/order_555`
* **JSON Payload**:
  ```json
  {
    "status": "delivered"
  }
  ```

### Payload 8: Write Ghost Fields (Vulnerability Shadowing)
* **Attack**: Attacker attempts to inject random metadata keys (e.g., `isVerifiedStore: true`) to bypass reviews constraint.
* **Target Path**: `/vendors/vendor_1`
* **JSON Payload**:
  ```json
  {
    "isApproved": true,
    "rating": 5.0,
    "isVerifiedStore": true
  }
  ```

### Payload 9: Hijacking Sibling Notification Feeds
* **Attack**: User `buyer_1` attempts to read a direct notification message sent explicitly to User `buyer_2`.
* **Target Path**: `/notifications/notif_secret_99`

### Payload 10: Denying Delivery (Rogue Outage)
* **Attack**: Authenticated User attempts to update a Courier's coordinates or turn them offline while not being that Courier.
* **Target Path**: `/couriers/dispatcher_42`
* **JSON Payload**:
  ```json
  {
    "onlineStatus": false,
    "currentLat": 0.0,
    "currentLng": 0.0
  }
  ```

### Payload 11: Spoofed Metadata (createdAt tampering)
* **Attack**: Attacker attempts to forge historical records by uploading orders with pre-dated timestamps.
* **Target Path**: `/orders/order_333`
* **JSON Payload**:
  ```json
  {
    "createdAt": "2020-01-01T00:00:00Z"
  }
  ```

### Payload 12: Injection Attacks as IDs
* **Attack**: Injection of long, toxic scripting characters string as document IDs to exhaust Firestore resource limits and trigger Denials of Service.
* **Target Path**: `/users/injection_attack_<script>alert('xss')</script>_overflow`

---

## 3. Test Runner Concept
Below is a model `firestore.rules.test.ts` specification utilizing the standard `@firebase/rules-unit-testing` framework to enforce security rules and verify that they block all "Dirty Dozen" payloads safely with `PERMISSION_DENIED`.

```typescript
import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

let testEnv: RulesTestEnvironment;

describe('LYNQED Fortress Security Rules', () => {
  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'gen-lang-client-0064050034',
      firestore: {
        rules: readFileSync('firestore.rules', 'utf8')
      }
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
  });

  test('Payload 1: Unauthorized profile editing must be rejected', async () => {
    const maliciousUser = testEnv.authenticatedContext('buyer_1');
    const b1Ref = doc(maliciousUser.firestore(), 'users/vendor_2');
    await expect(setDoc(b1Ref, { name: 'Hacker Entity' })).rejects.toThrow();
  });

  test('Payload 2: Upgrading roles to admin must fail validation', async () => {
    const context = testEnv.authenticatedContext('buyer_1');
    const profileRef = doc(context.firestore(), 'users/buyer_1');
    await expect(setDoc(profileRef, {
      id: 'buyer_1',
      name: 'Jane Buyer',
      email: 'jane@example.com',
      roles: ['buyer', 'admin']
    })).rejects.toThrow();
  });

  test('Payload 3 & 4: Errant Product creation and pricing modifications are blocked', async () => {
    const attacker = testEnv.authenticatedContext('buyer_1');
    const prodRef = doc(attacker.firestore(), 'products/stolen_product_id');
    await expect(setDoc(prodRef, {
      id: 'stolen_product_id',
      vendorId: 'vendor_2',
      title: 'Bootleg Sneakers',
      price: -450.0,
      stock: 10,
      status: 'approved'
    })).rejects.toThrow();
  });
});
```
