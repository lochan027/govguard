#!/bin/sh

# Replace environment variables in built files
# This allows runtime environment variable injection

if [ -f /usr/share/nginx/html/index.html ]; then
    # Replace placeholder environment variables with actual values
    envsubst '${VITE_GROQ_API_KEY} ${VITE_PERPLEXITY_API_KEY} ${VITE_FIREBASE_API_KEY} ${VITE_FIREBASE_PROJECT_ID}' < /usr/share/nginx/html/index.html > /tmp/index.html
    mv /tmp/index.html /usr/share/nginx/html/index.html
fi

echo "Environment variables injected successfully"