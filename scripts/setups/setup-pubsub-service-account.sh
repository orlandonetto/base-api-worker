#!/bin/bash

# chmod +x ./scripts/setups/setup-pubsub-service-account.sh 

# Definir variáveis
PROJECT_ID="gainmes-dev" # Substitua pelo seu ID de projeto
SERVICE_ACCOUNT="service-123123123@gcp-sa-pubsub.iam.gserviceaccount.com" # Substitua pelo Service account do Pub/Sub

# Conceder o papel de Pub/Sub Admin para a service account
echo "Concedendo o papel de Pub/Sub Admin para a service account..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/pubsub.admin"

# Confirmar que as permissões foram aplicadas
echo "Permissões aplicadas com sucesso para a service account $SERVICE_ACCOUNT."
