# Royal Grace Cards - Full Deployment Guide

This README contains everything to deploy **Royal Grace Cards** on a fresh VM, including:

- Spring Boot backend
- Next.js frontend
- NGINX reverse proxy
- Let’s Encrypt SSL certificates
- Systemd services for auto-start
- Full deployment script

---

## Table of Contents

1. [Prerequisites](#prerequisites)  
2. [Directory Structure](#directory-structure)  
3. [Environment Variables](#environment-variables)  
4. [Systemd Services](#systemd-services)  
5. [NGINX Configuration](#nginx-configuration)  
6. [Certbot SSL Setup](#certbot-ssl-setup)  
7. [Deployment Script](#deployment-script)  
8. [Testing & Validation](#testing--validation)  

---

## Prerequisites

- Ubuntu / Debian server
- Java 17+ (for Spring Boot backend)
- Node.js 18+ (for Next.js frontend)
- NGINX installed
- Certbot installed (`python3-certbot-nginx`)
- Git (optional, for cloning the repo)

---

## Directory Structure

/opt/royal-grace-cards/
├── backend/ # Spring Boot backend
│ ├── target/ # Built JAR
│ └── .env # Environment variables
└── frontend/ # Next.js frontend
└── node_modules/


Set proper permissions:

```bash
sudo chown -R www-data:www-data /opt/royal-grace-cards

Environment Variables

Create .env in /opt/royal-grace-cards/backend/.env:

# ======================
# Database
# ======================
DATABASE_URL=dburl
DATABASE_USERNAME=uname
DATABASE_PASSWORD=pass

# ======================
# Security
# ======================
JWT_SECRET=secretkey

# ======================
# Stripe
# ======================
STRIPE_SECRET_KEY=stripekey
STRIPE_WEBHOOK_SECRET=webhookkey

# ======================
# CORS
# ======================
CORS_ORIGINS=https://royalgrace.com,https://www.royalgrace.com,http://localhost:3000
DEBUG_LEVEL=INFO

# ======================
# Email
# ======================
EMAIL_HOST=ssmtp host
EMAIL_USER_NAME=some@some.com
EMAIL_PASSWORD=app-password-here

# ======================
# Frontend
# ======================
NEXT_PUBLIC_BACKEND_URL=https://royalgracecards.com

Systemd Services
Backend Service

File: /etc/systemd/system/royal-grace-backend.service

[Unit]
Description=Royal Grace Backend (Spring Boot)
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/royal-grace-cards/backend
EnvironmentFile=/opt/royal-grace-cards/backend/.env
ExecStart=/usr/bin/java -Xms256m -Xmx512m -jar /opt/royal-grace-cards/backend/target/royal-grace-backend.jar
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal
SuccessExitStatus=143
TimeoutStopSec=30

[Install]
WantedBy=multi-user.target


Frontend Service

File: /etc/systemd/system/royal-grace-frontend.service

[Unit]
Description=Royal Grace Frontend (Next.js)
After=network.target royal-grace-backend.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/royal-grace-cards
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/node node_modules/next/dist/bin/next start -p 3000
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target


Enable and start services:

sudo systemctl daemon-reload
sudo systemctl enable royal-grace-backend
sudo systemctl enable royal-grace-frontend
sudo systemctl start royal-grace-backend
sudo systemctl start royal-grace-frontend


NGINX Configuration

File: /etc/nginx/sites-available/royalgracecards.com

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name royalgracecards.com www.royalgracecards.com;

    ssl_certificate     /etc/letsencrypt/live/royalgracecards.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/royalgracecards.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Backend APIs
    location ^~ /api/ {
        proxy_pass http://127.0.0.1:9091;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }

    location = /login { proxy_pass http://127.0.0.1:9091/login; proxy_set_header Host $host; proxy_set_header X-Forwarded-Proto $scheme; proxy_redirect off; }
    location = /logout { proxy_pass http://127.0.0.1:9091/logout; proxy_set_header Host $host; proxy_set_header X-Forwarded-Proto $scheme; proxy_redirect off; }
    location ^~ /oauth2/ { proxy_pass http://127.0.0.1:9091/; proxy_set_header Host $host; proxy_set_header X-Forwarded-Proto $scheme; proxy_redirect off; }
    location ^~ /auth/ { proxy_pass http://127.0.0.1:9091/; proxy_set_header Host $host; proxy_set_header X-Forwarded-Proto $scheme; proxy_redirect off; }

    # Frontend UI
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# HTTP → HTTPS Redirect
server {
    listen 80;
    listen [::]:80;
    server_name royalgracecards.com www.royalgracecards.com;
    return 301 https://$host$request_uri;
}


Enable the site:

sudo ln -sf /etc/nginx/sites-available/royalgracecards.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx


Certbot SSL Setup

sudo apt update
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d royalgracecards.com -d www.royalgracecards.com --agree-tos --email your-email@example.com --redirect --non-interactive
sudo certbot renew --dry-run


Full Deployment Script (deploy.sh)

#!/bin/bash
set -e

DOMAIN="royalgracecards.com"
EMAIL="your-email@example.com"
FRONTEND_PORT=3000
BACKEND_PORT=9091

echo "Installing required packages..."
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx curl git

echo "Creating NGINX configuration..."
NGINX_CONF="/etc/nginx/sites-available/${DOMAIN}.conf"
sudo tee "$NGINX_CONF" > /dev/null <<EOF
# Paste the full NGINX config here (see above)
EOF

sudo ln -sf "$NGINX_CONF" "/etc/nginx/sites-enabled/$DOMAIN.conf"
sudo nginx -t
sudo systemctl reload nginx

echo "Obtaining SSL certificate with Certbot..."
sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --agree-tos --email $EMAIL --redirect --non-interactive
sudo certbot renew --dry-run

echo "Enabling and starting services..."
sudo systemctl daemon-reload
sudo systemctl enable royal-grace-backend
sudo systemctl enable royal-grace-frontend
sudo systemctl start royal-grace-backend
sudo systemctl start royal-grace-frontend

echo "✅ Deployment complete!"
echo "Frontend: https://$DOMAIN/"
echo "Backend API: https://$DOMAIN/api/"

Testing & Validation

Frontend: https://royalgracecards.com

Backend API: https://royalgracecards.com/api/cards

Check service status:
sudo systemctl status royal-grace-backend
sudo systemctl status royal-grace-frontend
sudo systemctl status nginx

View logs:

sudo journalctl -u royal-grace-backend -f
sudo journalctl -u royal-grace-frontend -f
sudo tail -f /var/log/nginx/error.log


