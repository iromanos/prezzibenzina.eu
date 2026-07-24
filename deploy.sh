#!/bin/bash

# ==============================================================================
# SCRIPT DI DEPLOYMENT STANDALONE PER NEXT.JS (VIA SSH / RSYNC)
# ==============================================================================

set -e # Interrompe lo script in caso di errore

# ------------------------------------------------------------------------------
# 1. CONFIGURAZIONE (Modifica con i tuoi dati)
# ------------------------------------------------------------------------------
SERVER_USER="prezzibenzina"                   # Username SSH del server
SERVER_HOST="87.106.242.50"           # IP o Dominio del server
REMOTE_DIR="/home/prezzibenzina/htdocs/www.prezzibenzina.eu"      # Cartella di destinazione sul server
SSH_PORT="22"                          # Porta SSH
LOCAL_ENV_FILE=".env.production"       # Variabili locali per la build NEXT_PUBLIC_

# ------------------------------------------------------------------------------
# 2. VERIFICHE E CONTROLLI PRELIMINARI
# ------------------------------------------------------------------------------
echo "🚀 [1/5] Avvio della procedura di deployment..."

if [ ! -f "$LOCAL_ENV_FILE" ]; then
  echo "⚠️ Attenzione: Il file '$LOCAL_ENV_FILE' non esiste."
  read -p "Vuoi continuare comunque? (y/N): " confirm
  if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
    echo "❌ Deployment annullato."
    exit 1
  fi
fi

# ------------------------------------------------------------------------------
# 3. COMPILAZIONE LOCALE (NEXT BUILD)
# ------------------------------------------------------------------------------
echo "📦 [2/5] Compilazione dell'applicazione Next.js in locale..."

# Carica le variabili .env.production per incorporare le variabili NEXT_PUBLIC_*
if [ -f "$LOCAL_ENV_FILE" ]; then
  export $(grep -v '^#' "$LOCAL_ENV_FILE" | xargs)
fi

npm run build

# Verifico che la cartella standalone esista
if [ ! -d ".next/standalone" ]; then
  echo "❌ ERRORE: La cartella '.next/standalone' non è stata trovata!"
  echo "Assicurati di aver impostato 'output: \"standalone\"' nel tuo next.config.js"
  exit 1
fi

echo "✅ Build completata con successo!"

# ------------------------------------------------------------------------------
# 4. PREPARAZIONE E RAGGRUPPAMENTO FILE PER L'UPLOAD
# ------------------------------------------------------------------------------
echo "🧹 [3/5] Organizzazione della struttura Standalone..."

TMP_DEPLOY_DIR=".deploy-temp"
rm -rf "$TMP_DEPLOY_DIR"
mkdir -p "$TMP_DEPLOY_DIR"

# A. Copia del contenuto standalone (server.js, node_modules minimali, package.json)
cp -R .next/standalone/. "$TMP_DEPLOY_DIR/"

mkdir "$TMP_DEPLOY_DIR/cron_logs"

# B. Copia della cartella public
if [ -d "public" ]; then
  cp -R public "$TMP_DEPLOY_DIR/"
fi

# C. Copia di .next/static dentro .deploy-temp/.next/static (Indispensabile per i CSS/Asset)
mkdir -p "$TMP_DEPLOY_DIR/.next/static"
cp -R .next/static/. "$TMP_DEPLOY_DIR/.next/static/"

# D. Copia cartella cron sul server

echo "✅ Struttura pronta per il trasferimento."
mkdir -p "$TMP_DEPLOY_DIR/cron"
cp -R src/cron/. "$TMP_DEPLOY_DIR/cron"

# ------------------------------------------------------------------------------
# 5. TRASFERIMENTO FILE VIA RSYNC (SSH)
# ------------------------------------------------------------------------------
echo "📡 [4/5] Trasferimento file sul server ($SERVER_HOST)..."

ssh -p $SSH_PORT $SERVER_USER@$SERVER_HOST "mkdir -p $REMOTE_DIR"

# rsync sincronizza solo i file modificati (velocissimo)
# Exclude previene la sovrascrittura del file .env segreto presente sul server
rsync -avz -e "ssh -p $SSH_PORT" \
  --delete \
  --exclude='.env' \
  --exclude='.env.local' \
  "$TMP_DEPLOY_DIR/" "$SERVER_USER@$SERVER_HOST:$REMOTE_DIR/"

# Pulizia temporanea locale
rm -rf "$TMP_DEPLOY_DIR"

# ------------------------------------------------------------------------------
# 6. RIAVVIO SERVIZIO SUL SERVER (PM2)
# ------------------------------------------------------------------------------
echo "🔄 [5/5] Riavvio dell'applicazione sul server remoto..."

ssh -p $SSH_PORT $SERVER_USER@$SERVER_HOST << EOF
  cd $REMOTE_DIR/cron

  npm install

  cd $REMOTE_DIR

  if pm2 describe prezzibenzina > /dev/null 2>&1; then
    echo "Riavvio del processo PM2 esistente..."
    pm2 reload prezzibenzina --update-env
  else
    echo "Primo avvio del processo PM2..."
    pm2 start server.js --name "prezzibenzina" -i max -- start
  fi

  pm2 save
EOF

echo "🎉 DEPLOYMENT COMPLETATO CON SUCCESSO!"