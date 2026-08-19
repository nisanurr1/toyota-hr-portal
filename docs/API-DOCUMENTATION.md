# API Documentation

## Overview

The backend exposes REST APIs under the `/api` base path. The APIs are implemented with Java Spring Boot controllers and are used by the React frontend.

> **Note:** This document describes the endpoints currently implemented in the submitted controller classes. `HrController` and `ManagerController` currently do not expose REST endpoints.

---

## 1. Authentication API

### POST `/api/auth/login`

Authenticates a user.

**Request Body**

`LoginRequest`

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

**Success Response**

- `200 OK`
- Returns `LoginResponse`.

**Error Responses**

- `401 Unauthorized` — incorrect password or user not found.
- `500 Internal Server Error` — unexpected server error.

---

## 2. Dashboard API

### GET `/api/dashboard`

Returns dashboard information.

**Success Response**

- `200 OK`
- Returns `DashboardResponse`.

**Request Body**

None.

---

## 3. Leave Request API

Base path: `/api/leave-requests`

### GET `/api/leave-requests`

Returns all leave requests.

**Success Response**

- `200 OK`
- Returns a list of `LeaveRequest` objects.

### GET `/api/leave-requests/{id}`

Returns a leave request by ID.

**Path Parameter**

| Parameter | Type | Description |
|---|---|---|
| `id` | Long | Leave request ID |

**Success Response**

- `200 OK`
- Returns a `LeaveRequest`.

### GET `/api/leave-requests/user/{userId}`

Returns leave requests belonging to a specific user.

**Path Parameter**

| Parameter | Type | Description |
|---|---|---|
| `userId` | Long | User ID |

**Success Response**

- `200 OK`
- Returns a list of `LeaveRequest` objects.

### POST `/api/leave-requests`

Creates a leave request.

**Request Body**

`LeaveRequest`

Example structure:

```json
{
  "user": {
    "id": 1
  },
  "leaveType": "ANNUAL",
  "startDate": "2026-08-10",
  "endDate": "2026-08-12",
  "status": "PENDING",
  "description": "Annual leave"
}
```

**Success Response**

- `200 OK`
- Returns the created `LeaveRequest`.

### PUT `/api/leave-requests/{id}`

Updates an existing leave request.

**Path Parameter**

| Parameter | Type | Description |
|---|---|---|
| `id` | Long | Leave request ID |

**Request Body**

`LeaveRequest`

**Success Response**

- `200 OK`
- Returns the updated `LeaveRequest`.

### DELETE `/api/leave-requests/{id}`

Deletes a leave request.

**Path Parameter**

| Parameter | Type | Description |
|---|---|---|
| `id` | Long | Leave request ID |

**Success Response**

- `200 OK`
- No response body is returned by the controller.

---

## 4. Notification API

Base path: `/api/notifications`

### GET `/api/notifications`

Returns all notifications.

**Success Response**

- `200 OK`
- Returns a list of `Notification` objects.

### POST `/api/notifications`

Creates a notification.

**Request Body**

`Notification`

**Success Response**

- `200 OK`
- Returns the created `Notification`.

### DELETE `/api/notifications/{id}`

Deletes a notification.

**Path Parameter**

| Parameter | Type | Description |
|---|---|---|
| `id` | Long | Notification ID |

**Success Response**

- `200 OK`
- No response body is returned by the controller.

---

## 5. Update Request API

Base path: `/api/update-requests`

### GET `/api/update-requests`

Returns all update requests.

**Success Response**

- `200 OK`
- Returns a list of `UpdateRequest` objects.

### GET `/api/update-requests/user/{userId}`

Returns update requests belonging to a specific user.

**Path Parameter**

| Parameter | Type | Description |
|---|---|---|
| `userId` | Long | User ID |

**Success Response**

- `200 OK`
- Returns a list of `UpdateRequest` objects.

### GET `/api/update-requests/{id}`

Returns an update request by ID.

**Path Parameter**

| Parameter | Type | Description |
|---|---|---|
| `id` | Long | Update request ID |

**Success Response**

- `200 OK`
- Returns an `UpdateRequest`.

### POST `/api/update-requests`

Creates an update request.

**Request Body**

`UpdateRequest`

**Controller behavior**

- If `status` is `null`, the controller sets it to `PENDING`.
- If the request does not contain a `User`, the controller currently loads user ID `1` and assigns that user to the request.

**Success Response**

- `200 OK`
- Returns the created `UpdateRequest`.

