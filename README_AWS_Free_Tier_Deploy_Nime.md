# Nime — Panduan Deploy Cepat di AWS Free Tier

Panduan ini dibuat untuk menjalankan website **Nime** di AWS dengan setup sederhana, hemat biaya, dan cukup untuk online tanpa Load Balancer.

Stack project berdasarkan repository:

- Next.js 16.1
- React 19.2
- TypeScript
- Tailwind CSS 4.x
- Prisma
- PostgreSQL
- PM2
- Cloudflare Tunnel
- Telegram bot optional

Target arsitektur:

```txt
Cloudflare Domain
   ↓
Cloudflare Tunnel
   ↓
EC2 Ubuntu
   ↓
Next.js app : localhost:3000
   ↓
PostgreSQL lokal : localhost:5432
```

---

## 1. Peringatan Billing AWS

Sebelum deploy, cek billing dulu supaya tidak kena tagihan yang tidak sengaja.

Berdasarkan screenshot credit AWS:

| Item | Nilai |
|---|---:|
| Credit awal | $100.00 |
| Total amount used | $38.90 |
| Total estimated amount used | $38.91 |
| Total amount remaining | $61.10 |
| Total estimated amount remaining | $61.09 |
| Start date | 03/31/2026 |
| Expiration date | 03/31/2027 |

Estimasi kasar pemakaian:

```txt
$38.90 / ±97 hari = ±$0.40 per hari
±$0.40 x 30 hari = ±$12 per bulan
```

Jika pola pemakaian tetap sama, sisa credit sekitar **$61.10** bisa bertahan sekitar:

```txt
$61.10 / $0.40 = ±152 hari
```

Perkiraan credit habis: **awal Desember 2026**.

> Catatan penting: jika akun masih di AWS Free plan/trial yang punya batas waktu 6 bulan, batas waktu plan bisa datang lebih cepat dari habisnya credit. Tetap cek halaman Billing dan Free Tier usage di AWS Console.

---

## 2. Checklist Billing Wajib

Sebelum deploy, pastikan ini sudah dicek:

- [ ] Buka **AWS Billing and Cost Management**.
- [ ] Cek **Bills → Charges by service → Expand all**.
- [ ] Cek semua region, jangan hanya region yang sedang dipakai.
- [ ] Pastikan tidak ada resource nyangkut di region lain.
- [ ] Buat budget alert actual cost.
- [ ] Buat budget alert forecast cost.
- [ ] Buat alert jika credit tinggal sekitar $20.
- [ ] Aktifkan Free Tier usage alert.
- [ ] Pastikan email billing aktif dan sering dicek.

Rekomendasi budget alert:

| Alert | Nilai |
|---|---:|
| Actual cost | > $1 |
| Forecast cost | > $5 |
| Credit remaining | < $20 |

Hindari dulu layanan ini supaya tidak boros:

- Load Balancer
- NAT Gateway
- Elastic IP yang tidak dipakai
- RDS Multi-AZ
- EKS/ECS/Fargate
- Route 53 Hosted Zone jika DNS sudah di Cloudflare
- Snapshot/backup berlebihan
- CloudWatch log retention tanpa batas

---

## 3. Setup EC2

Rekomendasi awal:

```txt
AMI: Ubuntu 24.04 LTS
Instance: t3.micro
Storage: 16 GB gp3
Security Group:
- SSH 22 hanya dari IP pribadi
- Tidak perlu buka 80/443 jika memakai Cloudflare Tunnel
Region: pilih satu region saja
```

Login ke server:

```bash
ssh -i key.pem ubuntu@EC2_PUBLIC_IP
```

Update server dan install dependency dasar:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl build-essential nginx postgresql postgresql-contrib
```

Install Node.js 22 dan PM2:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

node -v
npm -v
pm2 -v
```

