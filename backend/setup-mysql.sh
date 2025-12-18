#!/bin/bash

echo "=========================================="
echo "MySQL Setup for Real Estate Project"
echo "=========================================="
echo ""

# Check if XAMPP MySQL is available
if [ -f "/Applications/XAMPP/xamppfiles/bin/mysql" ]; then
    echo "✓ XAMPP MySQL found"
    MYSQL_BIN="/Applications/XAMPP/xamppfiles/bin/mysql"
else
    echo "✗ XAMPP MySQL not found. Please install XAMPP or MySQL."
    exit 1
fi

echo ""
echo "Step 1: Please start XAMPP MySQL service from XAMPP Control Panel"
echo "        Then press Enter to continue..."
read

echo ""
echo "Step 2: Creating database 'realestate'..."
$MYSQL_BIN -u root -e "CREATE DATABASE IF NOT EXISTS realestate CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>&1

if [ $? -eq 0 ]; then
    echo "✓ Database 'realestate' created successfully!"
    echo ""
    echo "Step 3: Database is ready!"
    echo ""
    echo "MySQL Workbench Connection Details:"
    echo "  Hostname: 127.0.0.1"
    echo "  Port: 3306"
    echo "  Username: root"
    echo "  Password: (leave empty if no password set)"
    echo "  Default Schema: realestate"
    echo ""
    echo "Next steps:"
    echo "  1. Open MySQL Workbench"
    echo "  2. Create a new connection with the details above"
    echo "  3. Run: npm run prisma:migrate"
else
    echo "✗ Failed to create database. Please check:"
    echo "  - MySQL service is running in XAMPP"
    echo "  - You have proper permissions"
fi

