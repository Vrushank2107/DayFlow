# 🌊 Dayflow

> Modern Human Resource Management System built with Next.js

### 👥 Contributors

- **Nikhil Tiwari** - Project development and implementation
- **Vrushank Solanki** - Project development and implementation  
- **Harsh Yadav** - Project development and implementation
- **Rohan Macha** - Project development and implementation

---

A comprehensive Human Resource Management System (HRMS) designed to streamline and automate HR processes in modern organizations. Dayflow provides a centralized platform for employee management, attendance tracking, leave management, and payroll operations with role-based access control and real-time data insights.

Built with cutting-edge web technologies including Next.js 16, React 19, and TypeScript, Dayflow offers a responsive, secure, and scalable solution for businesses of all sizes.

---

## ✨ Features

### 👥 Employee Management
- **Complete Employee Profiles**: Store and manage comprehensive employee information including personal details, job information, department, designation, and employment history
- **Employee Directory**: Searchable and filterable employee database with organizational hierarchy
- **Role-Based Access Control**: Three-tier access system (Employee, Admin, HR) with appropriate permissions for each role
- **Department Management**: Organize employees by departments and track team structures
- **Employee ID System**: Unique identification system for all employees with auto-generation capabilities

### ⏱️ Attendance System
- **Daily Check-in/Check-out**: Simple one-click attendance marking with timestamp recording
- **Real-time Status Tracking**: Monitor attendance status (Present, Absent, Half-day, Leave) in real-time
- **Weekly & Monthly Reports**: Comprehensive attendance analytics with exportable reports
- **Attendance History**: Complete historical data for compliance and performance evaluation
- **Automated Status Updates**: Automatic status changes based on check-in/check-out times
- **Admin Dashboard**: Centralized view of all employee attendance with filtering options

### 🏖️ Leave Management
- **Online Leave Applications**: Digital leave request system with form validation
- **Multiple Leave Types**: Support for Paid Leave, Sick Leave, and Unpaid Leave categories
- **Date Range Selection**: Flexible leave duration selection with automatic business day calculation
- **Admin Approval Workflow**: Multi-level approval process with comment support
- **Leave Balance Tracking**: Automatic calculation and tracking of available leave balances
- **Attendance Integration**: Automatic attendance status updates when leave is approved
- **Leave History**: Complete audit trail of all leave requests and decisions

### 💰 Payroll Management
- **Transparent Salary Structure**: Clear breakdown of salary components for employees
- **Monthly Payroll Processing**: Automated payroll calculations with configurable parameters
- **Deduction Management**: Track and calculate various deductions (taxes, insurance, etc.)
- **Net Pay Calculations**: Automatic computation of take-home salary
- **Payroll History**: Complete historical records of all payroll transactions
- **Salary Slip Generation**: Digital salary slips with detailed breakdown
- **Admin Payroll Control**: Full administrative control over salary structures and modifications

### 🔐 Security & Access Control
- **Secure Authentication**: Password-based login with bcrypt encryption
- **Session Management**: Secure cookie-based sessions with automatic timeout
- **Role-Based Routing**: Dynamic page access based on user roles
- **Data Isolation**: Strict separation of data access by user role
- **Input Validation**: Comprehensive validation and sanitization of all user inputs
- **Secure API Endpoints**: Protected backend routes with authentication middleware

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | Next.js 16 (App Router) | Modern React framework with server-side rendering |
| **Frontend** | React 19 + TypeScript | Component-based UI with type safety |
| **Styling** | Tailwind CSS 4 | Utility-first CSS framework for rapid styling |
| **Database** | SQLite (better-sqlite3) | Lightweight, file-based database for local development |
| **Authentication** | bcryptjs + Cookies | Password hashing and session management |
| **UI Components** | Radix UI + Lucide React | Accessible component library and icon system |
| **Animations** | Framer Motion | Smooth animations and transitions |
| **Notifications** | Sonner | Toast notifications for user feedback |
| **Development** | ESLint + TypeScript | Code quality and type checking |

---

## 🚀 Getting Started

### Prerequisites
Ensure your system meets the following requirements:
- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher (or yarn 1.22+)
- **Git**: For version control
- **Modern web browser**: Chrome, Firefox, Safari, or Edge

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd dayflow
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or with yarn
   yarn install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the project root:
   ```env
   DATABASE_PATH=data/dayflow.db
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   # or with yarn
   yarn dev
   ```