Tambahkan swap 2 GB agar proses build Next.js lebih aman di instance kecil:

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
free -h
```

---

## 4. Setup PostgreSQL Lokal

Masuk ke PostgreSQL:

```bash
sudo -u postgres psql
```

Buat user dan database:

```sql
CREATE USER nime_user WITH PASSWORD 'PASSWORD_KUAT_DI_SINI';
CREATE DATABASE nime OWNER nime_user;
GRANT ALL PRIVILEGES ON DATABASE nime TO nime_user;
\q
```

Format `DATABASE_URL`:

```env
DATABASE_URL="postgresql://nime_user:PASSWORD_KUAT_DI_SINI@localhost:5432/nime?schema=public"
```

> Untuk awal, PostgreSQL lokal cukup. RDS bisa dipakai nanti jika traffic sudah besar atau butuh database yang lebih aman secara operasional.

---

## 5. Clone Repository dari GitHub

Buat folder project:

```bash
sudo mkdir -p /var/www/nime
sudo chown -R ubuntu:ubuntu /var/www/nime
```

Clone repository:

```bash
git clone https://github.com/USERNAME/REPO.git /var/www/nime
cd /var/www/nime
```

Install dependency:

```bash
npm install
```

---

## 6. Setup Environment Variable

Copy file env contoh:

```bash
cp .env.example .env
nano .env
```

Isi minimal:

```env
DATABASE_URL="postgresql://nime_user:PASSWORD_KUAT_DI_SINI@localhost:5432/nime?schema=public"
NEXTAUTH_SECRET="ISI_RANDOM_PANJANG"
NEXTAUTH_URL="https://domainlu.com"

RESEND_API_KEY=""
TELEGRAM_BOT_TOKEN=""
TELEGRAM_CHANNEL_ID=""
OWNER_ID=""
```

Generate `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

Contoh hasilnya masukkan ke `.env`:

```env
NEXTAUTH_SECRET="hasil_random_dari_command_di_atas"
```

---

## 7. Setup Prisma

Generate Prisma client:

```bash
npx prisma generate
```

Push schema ke database:

```bash
npx prisma db push
```

Jika butuh cek database lewat Prisma Studio:

```bash
npx prisma studio
```

> Prisma Studio tidak wajib dinyalakan di production. Pakai hanya untuk pengecekan sementara.

---

## 8. Build dan Jalankan Website

Build project:

```bash
npm run build
```

Jalankan dengan PM2:

```bash
pm2 start npm --name nime -- start
pm2 save
pm2 startup
```

Setelah menjalankan `pm2 startup`, terminal akan memberi command tambahan. Copy dan jalankan command tersebut, biasanya formatnya seperti:

```bash
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

Cek aplikasi:

```bash
curl -I http://localhost:3000
pm2 logs nime
```

Jika statusnya `HTTP/1.1 200 OK`, aplikasi sudah jalan secara lokal.

---

## 9. Setup Cloudflare Tunnel

Install `cloudflared`:

```bash
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb
```

Login ke Cloudflare:

```bash
cloudflared tunnel login
```

Create tunnel:

```bash
cloudflared tunnel create nime
```

Route DNS ke domain:

```bash
cloudflared tunnel route dns nime domainlu.com
```

Buat folder config:

```bash
sudo mkdir -p /etc/cloudflared
```

Buat config:

```bash
sudo nano /etc/cloudflared/config.yml
```

Isi config:

```yaml
tunnel: TUNNEL_ID_LU
credentials-file: /etc/cloudflared/TUNNEL_ID_LU.json

ingress:
  - hostname: domainlu.com
    service: http://localhost:3000
  - service: http_status:404
```

Copy credentials tunnel:

```bash
sudo cp ~/.cloudflared/TUNNEL_ID_LU.json /etc/cloudflared/
```

Install sebagai service:

```bash
sudo cloudflared service install
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
sudo systemctl status cloudflared
```

Cek domain:

```bash
curl -I https://domainlu.com
```

Cek log tunnel:

```bash
journalctl -u cloudflared -f
```

---

## 10. Telegram Bot Optional

Project ini punya Telegram broadcast bot berbasis Telegraf dan PM2.

Jangan nyalakan dulu sebelum website utama stabil.

Jika sudah siap, isi env berikut:

```env
TELEGRAM_BOT_TOKEN="isi_token_bot"
TELEGRAM_CHANNEL_ID="isi_channel_id"
OWNER_ID="isi_owner_id"
```

Lalu jalankan:

```bash
npm run bot:pm2
```

Cek proses PM2:

```bash
pm2 list
pm2 logs
```

---

## 11. Command Deploy Update Berikutnya

Setiap ada update dari GitHub:

```bash
cd /var/www/nime

