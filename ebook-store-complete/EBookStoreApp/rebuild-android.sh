#!/bin/bash

echo "🧹 Cleaning Android build..."
rm -rf android/app/build
rm -rf android/.gradle
rm -rf android/app/.cxx

echo "📦 Running prebuild..."
npx expo prebuild --clean --platform android

echo "🔨 Building and running Android app..."
npx expo run:android

echo "✅ Rebuild complete!"