5. **Access the Application**
   Open your browser and navigate to `http://localhost:3000`

### Default Admin Account
After first run, you can register an admin account with:
- **Email**: admin@company.com
- **Password**: Must meet security requirements (8+ chars, uppercase, lowercase, number)
- **Role**: Select "Admin" during registration

---

## 📁 Project Structure

```
dayflow/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # RESTful API endpoints
│   │   │   ├── auth/          # Authentication routes
│   │   │   ├── employees/     # Employee management APIs
│   │   │   ├── attendance/    # Attendance tracking APIs
│   │   │   ├── leave/         # Leave management APIs
│   │   │   └── payroll/       # Payroll system APIs
│   │   ├── admin/             # Admin dashboard pages
│   │   ├── attendance/        # Attendance management UI
│   │   ├── employees/         # Employee management UI
│   │   ├── hr/                # HR dashboard pages
│   │   ├── layout.tsx         # Root layout component
│   │   └── globals.css        # Global styles
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # Base UI components (buttons, forms, etc.)
│   │   ├── attendance/       # Attendance-specific components
│   │   ├── layout/           # Layout components
│   │   └── auth-guard.tsx    # Authentication wrapper
│   ├── lib/                  # Utilities and configurations
│   │   ├── utils/            # Helper functions
│   │   ├── auth.ts           # Authentication utilities
│   │   └── api-auth.ts       # API authentication helpers
│   └── middleware.ts         # Next.js middleware for auth
├── data/                     # SQLite database files
│   ├── dayflow.db           # Main database file
│   ├── dayflow.db-shm       # Database shared memory
│   └── dayflow.db-wal       # Database write-ahead log
├── public/                   # Static assets
├── .gitignore               # Git ignore rules
├── README.md               # Project documentation
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── next.config.ts          # Next.js configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── reset-database.sh       # Database reset utility
```

---

## 🗄️ Database Schema

The application uses SQLite with the following normalized database schema:

### `users` Table
Stores employee information and authentication data:
- `id` (Primary Key) - Unique user identifier
- `email` (Unique) - User email for login
- `password` - Hashed password using bcrypt
- `name` - Employee full name
- `phone` - Contact phone number
- `address` - Residential address
- `employee_id` (Unique) - Company employee ID
- `department` - Department name
- `designation` - Job title/position
- `joining_date` - Employment start date
- `role` - User role (employee, admin, hr)
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp

### `attendance` Table
Tracks daily attendance records:
- `id` (Primary Key) - Attendance record ID
- `user_id` (Foreign Key) - Reference to users table
- `date` - Attendance date
- `check_in` - Check-in timestamp
- `check_out` - Check-out timestamp
- `status` - Attendance status (present, absent, half_day, leave)
- `created_at` - Record creation timestamp
- `updated_at` - Last update timestamp

### `leave_requests` Table
Manages leave applications and approvals:
- `id` (Primary Key) - Leave request ID
- `user_id` (Foreign Key) - Employee requesting leave
- `leave_type` - Type of leave (paid, sick, unpaid)
- `start_date` - Leave start date
- `end_date` - Leave end date
- `reason` - Leave reason/description
- `status` - Request status (pending, approved, rejected)
- `admin_comment` - Admin approval/rejection comments
- `created_at` - Request submission timestamp
- `updated_at` - Last update timestamp

### `payroll` Table
Stores salary and payroll information:
- `id` (Primary Key) - Payroll record ID
- `user_id` (Foreign Key) - Employee reference
- `month` - Payroll month
- `year` - Payroll year
- `basic_salary` - Base salary amount
- `allowances` - Additional allowances
- `deductions` - Total deductions
- `net_salary` - Take-home salary
- `created_at` - Record creation timestamp
- `updated_at` - Last update timestamp

### `notifications` Table
System notifications and alerts:
- `id` (Primary Key) - Notification ID
- `user_id` (Foreign Key) - Recipient user
- `title` - Notification title
- `message` - Notification content
- `type` - Notification type (info, success, warning, error)
- `read` - Read status (true/false)
- `created_at` - Notification creation timestamp

---

## 🔐 Access Control System

### Role-Based Permissions

| Role | Dashboard | Profile | Attendance | Leave | Payroll | Employee Management | System Settings |
|------|-----------|---------|------------|-------|---------|-------------------|-----------------|
| **Employee** | ✅ Own | ✅ View/Edit Own | ✅ View Own | ✅ Apply/View Own | ✅ View Own | ❌ | ❌ |
| **HR** | ✅ All | ✅ View All | ✅ View All | ✅ Approve All | ✅ View All | ✅ Full Access | ❌ |
| **Admin** | ✅ All | ✅ View All | ✅ View All | ✅ Approve All | ✅ Full Access | ✅ Full Access | ✅ Full Access |