git pull
npm install
npx prisma generate
npx prisma db push
npm run build
pm2 restart nime
pm2 logs nime
```

Jika hanya perubahan frontend ringan dan tidak ada dependency baru, biasanya cukup:

```bash
cd /var/www/nime

git pull
npm run build
pm2 restart nime
```

---

## 12. Backup Database Manual

Buat folder backup:

```bash
mkdir -p ~/backups
```

Backup manual:

```bash
pg_dump "postgresql://nime_user:PASSWORD_KUAT_DI_SINI@localhost:5432/nime" | gzip > ~/backups/nime-$(date +%F).sql.gz
```

Cek hasil backup:

```bash
ls -lh ~/backups
```

Download backup ke laptop lokal:

```bash
scp -i key.pem ubuntu@EC2_PUBLIC_IP:~/backups/nime-YYYY-MM-DD.sql.gz .
```

Restore backup jika diperlukan:

```bash
gunzip -c ~/backups/nime-YYYY-MM-DD.sql.gz | psql "postgresql://nime_user:PASSWORD_KUAT_DI_SINI@localhost:5432/nime"
```

---

## 13. Maintenance Harian / Mingguan

Cek status aplikasi:

```bash
pm2 list
pm2 logs nime
```

Cek storage:

```bash
df -h
```

Cek RAM:

```bash
free -h
```

Cek service Cloudflare Tunnel:

```bash
sudo systemctl status cloudflared
```

Cek PostgreSQL:

```bash
sudo systemctl status postgresql
```

Cek billing AWS:

```txt
AWS Console → Billing and Cost Management → Bills
AWS Console → Billing and Cost Management → Budgets
AWS Console → Free Tier
```

---

## 14. Troubleshooting

### Website tidak bisa dibuka

Cek apakah aplikasi jalan:

```bash
pm2 list
pm2 logs nime
curl -I http://localhost:3000
```

Cek Cloudflare Tunnel:

```bash
sudo systemctl status cloudflared
journalctl -u cloudflared -f
```

### Build gagal karena memory kecil

Pastikan swap sudah aktif:

```bash
free -h
```

Jika belum ada swap, ulangi langkah setup swap di bagian awal.

### Database error

Cek PostgreSQL:

```bash
sudo systemctl status postgresql
```

Cek connection string:

```bash
cat .env
```

Jalankan ulang Prisma:

```bash
npx prisma generate
npx prisma db push
```

### PM2 hilang setelah reboot

Jalankan ulang:

```bash
pm2 save
pm2 startup
```

Lalu copy command yang diberikan oleh PM2.

---

## 15. Kesimpulan Setup

Setup paling cepat dan hemat untuk kondisi sekarang:

```txt
1 EC2 Ubuntu
+ PostgreSQL lokal
+ Next.js via PM2
+ Cloudflare Tunnel
+ tanpa Load Balancer
+ tanpa RDS dulu
```

Kelebihan:

- Biaya lebih hemat.
- Deploy cepat.
- Domain bisa langsung aktif lewat Cloudflare.
- Tidak perlu buka port 80/443 di EC2.
- Cocok untuk tahap awal dan traffic kecil-menengah.

Kekurangan:

- Database masih satu mesin dengan aplikasi.
- Kalau EC2 bermasalah, aplikasi dan database ikut terdampak.
- Wajib rajin backup manual atau buat backup otomatis.

Prioritas setelah website online:

1. Pastikan billing aman.
2. Pastikan domain aktif.
3. Pastikan PM2 auto-start setelah reboot.
4. Pastikan Cloudflare Tunnel auto-start.
5. Pastikan backup database berjalan.
6. Baru aktifkan Telegram bot jika website utama sudah stabil.
