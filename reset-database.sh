#!/bin/bash

# Database Reset Script for DayFlow HRMS
# This script deletes all database files and resets the system

echo "🗑️  DayFlow HRMS Database Reset"
echo "================================"
echo ""
echo "⚠️  WARNING: This will delete ALL data including:"
echo "   • All user accounts"
echo "   • All attendance records" 
echo "   • All leave requests"
echo "   • All payroll data"
echo "   • All sessions"
echo ""
read -p "Are you sure you want to continue? (type 'DELETE' to confirm): " confirm

if [ "$confirm" != "DELETE" ]; then
    echo "❌ Database reset cancelled"
    exit 1
fi

echo ""
echo "🗑️  Deleting database files..."

# Remove all database files
rm -rf /Users/vrushank/Project/DayFlow/data/*

echo "✅ Database deleted successfully!"
echo ""
echo "🔄 Next steps:"
echo "1. Restart the application"
echo "2. Register new admin/HR users"
echo "3. Create employee accounts"
echo ""
echo "📝 Database will be automatically recreated on next startup"