### PUT `/api/update-requests/{id}`

Updates an existing update request.

**Path Parameter**

| Parameter | Type | Description |
|---|---|---|
| `id` | Long | Update request ID |

**Request Body**

`UpdateRequest`

**Success Response**

- `200 OK`
- Returns the updated `UpdateRequest`.

### DELETE `/api/update-requests/{id}`

Deletes an update request.

**Path Parameter**

| Parameter | Type | Description |
|---|---|---|
| `id` | Long | Update request ID |

**Success Response**

- `200 OK`
- No response body is returned by the controller.

### PUT `/api/update-requests/{id}/manager/approve`

Approves an update request at the manager stage.

**Path Parameter**

| Parameter | Type | Description |
|---|---|---|
| `id` | Long | Update request ID |

**Success Response**

- `200 OK`
- Returns the updated `UpdateRequest`.

### PUT `/api/update-requests/{id}/manager/reject`

Rejects an update request at the manager stage.

**Path Parameter**

| Parameter | Type | Description |
|---|---|---|
| `id` | Long | Update request ID |

**Success Response**

- `200 OK`
- Returns the updated `UpdateRequest`.

### PUT `/api/update-requests/{id}/hr/approve`

Approves an update request at the HR stage.

**Path Parameter**

| Parameter | Type | Description |
|---|---|---|
| `id` | Long | Update request ID |

**Success Response**

- `200 OK`
- Returns the updated `UpdateRequest`.

### PUT `/api/update-requests/{id}/hr/reject`

Rejects an update request at the HR stage.

**Path Parameter**

| Parameter | Type | Description |
|---|---|---|
| `id` | Long | Update request ID |

**Success Response**

- `200 OK`
- Returns the updated `UpdateRequest`.

---

## 6. User API

Base path: `/api/users`

### POST `/api/users`

Creates a user.

**Request Body**

`User`

**Controller behavior**

When creating a user:

- A missing password is replaced with `Toyota123!`.
- A missing status is set to `ACTIVE`.
- A missing hire date is set to the current date.
- A missing children count is set to `0`.
- The supplied role is resolved from the database.
- If no valid role is supplied, the controller attempts to use the `EMPLOYEE` role.

**Success Response**

- `200 OK`
- Returns the created `User`.

**Error Response**

- `500 Internal Server Error` — user creation fails.

### POST `/api/users/change-password`

Changes a user's password.

**Request Body**

`ChangePasswordRequest`

Expected fields:

```json
{
  "userId": 1,
  "currentPassword": "oldPassword",
  "newPassword": "newPassword"
}
```

**Validation performed by the controller**

1. `userId` must be provided.
2. The user must exist.
3. The current password must match.
4. The new password must contain at least 6 characters.

**Success Response**

- `200 OK`

**Bad Request**

- `400 Bad Request` — missing user ID.
- `400 Bad Request` — user not found.
- `400 Bad Request` — current password is incorrect.
- `400 Bad Request` — new password is shorter than 6 characters.

**Server Error**

- `500 Internal Server Error`

### PUT `/api/users/{id}`

Updates an existing user.

**Path Parameter**

| Parameter | Type | Description |
|---|---|---|
| `id` | Long | User ID |

**Request Body**

`User`

**Success Response**

- `200 OK`
- Returns the updated `User`.

### DELETE `/api/users/{id}`

Deletes a user.

**Path Parameter**

| Parameter | Type | Description |
|---|---|---|
| `id` | Long | User ID |

**Success Response**

- `200 OK`
- No response body is returned by the controller.

---

## 7. Vehicle API

Base path: `/api/vehicles`

### GET `/api/vehicles`

Returns all vehicles.

**Success Response**

- `200 OK`
- Returns a list of `Vehicle` objects.

### GET `/api/vehicles/{id}`

Returns a vehicle by ID.

**Path Parameter**

| Parameter | Type | Description |
|---|---|---|
| `id` | Long | Vehicle ID |

**Success Response**

- `200 OK`
- Returns a `Vehicle`.

### POST `/api/vehicles`

Creates a vehicle.

**Request Body**

`Vehicle`

**Success Response**

- `200 OK`
- Returns the created `Vehicle`.

### PUT `/api/vehicles/{id}`

Updates a vehicle.

**Path Parameter**

| Parameter | Type | Description |
|---|---|---|
| `id` | Long | Vehicle ID |

**Request Body**

`Vehicle`

**Success Response**

- `200 OK`
- Returns the updated `Vehicle`.

