# EC2 Instance
resource "aws_instance" "app_server" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.app_sg.id]
  key_name               = var.key_name

  user_data = <<-EOF
    #!/bin/bash
    set -e

    # Update system
    apt-get update -y
    apt-get upgrade -y

    # Install Node.js 18
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs

    # Install Git
    apt-get install -y git

    # Install PM2 globally
    npm install -g pm2

    # Install Nginx
    apt-get install -y nginx

    # Configure Nginx reverse proxy
    cat > /etc/nginx/sites-available/yoga-booking <<'NGINX'
    server {
        listen 80;
        server_name _;

        # Frontend (React build served by PM2 serve)
        location / {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        # Backend API
        location /api/ {
            proxy_pass http://localhost:5001;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    NGINX

    ln -sf /etc/nginx/sites-available/yoga-booking /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    nginx -t && systemctl reload nginx
    systemctl enable nginx

    # Clone repo
    git clone https://github.com/QUT-Rizwan/ypga-booking.git /home/ubuntu/yoga-booking
    chown -R ubuntu:ubuntu /home/ubuntu/yoga-booking

    echo "Bootstrap complete"
  EOF

  tags = {
    Name        = "${var.project_name}-server"
    Environment = var.environment
  }
}

# Elastic IP
resource "aws_eip" "app_eip" {
  instance = aws_instance.app_server.id
  domain   = "vpc"

  tags = {
    Name        = "${var.project_name}-eip"
    Environment = var.environment
  }
}
