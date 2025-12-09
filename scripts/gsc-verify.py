#!/usr/bin/env python3
"""
Google Search Console Site Verification Script
Uses OAuth 2.0 to get verification token and verify site ownership
"""

import os
import json
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

# Scopes needed for site verification
SCOPES = [
    'https://www.googleapis.com/auth/siteverification',
    'https://www.googleapis.com/auth/webmasters'
]

SITE_URL = 'https://lician.com/'
TOKEN_FILE = 'gsc_token.json'

def get_credentials():
    """Get or refresh OAuth credentials."""
    creds = None

    # Check for existing token
    if os.path.exists(TOKEN_FILE):
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)

    # If no valid credentials, do OAuth flow
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            # Need OAuth client credentials from GCP Console
            # For now, print instructions
            print("\n" + "="*60)
            print("OAuth Setup Required")
            print("="*60)
            print("""
To complete Google Search Console verification:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Select project: financialadvisor-20769
3. Click "Create Credentials" > "OAuth client ID"
4. Application type: "Desktop app"
5. Download the JSON file
6. Rename it to 'client_secret.json' in this directory
7. Run this script again

Alternatively, verify manually:
1. Go to: https://search.google.com/search-console
2. Add property: https://lician.com/
3. Use "HTML file" verification method
4. Download the file and place in public/ directory
""")
            return None

    # Save credentials for next run
    with open(TOKEN_FILE, 'w') as token:
        token.write(creds.to_json())

    return creds

def get_verification_token(creds):
    """Get file verification token from Site Verification API."""
    service = build('siteVerification', 'v1', credentials=creds)

    body = {
        'site': {
            'type': 'SITE',
            'identifier': SITE_URL
        },
        'verificationMethod': 'FILE'
    }

    response = service.webResource().getToken(body=body).execute()
    return response.get('token')

def verify_site(creds, token):
    """Verify the site after token is placed."""
    service = build('siteVerification', 'v1', credentials=creds)

    body = {
        'site': {
            'type': 'SITE',
            'identifier': SITE_URL
        }
    }

    response = service.webResource().insert(verificationMethod='FILE', body=body).execute()
    return response

def list_search_console_sites(creds):
    """List all sites in Search Console."""
    service = build('searchconsole', 'v1', credentials=creds)

    response = service.sites().list().execute()
    return response.get('siteEntry', [])

if __name__ == '__main__':
    print("Google Search Console Verification Tool")
    print("-" * 40)

    creds = get_credentials()

    if creds:
        print(f"\nGetting verification token for {SITE_URL}...")
        token = get_verification_token(creds)

        if token:
            print(f"\nVerification Token: {token}")
            print(f"\nCreate file: public/{token}")
            print(f"With content: google-site-verification: {token}")