### Permission Details

**Employee Role:**
- View and edit own profile information
- Mark daily attendance (check-in/check-out)
- View own attendance history and reports
- Apply for leave and view own leave status
- View own payroll information (read-only)
- No access to other employees' data

**HR Role:**
- All employee permissions plus:
- View all employee profiles and information
- Approve/reject leave requests
- View all attendance records and generate reports
- View all payroll information
- Manage employee profiles and basic HR operations

**Admin Role:**
- All HR permissions plus:
- Full payroll management and configuration
- System settings and configuration
- User account management
- Database operations and maintenance
- Complete system administration

---

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# Database Configuration
DATABASE_PATH=data/dayflow.db

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Custom database path
# DATABASE_PATH=/custom/path/to/database.db

# Optional: Production settings
# NODE_ENV=production
```

### Database Configuration

The SQLite database automatically initializes on first application run. For production deployments:

1. **Database Path**: Ensure the `data/` directory exists and is writable
2. **Backup Strategy**: Regular database backups are recommended
3. **Performance**: Consider PostgreSQL for high-traffic production environments

### Security Settings

- **Password Requirements**: Minimum 8 characters, uppercase, lowercase, and number
- **Session Timeout**: Sessions expire after inactivity
- **Cookie Security**: HttpOnly, Secure, and SameSite settings in production

---

## 📝 Available Scripts

### Development Commands

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build application for production
npm run start        # Start production server
npm run lint         # Run ESLint for code quality
npm run lint:fix     # Auto-fix ESLint issues
```

### Database Commands

```bash
./reset-database.sh  # Reset database to initial state
```

**⚠️ Warning**: The reset script will delete all existing data. Use with caution.

---

## 🚀 Deployment

### Production Deployment Steps

1. **Environment Setup**
   ```bash
   # Set production environment
   export NODE_ENV=production
   export NEXT_PUBLIC_APP_URL=https://your-domain.com
   ```

2. **Build Application**
   ```bash
   npm run build
   ```

3. **Start Production Server**
   ```bash
   npm start
   ```

### Docker Deployment (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 🤝 Contributing

We welcome contributions to improve Dayflow! Please follow these guidelines:

### Development Workflow

1. **Fork the Repository**
   - Click the "Fork" button on GitHub
   - Clone your fork locally

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Changes**
   - Follow existing code style and patterns
   - Add tests for new features
   - Update documentation as needed

4. **Test Thoroughly**
   ```bash
   npm run lint
   npm run build
   # Test all functionality manually
   ```

5. **Submit Pull Request**
   - Push to your fork
   - Create a pull request with detailed description
   - Address any feedback promptly

### Code Style Guidelines

- Use TypeScript for all new code
- Follow existing component patterns
- Use Tailwind CSS for styling
- Write clean, commented code
- Ensure accessibility compliance

---

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**
```
Error: SQLITE_CANTOPEN: unable to open database file
```
**Solution**: Ensure the `data/` directory exists and is writable

**Authentication Issues**
```
Error: Invalid credentials
```
**Solution**: Clear browser cookies and try logging in again

**Build Errors**
```
Error: Module not found
```
**Solution**: Run `npm install` to update dependencies

**Port Already in Use**
```
Error: listen EADDRINUSE :::3000
```
**Solution**: Kill the process or use a different port:
```bash
lsof -ti:3000 | xargs kill -9
# or
npm run dev -- -p 3001
```

### Getting Help

- Check the [Issues](https://github.com/your-repo/issues) page for known problems
- Create a new issue with detailed error information
- Include steps to reproduce the problem
- Provide system information (OS, Node.js version, browser)

---

## 📄 License

This project is licensed under the ISC License.

```
ISC License

Copyright (c) [Year] [Your Name]

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
```

---

## 🌟 Acknowledgments

- **Next.js Team** - For the excellent React framework
- **Tailwind CSS** - For the utility-first CSS framework
- **Radix UI** - For accessible component primitives
- **Lucide** - For the beautiful icon set
- **Open Source Community** - For inspiration and best practices

---

**Dayflow** – Streamlining HR operations with modern technology 🌊

Built with ❤️ for modern organizations


