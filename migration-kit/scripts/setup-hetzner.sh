#!/bin/bash
#
# Hetzner VPS Setup Script
# Run this on a fresh Ubuntu 24.04 server
#
# Usage:
#   1. SSH into your Hetzner VPS: ssh root@YOUR_IP
#   2. Run: curl -fsSL https://raw.githubusercontent.com/YOUR_REPO/main/migration-kit/scripts/setup-hetzner.sh | bash
#   Or:
#   1. Copy this file to server
#   2. chmod +x setup-hetzner.sh
#   3. ./setup-hetzner.sh

set -e

echo "=========================================="
echo "  Hetzner VPS Setup for Quant Platform"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "Please run as root (sudo ./setup-hetzner.sh)"
    exit 1
fi

echo -e "${GREEN}[1/5] Updating system...${NC}"
apt update && apt upgrade -y

echo -e "${GREEN}[2/5] Installing essential packages...${NC}"
apt install -y curl git wget ufw fail2ban

echo -e "${GREEN}[3/5] Configuring firewall...${NC}"
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow http
ufw allow https
ufw --force enable

echo -e "${GREEN}[4/5] Installing Coolify...${NC}"
echo ""
echo -e "${YELLOW}This will install Coolify - the self-hosted Vercel alternative${NC}"
echo ""

curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash

echo -e "${GREEN}[5/5] Setup complete!${NC}"
echo ""
echo "=========================================="
echo "  NEXT STEPS"
echo "=========================================="
echo ""
echo "1. Access Coolify dashboard:"
echo "   https://$(curl -s ifconfig.me):8000"
echo ""
echo "2. Create admin account in Coolify"
echo ""
echo "3. Add your GitHub repository:"
echo "   - Click 'New Resource' → 'Public Repository'"
echo "   - Or connect your GitHub account for private repos"
echo ""
echo "4. Configure environment variables in Coolify"
echo ""
echo "5. Deploy!"
echo ""
echo "=========================================="
echo ""
echo -e "${GREEN}Server IP: $(curl -s ifconfig.me)${NC}"
echo ""
