#!/bin/bash
# Executing this file will write this content to a service file. This will start the Django server when the machine turns on which allows the automation program to communicate with the host.
CONFIG_CONTENT=$(<./config.json)


cat << EOF > .env
DATABASE_URL="$(echo "$CONFIG_CONTENT" | jq -r ".DATABASE_URL")"
NEXTAUTH_SECRET="$(echo "$CONFIG_CONTENT" | jq -r ".NEXTAUTH_SECRET")"
NEXTAUTH_URL="$(echo "$CONFIG_CONTENT" | jq -r ".NEXTAUTH_URL")"
GOOGLE_PROJECT_ID="$(echo "$CONFIG_CONTENT" | jq -r ".GOOGLE_PROJECT_ID")"
GOOGLE_CLIENT_ID="$(echo "$CONFIG_CONTENT" | jq -r ".GOOGLE_CLIENT_ID")"
GOOGLE_CLIENT_SECRET="$(echo "$CONFIG_CONTENT" | jq -r ".GOOGLE_CLIENT_SECRET")"
NEXT_PUBLIC_FIREBASE_API_KEY="$(echo "$CONFIG_CONTENT" | jq -r ".NEXT_PUBLIC_FIREBASE_API_KEY")"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="$(echo "$CONFIG_CONTENT" | jq -r ".NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN")"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="$(echo "$CONFIG_CONTENT" | jq -r ".NEXT_PUBLIC_FIREBASE_PROJECT_ID")"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="$(echo "$CONFIG_CONTENT" | jq -r ".NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET")"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="$(echo "$CONFIG_CONTENT" | jq -r ".NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID")"
NEXT_PUBLIC_FIREBASE_APP_ID="$(echo "$CONFIG_CONTENT" | jq -r ".NEXT_PUBLIC_FIREBASE_APP_ID")"
NEXT_PUBLIC_FIREBASE_HOST_POST_ENDPOINT_SECRET="$(echo "$CONFIG_CONTENT" | jq -r ".NEXT_PUBLIC_FIREBASE_HOST_POST_ENDPOINT_SECRET")"
EOF