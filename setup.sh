#!/bin/bash

# Setup script for GTU Exam Preparation Application

echo "Setting up GTU Exam Preparation Application..."

# Create virtual environment
echo "Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Create .env file from example
echo "Creating .env file..."
cp .env.example .env

echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit the .env file with your actual configuration"
echo "2. Set up your Supabase project and create the required tables"
echo "3. Run 'python run_backend.py' to start the backend server"