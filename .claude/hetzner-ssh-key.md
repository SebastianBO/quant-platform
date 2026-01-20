# Hetzner Server Details

Created: 2026-01-19

## Server
```
IP: 46.224.200.254
Type: CPX32 (4 vCPU, 8GB RAM, 160GB SSD)
Location: Nuremberg
OS: Ubuntu 24.04
Cost: $11.99/mo
```

## Coolify Dashboard
```
URL: http://46.224.200.254:8000
API Token: Pco5T0G4IAPDSMw1e5wGzRUikhiM11a25bwXAVp388677520
```

## Coolify Private Key (for server access)
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACDzI8ihzPU5aqLS0qZPu5GQqcUwmWW5Vq0dnJ8o7zSR8gAAAKAOgDEIDoAx
CAAAAAtzc2gtZWQyNTUxOQAAACDzI8ihzPU5aqLS0qZPu5GQqcUwmWW5Vq0dnJ8o7zSR8g
AAAEBA52SdaBnXpvE0rWAj7MjaVB3BqrucRy6DhYMUhvWcWvMjyKHM9TlqotLSpk+7kZCp
xTCZZblWrR2cnyjvNJHyAAAAF3BocHNlY2xpYi1nZW5lcmF0ZWQta2V5AQIDBAUG
-----END OPENSSH PRIVATE KEY-----
```

## Public Key (safe to share)
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIBYSobhvdgE65bp8ZaTbtbA0G+YO5frgczwbt2/46H8k hetzner-lician
```

## Private Key Location (NEVER share)
```
~/.ssh/id_ed25519
```

## Usage
```bash
# SSH into Hetzner server
ssh root@YOUR_SERVER_IP

# Or with explicit key
ssh -i ~/.ssh/id_ed25519 root@YOUR_SERVER_IP
```

## Fingerprint
```
SHA256:fvUuo/VSM8QWQiQts77+qgpiudjH1yWvQxdQY6fs71M
```