### DELETE `/api/vehicles/{id}`

Deletes a vehicle.

**Path Parameter**

| Parameter | Type | Description |
|---|---|---|
| `id` | Long | Vehicle ID |

**Success Response**

- `200 OK`
- No response body is returned by the controller.

---

## 8. Vehicle Request API

Base path: `/api/vehicle-requests`

### GET `/api/vehicle-requests`

Returns all vehicle requests.

**Success Response**

- `200 OK`
- Returns a list of `VehicleRequest` objects.

### GET `/api/vehicle-requests/{id}`

Returns a vehicle request by ID.

**Path Parameter**

| Parameter | Type | Description |
|---|---|---|
| `id` | Long | Vehicle request ID |

**Success Response**

- `200 OK`
- Returns a `VehicleRequest`.

### POST `/api/vehicle-requests`

Creates a vehicle request.

**Request Body**

`VehicleRequest`

**Success Response**

- `200 OK`
- Returns the created `VehicleRequest`.

### PUT `/api/vehicle-requests/{id}`

Updates an existing vehicle request.

**Path Parameter**

| Parameter | Type | Description |
|---|---|---|
| `id` | Long | Vehicle request ID |

**Request Body**

`VehicleRequest`

**Success Response**

- `200 OK`
- Returns the updated `VehicleRequest`.

### DELETE `/api/vehicle-requests/{id}`

Deletes a vehicle request.

**Path Parameter**

| Parameter | Type | Description |
|---|---|---|
| `id` | Long | Vehicle request ID |

**Success Response**

- `200 OK`
- No response body is returned by the controller.

---

## 9. Controllers Without Endpoints

The following classes currently do not contain Spring REST mappings:

- `HrController`
- `ManagerController`

They are therefore not listed as active REST API groups in this documentation.

---

## 10. CORS

The implemented REST controllers use:

```java
@CrossOrigin(origins = "*")
```

This allows cross-origin requests from any origin at the controller level.

For a production deployment, the allowed origins should be restricted to trusted frontend domains.

---

## 11. API Summary

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/login` | User login |
| GET | `/api/dashboard` | Dashboard data |
| GET | `/api/leave-requests` | List leave requests |
| GET | `/api/leave-requests/{id}` | Get leave request |
| GET | `/api/leave-requests/user/{userId}` | User's leave requests |
| POST | `/api/leave-requests` | Create leave request |
| PUT | `/api/leave-requests/{id}` | Update leave request |
| DELETE | `/api/leave-requests/{id}` | Delete leave request |
| GET | `/api/notifications` | List notifications |
| POST | `/api/notifications` | Create notification |
| DELETE | `/api/notifications/{id}` | Delete notification |
| GET | `/api/update-requests` | List update requests |
| GET | `/api/update-requests/user/{userId}` | User's update requests |
| GET | `/api/update-requests/{id}` | Get update request |
| POST | `/api/update-requests` | Create update request |
| PUT | `/api/update-requests/{id}` | Update update request |
| DELETE | `/api/update-requests/{id}` | Delete update request |
| PUT | `/api/update-requests/{id}/manager/approve` | Manager approval |
| PUT | `/api/update-requests/{id}/manager/reject` | Manager rejection |
| PUT | `/api/update-requests/{id}/hr/approve` | HR approval |
| PUT | `/api/update-requests/{id}/hr/reject` | HR rejection |
| POST | `/api/users` | Create user |
| POST | `/api/users/change-password` | Change password |
| PUT | `/api/users/{id}` | Update user |
| DELETE | `/api/users/{id}` | Delete user |
| GET | `/api/vehicles` | List vehicles |
| GET | `/api/vehicles/{id}` | Get vehicle |
| POST | `/api/vehicles` | Create vehicle |
| PUT | `/api/vehicles/{id}` | Update vehicle |
| DELETE | `/api/vehicles/{id}` | Delete vehicle |
| GET | `/api/vehicle-requests` | List vehicle requests |
| GET | `/api/vehicle-requests/{id}` | Get vehicle request |
| POST | `/api/vehicle-requests` | Create vehicle request |
| PUT | `/api/vehicle-requests/{id}` | Update vehicle request |
| DELETE | `/api/vehicle-requests/{id}` | Delete vehicle request |

---

## Implementation Notes

This documentation is based on the current Spring Boot controller implementations. Detailed field definitions for request/response objects should be aligned with the corresponding DTO/entity classes if the API contract is changed in the future.
